import { ArrowUpDown, Save, RotateCcw, Trophy, Smartphone } from "lucide-react"

export default function FeatureSection() {
  return (
    <section className="my-16">
      <h2 className="mb-8 text-center text-3xl font-bold">Game Features</h2>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col items-center rounded-lg border border-gray-200 p-6 text-center shadow-sm dark:border-gray-700">
          <div className="mb-4 rounded-full bg-blue-100 p-3 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
            <ArrowUpDown size={24} />
          </div>
          <h3 className="mb-2 text-xl font-bold">Intuitive Controls</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Use arrow keys or swipe gestures to move tiles in any direction. Simple and responsive controls for all
            devices.
          </p>
        </div>

        <div className="flex flex-col items-center rounded-lg border border-gray-200 p-6 text-center shadow-sm dark:border-gray-700">
          <div className="mb-4 rounded-full bg-green-100 p-3 text-green-600 dark:bg-green-900 dark:text-green-300">
            <Save size={24} />
          </div>
          <h3 className="mb-2 text-xl font-bold">Auto-Save</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Your game progress is automatically saved. Close the browser and pick up right where you left off when you
            return.
          </p>
        </div>

        <div className="flex flex-col items-center rounded-lg border border-gray-200 p-6 text-center shadow-sm dark:border-gray-700">
          <div className="mb-4 rounded-full bg-purple-100 p-3 text-purple-600 dark:bg-purple-900 dark:text-purple-300">
            <RotateCcw size={24} />
          </div>
          <h3 className="mb-2 text-xl font-bold">Undo Feature</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Made a mistake? No problem! Use the undo button to revert to your previous move and try a different
            strategy.
          </p>
        </div>

        <div className="flex flex-col items-center rounded-lg border border-gray-200 p-6 text-center shadow-sm dark:border-gray-700">
          <div className="mb-4 rounded-full bg-yellow-100 p-3 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300">
            <Trophy size={24} />
          </div>
          <h3 className="mb-2 text-xl font-bold">Score Tracking</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Keep track of your current score and beat your personal best. Challenge yourself to reach higher numbers!
          </p>
        </div>

        <div className="flex flex-col items-center rounded-lg border border-gray-200 p-6 text-center shadow-sm dark:border-gray-700">
          <div className="mb-4 rounded-full bg-red-100 p-3 text-red-600 dark:bg-red-900 dark:text-red-300">
            <Smartphone size={24} />
          </div>
          <h3 className="mb-2 text-xl font-bold">Mobile Friendly</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Play on any device with touch support. Swipe in any direction to move tiles, perfect for gaming on the go.
          </p>
        </div>
      </div>
    </section>
  )
}
