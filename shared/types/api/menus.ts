export interface TodayMenu {
    name: string;
    slug: string;
    imageUrl: string | null;
    content: {
        soups: {
            name: string;
            price: number | null;
        }[];
        courses: {
            name: string;
            price: number | null;
        }[];
        fullSetPrice: number | null;
    } | null;
}

export type TodayMenusResponse = TodayMenu[];
