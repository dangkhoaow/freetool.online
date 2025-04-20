import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function FaqSection() {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions about our password generator and password security.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>How secure are the generated passwords?</AccordionTrigger>
              <AccordionContent>
                Our password generator uses the Web Crypto API, which provides cryptographically secure random number
                generation. This means the passwords are truly random and unpredictable, making them highly resistant to
                brute force attacks and other password cracking methods. A password with 12+ characters that includes a
                mix of uppercase, lowercase, numbers, and symbols is extremely difficult to crack with current
                technology.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>Where are my saved passwords stored?</AccordionTrigger>
              <AccordionContent>
                All saved passwords are stored locally in your browser's localStorage. This means they never leave your
                device and are not transmitted to any server. However, this also means they are specific to the browser
                you're using and won't sync across devices. For cross-device password management, we recommend using a
                dedicated password manager like Bitwarden, LastPass, or 1Password.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger>What makes a password strong?</AccordionTrigger>
              <AccordionContent>
                A strong password typically has these characteristics: (1) Length - at least 12 characters, preferably
                more; (2) Complexity - a mix of uppercase and lowercase letters, numbers, and special symbols; (3)
                Uniqueness - different from passwords used on other sites; (4) Randomness - not based on dictionary
                words or personal information. Our generator creates passwords that meet all these criteria.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger>Why can't I generate a password shorter than 8 characters?</AccordionTrigger>
              <AccordionContent>
                Passwords shorter than 8 characters are considered insecure by modern standards. They can be cracked
                relatively quickly using brute force methods. We enforce a minimum length of 8 characters to ensure that
                all generated passwords provide at least a basic level of security. For most accounts, we recommend
                using passwords of 12-16 characters or longer.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger>Can I use this tool offline?</AccordionTrigger>
              <AccordionContent>
                Yes! Once the page has loaded, our password generator works completely offline. It uses your browser's
                built-in Web Crypto API for random number generation and localStorage for saving passwords. You can
                disconnect from the internet after loading the page, and all functionality will continue to work
                normally.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger>Is it safe to use generated passwords for all my accounts?</AccordionTrigger>
              <AccordionContent>
                Yes, using unique, randomly generated passwords for each of your accounts is one of the best security
                practices. The main challenge is remembering all these complex passwords, which is why we recommend
                using a password manager to securely store them. Our tool allows you to save passwords temporarily, but
                for long-term storage across multiple devices, a dedicated password manager is more appropriate.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </section>
  )
}
