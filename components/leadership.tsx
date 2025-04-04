export default function Leadership() {
  const leaders = [
    {
      name: "Tiến sĩ Trần Viết Huân",
      position: "Chủ tịch cộng đồng CIO Vietnam",
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      name: "Anh Trần Nhất Minh",
      position: "Chủ tịch Ban Cố vấn (Nhiệm kỳ 2024-2026)",
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      name: "Anh Nguyễn Anh Tuấn",
      position: "Chủ tịch, Hanoi Chapter (Nhiệm kỳ 2024-2026)",
      image: "/placeholder.svg?height=300&width=300",
    },
  ]

  return (
    <section className="py-16 px-4 md:px-6 bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ban lãnh đạo</h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Ban lãnh đạo cộng đồng CIO Vietnam bao gồm những nhà lãnh đạo tận tâm, có tầm nhìn chiến lược, và dày dạn
            kinh nghiệm.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {leaders.map((leader, index) => (
            <div key={index} className="text-center">
              <div className="rounded-full overflow-hidden w-48 h-48 mx-auto mb-4">
                <img
                  src={leader.image || "/placeholder.svg"}
                  alt={leader.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-bold mb-1">{leader.name}</h3>
              <p className="text-gray-600">{leader.position}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

