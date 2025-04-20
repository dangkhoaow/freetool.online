import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function FaqSection() {
  return (
    <section className="py-12">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Find answers to common questions about our zip compressor tool
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>Is this zip compressor tool completely free?</AccordionTrigger>
            <AccordionContent>
              Yes, our online zip compressor is completely free to use with no hidden fees. You can compress as many
              files as you need without any limitations on the number of compressions.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>Are my files secure when using this tool?</AccordionTrigger>
            <AccordionContent>
              Absolutely. Your files are processed directly in your browser and are not stored on our servers. We take
              your privacy seriously and ensure that your data remains confidential. For added security, you can also
              password-protect your compressed files.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>What's the maximum file size I can compress?</AccordionTrigger>
            <AccordionContent>
              The maximum file size depends on your browser and device capabilities. Generally, you can compress files
              up to 4GB, but for optimal performance, we recommend compressing files under 2GB at a time. For larger
              files, you can use the split archive feature to break them into smaller parts.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger>Which compression formats are supported?</AccordionTrigger>
            <AccordionContent>
              Our tool supports multiple compression formats including ZIP, 7Z, and TAR. ZIP is the most widely
              compatible format, 7Z offers better compression ratios, and TAR is useful for archiving without
              compression.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger>How do I open a password-protected zip file?</AccordionTrigger>
            <AccordionContent>
              To open a password-protected zip file, you'll need a compatible archive program like WinRAR, 7-Zip, or the
              built-in archive utility on macOS. When you try to extract the files, the program will prompt you to enter
              the password you set during compression.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6">
            <AccordionTrigger>Can I compress folders with this tool?</AccordionTrigger>
            <AccordionContent>
              Yes, you can compress entire folders including their subfolders and files. Simply drag and drop the folder
              into the upload area or use the "Select Folder" button. You can also choose whether to include subfolders
              in the compression settings.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-7">
            <AccordionTrigger>What's the difference between compression levels?</AccordionTrigger>
            <AccordionContent>
              The compression level determines the balance between speed and file size reduction. Lower levels (1-3)
              compress quickly but with less size reduction. Medium levels (4-6) offer a good balance. Higher levels
              (7-9) provide maximum compression but take longer to process. Level 0 stores files without compression.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  )
}
