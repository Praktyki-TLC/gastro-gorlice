import { db, menus, menusLogs, RestaurantDetailsResponse, restaurants, TodayMenusResponse } from "shared";
import { Hono } from "hono";
import { eq, and, gte, lte, desc, sql, asc } from "drizzle-orm";

const mainRouter = new Hono();

mainRouter.get("/", (c) => {
    return c.text("👋 gastro-gorlice api");
})

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
                lte(menus.date, endOfToday)
            )
        );

    const lastUpdate = await db.select({
        date: menusLogs.date
    }).from(menusLogs).orderBy(desc(menusLogs)).limit(1);
    
    return c.json<TodayMenusResponse>({
        lastUpdate: lastUpdate[0]?.date || null,
        todayMenus: results.sort((a, b) => a.name.localeCompare(b.name)),
    });
})

mainRouter.get("/restaurant/:slug", async (c) => {
    const { slug } = c.req.param();

    const restaurant = (await db
        .select()
        .from(restaurants)
        .where(eq(restaurants.slug, slug))
        .limit(1))[0];

    if (!restaurant) {
        return c.json({ error: "Restaurant not found" }, 404);
    }

    // Menu price history aggregated by day
    const menuPriceHistoryByDay = await db
    .select({
      date: menus.date,
      price: sql<number | null>`(${menus.content}->>'fullSetPrice')::numeric`,
    })
    .from(menus)
    .where(eq(menus.restaurantId, restaurant.id))
    .orderBy(asc(menus.date));
    
    const menuPriceHistoryByWeek = await db
    .select({
      week: sql<string>`date_trunc('week', ${menus.date})`.as("week"),
      price: sql<number>`AVG((${menus.content}->>'fullSetPrice')::numeric)`,
    })
    .from(menus)
    .where(eq(menus.restaurantId, restaurant.id))
    .groupBy(sql`week`) 
    .orderBy(asc(sql`week`));

    return c.json<RestaurantDetailsResponse>({
         restaurant: {
            name: restaurant.name,
            slug: restaurant.slug,
            phoneNumber: restaurant.phoneNumber,
            address: restaurant.address,
            webpage: restaurant.webpage,
            imageUrl: restaurant.imageUrl,
            facebookUrl: restaurant.provider === "facebook" ? restaurant.scrapingUrl : null,
         }, 
         menuPriceHistory: {
            byDay: menuPriceHistoryByDay,
            byWeek: menuPriceHistoryByWeek
         }
    });
})

export default mainRouter;