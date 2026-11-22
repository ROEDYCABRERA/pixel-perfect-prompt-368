import { queryOptions } from '@tanstack/react-query';
import { getHomeContent, getPodcast, getPostDetail, listPodcasts, listSection, searchContent } from './public.functions';
import type { PostType } from './content';

export const homeQuery = queryOptions({ queryKey: ['home'], queryFn: () => getHomeContent() });
export const sectionQuery = (type: PostType) => queryOptions({ queryKey: ['section', type], queryFn: () => listSection({ data: { type } }) });
export const postQuery = (type: PostType, slug: string) => queryOptions({ queryKey: ['post', type, slug], queryFn: () => getPostDetail({ data: { type, slug } }) });
export const podcastsQuery = queryOptions({ queryKey: ['podcasts'], queryFn: () => listPodcasts() });
export const podcastQuery = (slug: string) => queryOptions({ queryKey: ['podcast', slug], queryFn: () => getPodcast({ data: { slug } }) });
export const searchQuery = (q: string) => queryOptions({ queryKey: ['search', q], queryFn: () => searchContent({ data: { q } }) });
