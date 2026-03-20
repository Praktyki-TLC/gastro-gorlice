export interface MenuContent {
    soups: {
        name: string;
        price: number | null;
    }[];
    courses: {
        name: string;
        price: number | null;
    }[];
    fullSetPrice: number | null;
}

export interface TodayMenu {
    name: string;
    slug: string;
    sourceUrl: string | null;
    content: MenuContent | null;
}

export type TodayMenusResponse = {
    lastUpdate: Date | null;
    todayMenus: TodayMenu[];
};

export type MenuByDateResponse = {
    content: MenuContent;
        date: Date;
}