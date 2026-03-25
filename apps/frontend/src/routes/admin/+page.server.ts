import { BACKEND_URL } from "$env/static/private";
import { fail, redirect } from "@sveltejs/kit";

export const load = async ({ fetch }) => {
  const res = await fetch(`${BACKEND_URL}/admin/restaurants`);

  if (!res.ok) return { restaurants: [] };

  return { restaurants: await res.json() };
};

export const actions = {
  delete: async ({ request, fetch }) => {
    const data = await request.formData();
    const id = data.get("id");

    const res = await fetch(`${BACKEND_URL}/admin/restaurants/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) return fail(res.status, { message: "Błąd podczas usuwania" });
    return { success: true };
  },
  sync: async ({ fetch }) => {
    const res = await fetch(`${BACKEND_URL}/admin/sync`, { method: "POST" });
    if (!res.ok) return fail(500, { message: "Sync nieudany" });
    return { success: true };
  },
};
