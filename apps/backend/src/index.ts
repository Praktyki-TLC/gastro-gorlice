import { serve } from "@hono/node-server";
import { Hono } from "hono";

import adminRouter from "./routers/adminRouter";

const app = new Hono();

app.route("/admin", adminRouter);

app.get("/", (c) => {
    return c.text("👋 gastro-gorlice api");
});

serve(
    {
        fetch: app.fetch,
        port: 6000,
    },
    (info) => {
        console.log(`Serwer chodzi na http://localhost:${info.port}`);
    },
);

export default app;
