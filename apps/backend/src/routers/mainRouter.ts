import {
    db,
    MenuByDateResponse,
    menus,
    menusLogs,
    RestaurantDetailsResponse,
    restaurants,
    TodayMenusResponse,
} from "shared";
import { Hono } from "hono";
import { eq, and, gte, lte, desc, sql, asc } from "drizzle-orm";

const mainRouter = new Hono();

mainRouter.get("/", (c) => {
    return c.text("👋 gastro-gorlice api");
});

mainRouter.get("/menus/today", async (c) => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const results = await db
        .select({
            name: restaurants.name,
            slug: restaurants.slug,
            sourceUrl: restaurants.scrapingUrl,

            content: menus.content,
        })
        .from(restaurants)
        .leftJoin(
            menus,
            and(
                eq(menus.restaurantId, restaurants.id),
                gte(menus.date, startOfToday),
                lte(menus.date, endOfToday),
            ),
        );

    const lastUpdate = await db
        .select({
            date: menusLogs.date,
        })
        .from(menusLogs)
        .orderBy(desc(menusLogs))
        .limit(1);

    return c.json<TodayMenusResponse>({
        lastUpdate: lastUpdate[0]?.date || null,
        todayMenus: results.sort((a, b) => a.name.localeCompare(b.name)),
    });
});

/* Menu restauracji z danego dnia */
mainRouter.get("/menus/:slug/:date", async (c) => {
    const { slug, date } = c.req.param();

    const restaurant = (
        await db
            .select()
            .from(restaurants)
            .where(eq(restaurants.slug, slug))
            .limit(1)
    )[0];

    if (!restaurant) {
        return c.json({ error: "Restaurant not found" }, 404);
    }

    const menu = await db
        .select({
            content: menus.content,
            date: menus.date,
        })
        .from(menus)
        .where(
            and(
                eq(menus.restaurantId, restaurant.id),
                eq(menus.date, new Date(date)),
            ),
        )
        .limit(1);

    if (menu.length === 0) {
        return c.json({ error: "Menu not found for the given date" }, 404);
    }

    return c.json<MenuByDateResponse>({
        content: menu[0].content,
        date: menu[0].date,
    });
});

mainRouter.get("/restaurant/:slug", async (c) => {
    const { slug } = c.req.param();

    const restaurant = (
        await db
            .select()
            .from(restaurants)
            .where(eq(restaurants.slug, slug))
            .limit(1)
    )[0];

    if (!restaurant) {
        return c.json({ error: "Restaurant not found" }, 404);
    }

    const menusDates = await db
        .select({
            date: menus.date,
        })
        .from(menus)
        .where(eq(menus.restaurantId, restaurant.id))
        .orderBy(desc(menus.date));

    const lastMenu = await db
        .select({
            content: menus.content,
            date: menus.date,
        })
        .from(menus)
        .where(eq(menus.restaurantId, restaurant.id))
        .orderBy(desc(menus.date))
        .limit(1);

    // Menu price history aggregated by day
    const menuPriceHistoryByDay = await db
        .select({
            date: menus.date,
            price: sql<
                number | null
            >`(${menus.content}->>'fullSetPrice')::numeric`,
        })
        .from(menus)
        .where(eq(menus.restaurantId, restaurant.id))
        .orderBy(asc(menus.date)).limit(14);

    const menuPriceHistoryByWeek = await db
        .select({
            week: sql<string>`date_trunc('week', ${menus.date})`.as("week"),
            price: sql<number>`AVG((${menus.content}->>'fullSetPrice')::numeric)`,
        })
        .from(menus)
        .where(eq(menus.restaurantId, restaurant.id))
        .groupBy(sql`week`)
        .orderBy(asc(sql`week`)).limit(10);

    return c.json<RestaurantDetailsResponse>({
        restaurant: {
            name: restaurant.name,
            slug: restaurant.slug,
            phoneNumber: restaurant.phoneNumber,
            address: restaurant.address,
            webpage: restaurant.webpage,
            imageUrl: restaurant.imageUrl,
            facebookUrl:
                restaurant.provider === "facebook"
                    ? restaurant.scrapingUrl
                    : null,
        },
        menuPriceHistory: {
            byDay: menuPriceHistoryByDay,
            byWeek: menuPriceHistoryByWeek,
        },
        menusDates: menusDates.map((m) => m.date.toISOString().split("T")[0]),
        lastMenu: lastMenu[0] || null,
    });
});

export default mainRouter;
