
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";

export default function Home() {
  return <div className="flex flex-col min-h-screen">
      {/* Header/Navigation */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-md p-1 bg-transparent px-0 py-0">
              <img alt="Projly Logo" src="/lovable-uploads/abe3dfce-0180-440a-b1c0-f3f35a8a0d51.png" className="h-16 w-16 object-contain" />
            </div>
            <span className="text-lg font-semibold text-project-primary">Projly</span>
          </div>
          <div className="hidden md:flex gap-6 items-center">
            
            
            
            
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              
            </Button>
            <Button className="bg-project-primary hover:bg-indigo-600" asChild>
              <Link to="/projly/login">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-indigo-50 to-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 max-w-4xl mx-auto">
            Enterprise Project Management System
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
            Streamline your projects, empower your team, and deliver results on time and within budget with our comprehensive project management solution.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button className="bg-project-primary hover:bg-indigo-600 px-8 py-6 text-lg" asChild>
              
            </Button>
            <Button variant="outline" className="px-8 py-6 text-lg" asChild>
              
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-indigo-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-project-primary" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M9 9h.01" />
                  <path d="M9 12h.01" />
                  <path d="M9 15h.01" />
                  <path d="M12 9h3" />
                  <path d="M12 12h3" />
                  <path d="M12 15h3" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Task Management</h3>
              <p className="text-gray-600">
                Create, assign, and track tasks with due dates, priorities, and customizable statuses for complete clarity.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-indigo-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-project-primary" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 1 0 7.75" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Team Collaboration</h3>
              <p className="text-gray-600">
                Facilitate seamless communication and collaboration between team members across different departments and locations.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-indigo-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-project-primary" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2" />
                  <path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Z" />
                  <path d="M12 11h4" />
                  <path d="M12 16h4" />
                  <path d="M8 11h.01" />
                  <path d="M8 16h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Planning</h3>
              <p className="text-gray-600">
                Create detailed project plans with milestones, dependencies, and resource allocation for effective execution.
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-indigo-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-project-primary" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v4" />
                  <path d="M20 12h-4" />
                  <path d="M12 18v4" />
                  <path d="M4 12h4" />
                  <circle cx="12" cy="12" r="2" />
                  <path d="M16.24 7.76a6 6 0 0 1 0 8.49" />
                  <path d="m19.07 4.93.01.01" />
                  <path d="M7.76 7.76a6 6 0 0 0 0 8.49" />
                  <path d="M4.92 4.93l.01.01" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Metrics and Reports</h3>
              <p className="text-gray-600">
                Generate insightful reports and dashboards with real-time data to track performance and make informed decisions.
              </p>
            </div>
            
            {/* Feature 5 */}
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-indigo-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-project-primary" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Time Tracking</h3>
              <p className="text-gray-600">
                Track time spent on tasks and projects to improve productivity and ensure accurate billing for clients.
              </p>
            </div>
            
            {/* Feature 6 */}
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-indigo-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-project-primary" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z" />
                  <path d="M8 12h4" />
                  <path d="M12 16V8" />
                  <path d="M16 12h-4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Workflows</h3>
              <p className="text-gray-600">
                Create custom workflows to automate repetitive tasks and streamline your project management processes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-project-primary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to streamline your project management?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of teams that use Projly to deliver successful projects on time and within budget.
          </p>
          <Button className="bg-white text-project-primary hover:bg-gray-100 px-8 py-6 text-lg" asChild>
            <Link to="/projly/login">Get Started Today</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Projly</h3>
              <p className="text-gray-400">
                Enterprise Project Management System designed to streamline your workflows and boost productivity.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-400 hover:text-white">Features</Link></li>
                <li><Link to="/" className="text-gray-400 hover:text-white">Solutions</Link></li>
                <li><Link to="/" className="text-gray-400 hover:text-white">Pricing</Link></li>
                <li><Link to="/" className="text-gray-400 hover:text-white">Integrations</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-400 hover:text-white">Documentation</Link></li>
                <li><Link to="/" className="text-gray-400 hover:text-white">Blog</Link></li>
                <li><Link to="/" className="text-gray-400 hover:text-white">Tutorials</Link></li>
                <li><Link to="/" className="text-gray-400 hover:text-white">Support</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-400 hover:text-white">About Us</Link></li>
                <li><Link to="/" className="text-gray-400 hover:text-white">Careers</Link></li>
                <li><Link to="/" className="text-gray-400 hover:text-white">Contact</Link></li>
                <li><Link to="/" className="text-gray-400 hover:text-white">Legal</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} VIB Bank. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>;
}
