import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function FaqSection() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about our resume builder tool.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>Is this resume builder completely free?</AccordionTrigger>
            <AccordionContent>
              Yes, our resume builder is 100% free to use. You can create, edit, and download your resume as a PDF
              without any cost or hidden fees. There are no premium features or paid upgrades.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>Do I need to create an account to use the resume builder?</AccordionTrigger>
            <AccordionContent>
              No, you don't need to create an account or provide any personal information to use our resume builder. All
              your resume data is stored locally in your browser's localStorage, not on our servers.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>How is my resume data stored?</AccordionTrigger>
            <AccordionContent>
              Your resume data is stored locally in your browser's localStorage. This means the data stays on your
              device and is not sent to our servers. Your data will persist even if you close your browser, but it will
              be lost if you clear your browser data or use a different device.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger>Can I use this resume builder offline?</AccordionTrigger>
            <AccordionContent>
              Yes, once the page has loaded, you can use the resume builder offline. All the processing happens in your
              browser, and you can create and download your resume without an internet connection.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger>How do I add multiple work experiences or education entries?</AccordionTrigger>
            <AccordionContent>
              In the Work Experience or Education tabs, simply click the "Add Experience" or "Add Education" button to
              create a new entry. You can add as many entries as you need, and they will be organized chronologically in
              your resume.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6">
            <AccordionTrigger>Can I edit my resume after I've created it?</AccordionTrigger>
            <AccordionContent>
              Yes, as long as you're using the same browser and haven't cleared your browser data, your resume
              information will be saved automatically. Simply return to the resume builder, and your data will be loaded
              automatically, allowing you to make changes and download an updated version.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-7">
            <AccordionTrigger>What format is the resume downloaded in?</AccordionTrigger>
            <AccordionContent>
              Your resume is downloaded as a PDF (Portable Document Format) file. This is the most widely accepted
              format for resumes as it preserves formatting across different devices and operating systems, and it's the
              preferred format for most job application systems.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-8">
            <AccordionTrigger>How can I preview my resume before downloading?</AccordionTrigger>
            <AccordionContent>
              After filling in your information, click the "Preview" button at the bottom of the form. This will show
              you exactly how your resume will look when downloaded. You can switch back to edit mode if you need to
              make any changes.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-9">
            <AccordionTrigger>What should I include in my professional summary?</AccordionTrigger>
            <AccordionContent>
              Your professional summary should be a brief overview (3-5 sentences) of your career, highlighting your
              most relevant skills, experience, and achievements. It should be tailored to the type of position you're
              applying for and give employers a quick snapshot of what makes you a strong candidate.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-10">
            <AccordionTrigger>How do I reset all my resume data?</AccordionTrigger>
            <AccordionContent>
              If you want to start over, click the "Reset Form" button at the bottom of the form. This will clear all
              your data and reset the form to its default state. of the form. This will clear all your data and reset
              the form to its default state. Be careful when using this option as it cannot be undone.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  )
}
