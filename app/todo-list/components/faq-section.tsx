import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function FaqSection() {
  return (
    <section className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Find answers to common questions about our todo list tool.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>Is my data secure?</AccordionTrigger>
            <AccordionContent>
              Yes, your todo list data is stored locally in your browser's localStorage. It never leaves your device or
              gets sent to any server, ensuring complete privacy and security.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>Will I lose my tasks if I clear my browser data?</AccordionTrigger>
            <AccordionContent>
              Yes, if you clear your browser's localStorage or cookies, your saved tasks will be deleted. Consider
              exporting important tasks or using a browser you don't regularly clear if you need to maintain your task
              list for a long time.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>Can I access my todo list on different devices?</AccordionTrigger>
            <AccordionContent>
              Since the data is stored in your browser's localStorage, your todo list is specific to the browser and
              device you're using. Your tasks won't automatically sync across different devices or browsers.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger>Is there a limit to how many tasks I can add?</AccordionTrigger>
            <AccordionContent>
              The number of tasks you can add is limited by your browser's localStorage capacity, which is typically
              around 5-10MB. This should be enough for thousands of tasks, so you're unlikely to hit this limit with
              normal usage.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger>Can I organize my tasks into categories?</AccordionTrigger>
            <AccordionContent>
              The current version of our todo list tool doesn't support categories or tags. However, you can include
              category information in your task text (e.g., "Work: Complete report" or "Home: Buy groceries").
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  )
}
