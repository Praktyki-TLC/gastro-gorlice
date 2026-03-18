import { DailyMenuContent, ProcessedPost, ScrapedPost } from "shared";
import { type BrowserContext } from "playwright";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { getImageBase64 } from "../../utils";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function scrapeFacebookPosts(
    context: BrowserContext,
    url: string,
): Promise<ScrapedPost[]> {
    const mobileUrl = url.replace("www.facebook.com", "m.facebook.com");
    const page = await context.newPage();

    await page.goto(mobileUrl, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
    });
    await page.mouse.wheel(0, 1000);

    await page.waitForTimeout(3000);

    
    const postsData = await page.evaluate(async () => {
        const dateElements = Array.from(
            document.querySelectorAll(
                "div[data-type='container'] div[data-type='container'] div:last-child div:nth-child(2) :nth-child(2)[data-mcomponent='TextArea'][data-type='text'][aria-label][data-focusable]",
            ),
        );

        const scrapedPromises = dateElements.map(async (x) => {
            try {
                const postDate = x.getAttribute("aria-label") || "";

                const textSpan = (
                    x.parentElement?.parentElement?.parentElement?.parentElement
                        ?.nextSibling as HTMLElement
                )?.querySelector("div div div div span") as HTMLElement;

                /* Rozwijanie tekstu z czekaniem */
                if (textSpan && textSpan.nextSibling) {
                    const expandButton = textSpan.nextSibling as HTMLElement;
                    const oldText = textSpan.textContent;

                    expandButton.click();

                    await new Promise((resolve) => {
                        let attempts = 0;
                        const checkInterval = setInterval(() => {
                            attempts++;
                            if (
                                (
                                    (
                                        x.parentElement?.parentElement
                                            ?.parentElement?.parentElement
                                            ?.nextSibling as HTMLElement
                                    )?.querySelector(
                                        "div div div div span",
                                    ) as HTMLElement
                                )?.textContent !== oldText ||
                                attempts > 15
                            ) {
                                clearInterval(checkInterval);
                                resolve(true);
                            }
                        }, 100);
                    });
                }

                const content =
                    (
                        x.parentElement?.parentElement?.parentElement
                            ?.parentElement?.nextSibling as HTMLElement
                    )?.querySelector("div div div div span")?.textContent || "";

                /* Obrazek */
                let image: string | null = (x?.parentElement?.parentElement?.parentElement?.parentElement?.nextSibling as HTMLElement)?.querySelector("div div:last-child div img")?.getAttribute("src") || null;

                if(!image) image = (
                    x.parentElement?.parentElement?.parentElement?.parentElement
                        ?.nextSibling?.nextSibling as HTMLDivElement
                )
                    ?.querySelector("div div img")
                    ?.getAttribute("src") || null;

                return {
                    postDate,
                    content,
                    image,
                };
            } catch (_e) {
                return null;
            }
        });

        const results = await Promise.all(scrapedPromises);
        return results
            .filter((post) => post && post.postDate.match(/, Publiczne/))
            .map((post) => {
                return {
                    ...post!,
                    postDate: post!.postDate.replace(/, Publiczne/, "").trim(),
                };
            })
            .filter((post) => post !== null);
    });

    await page.close();
    return postsData;
}
export async function processFacebookPosts(
    context: BrowserContext,
    posts: ScrapedPost[],
): Promise<ProcessedPost[]> {
    return Promise.all(
        posts.map(async (post) => {
            const imageData = post.image
                ? await getImageBase64(context, post.image)
                : null;
            return {
                ...post,
                imageData,
            };
        }),
    );
}

export async function analyzeFacebookPosts(
    posts: ProcessedPost[],
): Promise<Record<string, DailyMenuContent>> {
    if (posts.length === 0) return {};

    const model = genAI.getGenerativeModel({
        model: "gemini-3.1-flash-lite-preview",
        generationConfig: { responseMimeType: "application/json" },
    });

    const now = new Date();
    const todayStr = now.toLocaleDateString("pl-PL", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
    const todayISO = now.toISOString().split("T")[0];

    const filePath = path.join(__dirname, "prompt.txt");
    const promptText = (await readFile(filePath, "utf-8"))
        .replace("[todayStr]", todayStr)
        .replace("[todayISO]", todayISO);

    const parts: any[] = [{ text: promptText }];
    posts.forEach((p, i) => {
        parts.push({
            text: `--- POST #${i + 1} (Data z Facebooka: ${p.postDate}) ---\nTREŚĆ: ${p.content}`,
        });
        if (p.imageData) parts.push(p.imageData);
    });

    const result = await model.generateContent(parts);

    let text = result.response.text().trim();
    text = text.replace(/^[^{|[^\\[]*/, "").replace(/[^}\\]]*$/, "");
    return JSON.parse(text);
}
