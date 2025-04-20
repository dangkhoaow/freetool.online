export default function ToolGuide() {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-3xl font-bold text-center mb-12">How to Use the Color Picker</h2>

        <div className="space-y-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-bold mb-4">1. Select a Color</h3>
            <p className="text-gray-600 mb-4">
              Use the color input field or adjust the RGB/HSL sliders to select your desired color. The color preview
              will update in real-time.
            </p>
            <ul className="list-disc list-inside text-gray-600 ml-4">
              <li>Click on the color input field to open the native color picker</li>
              <li>Use the RGB sliders to adjust red, green, and blue values</li>
              <li>Use the HSL sliders to adjust hue, saturation, and lightness</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-bold mb-4">2. Copy Color Values</h3>
            <p className="text-gray-600 mb-4">
              Once you've selected a color, you can copy its values in different formats with a single click.
            </p>
            <ul className="list-disc list-inside text-gray-600 ml-4">
              <li>Click the copy button next to the HEX value</li>
              <li>Click the copy button next to the RGB value</li>
              <li>Click the copy button next to the HSL value</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-bold mb-4">3. Save Favorite Colors</h3>
            <p className="text-gray-600 mb-4">
              Save colors you like for future reference. Your favorites are stored in your browser's localStorage.
            </p>
            <ul className="list-disc list-inside text-gray-600 ml-4">
              <li>Click the "Save to Favorites" button to add the current color</li>
              <li>Switch to the "Favorites" tab to view your saved colors</li>
              <li>Click on a saved color to load it into the color picker</li>
              <li>Edit the name of a saved color by clicking the edit icon</li>
              <li>Remove a saved color by clicking the trash icon</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-bold mb-4">4. Check Color Accessibility</h3>
            <p className="text-gray-600 mb-4">
              Ensure your colors meet accessibility standards by checking the contrast ratio.
            </p>
            <ul className="list-disc list-inside text-gray-600 ml-4">
              <li>View the contrast ratio with white text in the "Contrast Ratio" section</li>
              <li>Check if the color passes WCAG AA standards for text readability</li>
              <li>Adjust the color if needed to improve accessibility</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
