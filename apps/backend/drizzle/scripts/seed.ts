import { db, restaurants } from "shared";
import { exit } from "process";

const initialRestaurants = [
    {
        name: "Del Piero",
        slug: "del-piero",
        provider: "facebook",
        scrapingUrl:
            "https://www.facebook.com/p/Pizzeria-Del-Piero-100063622118097/",
    },
    {
        name: "Stambuł Kebap",
        slug: "stambul-kebap",
        provider: "facebook",
        scrapingUrl:
            "https://www.facebook.com/p/KEBAP-Stambu%C5%82-new-100057644341776/",
    },
    {
        name: "Podzamcze",
        slug: "podzamcze",
        provider: "facebook",
        scrapingUrl: "https://www.facebook.com/podzamczegorlice/",
    },
    {
        name: "Bona bistro-bar",
        slug: "bona",
        provider: "facebook",
        scrapingUrl: "https://www.facebook.com/803975942806402/",
    },
    {
        name: "Pub Pizzeria Chili",
        slug: "chili",
        provider: "facebook",
        scrapingUrl: "https://www.facebook.com/PubPizzeriaChili/",
    },
    {
        name: "Klub Bilardowy Ósemka & Club 10 Kręgielnia",
        slug: "kregielnia",
        provider: "facebook",
        scrapingUrl: "https://www.facebook.com/bilard.kregle/",
    },
    {
        name: "Bar New York",
        slug: "bar-new-york",
        provider: "facebook",
        scrapingUrl: "https://www.facebook.com/barnewyorkgorlice/",
    },
    {
        name: "Bar mleczny Wojtek",
        slug: "bar-wojtek",
        provider: "facebook",
        scrapingUrl:
            "https://www.facebook.com/p/Bar-mleczny-Wojtek-Gorlice-100063715833727/",
    },
    {
        name: "Lucy Bar",
        slug: "lucy-bar",
        provider: "facebook",
        scrapingUrl: "https://www.facebook.com/p/Lucy-Bar-100057188120549/",
    },
    {
        name: "Dark Pub",
        slug: "dark-pub",
        provider: "facebook",
        scrapingUrl:
            "https://www.facebook.com/p/Dark-Pub-Hotelik-Official-100063812942422/",
    },
    {
        name: "Restauracja Dworcowa",
        slug: "dworcowa",
        provider: "facebook",
        scrapingUrl: "https://www.facebook.com/dworcowagorlice/",
    },
];

async function seed() {
    console.log("Dodawanie danych...");

    try {
        for (const res of initialRestaurants) {
            await db
                .insert(restaurants)
                .values(res as any)
                .onConflictDoUpdate({
                    target: restaurants.slug,
                    set: {
                        name: res.name,
                        scrapingUrl: res.scrapingUrl,
                        provider: res.provider as any,
                    },
                });
            console.log(`+ ${res.name}`);
        }
        console.log("\nSeedowanie zostało zakończone.");
    } catch (error) {
        console.error("\nWystąpił błąd podczas seedowania:", error);
    } finally {
        exit(0);
    }
}

seed();
