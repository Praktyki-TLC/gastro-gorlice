import { ProcessedPost, ScrapedPost } from "shared";
import { type BrowserContext } from "playwright";
import { getImageBase64 } from "../../utils";

export async function scrapeFacebookPosts(
    context: BrowserContext,
    url: string
): Promise<ScrapedPost[]> {
    const mobileUrl = url.replace("www.facebook.com", "m.facebook.com");
    const page = await context.newPage();

    await page.goto(mobileUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(3000);

    const postsData = page.evaluate(() => {
        const dateElements = Array.from(
            document.querySelectorAll("div[data-type='container'] div[data-type='container'] div:last-child div:nth-child(2) :nth-child(2)[data-mcomponent='TextArea'][data-type='text'][aria-label][data-focusable]")
        );

        return dateElements.map((x) => {
            try {
                const postDate = x.getAttribute("aria-label") || "";
                const postContainer = x.parentElement?.parentElement?.parentElement?.parentElement;
                const contentContainer = postContainer?.nextSibling as HTMLElement;

                const textSpan = contentContainer?.querySelector("div div div div span") as HTMLElement;
                if (textSpan && textSpan.nextSibling) (textSpan.nextSibling as HTMLElement).click();
                const content = textSpan ? textSpan.textContent || "" : "";

                const image = (x.parentElement?.parentElement?.parentElement?.parentElement?.nextSibling?.nextSibling as HTMLDivElement)?.querySelector("div div img")?.getAttribute("src");

                return {
                    postDate,
                    content,
                    image
                }
            } catch (_e) {
                return null;
            }
        })
            .filter(post => post && post.postDate.match(/, Publiczne/))
            .map(post => {
                return {
                    ...post!,
                    postDate: post!.postDate.replace(/, Publiczne/, "").trim()
                }
            })
            .filter(post => post !== null);
    })

    return postsData;
}

export async function processFacebookPosts(context: BrowserContext, posts: ScrapedPost[]): Promise<ProcessedPost[]> {
    return Promise.all(posts.map(async (post) => {
        const imageData = post.image ? await getImageBase64(context, post.image) : null;
        return {
            ...post,
            imageData
        }
    }))
}

export async function analyzeFacebookPosts(context: BrowserContext, posts: ScrapedPost[]) {}