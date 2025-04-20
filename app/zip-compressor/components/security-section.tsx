import { Shield, Lock, Server, Eye } from "lucide-react"

export default function SecuritySection() {
  return (
    <section className="py-12 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">Your Files Are Secure</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We prioritize the security and privacy of your data
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <Shield className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Client-Side Processing</h3>
              <p className="text-muted-foreground">
                All compression happens directly in your browser. Your files never leave your device, ensuring maximum
                privacy and security.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <Lock className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Strong Encryption</h3>
              <p className="text-muted-foreground">
                Add password protection to your archives with AES-256 encryption, one of the strongest encryption
                standards available.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <Server className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">No Server Storage</h3>
              <p className="text-muted-foreground">
                We don't store your files or compressed archives on our servers. Once you close the browser, all data is
                automatically removed.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <Eye className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Privacy Focused</h3>
              <p className="text-muted-foreground">
                We don't track the content of your files or collect unnecessary personal data. Your privacy is respected
                at all times.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
