export interface Artist {
  id: string
  slug: string
  name: string
  nameVietnamese?: string
  birthYear: number
  deathYear?: number
  birthPlace: string
  profileImage: string
  biography: string
  artisticStyle: string[]
  period: "dong-duong" | "post-1954-north" | "saigon-gia-dinh" | "reform" | "contemporary"
  periodLabel: string
  exhibitions: {
    year: number
    title: string
    location: string
    type: "solo" | "group"
  }[]
  awards: {
    year: number
    title: string
    organization: string
  }[]
  education: {
    year: number
    institution: string
    degree?: string
  }[]
  artworks: {
    id: string
    title: string
    year: number
    medium: string
    dimensions: string
    image: string
    description: string
  }[]
  isActive: boolean
  passwordLevel: "public" | "private-a" | "private-b" | "admin"
}

export const artistsData: Artist[] = [
  {
    id: "1",
    slug: "nguyen-phan-chanh",
    name: "Nguyễn Phan Chánh",
    nameVietnamese: "Nguyễn Phan Chánh",
    birthYear: 1892,
    deathYear: 1984,
    birthPlace: "Hue, Vietnam",
    profileImage: "/av-foundation/artist-nguyen-phan-chanh.png",
    biography:
      "Nguyễn Phan Chánh was a pioneering Vietnamese painter who played a crucial role in the development of modern Vietnamese art. Born in Hue, he was among the first generation of artists to study at the École des Beaux-Arts de l'Indochine. His work bridged traditional Vietnamese aesthetics with Western painting techniques, creating a distinctive style that influenced generations of Vietnamese artists.",
    artisticStyle: ["Silk Painting", "Lacquer Art", "Oil Painting", "Traditional Vietnamese"],
    period: "dong-duong",
    periodLabel: "Đông Dương Period (1925-1945)",
    exhibitions: [
      {
        year: 1931,
        title: "First Indochina Art Exhibition",
        location: "Hanoi, Vietnam",
        type: "group",
      },
      {
        year: 1943,
        title: "Traditional Vietnamese Paintings",
        location: "Saigon, Vietnam",
        type: "solo",
      },
    ],
    awards: [
      {
        year: 1935,
        title: "Gold Medal for Silk Painting",
        organization: "École des Beaux-Arts de l'Indochine",
      },
    ],
    education: [
      {
        year: 1925,
        institution: "École des Beaux-Arts de l'Indochine",
        degree: "Fine Arts Diploma",
      },
    ],
    artworks: [
      {
        id: "AV-001",
        title: "Young Woman with Lotus",
        year: 1935,
        medium: "Silk painting",
        dimensions: "60 x 40 cm",
        image: "/av-foundation/artwork-young-woman-lotus.png",
        description:
          "A masterful silk painting depicting a young Vietnamese woman holding lotus flowers, showcasing the artist's skill in traditional techniques.",
      },
      {
        id: "AV-002",
        title: "Village Scene",
        year: 1940,
        medium: "Lacquer on wood",
        dimensions: "80 x 60 cm",
        image: "/av-foundation/artwork-village-scene.png",
        description:
          "A serene depiction of rural Vietnamese life, executed in traditional lacquer technique with gold leaf details.",
      },
    ],
    isActive: true,
    passwordLevel: "public",
  },
  {
    id: "2",
    slug: "bui-xuan-phai",
    name: "Bùi Xuân Phái",
    nameVietnamese: "Bùi Xuân Phái",
    birthYear: 1920,
    deathYear: 1988,
    birthPlace: "Hanoi, Vietnam",
    profileImage: "/av-foundation/artist-bui-xuan-phai.png",
    biography:
      "Bùi Xuân Phái is renowned as the painter of Hanoi's old quarter. His distinctive style captured the essence of Vietnamese urban life, particularly the narrow streets and ancient architecture of Hanoi. His work is characterized by earthy tones and a deep emotional connection to Vietnamese culture and daily life.",
    artisticStyle: ["Oil Painting", "Urban Landscapes", "Street Scenes", "Impressionist"],
    period: "post-1954-north",
    periodLabel: "Post-1954 North Vietnam",
    exhibitions: [
      {
        year: 1960,
        title: "Hanoi Streets",
        location: "Hanoi, Vietnam",
        type: "solo",
      },
      {
        year: 1975,
        title: "Vietnamese Contemporary Art",
        location: "Ho Chi Minh City, Vietnam",
        type: "group",
      },
    ],
    awards: [
      {
        year: 1965,
        title: "National Artist Award",
        organization: "Ministry of Culture, Vietnam",
      },
    ],
    education: [
      {
        year: 1945,
        institution: "Hanoi Fine Arts University",
        degree: "Bachelor of Fine Arts",
      },
    ],
    artworks: [
      {
        id: "AV-003",
        title: "Old Quarter Morning",
        year: 1965,
        medium: "Oil on canvas",
        dimensions: "70 x 50 cm",
        image: "/av-foundation/artwork-old-quarter-morning.png",
        description:
          "A atmospheric painting of Hanoi's old quarter in the early morning light, showcasing Phái's mastery of urban landscapes.",
      },
    ],
    isActive: true,
    passwordLevel: "public",
  },
  {
    id: "3",
    slug: "le-pho",
    name: "Lê Phổ",
    nameVietnamese: "Lê Phổ",
    birthYear: 1907,
    deathYear: 2001,
    birthPlace: "Ha Dong, Vietnam",
    profileImage: "/av-foundation/artist-le-pho.png",
    biography:
      "Lê Phổ was a master of silk painting and one of the most internationally recognized Vietnamese artists. His work beautifully combined Eastern and Western artistic traditions, featuring elegant figures, flowers, and landscapes rendered with exceptional skill and sensitivity.",
    artisticStyle: ["Silk Painting", "Oil Painting", "Figurative", "Floral Studies"],
    period: "dong-duong",
    periodLabel: "Đông Dương Period (1925-1945)",
    exhibitions: [
      {
        year: 1950,
        title: "Vietnamese Silk Paintings",
        location: "Paris, France",
        type: "solo",
      },
      {
        year: 1970,
        title: "Asian Contemporary Art",
        location: "New York, USA",
        type: "group",
      },
    ],
    awards: [
      {
        year: 1955,
        title: "Prix de la Critique",
        organization: "Salon d'Automne, Paris",
      },
    ],
    education: [
      {
        year: 1930,
        institution: "École des Beaux-Arts de l'Indochine",
        degree: "Fine Arts Diploma",
      },
    ],
    artworks: [
      {
        id: "AV-004",
        title: "Woman with Chrysanthemums",
        year: 1955,
        medium: "Silk painting",
        dimensions: "65 x 45 cm",
        image: "/av-foundation/artwork-woman-chrysanthemums.png",
        description:
          "An elegant silk painting featuring a Vietnamese woman with chrysanthemums, demonstrating Lê Phổ's refined technique and aesthetic sensibility.",
      },
    ],
    isActive: true,
    passwordLevel: "public",
  },
]

export function getArtistBySlug(slug: string): Artist | undefined {
  return artistsData.find((artist) => artist.slug === slug)
}

export function getArtistsByPeriod(period: string): Artist[] {
  return artistsData.filter((artist) => artist.period === period)
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
