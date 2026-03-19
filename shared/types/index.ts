export * from './api/restaurants';
export * from './api/menus';

export interface MenuItem {
    name: string;
    price: number | null;
}

export interface DailyMenuContent {
    soups: MenuItem[];
    courses: MenuItem[];
    fullSetPrice: number | null;
}

// Record<"YYYY-MM-DD", DailyMenuContent | DailyMenuContent[]>
export type WeeklySchedule = Record<
    string,
    DailyMenuContent | DailyMenuContent[]
>;

export interface ScrapedPost {
    content: string;
    image?: string | null;
    postDate: string;
}

export interface ProcessedPost extends ScrapedPost {
    imageData?: {
        inlineData: {
            data: string;
            mimeType: string;
        }
    } | null;
}

export interface PushSubscriptionKeys {
    p256dh: string;
    auth: string;
}