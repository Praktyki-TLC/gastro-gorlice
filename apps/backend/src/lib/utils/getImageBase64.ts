import { BrowserContext } from "playwright";

export async function getImageBase64(context: BrowserContext, url: string) {
    if (!url || url.startsWith('data:') || url.includes('placeholder')) return null;
    try {
        const response = await context.request.get(url);
        const buffer = await response.body();
        return {
            inlineData: {
                data: buffer.toString("base64"),
                mimeType: "image/jpeg"
            }
        };
    } catch (e) {
        return null;
    }
}