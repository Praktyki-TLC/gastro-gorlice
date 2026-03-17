import { Hono } from "hono";
import { basicAuth } from "hono/basic-auth";
import { db, restaurants } from "shared";
import { eq } from "drizzle-orm";

const admin = new Hono();

/* Autentykacja */
admin.use(
    "*",
    basicAuth({
        username: process.env.ADMIN_USERNAME || "admin",
        password: process.env.ADMIN_PASSWORD || "password",
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

export default admin;
