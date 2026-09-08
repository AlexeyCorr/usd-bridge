import { describe, expect, it } from 'vitest';
import worker from './worker.ts';

describe('worker', () => {
  it('обслуживает precache index через корневой asset без редиректа', async () => {
    let assetUrl: URL | undefined;
    const env = {
      ASSETS: {
        fetch: async (request: Request) => {
          assetUrl = new URL(request.url);
          return new Response('app');
        },
      },
    };

    await worker.fetch(
      new Request(
        'https://alexeycorr.dev/usd-bridge/index.html?__WB_REVISION__=abc',
      ),
      env,
    );

    expect({ pathname: assetUrl?.pathname, search: assetUrl?.search }).toEqual({
      pathname: '/',
      search: '?__WB_REVISION__=abc',
    });
  });
});
