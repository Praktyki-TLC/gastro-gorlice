import { Hono } from "hono";

const mainRouter = new Hono();

mainRouter.get("/", (c) => {
    return c.text("👋 gastro-gorlice api");
})

export default mainRouter;