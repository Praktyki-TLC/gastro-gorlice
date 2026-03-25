import { Hono } from "hono";
import { basicAuth } from "hono/basic-auth";
import { db, menusLogs, restaurants } from "shared";
import { eq, desc, count } from "drizzle-orm";
import { menusManager } from "..";

const admin = new Hono();

/* Autentykacja */
admin.use(
    "*",
    basicAuth({
        username: process.env.ADMIN_USERNAME || "admin",
        password: process.env.ADMIN_PASSWORD || "admin",
    }),
);

admin.post("/login", (c) => {
    return c.json({ success: true, message: "Zalogowano pomyślnie" });
});

/* --- Restaurants --- */

// Pobieranie wszystkich
admin.get("/restaurants", async (c) => {
    const data = await db.select().from(restaurants);
    return c.json(data);
});

// Pobieranie jednej
admin.get("/restaurants/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const [res] = await db
        .select()
        .from(restaurants)
        .where(eq(restaurants.id, id));
    if (!res) return c.json({ error: "Nie znaleziono" }, 404);
    return c.json(res);
});

// Dodawanie
admin.post("/restaurants", async (c) => {
    const body = await c.req.json();
    try {
        const [newRes] = await db.insert(restaurants).values(body).returning();
        return c.json(newRes, 201);
    } catch (err) {
        return c.json({ error: "Błąd podczas dodawania" }, 400);
    }
});

// Edytowanie
admin.patch("/restaurants/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const body = await c.req.json();
    try {
        const [updated] = await db
            .update(restaurants)
            .set(body)
            .where(eq(restaurants.id, id))
            .returning();
        return c.json(updated);
    } catch (err) {
        return c.json({ error: "Błąd podczas edycji" }, 400);
    }
});

// Usuwanie
admin.delete("/restaurants/:id", async (c) => {
    const id = Number(c.req.param("id"));
    await db.delete(restaurants).where(eq(restaurants.id, id));
    return c.json({ message: "Usunięto pomyślnie" });
});

admin.get("/logs", async (c) => {
    const page = Number(c.req.query("page")) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    const [totalQuery] = await db.select({ value: count() }).from(menusLogs);
    const data = await db
        .select()
        .from(menusLogs)
        .orderBy(desc(menusLogs.createdAt))
        .limit(limit)
        .offset(offset);

    return c.json({
        logs: data,
        total: totalQuery.value,
        pages: Math.ceil(totalQuery.value / limit),
    });
});

// Szczegóły konkretnego logu
admin.get("/logs/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const [log] = await db.select().from(menusLogs).where(eq(menusLogs.id, id));
    if (!log) return c.json({ error: "Nie znaleziono logu" }, 404);
    return c.json(log);
});

admin.post("/sync", async (c) => {
    menusManager.updateMissingMenus();

    return c.json({ message: "Synchronizacja uruchomiona w tle" });
});

export default admin;
