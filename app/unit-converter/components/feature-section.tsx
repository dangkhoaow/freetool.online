import FeatureCard from "@/components/feature-card"

export default function FeatureSection() {
  return (
    <section id="features" className="py-16 px-4 bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            title="Multiple Categories"
            description="Convert units across 10 different categories including length, weight, temperature, area, volume, and more."
            icon="Target"
          />
          <FeatureCard
            title="Real-time Conversion"
            description="See conversion results instantly as you type with our real-time calculation engine."
            icon="Lightbulb"
          />
          <FeatureCard
            title="Conversion History"
            description="Keep track of your recent conversions with our built-in history feature."
            icon="Eye"
          />
          <FeatureCard
            title="Works Offline"
            description="Once loaded, our converter works completely offline with no need for internet connection."
            icon="Heart"
          />
          <FeatureCard
            title="Accurate Formulas"
            description="All conversions use precise mathematical formulas to ensure accurate results."
            icon="Award"
          />
          <FeatureCard
            title="User-Friendly Interface"
            description="Simple and intuitive interface makes unit conversion quick and easy for everyone."
            icon="Users"
          />
        </div>
      </div>
    </section>
  )
}
