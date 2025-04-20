import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function FaqSection() {
  return (
    <section id="faq" className="py-16 px-4 bg-gray-50">
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>How accurate are the conversions?</AccordionTrigger>
            <AccordionContent>
              Our unit converter uses precise mathematical formulas and conversion factors to ensure high accuracy. For
              most everyday conversions, the results are accurate to at least 6 significant digits. For scientific
              applications requiring extreme precision, we recommend verifying with specialized tools.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>Does the converter work offline?</AccordionTrigger>
            <AccordionContent>
              Yes, once the page has loaded, all conversions are performed directly in your browser using JavaScript. No
              internet connection is required for the converter to function after the initial page load. Your conversion
              history is stored in your browser's localStorage.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>Is my conversion data private?</AccordionTrigger>
            <AccordionContent>
              Absolutely. All conversions happen entirely in your browser. We don't send your conversion data to our
              servers or track what you're converting. Your conversion history is stored locally on your device using
              localStorage and is only accessible to you.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger>Why do some temperature conversions seem incorrect?</AccordionTrigger>
            <AccordionContent>
              Temperature conversions are unique because they don't follow a simple multiplicative relationship. For
              example, 0°C is 32°F, but 10°C is not 10 times more than 0°C in Fahrenheit. Our converter correctly
              handles these non-linear relationships using the proper formulas (e.g., °F = °C × 9/5 + 32).
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger>Can I convert between more than two units at once?</AccordionTrigger>
            <AccordionContent>
              Currently, the converter supports converting between two units at a time. However, you can perform
              sequential conversions and track them in the history tab. For example, you can convert meters to feet, and
              then feet to inches as separate conversions.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6">
            <AccordionTrigger>How do I clear my conversion history?</AccordionTrigger>
            <AccordionContent>
              You can clear your conversion history by going to the History tab and clicking the "Clear History" button
              in the top right corner. This will remove all saved conversions from your browser's localStorage.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-7">
            <AccordionTrigger>What's the difference between US and Imperial units?</AccordionTrigger>
            <AccordionContent>
              While similar, US customary units and Imperial units have some differences, particularly for volume
              measurements. For example, a US gallon is about 3.79 liters, while an Imperial gallon is about 4.55
              liters. Our converter distinguishes between these systems where relevant, especially in the volume
              category.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-8">
            <AccordionTrigger>Can I suggest new units or categories to add?</AccordionTrigger>
            <AccordionContent>
              We're always looking to improve our tools. If you'd like to suggest new units or categories, please
              contact us through our feedback form. We regularly update our converter based on user suggestions and
              needs.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  )
}
