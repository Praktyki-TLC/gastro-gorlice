import { BrowserContext } from "playwright";

export async function getImageBase64(context: BrowserContext, url: string) {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    return {
        inlineData: {
            data: Buffer.from(buffer).toString("base64"),
            mimeType: "image/jpeg",
        },
    };
}
