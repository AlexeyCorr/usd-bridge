interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
}

const BASE = '/usd-bridge';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

    // Канонический адрес — со слешем: service worker зарегистрирован
    // со scope '/usd-bridge/', и всё вне этого префикса он не контролирует.
    if (pathname === BASE) {
      url.pathname = `${BASE}/`;
      return Response.redirect(url.toString(), 302);
    }

    // Роут в wrangler.toml — 'usd-bridge*' без слеша, так что сюда долетает
    // и '/usd-bridgefoo'. Это не наш путь.
    if (!pathname.startsWith(`${BASE}/`)) {
      return new Response('Not found', { status: 404 });
    }

    url.pathname = pathname.slice(BASE.length);
    // Assets редиректит '/index.html' на корень домена. Workbox запрашивает
    // именно этот путь для precache, поэтому отдаём корневой asset напрямую.
    if (url.pathname === '/index.html') {
      url.pathname = '/';
    }
    const res = await env.ASSETS.fetch(new Request(url.toString(), request));

    // SPA-fallback: неизвестный путь → index.html.
    if (res.status === 404) {
      url.pathname = '/';
      return env.ASSETS.fetch(new Request(url.toString(), request));
    }

    return res;
  },
};
