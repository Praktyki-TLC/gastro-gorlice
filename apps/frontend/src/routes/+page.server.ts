import { fail, redirect } from "@sveltejs/kit";
import { BACKEND_URL } from "$env/static/private";
import type { Actions, PageServerLoad } from "./$types";
import type { TodayMenusResponse } from "shared";

export const load: PageServerLoad = async () => {
  const req = await fetch(`${BACKEND_URL}/menus/today`)
  const res: TodayMenusResponse = await req.json();

  return {
    todayMenus: res.todayMenus,
    lastUpdate: res.lastUpdate
  }
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

    const res = await fetch(`${BACKEND_URL}/admin/login`, {
      method: "POST",
      headers: { Authorization: `Basic ${token}` },
    }).catch((err) => {
      return null;
    });

    if (res?.ok) {
      cookies.set("admin_auth", token, {
        path: "/",
        httpOnly: true,
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7, // 7 dni
      });
      return redirect(303, "/admin");
    }

    return fail(401, { message: "Błędny login lub hasło" });
  },

  logout: async ({ cookies }) => {
    cookies.delete("admin_auth", { path: "/" });
    throw redirect(303, "/");
  },
};
