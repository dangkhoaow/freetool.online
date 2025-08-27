export interface NewsEvent {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  category: "foundation-event" | "community-news" | "community-support" | "exhibition"
  date: string
  author: string
  image: string
  featured: boolean
  tags: string[]
}

export const newsEvents: NewsEvent[] = [
  {
    id: "1",
    title: "Contemporary Vietnamese Art Exhibition Opens at A&V Foundation",
    slug: "contemporary-vietnamese-art-exhibition-2024",
    excerpt:
      "Discover the latest works from emerging Vietnamese artists in our groundbreaking contemporary art showcase.",
    content: `
      <p>The A&V Foundation is proud to present "Voices of Tomorrow," a comprehensive exhibition featuring contemporary Vietnamese artists who are reshaping the artistic landscape of Vietnam.</p>
      
      <p>This exhibition showcases over 50 works from 20 emerging and established artists, exploring themes of identity, tradition, and modernity in Vietnamese society. From digital installations to traditional silk paintings with contemporary twists, the exhibition represents the diverse voices of today's Vietnamese art scene.</p>
      
      <p>Featured artists include Nguyen Minh Duc, Tran Thi Lan, and Le Van Hoang, each bringing their unique perspective to the conversation about Vietnamese identity in the 21st century.</p>
      
      <p>The exhibition runs from March 15 to June 30, 2024, with guided tours available every Saturday at 2 PM.</p>
    `,
    category: "foundation-event",
    date: "2024-03-15",
    author: "Dr. Nguyen Van Minh",
    image: "/av-foundation/news-contemporary-exhibition.png",
    featured: true,
    tags: ["exhibition", "contemporary art", "vietnamese artists"],
  },
  {
    id: "2",
    title: "A&V Foundation Launches Artist Residency Program",
    slug: "artist-residency-program-launch",
    excerpt: "Supporting emerging Vietnamese artists with studio space, mentorship, and exhibition opportunities.",
    content: `
      <p>The A&V Foundation announces the launch of its inaugural Artist Residency Program, designed to support emerging Vietnamese artists in developing their practice and reaching new audiences.</p>
      
      <p>The program offers selected artists a fully equipped studio space for six months, mentorship from established artists and curators, and the opportunity to showcase their work in a solo exhibition at the foundation.</p>
      
      <p>Applications are now open for artists working in all mediums, with a focus on those exploring Vietnamese cultural themes and contemporary social issues. The program aims to bridge traditional Vietnamese art forms with contemporary practices.</p>
      
      <p>Interested artists can apply through our website until April 30, 2024. The first cohort will begin in September 2024.</p>
    `,
    category: "community-support",
    date: "2024-02-20",
    author: "Tran Thi Mai",
    image: "/av-foundation/news-residency-program.png",
    featured: true,
    tags: ["residency", "emerging artists", "community support"],
  },
  {
    id: "3",
    title: "Digital Archive Project Preserves 1000+ Historical Artworks",
    slug: "digital-archive-project-milestone",
    excerpt:
      "Major milestone reached in our mission to digitally preserve Vietnamese art heritage for future generations.",
    content: `
      <p>The A&V Foundation celebrates a significant milestone in its digital preservation efforts, having successfully archived over 1,000 historical Vietnamese artworks in high-resolution digital format.</p>
      
      <p>This comprehensive digitization project, launched in 2022, focuses on preserving artworks from the Đông Dương period through the contemporary era. Each piece is photographed using advanced imaging techniques and accompanied by detailed metadata including provenance, condition reports, and historical context.</p>
      
      <p>The digital archive is now accessible to researchers, students, and art enthusiasts worldwide through our online platform, democratizing access to Vietnamese art heritage.</p>
      
      <p>The project continues with plans to archive an additional 500 works by the end of 2024, including rare manuscripts and sketches from private collections.</p>
    `,
    category: "foundation-event",
    date: "2024-01-10",
    author: "Le Thi Hong",
    image: "/av-foundation/news-digital-archive.png",
    featured: false,
    tags: ["digital preservation", "archive", "heritage"],
  },
  {
    id: "4",
    title: "Community Art Workshop Series Begins This Month",
    slug: "community-art-workshop-series",
    excerpt: "Free workshops teaching traditional Vietnamese art techniques to community members of all ages.",
    content: `
      <p>The A&V Foundation launches its Community Art Workshop Series, offering free classes in traditional Vietnamese art techniques to community members of all skill levels.</p>
      
      <p>The monthly workshops cover various traditional techniques including silk painting, lacquer art, and woodblock printing. Each session is led by master artists who share both technical skills and cultural knowledge behind these time-honored practices.</p>
      
      <p>The program aims to keep traditional Vietnamese art forms alive by passing knowledge to new generations while fostering community engagement with Vietnamese cultural heritage.</p>
      
      <p>Workshops are held every third Saturday of the month from 10 AM to 4 PM. Registration is required due to limited space.</p>
    `,
    category: "community-support",
    date: "2024-03-01",
    author: "Pham Van Duc",
    image: "/av-foundation/news-community-workshops.png",
    featured: false,
    tags: ["workshops", "community", "traditional techniques"],
  },
  {
    id: "5",
    title: "Vietnamese Art Market Report 2024 Released",
    slug: "vietnamese-art-market-report-2024",
    excerpt: "Comprehensive analysis of trends, prices, and emerging artists in the Vietnamese art market.",
    content: `
      <p>The A&V Foundation releases its annual Vietnamese Art Market Report, providing comprehensive insights into market trends, price movements, and emerging artists gaining recognition.</p>
      
      <p>The 2024 report highlights a 25% increase in international interest in Vietnamese contemporary art, with particular growth in digital and mixed-media works. Traditional paintings continue to maintain strong value, especially works from the Reform period.</p>
      
      <p>The report also identifies 15 emerging artists to watch, analyzes auction results from major sales, and provides guidance for new collectors interested in Vietnamese art.</p>
      
      <p>The full report is available for download on our website and includes detailed market data, artist profiles, and expert commentary from leading art market analysts.</p>
    `,
    category: "community-news",
    date: "2024-02-05",
    author: "Dr. Hoang Thi Lan",
    image: "/av-foundation/news-market-report.png",
    featured: false,
    tags: ["market report", "trends", "collectors"],
  },
]

export function getNewsEventBySlug(slug: string): NewsEvent | undefined {
  return newsEvents.find((event) => event.slug === slug)
}

export function getFeaturedNews(): NewsEvent[] {
  return newsEvents.filter((event) => event.featured)
}

export function getNewsByCategory(category: NewsEvent["category"]): NewsEvent[] {
  return newsEvents.filter((event) => event.category === category)
}
