import { chromium, type BrowserContext } from "playwright";
import { db, restaurants, menus } from "shared";
import { eq, and, sql } from "drizzle-orm";
import { scrapeFacebookPage, analyzeMenuWithAI } from "./facebook/scraper";
import type { WeeklySchedule, DailyMenuContent } from "shared";

export class MenusManager {
    private context: BrowserContext | null = null;

    private async initContext() {
        const browser = await chromium.launch({ headless: true });
        this.context = await browser.newContext({
            userAgent:
                "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
        });

        if (process.env.FACEBOOK_COOKIES) {
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
        }
    }

    async updateAllMissingMenus() {
        if (!this.context) await this.initContext();

        const allRes = await db.select().from(restaurants);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (const res of allRes) {
            console.log(`\n🔍 Sprawdzam ${res.name}...`);

            const hasToday = await this.checkIfMenuExists(res.id, today);
            if (hasToday && res.slug !== "podzamcze") {
                console.log(`✅ Menu dla ${res.name} już aktualne.`);
                continue;
            }

            try {
                if (res.provider === "facebook" && res.scrapingUrl) {
                    const rawPosts = await scrapeFacebookPage(
                        this.context!,
                        res.scrapingUrl,
                    );
                    const schedule: WeeklySchedule | null =
                        await analyzeMenuWithAI(rawPosts);

                    if (schedule) {
                        for (const [dateKey, content] of Object.entries(
                            schedule,
                        )) {
                            const targetDate = new Date(dateKey);
                            await this.saveMenuIfMissing(
                                res.id,
                                targetDate,
                                content as DailyMenuContent,
                            );
                        }
                    }
                }
            } catch (err) {
                console.error(`❌ Błąd ${res.name}:`, (err as any).message);
            }
        }
    }

    private async checkIfMenuExists(
        restaurantId: number,
        date: Date,
    ): Promise<boolean> {
        const result = await db
            .select()
            .from(menus)
            .where(
                and(
                    eq(menus.restaurantId, restaurantId),
                    sql`DATE(${menus.date}) = DATE(${date.toISOString()})`,
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
        // 1. Sprawdź czy menu nie jest puste (brak zup i brak dań)
        const isEmpty =
            content.soups.length === 0 && content.courses.length === 0;

        if (isEmpty) {
            console.log(
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
            console.log(`  ✨ Zapisano: ${date.toISOString().split("T")[0]}`);
        }
    }

    async cleanup() {
        if (this.context) await this.context.browser()?.close();
    }
}
