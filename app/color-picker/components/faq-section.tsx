export default function FaqSection() {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>

        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-bold mb-2">What is the difference between RGB and HSL?</h3>
            <p className="text-gray-600">
              RGB (Red, Green, Blue) is an additive color model where colors are created by combining different
              intensities of red, green, and blue light. HSL (Hue, Saturation, Lightness) is a more intuitive color
              model that separates the color (hue) from its saturation and lightness. HSL makes it easier to adjust a
              color's vibrancy or brightness without changing the actual color.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-bold mb-2">How are my favorite colors saved?</h3>
            <p className="text-gray-600">
              Your favorite colors are saved in your browser's localStorage, which means they persist even when you
              close the browser or refresh the page. The data is stored only on your device and is not sent to any
              server. If you clear your browser data or use a different browser, your saved colors won't be available.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-bold mb-2">What does the contrast ratio mean?</h3>
            <p className="text-gray-600">
              The contrast ratio measures the difference in luminance between two colors, typically text and its
              background. For accessibility, WCAG guidelines recommend a minimum contrast ratio of 4.5:1 for normal text
              and 3:1 for large text. Our tool shows you if your selected color would pass these standards when used
              with white text, helping you create more accessible designs.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-bold mb-2">How are colors converted between formats?</h3>
            <p className="text-gray-600">
              Our tool uses mathematical formulas to convert between color formats. For HEX to RGB, we parse the
              hexadecimal values. For RGB to HSL, we calculate the hue based on the relative values of red, green, and
              blue, then determine saturation and lightness. These conversions are done instantly as you adjust the
              color, ensuring all formats stay synchronized.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-bold mb-2">Can I use this tool offline?</h3>
            <p className="text-gray-600">
              Yes! Once the page has loaded, all color picking and conversion happens directly in your browser without
              any server communication. You can use the tool even without an internet connection. Your saved colors are
              also stored locally on your device, so you can access them offline as well.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-bold mb-2">How accurate are the color conversions?</h3>
            <p className="text-gray-600">
              Our color conversions are mathematically accurate, but due to the nature of different color spaces, there
              can be slight rounding differences when converting between formats. For example, converting from HSL to
              RGB and back might result in values that are off by 1 due to rounding. For most practical purposes, these
              differences are negligible.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
