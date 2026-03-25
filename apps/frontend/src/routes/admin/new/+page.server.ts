import { BACKEND_URL } from "$env/static/private";
import { fail, redirect } from "@sveltejs/kit";

export const actions = {
  default: async ({ request, fetch }) => {
    const formData = await request.formData();
    const payload = Object.fromEntries(formData);

    const res = await fetch(`${BACKEND_URL}/admin/restaurants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json();
      return fail(400, { message: error.error || "Błąd zapisu" });
    }

    throw redirect(303, "/admin");
  },
};
