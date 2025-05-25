"use client"

import { useEffect } from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function FaqSection() {
  // Log component mounting for debugging
  useEffect(() => {
    console.log("[PROJLY:LANDING] FaqSection component mounted")
    return () => {
      console.log("[PROJLY:LANDING] FaqSection component unmounted")
    }
  }, [])

  // FAQ data with questions and answers
  const faqs = [
    {
      question: "Is Projly completely free to use?",
      answer:
        "Yes, Projly is 100% free to use with all features available to all users. There are no hidden fees, premium tiers, or credit card requirements.",
    },
    {
      question: "How many projects and tasks can I create?",
      answer:
        "There are no strict limits on the number of projects or tasks you can create. However, for optimal performance, we recommend keeping your active projects to a reasonable number based on your team's capacity.",
    },
    {
      question: "Can I invite users from outside my organization?",
      answer:
        "Yes, you can invite team members with any email address. Users who don't have a Projly account will receive an email invitation with instructions to sign up and join your project.",
    },
    {
      question: "How does the role system work?",
      answer:
        "Projly offers three primary roles: site_owner, admin, and regular_user. Site owners have full control over the platform, admins can manage projects and teams, and regular users can collaborate on assigned projects. Team-specific roles can also be customized.",
    },
    {
      question: "Is my data secure on Projly?",
      answer:
        "Yes, Projly employs industry-standard security measures including encryption, secure authentication with JWT, and regular security updates. Your data is protected both in transit and at rest.",
    },
    {
      question: "Can I export my project data?",
      answer:
        "Yes, Projly allows you to export project data and reports in various formats for your records or further analysis in other tools.",
    },
    {
      question: "How do I get support if I have questions?",
      answer:
        "We offer comprehensive documentation, in-app guides, and email support for all users. Our support team is available to help with any questions or issues you may encounter.",
    },
    {
      question: "Can I use Projly on mobile devices?",
      answer:
        "Yes, Projly is built with responsive design principles, ensuring it works well on desktops, tablets, and mobile phones, allowing you to manage your projects on the go.",
    },
  ]
  
  console.log("[PROJLY:LANDING] FaqSection rendering FAQs:", faqs.length)
  
  return (
    <section id="faq" className="py-16 px-4 bg-white dark:bg-gray-950">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 dark:text-white">Frequently Asked Questions</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Find answers to common questions about Projly and its features.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => {
            console.log(`[PROJLY:LANDING] Rendering FAQ: ${faq.question}`)
            return (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-medium text-lg py-4 dark:text-white">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-300 pt-2 pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </div>
    </section>
  )
}
