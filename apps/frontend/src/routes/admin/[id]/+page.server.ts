import { BACKEND_URL } from "$env/static/private";
import { fail, redirect } from "@sveltejs/kit";

export const load = async ({ params, fetch }) => {
  // Jeśli ID to "new", zwracamy pusty obiekt dla formularza
  if (params.id === "new") {
    return { id: "new", restaurant: null };
  }

  const res = await fetch(`${BACKEND_URL}/admin/restaurants/${params.id}`);

  if (!res.ok) {
    throw redirect(302, "/admin");
  }

  return {
    id: params.id,
    restaurant: await res.json(),
  };
};

export const actions = {
  save: async ({ request, params, fetch }) => {
    const formData = await request.formData();

    // Automatycznie zbieramy wszystkie pola z formularza
    const payload = {
      name: formData.get("name"),
      slug: formData.get("slug"),
      phoneNumber: formData.get("phoneNumber") || null,
      address: formData.get("address") || null,
      webpage: formData.get("webpage") || null,
      scrapingUrl: formData.get("scrapingUrl") || null,
      provider: formData.get("provider") || "facebook",
      imageUrl: formData.get("imageUrl") || null,
    };

    const isNew = params.id === "new";
    const url = isNew
      ? `${BACKEND_URL}/admin/restaurants`
      : `${BACKEND_URL}/admin/restaurants/${params.id}`;

    const res = await fetch(url, {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const result = await res.json();
      return fail(400, { error: result.error || "Błąd podczas zapisu danych" });
    }

    // Po sukcesie wracamy do listy
    throw redirect(302, "/admin");
  },
};
