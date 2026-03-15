import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { MenusManager } from "./lib/menus/MenusManager";

const app = new Hono();

new MenusManager().updateAllMissingMenus();

app.get("/", (c) => {
    return c.text("Hello Hono!");
});

serve(
    {
        fetch: app.fetch,
        port: 4202,
    },
    (info) => {
        console.log(`Server is running on http://localhost:${info.port}`);
    },
);
