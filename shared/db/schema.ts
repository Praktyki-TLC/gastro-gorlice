import {
    pgTable,
    serial,
    text,
    jsonb,
    timestamp,
    integer,
    pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { PushSubscriptionKeys } from "../types";

/* Restaurants table */
export const providerEnum = pgEnum("scraping_provider", ["facebook"]);

export const restaurants = pgTable("restaurants", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").unique().notNull(),
    scrapingUrl: text("scraping_url"),
    provider: providerEnum("provider").default("facebook").notNull(),
    imageUrl: text("image_url"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

/* Menus table */
export const menus = pgTable("menus", {
    id: serial("id").primaryKey(),
    restaurantId: integer("restaurant_id")
        .references(() => restaurants.id, { onDelete: "cascade" })
        .notNull(),
    content: jsonb("content")
        .$type<{
            soups: Array<{ name: string; price: number | null }>;
            courses: Array<{ name: string; price: number | null }>;
            fullSetPrice: number | null;
        }>()
        .notNull(),
    rawText: text("raw_text"),
    date: timestamp("date").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

/* Relations */
export const restaurantsRelations = relations(restaurants, ({ many }) => ({
    menus: many(menus),
}));

export const menusRelations = relations(menus, ({ one }) => ({
    restaurant: one(restaurants, {
        fields: [menus.restaurantId],
        references: [restaurants.id],
    }),
}));

export const subscriptions = pgTable("subscriptions", {
    id: serial("id").primaryKey(),
    endpoint: text("endpoint").notNull().unique(),
    keys: jsonb("keys").$type<PushSubscriptionKeys>().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
