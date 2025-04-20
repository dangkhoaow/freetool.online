import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function FaqSection() {
  return (
    <section id="faq" className="py-16 px-4 bg-white">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions about our QR code generator and how to use it effectively.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>What types of content can I encode in a QR code?</AccordionTrigger>
            <AccordionContent>
              <p>You can encode various types of content in a QR code, including:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Website URLs</li>
                <li>Plain text</li>
                <li>Contact information (vCard)</li>
                <li>Email addresses</li>
                <li>Phone numbers</li>
                <li>SMS messages</li>
                <li>Wi-Fi network credentials</li>
                <li>Geographic locations</li>
              </ul>
              <p className="mt-2">
                Our generator currently supports text and URL encoding. For specialized formats like vCards or Wi-Fi
                credentials, format your text according to the appropriate standards.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>How do I scan a QR code?</AccordionTrigger>
            <AccordionContent>
              <p>Most modern smartphones can scan QR codes using their built-in camera app:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>
                  <strong>iPhone/iOS:</strong> Open the Camera app and point it at the QR code. A notification will
                  appear that you can tap to open the encoded content.
                </li>
                <li>
                  <strong>Android:</strong> Open the Camera app and point it at the QR code. If your device doesn't
                  support this natively, you can download a QR code scanner app from the Google Play Store.
                </li>
              </ul>
              <p className="mt-2">
                For desktop computers, you can use webcam-based QR code readers or browser extensions.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>What is error correction in QR codes?</AccordionTrigger>
            <AccordionContent>
              <p>
                Error correction allows a QR code to be readable even when it's partially damaged, dirty, or obscured.
                There are four levels of error correction:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>
                  <strong>L (Low):</strong> 7% of codewords can be restored
                </li>
                <li>
                  <strong>M (Medium):</strong> 15% of codewords can be restored
                </li>
                <li>
                  <strong>Q (Quartile):</strong> 25% of codewords can be restored
                </li>
                <li>
                  <strong>H (High):</strong> 30% of codewords can be restored
                </li>
              </ul>
              <p className="mt-2">
                Higher error correction levels make the QR code more complex (more dots) but more resilient. When adding
                a logo or customizing your QR code, it's recommended to use H (High) error correction.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger>Can I add my logo or image to a QR code?</AccordionTrigger>
            <AccordionContent>
              <p>
                Yes, you can add a logo or image to the center of your QR code using our generator. Here's what you need
                to know:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Toggle the "Add Logo Image" switch and upload your image (JPEG, PNG, GIF, or SVG up to 2MB)</li>
                <li>Use a simple, high-contrast logo for best results</li>
                <li>Keep the logo relatively small (we recommend 20-25% of the QR code size)</li>
                <li>Always use "High" error correction when adding a logo</li>
                <li>Test your QR code with multiple scanning apps before distributing it</li>
              </ul>
              <p className="mt-2">
                Adding a logo may reduce the scannability of your QR code, especially if the logo is too large or
                complex. Always test thoroughly before using it in production.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger>Can I change the colors of my QR code?</AccordionTrigger>
            <AccordionContent>
              <p>
                Yes, you can customize both the foreground (dark) and background (light) colors of your QR code.
                However, there are some important considerations:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Maintain high contrast between foreground and background colors</li>
                <li>Very light foreground colors or very dark background colors may reduce scannability</li>
                <li>Some older or lower-quality scanners work best with traditional black and white QR codes</li>
                <li>Always test your colored QR codes with multiple scanning apps</li>
              </ul>
              <p className="mt-2">
                For critical applications, we recommend sticking with black and white or dark blue and white for maximum
                compatibility.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6">
            <AccordionTrigger>Is there a size limit for QR codes?</AccordionTrigger>
            <AccordionContent>
              <p>QR codes have both physical size considerations and data capacity limits:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>
                  <strong>Physical size:</strong> QR codes should be printed large enough to be easily scanned. For most
                  uses, a minimum of 2 x 2 inches (5 x 5 cm) is recommended.
                </li>
                <li>
                  <strong>Data capacity:</strong> Standard QR codes can store up to about 2,953 bytes, 4,296
                  alphanumeric characters, or 7,089 numeric digits, depending on the encoding.
                </li>
              </ul>
              <p className="mt-2">
                Our generator will warn you if your content exceeds recommended limits. For very long content, consider
                linking to a website instead of encoding all the data directly.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-7">
            <AccordionTrigger>Are the QR codes generated on your site permanent?</AccordionTrigger>
            <AccordionContent>
              <p>
                Yes, the QR codes you generate with our tool are static and permanent. They encode the exact information
                you provide and will continue to work indefinitely. Some important points:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>All processing happens in your browser - we don't store your QR codes on our servers</li>
                <li>Your recent QR codes are saved in your browser's local storage for convenience</li>
                <li>If you encode a URL, the QR code will stop working only if that website becomes unavailable</li>
                <li>You can download and save your QR codes for future use</li>
              </ul>
              <p className="mt-2">
                For dynamic QR codes that you can edit after creation, you would need a different service that provides
                hosted QR code management.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-8">
            <AccordionTrigger>Is my data secure when using this QR code generator?</AccordionTrigger>
            <AccordionContent>
              <p>Yes, your data is secure when using our QR code generator:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>All processing happens locally in your browser</li>
                <li>Your content and images are never sent to our servers</li>
                <li>We don't track or store the content of your QR codes</li>
                <li>Your QR code history is only stored in your browser's local storage</li>
              </ul>
              <p className="mt-2">
                This makes our tool suitable for generating QR codes with sensitive information, though we still
                recommend caution when encoding highly confidential data in any QR code.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  )
}
