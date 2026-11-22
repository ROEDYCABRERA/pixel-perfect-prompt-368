import { createServerFn } from '@tanstack/react-start';
import { notFound } from '@tanstack/react-router';
import { z } from 'zod';
import type { Json } from '@/integrations/supabase/types';
import { publicClient } from './public-client.server';

const postTypes = ['lesson', 'resource', 'video', 'software', 'simulator', 'activity', 'evaluation'] as const;
const cardColumns = 'id,type,slug,title,summary,cover_url,position,published_at,category:categories(name,slug)';
const tables = { lesson: 'lessons', resource: 'resources', video: 'videos', software: 'software', simulator: 'simulators', activity: 'activities', evaluation: 'evaluations' } as const;

export type CardPost = { id: string; type: (typeof postTypes)[number]; slug: string; title: string; summary: string; cover_url: string | null; position: number; published_at: string | null; category: { name: string; slug: string } | null };
export type PublicQuestion = { id: string; prompt: string; position: number; options: { id: string; text: string; position: number }[] };

function failed(error: { message: string } | null) {
  if (error) {
    console.error(error.message);
    throw new Error('No pudimos cargar este contenido. Inténtalo de nuevo.');
  }
}

export const getHomeContent = createServerFn({ method: 'GET' }).handler(async () => {
  const db = publicClient();
  const [posts, podcasts] = await Promise.all([
    db.from('posts').select(cardColumns).eq('status', 'published').order('position').order('published_at', { ascending: false }),
    db.from('podcasts').select('id,slug,title,episode_name,episode_number,description,cover_url,duration_seconds').eq('status', 'published').order('episode_number', { ascending: false }).limit(3),
  ]);
  failed(posts.error); failed(podcasts.error);
  const all = (posts.data ?? []) as CardPost[];
  return {
    lessons: all.filter((p) => p.type === 'lesson'),
    videos: all.filter((p) => p.type === 'video').slice(0, 3),
    resources: all.filter((p) => p.type === 'resource').slice(0, 3),
    practice: all.filter((p) => p.type === 'activity' || p.type === 'evaluation').slice(0, 4),
    tools: all.filter((p) => p.type === 'software' || p.type === 'simulator').slice(0, 3),
    podcasts: podcasts.data ?? [],
  };
});

export const listSection = createServerFn({ method: 'GET' })
  .inputValidator((input) => z.object({ type: z.enum(postTypes) }).parse(input))
  .handler(async ({ data }) => {
    const db = publicClient();
    const posts = await db.from('posts').select(cardColumns).eq('type', data.type).eq('status', 'published').order('position').order('published_at', { ascending: false });
    failed(posts.error);
    const list = (posts.data ?? []) as CardPost[];
    let lessonMeta: { post_id: string; number: number; duration_minutes: number }[] = [];
    if (data.type === 'lesson' && list.length) {
      const meta = await db.from('lessons').select('post_id,number,duration_minutes').in('post_id', list.map((p) => p.id));
      failed(meta.error); lessonMeta = meta.data ?? [];
    }
    let videoMeta: { post_id: string; duration: string }[] = [];
    if (data.type === 'video' && list.length) {
      const meta = await db.from('videos').select('post_id,duration').in('post_id', list.map((p) => p.id));
      failed(meta.error); videoMeta = meta.data ?? [];
    }
    return list.map((p) => ({
      ...p,
      meta: lessonMeta.find((m) => m.post_id === p.id) ? `Lección ${lessonMeta.find((m) => m.post_id === p.id)!.number} · ${lessonMeta.find((m) => m.post_id === p.id)!.duration_minutes} min` : videoMeta.find((m) => m.post_id === p.id)?.duration || '',
    }));
  });

export const getPostDetail = createServerFn({ method: 'GET' })
  .inputValidator((input) => z.object({ type: z.enum(postTypes), slug: z.string().min(1).max(200) }).parse(input))
  .handler(async ({ data }) => {
    const db = publicClient();
    const found = await db.from('posts').select('id,type,slug,title,summary,cover_url,body,position,published_at,category_id,category:categories(name,slug)').eq('type', data.type).eq('slug', data.slug).eq('status', 'published').maybeSingle();
    failed(found.error);
    if (!found.data) throw notFound();
    const post = found.data;
    const detailResult = await db.from(tables[data.type] as 'lessons').select('*').eq('post_id', post.id).maybeSingle();
    failed(detailResult.error);
    const siblings = await db.from('posts').select(cardColumns).eq('type', data.type).eq('status', 'published').order('position').order('published_at', { ascending: false });
    failed(siblings.error);
    const list = (siblings.data ?? []) as CardPost[];
    const index = list.findIndex((p) => p.id === post.id);
    let related = list.filter((p) => p.id !== post.id).slice(0, 3);
    if (data.type === 'lesson') {
      const resources = await db.from('posts').select(cardColumns).in('type', ['resource', 'video', 'activity']).eq('status', 'published').order('position');
      failed(resources.error);
      const items = (resources.data ?? []) as CardPost[];
      const sameCategory = items.filter((p) => post.category_id && (p as CardPost & { category: { slug: string } | null }).category?.slug === post.category?.slug);
      related = [...sameCategory, ...items.filter((p) => !sameCategory.includes(p))].slice(0, 4);
    }
    let questions: PublicQuestion[] = [];
    if (data.type === 'activity' || data.type === 'evaluation') {
      const q = await db.from('questions').select('id,prompt,position,answer_options(id,text,position)').eq('post_id', post.id).order('position');
      failed(q.error);
      questions = (q.data ?? []).map((item) => ({ id: item.id, prompt: item.prompt, position: item.position, options: [...item.answer_options].sort((a, b) => a.position - b.position) }));
    }
    return {
      post,
      detail: (detailResult.data ?? {}) as unknown as { [key: string]: Json },
      previous: index > 0 ? list[index - 1] ?? null : null,
      next: index >= 0 ? list[index + 1] ?? null : null,
      related,
      questions,
    };
  });

export const listPodcasts = createServerFn({ method: 'GET' }).handler(async () => {
  const result = await publicClient().from('podcasts').select('id,slug,title,episode_name,episode_number,description,cover_url,duration_seconds,published_at').eq('status', 'published').order('episode_number', { ascending: false });
  failed(result.error);
  return result.data ?? [];
});

export const getPodcast = createServerFn({ method: 'GET' })
  .inputValidator((input) => z.object({ slug: z.string().min(1).max(200) }).parse(input))
  .handler(async ({ data }) => {
    const db = publicClient();
    const result = await db.from('podcasts').select('id,slug,title,episode_name,episode_number,description,cover_url,audio_url,audio_format,duration_seconds,published_at').eq('slug', data.slug).eq('status', 'published').maybeSingle();
    failed(result.error);
    if (!result.data) throw notFound();
    const others = await db.from('podcasts').select('id,slug,title,episode_name,episode_number,cover_url,duration_seconds').eq('status', 'published').neq('id', result.data.id).order('episode_number', { ascending: false }).limit(3);
    failed(others.error);
    return { episode: result.data, others: others.data ?? [] };
  });

export const searchContent = createServerFn({ method: 'GET' })
  .inputValidator((input) => z.object({ q: z.string().max(80) }).parse(input))
  .handler(async ({ data }) => {
    const term = data.q.trim().replace(/[%,()]/g, ' ');
    if (term.length < 2) return { posts: [] as CardPost[], podcasts: [] };
    const db = publicClient();
    const like = `%${term}%`;
    const [posts, podcasts] = await Promise.all([
      db.from('posts').select(cardColumns).eq('status', 'published').or(`title.ilike.${like},summary.ilike.${like},body.ilike.${like}`).order('position').limit(30),
      db.from('podcasts').select('id,slug,title,episode_name,episode_number,description,cover_url,duration_seconds').eq('status', 'published').or(`title.ilike.${like},description.ilike.${like},episode_name.ilike.${like}`).limit(10),
    ]);
    failed(posts.error); failed(podcasts.error);
    return { posts: (posts.data ?? []) as CardPost[], podcasts: podcasts.data ?? [] };
  });
