import { serve } from "@hono/node-server";
import { Hono } from "hono";

import adminRouter from "./routers/adminRouter";
import { cors } from "hono/cors";

const app = new Hono();

app.use(
    "*",
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
        allowHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    }),
);

app.route("/admin", adminRouter);

app.get("/", (c) => {
    return c.text("👋 gastro-gorlice api");
});

serve(
    {
        fetch: app.fetch,
        port: 4202,
    },
    (info) => {
        console.log(`Serwer chodzi na http://localhost:${info.port}`);
    },
);

export default app;
