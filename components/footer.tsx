import Link from "next/link"
import { ThemeToggle } from "./theme-toggle"

export default function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300 dark:text-gray-300 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white dark:text-white text-lg font-bold mb-4"><a href="/">FreeTool.Online</a></h3>
            <p className="text-sm">
              Your one-stop destination for a wide range of free online tools for developers, testers, students, and
              office workers.
            </p>
          </div>

          <div>
            <h4 className="text-white dark:text-white font-medium mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#converter" className="hover:text-white dark:hover:text-white transition-colors">
                  Converter Tool
                </Link>
              </li>
              <li>
                <Link href="#features" className="hover:text-white dark:hover:text-white transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#guide" className="hover:text-white dark:hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="#faq" className="hover:text-white dark:hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white dark:text-white font-medium mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="https://freetoolonline.org?utm_source=external&utm_medium=freetool&utm_content=footer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white dark:hover:text-white transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white dark:hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="https://freetoolonline.com/contact-us.html?utm_source=external&utm_medium=freetool&utm_content=footer"
                  target="_blank"
                  className="hover:text-white dark:hover:text-white transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white dark:hover:text-white transition-colors">
                  Feedback
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white dark:text-white font-medium mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="https://freetoolonline.com/privacy-policy.html?utm_source=external&utm_medium=freetool&utm_content=footer"
                  target="_blank"
                  className="hover:text-white dark:hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white dark:hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="https://freetoolonline.com/privacy-policy.html?utm_source=external&utm_medium=freetool&utm_content=footer"
                  target="_blank"
                  className="hover:text-white dark:hover:text-white transition-colors"
                >
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 dark:border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm">
            © {new Date().getFullYear()}{" "}
            <a
              href="https://freetoolonline.com?utm_source=external&utm_medium=freetool&utm_content=footer"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white dark:hover:text-white transition-colors"
            >
              FreeToolOnline.com
            </a>
            . All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0 items-center">
            <ThemeToggle />
            <Link
              href="https://www.facebook.com/freetoolonline"
              target="_blank"
              className="text-gray-400 dark:text-gray-400 hover:text-white dark:hover:text-white transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </Link>
            <Link 
              href="https://www.linkedin.com/in/ktran1991/" 
              target="_blank"
              className="text-gray-400 dark:text-gray-400 hover:text-white dark:hover:text-white transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect x="2" y="9" width="4" height="12"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
