"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

export default function FaqSection() {
  const [mounted, setMounted] = useState(false)
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  useEffect(() => {
    console.log("[CONTRACT:LANDING] FaqSection component mounted")
    setMounted(true)
    return () => {
      console.log("[CONTRACT:LANDING] FaqSection component unmounted")
    }
  }, [])

  const faqs = [
    {
      question: "What types of contracts can I manage?",
      answer: "You can manage all types of contracts including service agreements, employment contracts, vendor agreements, NDAs, leases, and more. The system supports both Vietnamese and English contracts with flexible custom fields."
    },
    {
      question: "How secure is my contract data?",
      answer: "We use enterprise-grade security with end-to-end encryption, secure cloud storage, and regular backups. Your contract data is protected with role-based access controls and audit trails."
    },
    {
      question: "Can I import existing contracts?",
      answer: "Yes, you can easily import existing contracts through our bulk import feature. We support various formats including Excel and CSV files to help you migrate your existing contract database."
    },
    {
      question: "How do deadline notifications work?",
      answer: "The system automatically monitors contract expiration dates and renewal deadlines. You'll receive email notifications at configurable intervals (30, 60, 90 days) before important dates."
    },
    {
      question: "Is there multi-language support?",
      answer: "Yes, the platform fully supports both Vietnamese and English languages. You can switch between languages at any time, and all contract data supports both languages."
    },
    {
      question: "Can I export contract reports?",
      answer: "Absolutely! You can export contracts and reports in multiple formats including PDF, Excel, and CSV. Generate comprehensive reports for compliance, auditing, or analysis purposes."
    }
  ]

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  if (!mounted) {
    return <div className="py-12 px-4">Loading FAQ...</div>
  }

  return (
    <section className="py-16 px-4 bg-white dark:bg-gray-950">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 dark:text-white">Frequently Asked Questions</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Find answers to common questions about our contract management platform.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <h3 className="text-lg font-semibold dark:text-white">{faq.question}</h3>
                {openIndex === index ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4">
                  <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
