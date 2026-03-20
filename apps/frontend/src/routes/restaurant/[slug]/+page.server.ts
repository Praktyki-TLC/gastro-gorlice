import { BACKEND_URL } from "$env/static/private";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import type { RestaurantDetailsResponse } from "shared";

export const load: PageServerLoad = async ({ params, fetch }) => {
    const { slug } = params;
1
    const req = await fetch(`${BACKEND_URL}/restaurant/${slug}`);
    if (!req.ok) {
        throw error(req.status, { message: "Nie znaleziono takiej restauracji" });
    }

    const res: RestaurantDetailsResponse = await req.json();
    return {
        ...res,
        backendUrl: BACKEND_URL,
    };
}