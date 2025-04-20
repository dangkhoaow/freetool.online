import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function FaqSection() {
  return (
    <section className="my-16">
      <h2 className="mb-8 text-center text-3xl font-bold">Frequently Asked Questions</h2>

      <div className="mx-auto max-w-3xl">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>What is 2048?</AccordionTrigger>
            <AccordionContent>
              2048 is a popular single-player sliding block puzzle game. The objective is to slide numbered tiles on a
              grid to combine them and create a tile with the number 2048. The game was created in 2014 by Italian
              developer Gabriele Cirulli and has since become a worldwide phenomenon.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>How do I play 2048?</AccordionTrigger>
            <AccordionContent>
              Use your arrow keys (on desktop) or swipe gestures (on mobile) to move all tiles in one direction. When
              two tiles with the same number touch, they merge into one tile with the sum of their values. After each
              move, a new tile with a value of 2 or 4 appears in a random empty cell. The goal is to create a tile with
              the value 2048.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>Is there a strategy to win at 2048?</AccordionTrigger>
            <AccordionContent>
              Yes, there are several strategies that can help you win. One common strategy is to keep your highest value
              tile in a corner and build a descending sequence of tiles next to it. This helps maintain order on the
              board and prevents smaller tiles from getting trapped. Another tip is to use primarily two or three
              directions for movement, rather than moving in all four directions randomly.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger>What happens if I reach 2048?</AccordionTrigger>
            <AccordionContent>
              Congratulations! You've won the game! However, you can continue playing to achieve even higher numbers
              like 4096, 8192, and beyond. The game will ask if you want to continue playing or start a new game when
              you reach 2048.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger>Can I undo a move if I make a mistake?</AccordionTrigger>
            <AccordionContent>
              Yes, our implementation of 2048 includes an undo button that allows you to revert to your previous move.
              This can be helpful when learning the game or if you accidentally make a move that disrupts your strategy.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6">
            <AccordionTrigger>Is my game progress saved?</AccordionTrigger>
            <AccordionContent>
              Yes, your game progress is automatically saved to your browser's localStorage. If you close the browser or
              refresh the page, you can continue from where you left off. Your best score is also saved.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-7">
            <AccordionTrigger>Can I play 2048 offline?</AccordionTrigger>
            <AccordionContent>
              Yes, once the game has loaded in your browser, it works completely offline. All game logic runs in your
              browser without requiring an internet connection.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-8">
            <AccordionTrigger>What's the highest possible tile in 2048?</AccordionTrigger>
            <AccordionContent>
              Theoretically, on a standard 4x4 grid, the highest possible tile is 131,072 (2^17). However, reaching such
              a high number is extremely difficult and requires perfect strategy and a bit of luck. Most skilled players
              can reach 8192 or 16384 with practice.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  )
}
