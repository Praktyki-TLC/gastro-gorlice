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

    const restaurant = await db
        .select()
        .from(restaurants)
        .where(eq(restaurants.slug, slug))
        .limit(1);

    if (restaurant.length === 0) {
        return c.json({ error: "Restaurant not found" }, 404);
    }

    return c.json(restaurant[0]);
})

export default mainRouter;