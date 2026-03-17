import { fail, redirect } from "@sveltejs/kit";
import { BACKEND_URL } from "$env/static/private";
import type { PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async ({ cookies }) => {
  const auth = cookies.get("admin_auth");
  return {
    isLoggedIn: !!auth,
  };
};

export const actions: Actions = {
  login: async ({ request, cookies, fetch }) => {
    const data = await request.formData();
    const user = data.get("username");
    const pass = data.get("password");

    if (!user || !pass) {
      return fail(400, { message: "Wypełnij wszystkie pola" });
    }

    const token = Buffer.from(`${user}:${pass}`).toString("base64");

    try {
      const res = await fetch(`${BACKEND_URL}/admin/login`, {
        method: "POST",
        headers: { Authorization: `Basic ${token}` },
      });

      if (res.ok) {
        cookies.set("admin_auth", token, {
          path: "/",
          httpOnly: true,
          sameSite: "strict",
          maxAge: 60 * 60 * 24 * 7, // 7 dni
        });
        return { success: true };
      }

      return fail(401, { message: "Błędny login lub hasło" });
    } catch (err) {
      return fail(500, { message: "Błąd połączenia z serwerem" });
    }
  },

  logout: async ({ cookies }) => {
    cookies.delete("admin_auth", { path: "/" });
    throw redirect(303, "/");
  },
};
