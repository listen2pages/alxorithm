import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isSubscriber } from '@/utils/supabase/subscription';
import {
  BASE_URL,
  locales,
  localeFromPath,
  localizedPath,
  stripLocale,
  type Locale,
} from '@/i18n/routing';

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https://*.supabase.co https://lh3.googleusercontent.com https://*.googleusercontent.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com",
  "frame-src 'self' https://buy.stripe.com https://billing.stripe.com https://checkout.stripe.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self' https://buy.stripe.com https://checkout.stripe.com https://billing.stripe.com",
  "object-src 'none'",
].join('; ');

function applySecurityHeaders(response: NextResponse, request: NextRequest): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  );
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Content-Security-Policy', CONTENT_SECURITY_POLICY);
  if (request.nextUrl.protocol === 'https:') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload',
    );
  }
  return response;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const resource = /^\/(api|auth)(\/|$)/.test(pathname);
  const cookieLocale = request.cookies.get('alxorithm-locale')?.value as Locale | undefined;
  const locale: Locale = resource
    ? cookieLocale && locales.includes(cookieLocale)
      ? cookieLocale
      : 'en'
    : localeFromPath(pathname);

  const path = stripLocale(pathname);
  const privatePage = path === '/home' || path.startsWith('/home/');

  if (pathname === '/en' || pathname.startsWith('/en/')) {
    return applySecurityHeaders(
      NextResponse.redirect(new URL(path + request.nextUrl.search, request.url), 308),
      request,
    );
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-alxorithm-locale', locale);

  const target = request.nextUrl.clone();
  if (!resource && locale === 'en') {
    target.pathname = '/en' + (path === '/' ? '' : path);
  }

  const makeResponse = () =>
    !resource && locale === 'en'
      ? NextResponse.rewrite(target, { request: { headers: requestHeaders } })
      : NextResponse.next({ request: { headers: requestHeaders } });

  let response = makeResponse();
  let destination: string | null = null;

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll(values) {
            values.forEach(({ name, value }) => request.cookies.set(name, value));
            response = makeResponse();
            values.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user && privatePage) {
      destination = '/login';
    }

    if (user && (privatePage || ['/', '/login', '/demo'].includes(path))) {
      try {
        const subscribed = await isSubscriber(supabase, user.id);
        if (privatePage && !subscribed) destination = '/cennik';
        if (!privatePage && subscribed) destination = '/home';
      } catch {
        if (privatePage) {
          const unavailable = new NextResponse(
            {
              en: 'Cannot check your subscription. Try again.',
              pl: 'Nie można sprawdzić subskrypcji. Spróbuj ponownie.',
              ru: 'Не удалось проверить подписку. Попробуйте снова.',
            }[locale],
            { status: 503 },
          );
          response.cookies.getAll().forEach(cookie => unavailable.cookies.set(cookie));
          return applySecurityHeaders(unavailable, request);
        }
      }
    }
  } else if (privatePage) {
    destination =
      '/login?message=' +
      encodeURIComponent(
        {
          en: 'Add the Supabase credentials to enable sign-in.',
          pl: 'Dodaj dane Supabase, aby włączyć logowanie.',
          ru: 'Добавьте ключи Supabase для входа.',
        }[locale],
      );
  }

  if (destination) {
    const redirect = NextResponse.redirect(new URL(localizedPath(destination, locale), request.url));
    response.cookies.getAll().forEach(cookie => redirect.cookies.set(cookie));
    redirect.headers.set('Cache-Control', 'private, no-store');
    return applySecurityHeaders(redirect, request);
  }

  if (!resource) {
    response.cookies.set('alxorithm-locale', locale, {
      path: '/',
      maxAge: 31536000,
      sameSite: 'lax',
      secure: request.nextUrl.protocol === 'https:',
    });
    response.headers.set('Content-Language', locale);
    response.headers.set(
      'Link',
      [
        ...locales.map(
          l => `<${BASE_URL + localizedPath(path, l)}>; rel="alternate"; hreflang="${l}"`,
        ),
        `<${BASE_URL + path}>; rel="alternate"; hreflang="x-default"`,
      ].join(', '),
    );
  }

  if (resource || privatePage) {
    response.headers.set('Cache-Control', 'private, no-store');
  }

  return applySecurityHeaders(response, request);
}

export const config = {
  matcher: [
    '/((?!_next|favicon.ico|icon.png|apple-icon.png|opengraph-image|sitemap.xml|robots.txt|manifest.webmanifest|manifest.json|.*\\.(?:svg|png|jpg|jpeg|avif|webp|ico|csv|woff2?)$).*)',
  ],
};
