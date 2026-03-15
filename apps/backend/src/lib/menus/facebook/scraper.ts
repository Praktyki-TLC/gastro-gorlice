import { GoogleGenerativeAI } from "@google/generative-ai";
import type { BrowserContext } from "playwright";
import { type ScrapedPost, type WeeklySchedule } from "shared";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function scrapeFacebookPage(
    context: BrowserContext,
    url: string,
): Promise<ScrapedPost[]> {
    const mobileUrl = url.replace("www.facebook.com", "m.facebook.com");
    const page = await context.newPage();

    try {
        console.log(`  📱 Próba precyzyjnego scrapowania: ${mobileUrl}`);

        await page.goto(mobileUrl, {
            waitUntil: "domcontentloaded",
            timeout: 30000,
        });

        // Czekamy na załadowanie kluczowych komponentów MComponent
        await page.waitForTimeout(4000);

        // Opcjonalne przewinięcie, żeby dociągnąć posty
        await page.mouse.wheel(0, 500);
        await page.waitForTimeout(1000);

        const postsData = await page.evaluate(() => {
            const results: { content: string; postDate: string }[] = [];

            // 1. Znajdujemy wszystkie elementy daty wg Twojego wzorca
            const dateSelectors =
                "div[data-mcomponent='TextArea'][data-type='text'][aria-label][data-focusable]";
            const dateElements = Array.from(
                document.querySelectorAll(dateSelectors),
            );

            dateElements.forEach((dateEl) => {
                try {
                    const label = dateEl.getAttribute("aria-label") || "";

                    // Weryfikacja czy to data (by nie złapać innych TextArea)
                    if (
                        !/godz\.|min\.|dni|Wczoraj|stycznia|lutego|marca|kwietnia|maja|czerwca|lipca|sierpnia|września|października|listopada|grudnia/.test(
                            label,
                        )
                    ) {
                        return;
                    }

                    // 2. Twoja ścieżka do tekstu posta:
                    // .parentElement.parentElement.parentElement.parentElement.nextSibling
                    let postContent = "";
                    const headerContainer =
                        dateEl.parentElement?.parentElement?.parentElement
                            ?.parentElement;
                    const contentSibling =
                        headerContainer?.nextSibling as HTMLElement;

                    if (contentSibling) {
                        // Szukamy spana wewnątrz rodzeństwa (Twoje: .querySelector("div div div div span"))
                        const span = contentSibling.querySelector("span");
                        if (span) {
                            postContent = span.innerText.trim();
                        }
                    }

                    // Rezerwowy mechanizm jeśli nextSibling nie zadziała (czasem FB wstawia tam puste divy/skrypty)
                    if (!postContent) {
                        const fallbackContent =
                            headerContainer?.parentElement?.querySelector(
                                'span[class^="f"], .native-text span',
                            );
                        postContent =
                            (
                                fallbackContent as HTMLElement
                            )?.innerText.trim() || "";
                    }

                    if (postContent.length > 15) {
                        results.push({
                            content: postContent,
                            postDate: label.split(",")[0].trim(),
                        });
                    }
                } catch (e) {
                    // Ignorujemy błędy dla pojedynczego posta
                }
            });

            return results;
        });

        // Unikalność
        const uniquePosts = postsData.filter(
            (v, i, a) => a.findIndex((t) => t.content === v.content) === i,
        );

        console.log(`  ✅ Sukces! Wyciągnięto ${uniquePosts.length} postów.`);
        return uniquePosts;
    } catch (err) {
        console.error(`  ❌ Błąd krytyczny scrapera ${url}:`, err);
        return [];
    } finally {
        await page.close();
    }
}

export async function analyzeMenuWithAI(
    posts: ScrapedPost[],
): Promise<WeeklySchedule | null> {
    if (posts.length === 0) return null;

    const model = genAI.getGenerativeModel({
        model: "gemini-3.1-flash-lite-preview",
        generationConfig: { responseMimeType: "application/json" },
    });

    const now = new Date();
    const todayISO = now.toISOString().split("T")[0];
    const todayStr = now.toLocaleDateString("pl-PL", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    const prompt = `Dzisiaj jest ${todayStr}, data: ${todayISO}.
    Przeanalizuj poniższe posty z Facebooka restauracji.
    
    ZADANIE:
    1. Każdy post ma przypisany "relatywny czas" (np. "9 godz. temu", "Wczoraj o 12:00", "12 marca").
    2. Oblicz dokładną datę YYYY-MM-DD dla każdego posta względem dzisiejszej daty (${todayISO}).
    3. Zidentyfikuj, czy post zawiera menu obiadowe (dania dnia, zupy, ceny).
    4. Jeśli post zawiera menu na wiele dni (np. na cały tydzień), rozbij je na osobne daty w JSONie.

    JSON FORMAT:
    {
      "YYYY-MM-DD": {
        "soups": [{"name": "string", "price": number}],
        "courses": [{"name": "string", "price": number}],
        "fullSetPrice": number | null
      }
    }`;

    // Łączymy treść z datą relatywną dla AI
    const contentForAI = posts
        .map((p) => `DATA Z FB: ${p.postDate}\nTREŚĆ: ${p.content}`)
        .join("\n\n---\n\n");

    try {
        const result = await model.generateContent([prompt, contentForAI]);
        const parsed = JSON.parse(result.response.text()) as WeeklySchedule;

        // Bierzemy tylko menu, które nie jest z zamierzchłej przeszłości
        const validated: WeeklySchedule = {};
        for (const [date, data] of Object.entries(parsed)) {
            // Akceptujemy datę dzisiejszą, przyszłe lub wczorajszą (czasem menu wrzucają późno)
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayISO = yesterday.toISOString().split("T")[0];

            if (date >= yesterdayISO) {
                validated[date] = data;
            }
        }
        return Object.keys(validated).length > 0 ? validated : null;
    } catch (e) {
        console.error("  🤖 Błąd AI przy analizie:", e);
        return null;
    }
}
