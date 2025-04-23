import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = 'https://freetool.online'
  
  // List of all tools paths
  const toolPaths = [
    'private-ai-chat',
    'heic-converter',
    'code-editor',
    'color-picker',
    'qr-code-generator',
    'unit-converter',
    'todo-list',
    'font-generator',
    'steganography-tool',
    'gif-to-frames',
    'pdf-tools',
    'zip-compressor',
  ]

  // Main pages
  const mainRoutes = [
    {
      url: `${siteUrl}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    },
    {
      url: `${siteUrl}/tools`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
  ]

  // Tool pages
  const toolRoutes = toolPaths.map(path => ({
    url: `${siteUrl}/${path}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  return [...mainRoutes, ...toolRoutes]
} 