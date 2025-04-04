export default function StatsSection() {
  const stats = [
    { number: "600+", label: "Sự kiện đã tổ chức" },
    { number: "72,000", label: "Lượt tham gia" },
    { number: "1,200", label: "Chuyên gia khách mời" },
    { number: "150", label: "Lãnh đạo công nghệ được huấn luyện" },
  ]

  return (
    <section className="py-16 px-4 md:px-6 bg-primary text-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Thành tựu 15 năm</h2>
          <div className="w-20 h-1 bg-white mx-auto mb-6"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">{stat.number}</div>
              <div className="text-lg opacity-90">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

