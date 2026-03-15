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

export interface PushSubscriptionKeys {
    p256dh: string;
    auth: string;
}
