import { ownsUpload } from '@/utils/uploads';

export {
  kitchenContext as context,
  kitchenJson as json,
  kitchenFailure as failure,
  KitchenError as HttpError,
} from '@/utils/kitchen/server';
export { readAll } from '@/utils/kitchen/read-all';
export { ownsUpload } from '@/utils/uploads';

const SIGNED_URL_TTL_SECONDS = 3600;
const CACHE_TTL_MS = 45 * 60 * 1000;
const signedUrlCache = new Map<string, { signedUrl: string; expiresAt: number }>();

type StorageBucketClient = {
  storage: {
    from: (bucket: string) => {
      createSignedUrls: (
        paths: string[],
        expiresIn: number,
      ) => PromiseLike<{
        data: Array<{ path: string | null; signedUrl: string | null }> | null;
        error?: unknown;
      }>;
    };
  };
};

/** Evicts a path from the signed URL cache when an image is replaced or deleted. */
export function invalidateWorkspaceImage(path: string | null | undefined): void {
  if (path) signedUrlCache.delete(path);
}

/**
 * Resolves signed URLs for private `workspace-images` objects while reusing cached
 * tokens for 45 minutes so periodic workspace refreshes do not bust browser image caches.
 */
export async function signWorkspaceImages(
  supabase: StorageBucketClient,
  userId: string,
  rawPaths: Array<string | null | undefined>,
  now = Date.now(),
): Promise<Map<string, string>> {
  const validPaths = [
    ...new Set(rawPaths.filter((p): p is string => Boolean(p && ownsUpload(p, userId)))),
  ];
  const result = new Map<string, string>();
  const missing: string[] = [];

  for (const path of validPaths) {
    const cached = signedUrlCache.get(path);
    if (cached && cached.expiresAt > now) {
      result.set(path, cached.signedUrl);
    } else {
      missing.push(path);
    }
  }

  if (missing.length > 0) {
    const { data } = await supabase.storage
      .from('workspace-images')
      .createSignedUrls(missing, SIGNED_URL_TTL_SECONDS);
    for (const entry of data || []) {
      if (entry.path && entry.signedUrl) {
        signedUrlCache.set(entry.path, {
          signedUrl: entry.signedUrl,
          expiresAt: now + CACHE_TTL_MS,
        });
        result.set(entry.path, entry.signedUrl);
      }
    }
  }

  return result;
}
