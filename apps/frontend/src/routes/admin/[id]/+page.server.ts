import { BACKEND_URL } from "$env/static/private";
import { fail, redirect } from "@sveltejs/kit";

export const load = async ({ params, fetch }) => {
  const res = await fetch(`${BACKEND_URL}/admin/restaurants/${params.id}`);

  if (!res.ok) throw redirect(303, "/admin");
  return { restaurant: await res.json() };
};

export const actions = {
  default: async ({ params, request, fetch }) => {
    const formData = await request.formData();
    const payload = Object.fromEntries(formData);

    const res = await fetch(`${BACKEND_URL}/admin/restaurants/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) return fail(400, { message: "Błąd podczas aktualizacji" });
    throw redirect(303, "/admin");
  },
};
