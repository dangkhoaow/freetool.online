import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function FaqSection() {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions about our online code editor.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>Is my code secure when using this editor?</AccordionTrigger>
            <AccordionContent>
              Yes, your code is completely secure. All code execution happens directly in your browser and is never sent
              to any server. Your code snippets are stored only in your browser's localStorage, which means they remain
              on your device and are not accessible to anyone else.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>Can I use external libraries in my code?</AccordionTrigger>
            <AccordionContent>
              Currently, the editor supports vanilla JavaScript execution. You cannot directly import external
              libraries. However, you can copy and paste library code into your snippet if needed, though this is not
              recommended for large libraries due to performance considerations.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>Will I lose my code if I close the browser?</AccordionTrigger>
            <AccordionContent>
              Not if you save it first! When you save a code snippet, it's stored in your browser's localStorage. This
              means your saved snippets will persist even if you close the browser or restart your computer. However,
              unsaved changes will be lost if you navigate away from the page or close the browser.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger>Is there a limit to how many snippets I can save?</AccordionTrigger>
            <AccordionContent>
              The number of snippets you can save is limited by your browser's localStorage capacity, which is typically
              around 5-10MB. This should be enough for hundreds of code snippets, but very large snippets might consume
              more space. If you're approaching the limit, consider downloading some snippets to your computer and
              deleting them from the editor.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger>How does the code execution work?</AccordionTrigger>
            <AccordionContent>
              The editor uses JavaScript's eval() function in a controlled environment to execute your code. We've
              implemented safety measures to prevent common security issues. The console.log() output is captured and
              displayed in the output pane. Any errors that occur during execution are caught and displayed with helpful
              error messages.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6">
            <AccordionTrigger>Can I use this editor offline?</AccordionTrigger>
            <AccordionContent>
              Yes! Once the page has loaded, the editor works completely offline. You can write, run, and save code
              snippets without an internet connection. This makes it perfect for coding on the go or in environments
              with limited connectivity.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  )
}
