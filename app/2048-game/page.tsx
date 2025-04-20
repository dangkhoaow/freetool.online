import Game2048 from "./components/game-2048"
import FeatureSection from "./components/feature-section"
import ToolGuide from "./components/tool-guide"
import FaqSection from "./components/faq-section"

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <div className="container mx-auto px-4 py-8">
        <section className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            2048 Game
          </h1>
          <p className="mx-auto max-w-3xl text-lg text-gray-600 dark:text-gray-300">
            Play the classic 2048 puzzle game online for free. Combine tiles, reach 2048, and challenge your strategic
            thinking!
          </p>
        </section>

        <Game2048 />

        <FeatureSection />
        <ToolGuide />
        <FaqSection />
      </div>
    </main>
  )
}
