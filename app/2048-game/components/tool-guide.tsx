import { ArrowUp, ArrowRight, ArrowDown, ArrowLeft, Smartphone } from "lucide-react"

export default function ToolGuide() {
  return (
    <section className="my-16">
      <h2 className="mb-8 text-center text-3xl font-bold">How to Play</h2>

      <div className="mx-auto max-w-3xl rounded-lg border border-gray-200 p-6 shadow-sm dark:border-gray-700">
        <div className="mb-8">
          <h3 className="mb-4 text-xl font-bold">Game Objective</h3>
          <p className="mb-2 text-gray-600 dark:text-gray-400">
            The goal of 2048 is to create a tile with the number 2048 by combining tiles with the same value. You win
            when you create a 2048 tile, but you can continue playing to achieve even higher numbers!
          </p>
        </div>

        <div className="mb-8">
          <h3 className="mb-4 text-xl font-bold">Controls</h3>

          <div className="mb-4">
            <h4 className="mb-2 font-semibold">Keyboard Controls:</h4>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="flex items-center gap-2 rounded-md border border-gray-200 p-2 dark:border-gray-700">
                <ArrowUp className="text-blue-600 dark:text-blue-400" />
                <span>Move Up</span>
              </div>
              <div className="flex items-center gap-2 rounded-md border border-gray-200 p-2 dark:border-gray-700">
                <ArrowRight className="text-blue-600 dark:text-blue-400" />
                <span>Move Right</span>
              </div>
              <div className="flex items-center gap-2 rounded-md border border-gray-200 p-2 dark:border-gray-700">
                <ArrowDown className="text-blue-600 dark:text-blue-400" />
                <span>Move Down</span>
              </div>
              <div className="flex items-center gap-2 rounded-md border border-gray-200 p-2 dark:border-gray-700">
                <ArrowLeft className="text-blue-600 dark:text-blue-400" />
                <span>Move Left</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="mb-2 font-semibold">Touch Controls:</h4>
            <div className="flex items-center gap-2 rounded-md border border-gray-200 p-2 dark:border-gray-700">
              <Smartphone className="text-blue-600 dark:text-blue-400" />
              <span>Swipe in any direction to move tiles</span>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="mb-4 text-xl font-bold">Game Rules</h3>
          <ol className="list-inside list-decimal space-y-2 text-gray-600 dark:text-gray-400">
            <li>The game starts with two random tiles, each with a value of 2 or 4.</li>
            <li>Use arrow keys or swipe to move all tiles in one direction.</li>
            <li>Tiles with the same value will merge into one when they touch, doubling the value.</li>
            <li>After each move, a new tile with a value of 2 or 4 appears in a random empty cell.</li>
            <li>The game ends when you reach 2048 or when there are no more valid moves.</li>
          </ol>
        </div>

        <div>
          <h3 className="mb-4 text-xl font-bold">Tips & Strategies</h3>
          <ul className="list-inside list-disc space-y-2 text-gray-600 dark:text-gray-400">
            <li>Keep your highest value tile in a corner.</li>
            <li>Work to maintain a clear pattern, like keeping larger values on one side.</li>
            <li>Plan several moves ahead to avoid getting stuck.</li>
            <li>Don't rush - take your time to analyze the board before each move.</li>
            <li>Use the undo button if you make a mistake, but try to develop your strategy without relying on it.</li>
          </ul>
        </div>
      </div>
    </section>
  )
}
