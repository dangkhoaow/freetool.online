import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

export default function MembershipOptions() {
  const membershipTypes = [
    {
      title: "Thành viên cá nhân",
      description: "Dành cho lãnh đạo công nghệ và kinh doanh",
      features: [
        "Mở rộng mạng lưới với lãnh đạo hàng đầu",
        "Tham gia chương trình đào tạo chuyên sâu",
        "Cập nhật xu hướng công nghệ mới nhất",
        "Tham gia các sự kiện độc quyền",
      ],
      buttonText: "Đăng ký",
      popular: false,
    },
    {
      title: "Thành viên doanh nghiệp",
      description: "1.000 USD/năm",
      features: [
        "1 Executive Membership",
        "1 Professional Membership",
        "Quyền tham gia 5 sự kiện bất kỳ",
        "Cơ hội hợp tác và quảng bá thương hiệu",
      ],
      buttonText: "Liên hệ ngay",
      popular: true,
    },
    {
      title: "Đối tác chiến lược",
      description: "10.000 USD/năm",
      features: [
        "Thành viên trong Ban Cố vấn",
        "Cơ hội diễn thuyết chính thức",
        "Bootcamp chia sẻ kiến thức",
        "Tăng cường hiện diện thương hiệu",
      ],
      buttonText: "Trở thành đối tác",
      popular: false,
    },
  ]

  return (
    <div className="grid md:grid-cols-3 gap-8 mt-12">
      {membershipTypes.map((membership, index) => (
        <Card
          key={index}
          className={`relative flex flex-col ${membership.popular ? "border-primary shadow-lg" : "border-gray-200"}`}
        >
          {membership.popular && (
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
              Phổ biến
            </div>
          )}
          <CardHeader>
            <CardTitle>{membership.title}</CardTitle>
            <CardDescription>{membership.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <ul className="space-y-3">
              {membership.features.map((feature, idx) => (
                <li key={idx} className="flex items-start">
                  <Check className="h-5 w-5 text-primary shrink-0 mr-2" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="mt-auto">
            <Button
              className={`w-full ${membership.popular ? "" : "bg-white text-primary border border-primary hover:bg-gray-50"}`}
            >
              {membership.buttonText}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

