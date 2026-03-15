import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { chromium } from "playwright";
import { db, menus } from "shared";
import { eq, and, sql } from "drizzle-orm";
import type { DailyMenu } from "shared";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const RESTAURANTS = [
    {
        name: "Del Piero",
        url: "https://www.facebook.com/p/Pizzeria-Del-Piero-100063622118097/",
    },
    { name: "Podzamcze", url: "https://www.facebook.com/podzamczegorlice/" },
    {
        name: "Bona bistro-bar",
        url: "https://www.facebook.com/803975942806402/",
    },
    {
        name: "Bar New York",
        url: "https://www.facebook.com/barnewyorkgorlice/",
    },
    {
        name: "Bar Wojtek",
        url: "https://www.facebook.com/p/Bar-mleczny-Wojtek-Gorlice-100063715833727/",
    },
    {
        name: "Stambuł Kebap",
        url: "https://www.facebook.com/p/KEBAP-Stambu%C5%82-new-100057644341776/",
    },
];

async function analyzeWithAI(
    posts: { content: string; image?: string | null; postDate?: string }[],
) {
    const model = genAI.getGenerativeModel({
        model: "gemini-3.1-flash-lite-preview",
        generationConfig: { responseMimeType: "application/json" },
    });

    const today = new Date();
    const todayStr = today.toLocaleDateString("pl-PL", {
        weekday: "long",
        day: "numeric",
        month: "long",
    });

    const prompt = `Jesteś ekspertem od menu restauracji. Dzisiaj jest ${todayStr}, rok 2026.
    Przeanalizuj posty. Zwróć obiekt JSON, gdzie kluczem jest data w formacie YYYY-MM-DD, a wartością menu (obiekt lub tablica obiektów).
    
    ZASADY:
    1. Jeśli post zawiera menu na cały tydzień (np. Podzamcze), wygeneruj wpisy dla KAŻDEGO dnia (pon-pt).
    2. Jeśli post nie ma daty, załóż że menu dotyczy dnia publikacji posta (podanego w danych).
    3. Ignoruj posty starsze niż dzisiejszy tydzień, chyba że to menu tygodniowe obejmujące dzisiejszy dzień.
    4. Stambuł Kebab: jeśli post jest z 13 marca (piątek), a dzisiaj jest niedziela/poniedziałek, nie przypisuj go do dzisiaj!
    
    FORMAT ZWROTNY:
    {
      "2026-03-15": {"soup": "...", "mainCourse": "...", "price": 28},
      "2026-03-16": [{"soup": "...", "mainCourse": "...", "price": 28}]
    }
    Zwróć pusty obiekt {}, jeśli nie znaleziono nic aktualnego.`;

    const parts: any[] = [{ text: prompt }];

    for (const [index, post] of posts.entries()) {
        parts.push({
            text: `--- POST #${index + 1} ---\nData posta (relatywna): ${post.postDate}\nTreść: ${post.content}`,
        });

        if (post.image && post.image.startsWith("http")) {
            try {
                const response = await fetch(post.image);
                const buffer = await response.arrayBuffer();
                parts.push({
                    inlineData: {
                        data: Buffer.from(buffer).toString("base64"),
                        mimeType: "image/jpeg",
                    },
                });
            } catch (e) {}
        }
    }

    try {
        const result = await model.generateContent(parts);
        let responseText = result.response.text().trim();

        // Czyszczenie JSONa (naprawa błędu z Twoich logów)
        responseText = responseText
            .replace(/^[^{|[^\\[]*/, "")
            .replace(/[^}\\]]*$/, "");
        return JSON.parse(responseText);
    } catch (err) {
        console.error("  ❌ Błąd AI/JSON:", (err as any).message);
        return null;
    }
}

async function runScraper() {
    console.log("🚀 Rozpoczynam pracę scrapera (History Aware)...");
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        userAgent:
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    });

    // ... (kod ciasteczek bez zmian)
    if (process.env.FACEBOOK_COOKIES) {
        const rawCookies = JSON.parse(process.env.FACEBOOK_COOKIES);
        const cleanedCookies = rawCookies.map((c: any) => ({
            ...c,
            sameSite: !c.sameSite
                ? "Lax"
                : c.sameSite.toLowerCase() === "no_restriction"
                  ? "None"
                  : c.sameSite.charAt(0).toUpperCase() + c.sameSite.slice(1),
        }));
        await context.addCookies(cleanedCookies);
    }

    const page = await context.newPage();

    for (const res of RESTAURANTS) {
        try {
            console.log(`\n🔍 Sprawdzam: ${res.name}...`);

            // --- SPRAWDZANIE DUPLIKATU ---
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const existing = await db
                .select()
                .from(menus)
                .where(
                    and(
                        eq(menus.restaurantName, res.name),
                        sql`DATE(${menus.date}) = DATE(${today.toISOString()})`,
                    ),
                )
                .limit(1);

            if (existing.length > 0 && res.name !== "Podzamcze") {
                // Podzamcze zawsze sprawdzamy by uzupełnić tydzień
                console.log(
                    `✅ Menu dla ${res.name} na dzisiaj już istnieje w bazie. Pomijam.`,
                );
                continue;
            }

            await page.goto(res.url, {
                waitUntil: "domcontentloaded",
                timeout: 30000,
            });
            await page.waitForTimeout(4000);

            // Pobieranie postów z datami
            const postsData = await page.evaluate(() => {
                const collected = [];
                const articles = document.querySelectorAll(
                    'div[role="article"], div[aria-posinset]',
                );

                for (const el of Array.from(articles)) {
                    if (collected.length >= 3) break;
                    const htmlEl = el as HTMLElement;

                    // Szukanie daty posta (Facebookowe linki/spany z czasem)
                    const dateEl = htmlEl.querySelector(
                        'span[id^="jsc_c"], a[role="link"] > span, span > a > span',
                    );
                    const postDate = dateEl
                        ? (dateEl as HTMLElement).innerText
                        : "brak daty";

                    const textParts: string[] = [];
                    htmlEl
                        .querySelectorAll('div[dir="auto"], span[dir="auto"]')
                        .forEach((t) => {
                            const txt = (t as HTMLElement).innerText.trim();
                            if (txt.length > 10) textParts.push(txt);
                        });

                    let imgUrl = null;
                    const img = htmlEl.querySelector(
                        "img:not([src*='static']):not([src*='emoji'])",
                    ) as HTMLImageElement;
                    if (img && img.naturalWidth > 200) imgUrl = img.src;

                    if (textParts.length > 0 || imgUrl) {
                        collected.push({
                            content: textParts.slice(0, 5).join("\n"),
                            image: imgUrl,
                            postDate,
                        });
                    }
                }
                return collected;
            });

            if (postsData.length > 0) {
                console.log(`🤖 Analiza AI...`);
                const fullSchedule = await analyzeWithAI(postsData);

                if (fullSchedule && Object.keys(fullSchedule).length > 0) {
                    for (const [dateKey, menuContent] of Object.entries(
                        fullSchedule,
                    )) {
                        const targetDate = new Date(dateKey);

                        // Sprawdź czy dla tej konkretnej daty już coś mamy
                        const subExisting = await db
                            .select()
                            .from(menus)
                            .where(
                                and(
                                    eq(menus.restaurantName, res.name),
                                    sql`DATE(${menus.date}) = DATE(${targetDate.toISOString()})`,
                                ),
                            )
                            .limit(1);

                        if (subExisting.length === 0) {
                            await db.insert(menus).values({
                                restaurantName: res.name,
                                content: menuContent as any,
                                rawText: postsData[0].content,
                                date: targetDate,
                            });
                            console.log(
                                `✅ Zapisano menu na dzień: ${dateKey}`,
                            );
                        }
                    }
                } else {
                    console.log(`ℹ️  AI nie znalazło aktualnych danych.`);
                }
            }
            await page.waitForTimeout(3000);
        } catch (err) {
            console.error(`❌ Błąd przy ${res.name}:`, (err as any).message);
        }
    }

    await browser.close();
    process.exit(0);
}

runScraper();
