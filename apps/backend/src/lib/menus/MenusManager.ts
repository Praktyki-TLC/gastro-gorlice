import { chromium, type BrowserContext, devices } from "playwright";
import { type DailyMenuContent, db, menus, restaurants, RestaurantSelect } from "shared";
import { eq, and, sql } from "drizzle-orm";
import { processFacebookPosts, scrapeFacebookPosts } from "./facebook/scraper";

export class MenusManager {
    private context: BrowserContext | null = null;
    private currentLog: string | null = null;

    private async initContext() {
        const browser = await chromium.launch({
            headless: true,
            args: ['--disable-blink-features=AutomationControlled']
        });

        const androidConfig = devices['Pixel 7'];

        this.context = await browser.newContext({
            ...androidConfig,
            userAgent: "Mozilla/5.0 (Linux; Android 16; Pixel 7 Build/AP3A.240617.008) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6778.204 Mobile Safari/537.36",
            locale: 'pl-PL',
            timezoneId: 'Europe/Warsaw',
        });
        await this.context.addInitScript(() => {
            Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
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
                this.log("Błąd parsowania ciasteczek:" + e, "error");
            }
        }
    }

    public async updateMissingMenus() {
        if (!this.context) await this.initContext();
        this.currentLog = "";

        const allRestaurants = await db.select().from(restaurants);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (const restaurant of allRestaurants) {
            this.log(`\n🔍 Sprawdzam ${restaurant.name}...`);

            const hasToday = await this.checkIfMenuExists(restaurant.id, today);

            if (hasToday) {
                this.log(`Menu dla ${restaurant.name} już aktualne.`, "success");
                continue;
            }

            switch(restaurant.provider) {
                case("facebook"): {
                    await this.getMenusFromFacebook(restaurant);
                    break;
                }
            }
        }
    }

    private async getMenusFromFacebook(restaurant: RestaurantSelect) {
        if(!restaurant.scrapingUrl) return;

        this.log(`  📱 Scrapowanie: ${restaurant.scrapingUrl}`);
        const posts = await scrapeFacebookPosts(this.context as BrowserContext, restaurant.scrapingUrl);
        this.log(`     Znaleziono ${posts.length} postów.`);

        const processedPosts = await processFacebookPosts(this.context as BrowserContext, posts);
        this.log(`     Znaleziono ${processedPosts.filter(p => !!p.imageData).length} zdjęć postów.`);

        console.log(JSON.stringify(processedPosts.map(x => ({...x, imageData: null})), null, 2));
    }

    private async checkIfMenuExists(
        restaurantId: number,
        date: Date,
    ): Promise<boolean> {
        const dateStr = date.toISOString().split('T')[0];
        const result = await db
            .select()
            .from(menus)
            .where(
                and(
                    eq(menus.restaurantId, restaurantId),
                    sql`DATE(${menus.date}) = ${dateStr}`,
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
                `  ⚠️ Puste menu dla restauracji #${restaurantId} na dzień ${date.toISOString().split("T")[0]}. Pomijam.`,
            );
            return;
        }

        const exists = await this.checkIfMenuExists(restaurantId, date);
        if (!exists) {
            await db.insert(menus).values({
                restaurantId,
                date,
                content: content as any,
            });
            this.log(`  ✨ Zapisano nowe menu: ${date.toISOString().split("T")[0]}`);
        }
    }

    async cleanup() {
        if (this.context) {
            const browser = this.context.browser();
            await browser?.close();
            this.context = null;
        }
    }

    async log(text: string, severity?: "log" | "success" | "info" | "warning" | "error") {
        switch (severity) {
            case "log":
                console.log(text);
                break;
            case "success":
                text = `✅` + text;
                console.log(text);
                break;
            case "info":
                text = "ℹ️ " + text;
                console.info(text)
            case "warning":
                text = "⚠️" + text;
                console.warn(text);
                break;
            case "error":
                text = `❌` + text
                console.error(text)
                break;
            default:
                console.log(text)
                break;
        }

        this.currentLog += text;
    }
}