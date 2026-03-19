import { db, menus, menusLogs, restaurants, TodayMenusResponse } from "shared";
import { Hono } from "hono";
import { eq, and, gte, lte, desc } from "drizzle-orm";

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
            imageUrl: restaurants.imageUrl,

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
        todayMenus: results
    });
})

export default mainRouter;