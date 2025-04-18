/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://freetool.online',
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
    ],
    additionalSitemaps: [
      'https://freetool.online/sitemap.xml',
    ],
  },
  exclude: ['/api/*', '/admin/*', '/health'],
  generateIndexSitemap: false,
  outDir: 'public',
  transform: async (config, path) => {
    // Custom priority and changefreq for specific pages
    const defaultPriority = 0.7;
    const defaultChangefreq = 'weekly';
    
    // Define priorities and change frequencies for different paths
    const customConfig = {
      '/': { priority: 1.0, changefreq: 'daily' },
      '/heic-converter': { priority: 0.9, changefreq: 'weekly' },
      // Add future tools here as they become available
      // '/gif-to-frames': { priority: 0.9, changefreq: 'weekly' },
      // '/pdf-tools': { priority: 0.9, changefreq: 'weekly' },
    };
    
    // Apply custom configuration if available, otherwise use defaults
    const pathConfig = customConfig[path] || { priority: defaultPriority, changefreq: defaultChangefreq };
    
    return {
      loc: path,
      changefreq: pathConfig.changefreq,
      priority: pathConfig.priority,
      lastmod: new Date().toISOString(),
    };
  },
} 