import { NextResponse, type NextRequest } from 'next/server';

// Search engines should only index the real domain. On any other host (the Worker's *.workers.dev address,
// version previews, local servers) every page gets "X-Robots-Tag: noindex, nofollow" and robots.txt disallows
// everything. On emmanuelgrowth.com and www.emmanuelgrowth.com nothing changes.
// Static files (images, scripts, fonts) are served by Cloudflare before this runs, so they don't get the header;
// that's fine because the pages that link to them are noindex.
const LIVE_HOSTS = new Set(['emmanuelgrowth.com', 'www.emmanuelgrowth.com']);
const NOINDEX = 'noindex, nofollow';

export function proxy(request: NextRequest) {
  const host = (request.headers.get('host') ?? '').toLowerCase().replace(/:\d+$/, '');
  if (LIVE_HOSTS.has(host)) return NextResponse.next();

  if (request.nextUrl.pathname === '/robots.txt') {
    return new NextResponse('User-Agent: *\nDisallow: /\n', {
      headers: { 'content-type': 'text/plain; charset=utf-8', 'x-robots-tag': NOINDEX },
    });
  }
  const response = NextResponse.next();
  response.headers.set('x-robots-tag', NOINDEX);
  return response;
}
