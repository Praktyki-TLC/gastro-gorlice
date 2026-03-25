import { BACKEND_URL } from "$env/static/private";
import { error } from "@sveltejs/kit";

export const load = async ({ fetch, params }) => {
  const res = await fetch(`${BACKEND_URL}/admin/logs/${params.id}`);

  if (!res.ok) {
    throw error(404, "Nie znaleziono takiego logu");
  }

  return {
    log: await res.json(),
  };
};
