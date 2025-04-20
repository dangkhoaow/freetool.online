import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function FaqSection() {
  return (
    <section className="py-12 mb-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>What is MD5?</AccordionTrigger>
              <AccordionContent>
                MD5 (Message Digest Algorithm 5) is a widely used cryptographic hash function that produces a 128-bit
                (16-byte) hash value, typically expressed as a 32-character hexadecimal number. It was designed to be a
                one-way function, meaning it's practically impossible to reverse the process and generate the original
                text from the hash value alone.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>Is MD5 secure for passwords?</AccordionTrigger>
              <AccordionContent>
                No, MD5 is no longer considered secure for password storage. It has known vulnerabilities and is
                susceptible to collision attacks. For password hashing, it's recommended to use more secure algorithms
                like bcrypt, Argon2, or PBKDF2 with appropriate salt values. MD5 should only be used for
                non-security-critical applications like checksums or data verification.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger>Can MD5 hashes be reversed?</AccordionTrigger>
              <AccordionContent>
                Technically, MD5 is a one-way function and cannot be directly reversed. However, there are methods to
                potentially discover the original text:
                <ul className="list-disc pl-6 mt-2">
                  <li>Rainbow tables: Pre-computed tables of hash values and their corresponding inputs</li>
                  <li>Brute force attacks: Trying all possible inputs until a matching hash is found</li>
                  <li>Dictionary attacks: Trying common words and phrases</li>
                </ul>
                Our MD5 to text lookup uses a limited database of common words and phrases, but success is not
                guaranteed.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger>What is batch processing in the MD5 converter?</AccordionTrigger>
              <AccordionContent>
                Batch processing allows you to convert multiple text strings to MD5 hashes simultaneously. In the Text
                to MD5 tab, enable the "Batch Mode" option, and enter each text string on a separate line. The tool will
                process each line individually and display all results in a table format.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger>Is my data safe when using this tool?</AccordionTrigger>
              <AccordionContent>
                Yes, all processing happens directly in your browser. Your text and hash values never leave your device
                or get sent to our servers. The conversion history is stored locally on your device and can be cleared
                at any time. We prioritize your privacy and security.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger>What are common uses for MD5 hashes?</AccordionTrigger>
              <AccordionContent>
                While MD5 is no longer recommended for security-critical applications, it's still commonly used for:
                <ul className="list-disc pl-6 mt-2">
                  <li>File integrity verification (checksums)</li>
                  <li>Data deduplication</li>
                  <li>Quickly comparing large data sets</li>
                  <li>Caching mechanisms</li>
                  <li>Non-sensitive data fingerprinting</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </section>
  )
}
