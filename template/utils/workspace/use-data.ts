'use client';

import { fetch } from '@/i18n/fetch';
import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

const POLL_INTERVAL_MS = 60_000;

export function useData<T extends { userId: string }>(url: string, tables: string[]) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(() => setRevision(n => n + 1), []);
  const tableKey = tables.join(',');

  useEffect(() => {
    const controller = new AbortController();
    fetch(url, { signal: controller.signal })
      .then(async r => {
        const value = await r.json();
        if (!r.ok) throw Error(value.error);
        if (!controller.signal.aborted) {
          setData(value);
          setError('');
        }
      })
      .catch(e => {
        if (e.name !== 'AbortError') setError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [url, revision]);

  useEffect(() => {
    if (!data?.userId) return;
    const db = createClient();
    const channel = db.channel('workspace-' + crypto.randomUUID());
    for (const table of tableKey.split(',')) {
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table, filter: 'user_id=eq.' + data.userId },
        refresh,
      );
    }
    channel.subscribe();

    const pollIfVisible = () => {
      if (typeof document === 'undefined' || document.visibilityState === 'visible') {
        refresh();
      }
    };
    const timer = window.setInterval(pollIfVisible, POLL_INTERVAL_MS);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', pollIfVisible);

    return () => {
      void db.removeChannel(channel);
      clearInterval(timer);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', pollIfVisible);
    };
  }, [data?.userId, tableKey, refresh]);

  return { data, error, setError, loading, refresh };
}
