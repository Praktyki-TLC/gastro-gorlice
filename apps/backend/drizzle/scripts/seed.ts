import { db, RestaurantInsert, restaurants } from "shared";
import { exit } from "process";

const initialRestaurants = [
    {
        name: "Del Piero",
        slug: "del-piero",
        address: "Tadeusza Kościuszki 42m, 38-300 Gorlice",
        phoneNumber: "+48 516 461 135",
        webpage: "https://www.delpiero.gorlice.pl/",
        provider: "facebook",
        scrapingUrl:
            "https://www.facebook.com/p/Pizzeria-Del-Piero-100063622118097/",
    },
    {
        name: "Stambuł Kebap",
        slug: "stambul-kebap",
        address: "Biecka 12, 38-300 Gorlice",
        phoneNumber: "+48 733 288 885",
        webpage:
            "https://www.facebook.com/KEBAP-Stambu%C5%82-new-110339720723448/",
        provider: "facebook",
        scrapingUrl:
            "https://www.facebook.com/p/KEBAP-Stambu%C5%82-new-100057644341776/",
    },
    {
        name: "Podzamcze",
        slug: "podzamcze",
        address: "Krakowska 44, 38-300 Gorlice",
        phoneNumber: "+48 602 296 933",
        webpage: "https://www.podzamcze.gorlice.pl/",
        provider: "facebook",
        scrapingUrl: "https://www.facebook.com/podzamczegorlice/",
    },
    {
        name: "Bona bistro-bar",
        slug: "bona",
        address: "Solidarności 1, 38-300 Gorlice",
        phoneNumber: "+48 572 494 371",
        webpage: "https://www.facebook.com/share/193PKTwV95/",
        provider: "facebook",
        scrapingUrl: "https://www.facebook.com/803975942806402/",
    },
    {
        name: "Pub Pizzeria Chili",
        slug: "chili",
        address: "Adama Mickiewicza 8, 38-300 Gorlice",
        phoneNumber: "+48 18 354 00 80",
        webpage: "https://chiligorlice.pl/",
        provider: "facebook",
        scrapingUrl: "https://www.facebook.com/PubPizzeriaChili/",
    },
    {
        name: "Klub Bilardowy Ósemka & Club 10 Kręgielnia",
        slug: "kregielnia",
        address: "Pierwsze piętro, Parkowa 6/4, 38-300 Gorlice",
        phoneNumber: "+48 18 352 66 99",
        webpage: "http://www.klub8club10.pl/",
        provider: "facebook",
        scrapingUrl: "https://www.facebook.com/bilard.kregle/",
    },
    {
        name: "Bar New York",
        slug: "bar-new-york",
        address: "Świeykowskiego 3, 38-300 Gorlice",
        phoneNumber: "+48 18 353 68 25",
        webpage: "https://www.facebook.com/barnewyorkgorlice/",
        provider: "facebook",
        scrapingUrl: "https://www.facebook.com/barnewyorkgorlice/",
    },
    {
        name: "Bar mleczny Wojtek",
        slug: "bar-wojtek",
        address: "Mikołaja Kopernika 10, 38-300 Gorlice",
        phoneNumber: "+48 571 243 989",
        webpage: "https://barwojtekgorlice.pl/",
        provider: "facebook",
        scrapingUrl:
            "https://www.facebook.com/p/Bar-mleczny-Wojtek-Gorlice-100063715833727/",
    },
    {
        name: "Lucy Bar",
        slug: "lucy-bar",
        address: "Dukielska 85A, 38-300 Gorlice",
        phoneNumber: "723 834 440",
        webpage: "https://www.facebook.com/p/Lucy-Bar-100057188120549/",
        provider: "facebook",
        scrapingUrl: "https://www.facebook.com/p/Lucy-Bar-100057188120549/",
    },
    {
        name: "Dark Pub",
        slug: "dark-pub",
        address: "Wąska 11, 38-300 Gorlice",
        phoneNumber: "+48 733 575 759",
        webpage: "https://darkpub.pl/",
        provider: "facebook",
        scrapingUrl:
            "https://www.facebook.com/p/Dark-Pub-Hotelik-Official-100063812942422/",
    },
    {
        name: "Restauracja Dworcowa",
        slug: "dworcowa",
        address: "Bardiowska 3, 38-300 Gorlice",
        phoneNumber: "+48 730 022 404",
        webpage: "https://www.facebook.com/dworcowagorlice/",
        provider: "facebook",
        scrapingUrl: "https://www.facebook.com/dworcowagorlice/",
    },
] as RestaurantInsert[];

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
                        address: res.address,
                        phoneNumber: res.phoneNumber,
                        webpage: res.webpage,
                        imageUrl: res.imageUrl,
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
