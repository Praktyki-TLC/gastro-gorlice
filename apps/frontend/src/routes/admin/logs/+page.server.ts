import { BACKEND_URL } from "$env/static/private";

export const load = async ({ fetch, url }) => {
  const page = url.searchParams.get("page") || "1";

  const res = await fetch(`${BACKEND_URL}/admin/logs?page=${page}`);

  if (!res.ok) {
    return { logs: [], total: 0, pages: 0, currentPage: 1 };
  }

  const data = await res.json();

  return {
    logs: data.logs,
    total: data.total,
    pages: data.pages,
    currentPage: parseInt(page),
  };
};
