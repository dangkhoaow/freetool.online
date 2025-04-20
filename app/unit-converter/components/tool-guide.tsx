import { Card, CardContent } from "@/components/ui/card"
import { Calculator, ArrowLeftRight, Clock, Ruler } from "lucide-react"

export default function ToolGuide() {
  return (
    <section id="guide" className="py-16 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold text-center mb-12">How to Use the Unit Converter</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Calculator className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Step 1: Select a Category</h3>
                  <p className="text-gray-600">
                    Choose the measurement category you want to convert from the dropdown menu. Options include length,
                    weight, temperature, area, volume, time, speed, pressure, energy, and data.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Ruler className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Step 2: Choose Units</h3>
                  <p className="text-gray-600">
                    Select the unit you want to convert from and the unit you want to convert to using the dropdown
                    menus. Each category offers a comprehensive list of units to choose from.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <ArrowLeftRight className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Step 3: Enter a Value</h3>
                  <p className="text-gray-600">
                    Type the value you want to convert in the input field. The conversion will happen automatically as
                    you type. You can also use the "Swap Units" button to quickly reverse the conversion direction.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Step 4: View History</h3>
                  <p className="text-gray-600">
                    All your conversions are automatically saved to the history tab. You can review your past
                    conversions at any time or clear the history if needed.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 bg-blue-50 p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-4">Tips for Using the Unit Converter</h3>
          <ul className="space-y-2 list-disc pl-5">
            <li>For temperature conversions, negative values are supported and handled correctly.</li>
            <li>Scientific notation is automatically used for very small or very large numbers.</li>
            <li>
              The converter works offline after the initial page load, so you can use it without an internet connection.
            </li>
            <li>For quick access to common conversions, use the history tab to see your recent conversions.</li>
            <li>The formula display shows you the mathematical relationship between the units you're converting.</li>
          </ul>
        </div>
      </div>
    </section>
  )
}
