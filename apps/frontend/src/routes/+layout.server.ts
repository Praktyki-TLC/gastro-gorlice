import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ cookies }) => {
  const auth = cookies.get("admin_auth");
  return {
    isLoggedIn: !!auth,
  };
};
