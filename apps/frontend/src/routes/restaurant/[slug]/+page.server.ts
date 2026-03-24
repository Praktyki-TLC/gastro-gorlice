import { BACKEND_URL } from "$env/static/private";
import { error, fail, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import type { MenuByDateResponse, RestaurantDetailsResponse } from "shared";

export const load: PageServerLoad = async ({ params, fetch }) => {
  const { slug } = params;

  const req = await fetch(`${BACKEND_URL}/restaurant/${slug}`);
  if (!req.ok) {
    throw error(req.status, { message: "Nie znaleziono takiej restauracji" });
  }

  const res: RestaurantDetailsResponse = await req.json();
  return {
    ...res,
    backendUrl: BACKEND_URL,
  };
};

export const actions: Actions = {
  updateDate: async ({ request, fetch, params }) => {
    const { slug } = params;
    const formData = await request.formData();
    const date = formData.get("date");
    if (typeof date !== "string") return fail(406, "Nieprawidłowy format daty");

    try {
      const req = await fetch(`${BACKEND_URL}/menus/${slug}/${date}`);

      const res = await req.json();

      if(!req.ok) {
        return fail(req.status, res.error || req.statusText)
      }

      return res;
    } catch (e) {
      return fail(400);
    }
  },
};
