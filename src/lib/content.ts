import type { Database } from '@/integrations/supabase/types';
export type Post = Database['public']['Tables']['posts']['Row'];
export type Podcast = Database['public']['Tables']['podcasts']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type PostType = Post['type'];
export const sections = [
 {path:'lecciones', type:'lesson', title:'Lecciones', singular:'Lección', description:'Tu recorrido para entender la informática, paso a paso.'},
 {path:'recursos', type:'resource', title:'Recursos educativos', singular:'Recurso', description:'Guías y materiales para acompañar cada descubrimiento.'},
 {path:'videos', type:'video', title:'Videos educativos', singular:'Video', description:'Mira, comprende y descubre cómo funciona la tecnología.'},
 {path:'software', type:'software', title:'Software educativo', singular:'Software', description:'Herramientas para aprender, crear y experimentar.'},
 {path:'simuladores', type:'simulator', title:'Simuladores', singular:'Simulador', description:'Explora la tecnología con tus propias manos.'},
 {path:'actividades', type:'activity', title:'Actividades', singular:'Actividad', description:'Pon en práctica lo que sabes y aprende haciendo.'},
 {path:'evaluaciones', type:'evaluation', title:'Evaluaciones', singular:'Evaluación', description:'¿Cuánto has aprendido? Ponte a prueba a tu ritmo.'},
] as const;
export const objectives = [
 'Comprender la informática y su importancia en la vida cotidiana.',
 'Identificar el hardware y los componentes físicos de una computadora.',
 'Reconocer los componentes internos y explicar sus funciones.',
 'Clasificar periféricos de entrada, salida y almacenamiento.',
 'Comprender qué es el software y conocer sus diferentes tipos.',
 'Diferenciar hardware y software con ejemplos cotidianos.',
 'Utilizar recursos digitales, programas educativos y simuladores.',
 'Desarrollar habilidades tecnológicas con actividades y evaluaciones.',
];
export function sectionFor(type: PostType) { return sections.find(s=>s.type===type) ?? sections[0]; }
export function slugify(value:string) { return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''); }
export function formatDuration(seconds:number) { return `${Math.floor(seconds/60)}:${String(Math.floor(seconds%60)).padStart(2,'0')}`; }
export function safeUrl(value:string|null|undefined) { if (!value) return undefined; if(value.startsWith('storage:')) return value; try {const u=new URL(value); return u.protocol==='https:'||u.protocol==='http:' ? value : undefined;} catch {return undefined;} }
export function youtubeId(value:string|null|undefined) { if(!value) return undefined; try {const u=new URL(value); if(u.hostname==='youtu.be') return u.pathname.slice(1); if(['www.youtube.com','youtube.com','www.youtube-nocookie.com'].includes(u.hostname)) return u.searchParams.get('v') ?? u.pathname.split('/').at(-1); }catch{} return undefined; }
export type Question = {id:string;prompt:string;position:number;options:{id:string;text:string;position:number}[]};
export type Grading = {score:number;total:number;results:{question_id:string;selected_option_id:string|null;correct_option_id:string|null;is_correct:boolean|null;feedback:string}[]};
export function scorePercent(score:number,total:number) { return total>0 ? Math.round(score/total*100) : 0; }
export const detailTable = {lesson:'lessons',resource:'resources',video:'videos',software:'software',simulator:'simulators',activity:'activities',evaluation:'evaluations'} as const;
export function pageHead(title:string,description:string,image?:string|null) { return { meta:[{title:`${title} | AulaByte`},{name:'description',content:description},{property:'og:title',content:`${title} | AulaByte`},{property:'og:description',content:description},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'},...(image?.startsWith('https://')?[{property:'og:image',content:image},{name:'twitter:image',content:image}]:[])]}; }
