import type { HandleFetch } from "@sveltejs/kit";

export const handleFetch: HandleFetch = async ({ event, request, fetch }) => {
  if (request.url.includes("/admin")) {
    const authData = event.cookies.get("admin_auth");
    if (authData) {
      request.headers.set("Authorization", `Basic ${authData}`);
    }
  }

  return fetch(request);
};
