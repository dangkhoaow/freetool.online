import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"

export default function ProgramsSection() {
  const programs = [
    {
      title: "CIO Summit",
      description:
        "Sự kiện thường niên quy tụ những nhà lãnh đạo công nghệ hàng đầu, cùng nhau kết nối, chia sẻ tầm nhìn chiến lược.",
      image: "/placeholder.svg?height=300&width=500",
    },
    {
      title: "CIO Awards",
      description:
        "Giải thưởng thường niên tôn vinh những lãnh đạo CNTT xuất sắc, đóng góp nổi bật trong chuyển đổi số và đổi mới công nghệ.",
      image: "/placeholder.svg?height=300&width=500",
    },
    {
      title: "CIO Coaching Program",
      description:
        "Chương trình huấn luyện chuyên sâu dành cho các nhà lãnh đạo CNTT, nâng cao kỹ năng lãnh đạo và quản lý.",
      image: "/placeholder.svg?height=300&width=500",
    },
    {
      title: "Co-Innovation Program",
      description: "Thúc đẩy hợp tác giữa doanh nghiệp và startup trong đổi mới công nghệ, tạo ra giá trị vượt trội.",
      image: "/placeholder.svg?height=300&width=500",
    },
  ]

  return (
    <section className="py-16 px-4 md:px-6 bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Chương trình nổi bật</h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            CIO Vietnam mang đến nhiều chương trình đa dạng, giúp các nhà lãnh đạo công nghệ phát triển kỹ năng, mở rộng
            mạng lưới và tạo ra giá trị thực sự.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {programs.map((program, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="h-48 overflow-hidden">
                <img
                  src={program.image || "/placeholder.svg"}
                  alt={program.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <CardHeader>
                <CardTitle>{program.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{program.description}</p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="text-primary">
                  Tìm hiểu thêm <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="flex justify-center mt-12">
          <Button className="px-8">
            Xem tất cả chương trình <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}

