'use client';
import NextLink from 'next/link';
import { usePathname as nextPathname, useRouter as nextRouter } from 'next/navigation';
import { forwardRef, useContext, type ComponentProps } from 'react';
import {WorkspacePeriodContext} from './WorkspacePeriod';
import {withWorkspaceMonth,isWorkspacePath} from '@/utils/workspace/period';
import { localizedPath, localeFromPath, stripLocale } from './routing';
export { useSearchParams, notFound, useParams, useSelectedLayoutSegment, useSelectedLayoutSegments } from 'next/navigation';
export function useLocale() { return localeFromPath(nextPathname() || '/'); }
export function usePathname() { return stripLocale(nextPathname() || '/'); }
export function useRouter() {
  const router = nextRouter(), locale = useLocale(),workspace=useContext(WorkspacePeriodContext);
  return { ...router, push: (href: string, options?: Parameters<typeof router.push>[1]) => router.push(withWorkspaceMonth(localizedPath(href, locale),workspace?.period||null), options), replace: (href: string, options?: Parameters<typeof router.replace>[1]) => router.replace(withWorkspaceMonth(localizedPath(href, locale),workspace?.period||null), options) };
}
const Link = forwardRef<HTMLAnchorElement, ComponentProps<typeof NextLink>>(function Link({href, ...props}, ref) {
  const locale = useLocale(),workspace=useContext(WorkspacePeriodContext);
  const target = typeof href === 'string' ? withWorkspaceMonth(localizedPath(href, locale),workspace?.period||null) : { ...href, pathname: href.pathname ? localizedPath(href.pathname, locale) : href.pathname,query:workspace&&href.pathname&&isWorkspacePath(href.pathname)?(typeof href.query==='string'?new URLSearchParams(withWorkspaceMonth(href.pathname+'?'+href.query,workspace.period).split('?')[1]?.split('#')[0]).toString():{...href.query,month:href.query?.month??workspace.period}):href.query };
  return <NextLink {...props} href={target} ref={ref} />;
});
export default Link;
