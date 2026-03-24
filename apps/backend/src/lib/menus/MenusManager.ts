import { chromium, type BrowserContext, devices } from "playwright";
import {
    type DailyMenuContent,
    db,
    menus,
    menusLogs,
    restaurants,
    type RestaurantSelect,
} from "shared";
import { eq, and, lte, gte } from "drizzle-orm";
import {
    analyzeFacebookPosts,
    processFacebookPosts,
    scrapeFacebookPosts,
} from "./facebook/scraper";

export class MenusManager {
    private context: BrowserContext | null = null;
    private currentLog: string = "";

    private async initContext() {
        if (this.context) return;

        const browser = await chromium.launch({
            headless: true,
            args: ["--disable-blink-features=AutomationControlled"],
        });

        const androidConfig = devices["Pixel 7"];

        this.context = await browser.newContext({
            ...androidConfig,
            userAgent:
                "Mozilla/5.0 (Linux; Android 16; Pixel 7 Build/AP3A.240617.008) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6778.204 Mobile Safari/537.36",
            locale: "pl-PL",
            timezoneId: "Europe/Warsaw",
        });

        await this.context.addInitScript(() => {
            Object.defineProperty(navigator, "webdriver", {
                get: () => undefined,
            });
        });

        if (process.env.FACEBOOK_COOKIES) {
            try {
                const raw = JSON.parse(process.env.FACEBOOK_COOKIES);
                const cookies = raw.map((c: any) => ({
                    ...c,
                    sameSite: c.sameSite
                        ? c.sameSite === "no_restriction"
                            ? "None"
                            : c.sameSite.charAt(0).toUpperCase() +
                              c.sameSite.slice(1)
                        : "Lax",
                }));
                await this.context.addCookies(cookies);
                this.log("Załadowano ciasteczka Facebooka.", "info");
            } catch (e) {
                this.log(
                    `Błąd parsowania ciasteczek: ${(e as Error).message}`,
                    "error",
                );
            }
        }
    }

    public async updateMissingMenus() {
        await this.initContext();
        this.currentLog = "";

        const allRestaurants = await db.select().from(restaurants);

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const todaysMenus = await db
            .select({ restaurantId: menus.restaurantId })
            .from(menus)
            .where(gte(menus.date, startOfToday));

        const restaurantsWithMenuToday = new Set(
            todaysMenus.map((m) => m.restaurantId),
        );

        for (const restaurant of allRestaurants) {
            this.log(`\n🔍 Sprawdzam ${restaurant.name}...`);

            if (restaurantsWithMenuToday.has(restaurant.id)) {
                this.log(
                    `Menu dla ${restaurant.name} już aktualne.`,
                    "success",
                );
                continue;
            }

            if (restaurant.provider === "facebook") {
                await this.getMenusFromFacebook(restaurant);
            }
        }

        this.log("\n✅ Aktualizacja zakończona.");
        await this.saveLog();
    }

    private async saveLog() {
        try {
            await db.insert(menusLogs).values({
                log: this.currentLog || "",
                createdAt: new Date(),
            });
            this.log("Log zapisany do bazy danych.", "info");
        } catch (e) {
            this.log(
                `Błąd zapisu logu do bazy danych: ${(e as Error).message}`,
                "error",
            );
        }
    }

    private async getMenusFromFacebook(restaurant: RestaurantSelect) {
        if (!restaurant.scrapingUrl || !this.context) return;

        this.log(`📱 Scrapowanie: ${restaurant.scrapingUrl}`, "log", 1);

        try {
            const rawPosts = await scrapeFacebookPosts(
                this.context,
                restaurant.scrapingUrl,
            );
            const postsToProcess = rawPosts.slice(0, 5);
            this.log(
                `Znaleziono ${postsToProcess.length} najnowszych postów.`,
                "log",
                3,
            );

            const processedPosts = await processFacebookPosts(
                this.context,
                postsToProcess,
            );
            const imageCount = processedPosts.filter(
                (p) => !!p.imageData,
            ).length;
            this.log(`Przetworzono ${imageCount} zdjęć do analizy.`, "log", 3);

            const analyzedMenus = await analyzeFacebookPosts(processedPosts);

            if (analyzedMenus && Object.keys(analyzedMenus).length > 0) {
                for (const [dateKey, content] of Object.entries(
                    analyzedMenus,
                )) {
                    await this.saveMenuIfMissing(
                        restaurant.id,
                        new Date(dateKey),
                        content,
                    );
                }
            } else {
                this.log(
                    `⚠️ Nie wyodrębniono żadnego menu z postów.`,
                    "warning",
                    3,
                );
            }
        } catch (error) {
            this.log(
                `❌ Błąd podczas scrapowania ${restaurant.name}: ${(error as Error).message}`,
                "error",
                3,
            );
        }
    }

    private async checkIfMenuExists(
        restaurantId: number,
        targetDate: Date,
    ): Promise<boolean> {
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        const result = await db
            .select({ id: menus.id })
            .from(menus)
            .where(
                and(
                    eq(menus.restaurantId, restaurantId),
                    gte(menus.date, startOfDay),
                    lte(menus.date, endOfDay),
                ),
            )
            .limit(1);

        return result.length > 0;
    }

    private async saveMenuIfMissing(
        restaurantId: number,
        date: Date,
        content: DailyMenuContent,
    ) {
        const isEmpty =
            content.soups.length === 0 && content.courses.length === 0;

        if (isEmpty) {
            this.log(
                `⚠️ Otrzymano pustą treść dla daty ${date.toISOString().split("T")[0]}. Pomijam.`,
                "warning",
                1,
            );
            return;
        }

        const exists = await this.checkIfMenuExists(restaurantId, date);
        if (!exists) {
            await db.insert(menus).values({
                restaurantId,
                date,
                content: content,
            });
            this.log(
                `✨ Zapisano nowe menu na dzień: ${date.toISOString().split("T")[0]}`,
                "log",
                3,
            );
        }
    }

    async cleanup() {
        if (this.context) {
            await this.context.browser()?.close();
            this.context = null;
        }
    }

    private log(
        text: string,
        severity: "log" | "success" | "info" | "warning" | "error" = "log",
        indent: number = 0,
    ) {
        const icons = {
            log: "",
            success: "✅ ",
            info: "ℹ️  ",
            warning: "⚠️ ",
            error: "❌ ",
        };

        const indentation = "  ".repeat(indent);
        const message = `${indentation}${icons[severity]}${text}`;

        const consoleMethods = {
            error: console.error,
            warning: console.warn,
            info: console.info,
            success: console.log,
            log: console.log,
        };

        consoleMethods[severity](message);

        this.currentLog += message + "\n";
    }
}
