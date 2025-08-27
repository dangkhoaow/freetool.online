export interface Artwork {
  id: string
  inventoryNumber: string
  title: string
  titleVietnamese?: string
  artist: {
    id: string
    name: string
    slug: string
  }
  year: number
  medium: string
  dimensions: {
    height: number
    width: number
    depth?: number
    unit: "cm" | "mm" | "in"
  }
  weight?: {
    value: number
    unit: "kg" | "g" | "lbs"
  }
  description: string
  period: "dong-duong" | "post-1954-north" | "saigon-gia-dinh" | "reform" | "contemporary"
  periodLabel: string
  classification: {
    category: "painting" | "sculpture" | "lacquer" | "silk-painting" | "ceramics" | "photography"
    subcategory: string
    technique: string
  }
  condition: "excellent" | "good" | "fair" | "poor"
  provenance: {
    acquisition: {
      date: string
      method: "purchase" | "donation" | "commission" | "transfer"
      source: string
      price?: number
      currency?: string
    }
    previousOwners?: {
      name: string
      period: string
    }[]
    exhibitions?: {
      title: string
      venue: string
      date: string
    }[]
  }
  storage: {
    location: string
    environment: {
      temperature: string
      humidity: string
      lighting: string
    }
    security: "high" | "medium" | "standard"
  }
  images: {
    primary: string
    gallery: string[]
    details?: string[]
  }
  isPublic: boolean
  passwordLevel: "public" | "private-a" | "private-b" | "admin"
  estimatedValue?: {
    amount: number
    currency: string
    date: string
  }
  tags: string[]
}

export const artworksData: Artwork[] = [
  {
    id: "AV-001",
    inventoryNumber: "AV-2024-001",
    title: "Young Woman with Lotus",
    titleVietnamese: "Thiếu Nữ Bên Hoa Sen",
    artist: {
      id: "1",
      name: "Nguyễn Phan Chánh",
      slug: "nguyen-phan-chanh",
    },
    year: 1935,
    medium: "Silk painting with natural pigments",
    dimensions: {
      height: 60,
      width: 40,
      unit: "cm",
    },
    weight: {
      value: 0.8,
      unit: "kg",
    },
    description:
      "A masterful silk painting depicting a young Vietnamese woman holding lotus flowers, showcasing the artist's skill in traditional techniques. The work exemplifies the fusion of Eastern aesthetics with Western painting methods that characterized the École des Beaux-Arts de l'Indochine period.",
    period: "dong-duong",
    periodLabel: "Đông Dương Period (1925-1945)",
    classification: {
      category: "silk-painting",
      subcategory: "Portrait",
      technique: "Traditional silk painting with natural pigments",
    },
    condition: "excellent",
    provenance: {
      acquisition: {
        date: "2020-03-15",
        method: "purchase",
        source: "Private collector, Hanoi",
        price: 25000,
        currency: "USD",
      },
      previousOwners: [
        {
          name: "Nguyen Family Collection",
          period: "1935-2020",
        },
      ],
      exhibitions: [
        {
          title: "Masters of Vietnamese Silk Painting",
          venue: "Vietnam Fine Arts Museum",
          date: "2021-06-01",
        },
      ],
    },
    storage: {
      location: "Climate-controlled vault A, Section 1",
      environment: {
        temperature: "18-20°C",
        humidity: "45-55% RH",
        lighting: "UV-filtered LED, <50 lux",
      },
      security: "high",
    },
    images: {
      primary: "/av-foundation/artwork-young-woman-lotus.png",
      gallery: [
        "/av-foundation/artwork-young-woman-lotus.png",
        "/av-foundation/artwork-young-woman-lotus-detail-1.png",
        "/av-foundation/artwork-young-woman-lotus-detail-2.png",
      ],
    },
    isPublic: true,
    passwordLevel: "public",
    estimatedValue: {
      amount: 35000,
      currency: "USD",
      date: "2024-01-01",
    },
    tags: ["traditional", "portrait", "lotus", "silk painting", "female figure", "cultural heritage"],
  },
  {
    id: "AV-002",
    inventoryNumber: "AV-2024-002",
    title: "Village Scene",
    titleVietnamese: "Cảnh Làng Quê",
    artist: {
      id: "1",
      name: "Nguyễn Phan Chánh",
      slug: "nguyen-phan-chanh",
    },
    year: 1940,
    medium: "Lacquer on wood with gold leaf",
    dimensions: {
      height: 80,
      width: 60,
      depth: 3,
      unit: "cm",
    },
    weight: {
      value: 2.5,
      unit: "kg",
    },
    description:
      "A serene depiction of rural Vietnamese life, executed in traditional lacquer technique with gold leaf details. The work captures the peaceful atmosphere of village life during the colonial period.",
    period: "dong-duong",
    periodLabel: "Đông Dương Period (1925-1945)",
    classification: {
      category: "lacquer",
      subcategory: "Landscape",
      technique: "Traditional Vietnamese lacquer with gold leaf application",
    },
    condition: "good",
    provenance: {
      acquisition: {
        date: "2019-11-20",
        method: "donation",
        source: "Estate of Mrs. Tran Thi Mai",
      },
      previousOwners: [
        {
          name: "Tran Family Collection",
          period: "1940-2019",
        },
      ],
    },
    storage: {
      location: "Climate-controlled vault B, Section 2",
      environment: {
        temperature: "18-20°C",
        humidity: "45-55% RH",
        lighting: "UV-filtered LED, <50 lux",
      },
      security: "high",
    },
    images: {
      primary: "/av-foundation/artwork-village-scene.png",
      gallery: ["/av-foundation/artwork-village-scene.png", "/av-foundation/artwork-village-scene-detail-1.png"],
    },
    isPublic: true,
    passwordLevel: "public",
    estimatedValue: {
      amount: 28000,
      currency: "USD",
      date: "2024-01-01",
    },
    tags: ["lacquer", "landscape", "village", "rural life", "gold leaf", "traditional technique"],
  },
  {
    id: "AV-003",
    inventoryNumber: "AV-2024-003",
    title: "Old Quarter Morning",
    titleVietnamese: "Phố Cổ Buổi Sáng",
    artist: {
      id: "2",
      name: "Bùi Xuân Phái",
      slug: "bui-xuan-phai",
    },
    year: 1965,
    medium: "Oil on canvas",
    dimensions: {
      height: 70,
      width: 50,
      unit: "cm",
    },
    weight: {
      value: 1.2,
      unit: "kg",
    },
    description:
      "An atmospheric painting of Hanoi's old quarter in the early morning light, showcasing Phái's mastery of urban landscapes. The work captures the essence of Vietnamese street life with remarkable sensitivity.",
    period: "post-1954-north",
    periodLabel: "Post-1954 North Vietnam",
    classification: {
      category: "painting",
      subcategory: "Urban Landscape",
      technique: "Oil painting on primed canvas",
    },
    condition: "excellent",
    provenance: {
      acquisition: {
        date: "2021-08-10",
        method: "purchase",
        source: "Hanoi Fine Arts Gallery",
        price: 18000,
        currency: "USD",
      },
      exhibitions: [
        {
          title: "Hanoi Through Artists' Eyes",
          venue: "National Museum of Fine Arts",
          date: "2022-03-15",
        },
      ],
    },
    storage: {
      location: "Climate-controlled vault A, Section 3",
      environment: {
        temperature: "18-20°C",
        humidity: "45-55% RH",
        lighting: "UV-filtered LED, <50 lux",
      },
      security: "high",
    },
    images: {
      primary: "/av-foundation/artwork-old-quarter-morning.png",
      gallery: ["/av-foundation/artwork-old-quarter-morning.png", "/av-foundation/artwork-old-quarter-morning-detail-1.png"],
    },
    isPublic: true,
    passwordLevel: "public",
    estimatedValue: {
      amount: 22000,
      currency: "USD",
      date: "2024-01-01",
    },
    tags: ["oil painting", "urban landscape", "hanoi", "street scene", "morning light", "impressionist"],
  },
  {
    id: "AV-004",
    inventoryNumber: "AV-2024-004",
    title: "Woman with Chrysanthemums",
    titleVietnamese: "Người Phụ Nữ Bên Hoa Cúc",
    artist: {
      id: "3",
      name: "Lê Phổ",
      slug: "le-pho",
    },
    year: 1955,
    medium: "Silk painting with watercolor",
    dimensions: {
      height: 65,
      width: 45,
      unit: "cm",
    },
    weight: {
      value: 0.9,
      unit: "kg",
    },
    description:
      "An elegant silk painting featuring a Vietnamese woman with chrysanthemums, demonstrating Lê Phổ's refined technique and aesthetic sensibility. The work shows the influence of both Eastern and Western artistic traditions.",
    period: "dong-duong",
    periodLabel: "Đông Dương Period (1925-1945)",
    classification: {
      category: "silk-painting",
      subcategory: "Portrait",
      technique: "Silk painting with watercolor pigments",
    },
    condition: "excellent",
    provenance: {
      acquisition: {
        date: "2022-05-30",
        method: "purchase",
        source: "International auction, Paris",
        price: 45000,
        currency: "USD",
      },
      previousOwners: [
        {
          name: "Private European Collection",
          period: "1955-2022",
        },
      ],
      exhibitions: [
        {
          title: "Vietnamese Masters in Paris",
          venue: "Galerie Nationale, Paris",
          date: "1960-10-01",
        },
      ],
    },
    storage: {
      location: "Climate-controlled vault A, Section 1",
      environment: {
        temperature: "18-20°C",
        humidity: "45-55% RH",
        lighting: "UV-filtered LED, <50 lux",
      },
      security: "high",
    },
    images: {
      primary: "/av-foundation/artwork-woman-chrysanthemums.png",
      gallery: ["/av-foundation/artwork-woman-chrysanthemums.png", "/av-foundation/artwork-woman-chrysanthemums-detail-1.png"],
    },
    isPublic: true,
    passwordLevel: "public",
    estimatedValue: {
      amount: 55000,
      currency: "USD",
      date: "2024-01-01",
    },
    tags: ["silk painting", "portrait", "chrysanthemums", "female figure", "elegant", "watercolor"],
  },
]

export function getArtworkById(id: string): Artwork | undefined {
  return artworksData.find((artwork) => artwork.id === id)
}

export function getArtworksByArtist(artistId: string): Artwork[] {
  return artworksData.filter((artwork) => artwork.artist.id === artistId)
}

export function getArtworksByPeriod(period: string): Artwork[] {
  return artworksData.filter((artwork) => artwork.period === period)
}

export function getArtworksByCategory(category: string): Artwork[] {
  return artworksData.filter((artwork) => artwork.classification.category === category)
}

export function getAllCategories(): { value: string; label: string }[] {
  return [
    { value: "all", label: "All Categories" },
    { value: "painting", label: "Paintings" },
    { value: "silk-painting", label: "Silk Paintings" },
    { value: "lacquer", label: "Lacquer Art" },
    { value: "sculpture", label: "Sculptures" },
    { value: "ceramics", label: "Ceramics" },
    { value: "photography", label: "Photography" },
  ]
}

export function getAllPeriods(): { value: string; label: string }[] {
  return [
    { value: "all", label: "All Periods" },
    { value: "dong-duong", label: "Đông Dương Period (1925-1945)" },
    { value: "post-1954-north", label: "Post-1954 North Vietnam" },
    { value: "saigon-gia-dinh", label: "Saigon Gia Định Period" },
    { value: "reform", label: "Reform Period (1986-2000)" },
    { value: "contemporary", label: "Contemporary (2000-present)" },
  ]
}
