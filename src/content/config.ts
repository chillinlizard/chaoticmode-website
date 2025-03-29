import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    pubDate: z.string(),
    description: z.string().optional(),
    author: z.string().optional(),
    role: z.string().optional(),
    authorImage: z.string().optional(),
    image: z.string().optional(),
    tags: z.array(z.string()).optional(),
    trending: z.boolean().optional().default(false)
  }),
});

export const collections = {
  blog: blogCollection,
};