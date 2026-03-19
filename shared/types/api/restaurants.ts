export type RestaurantDetailsResponse = {
    restaurant: {
        name: string;
        slug: string;
        phoneNumber: string | null;
        address: string | null;
        webpage: string | null;
        imageUrl: string | null;
        facebookUrl?: string | null;
    };
    menuPriceHistory: {
        byDay: {
            date: Date;
            price: number | null;
        }[];
        byWeek: {
            week: string;
            price: number;
        }[];
    };
}