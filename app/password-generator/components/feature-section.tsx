import { Shield, RefreshCw, Save, Clipboard, Lock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function FeatureSection() {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">Password Generator Features</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our password generator uses cryptographically secure methods to create strong, random passwords that help
            protect your online accounts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <Shield className="h-8 w-8 mb-2 text-blue-600" />
              <CardTitle>Cryptographically Secure</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Uses the Web Crypto API to generate truly random passwords that are resistant to prediction and brute
                force attacks.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <RefreshCw className="h-8 w-8 mb-2 text-blue-600" />
              <CardTitle>Customizable Options</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Adjust password length and character types (lowercase, uppercase, numbers, symbols) to meet specific
                requirements.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <Save className="h-8 w-8 mb-2 text-blue-600" />
              <CardTitle>Save & Manage</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Save generated passwords with custom labels and manage them directly in your browser with localStorage.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <Clipboard className="h-8 w-8 mb-2 text-blue-600" />
              <CardTitle>Copy to Clipboard</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Easily copy generated passwords to your clipboard with a single click for quick use in websites and
                apps.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <Lock className="h-8 w-8 mb-2 text-blue-600" />
              <CardTitle>Offline & Private</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Works completely offline with no server requests. Your passwords never leave your device, ensuring
                maximum privacy.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
