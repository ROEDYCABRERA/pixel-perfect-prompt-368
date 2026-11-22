import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const files = import.meta.glob('/src/assets/*.asset.json', { eager: true, import: 'default' }) as Record<string, { url: string }>;
const assets = Object.fromEntries(Object.entries(files).map(([path, value]) => [path.split('/').at(-1)!.replace('.asset.json', ''), value.url]));
export const MEDIA_BUCKET = 'aulabyte-media';

export function assetUrl(name: string) { return assets[name]; }
export function resolveMedia(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  if (value.startsWith('asset:')) return assets[value.slice(6)];
  if (value.startsWith('storage:')) return undefined;
  return /^https?:\/\//.test(value) || value.startsWith('/') ? value : undefined;
}
export function useMediaUrl(value: string | null | undefined) {
  const direct = resolveMedia(value);
  const [signed, setSigned] = useState<string>();
  useEffect(() => {
    setSigned(undefined);
    if (!value?.startsWith('storage:')) return;
    let active = true;
    supabase.storage.from(MEDIA_BUCKET).createSignedUrl(value.slice(8), 60 * 60 * 6).then(({ data }) => { if (active && data) setSigned(data.signedUrl); });
    return () => { active = false; };
  }, [value]);
  return direct ?? signed;
}
