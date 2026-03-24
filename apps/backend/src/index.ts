import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { CronJob } from "cron";
import { Hono } from "hono";

import { MenusManager } from "./lib/menus/MenusManager";
import adminRouter from "./routers/adminRouter";
import mainRouter from "./routers/mainRouter";

const app = new Hono();

export const menusManager = new MenusManager();
new CronJob("0,10,30 10,11 * * 1-5", async () =>{
    await menusManager.updateMissingMenus();
})
if(process.env.NODE_ENV === "development") {
    (async () => {
        await menusManager.updateMissingMenus();
    })();
}

app.use(
    "*",
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
        allowHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    }),
);

app.route("/", mainRouter);
app.route("/admin", adminRouter);

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
