export function ToolGuide() {
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">How to Use the Password Generator</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Follow these simple steps to create and manage secure passwords for all your accounts.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white font-bold text-xl">
              1
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Customize Your Password</h3>
              <p className="text-gray-600">
                Adjust the password length using the slider. Toggle options to include lowercase letters, uppercase
                letters, numbers, and special symbols based on your requirements.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white font-bold text-xl">
              2
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Generate a Password</h3>
              <p className="text-gray-600">
                Click the "Generate Password" button to create a new random password based on your selected options. You
                can generate as many passwords as you need until you find one you like.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white font-bold text-xl">
              3
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Copy or Save Your Password</h3>
              <p className="text-gray-600">
                Use the copy button to copy the password to your clipboard for immediate use. If you want to keep it for
                later, click the save button to store it in your browser.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white font-bold text-xl">
              4
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Manage Saved Passwords</h3>
              <p className="text-gray-600">
                Switch to the "Saved Passwords" tab to view, label, copy, or delete your stored passwords. All passwords
                are stored locally in your browser and never sent to any server.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
