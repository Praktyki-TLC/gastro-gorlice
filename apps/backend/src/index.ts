import { serve } from "@hono/node-server";
import { CronJob } from "cron";
import { Hono } from "hono";

import { MenusManager } from "./lib/menus/MenusManager";
import adminRouter from "./routers/adminRouter";
import mainRouter from "./routers/mainRouter";

const app = new Hono();

export const menusManager = new MenusManager();
new CronJob(
    "0,10,30 10,11 * * 1-5",
    async () => {
        await menusManager.updateMissingMenus();
    },
    null,
    true,
    "Europe/Warsaw",
    null,
    process.env.NODE_ENV === "development",
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
