import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  return new Response(
    `google.com, pub-6558008609014707, DIRECT, f08c47fec0942fa0`,
    {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    },
  );
};
