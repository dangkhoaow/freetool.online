export default function ToolGuide() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How to Use the Code Editor</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Follow these simple steps to get started with our online JavaScript code editor.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <div>
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">
                  1
                </div>
                <h3 className="text-xl font-bold">Write Your Code</h3>
              </div>
              <p className="text-gray-600 ml-11">
                Enter your JavaScript code in the editor pane. The editor provides a clean interface for writing code
                with line numbers.
              </p>
            </div>

            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">
                  2
                </div>
                <h3 className="text-xl font-bold">Run Your Code</h3>
              </div>
              <p className="text-gray-600 ml-11">
                Click the "Run" button to execute your code. The output will appear in the output pane on the right. Any
                console.log() statements will display their results here.
              </p>
            </div>

            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">
                  3
                </div>
                <h3 className="text-xl font-bold">Save Your Snippets</h3>
              </div>
              <p className="text-gray-600 ml-11">
                Click the "Save" button to store your code snippet for later use. Give your snippet a descriptive name
                to easily find it later.
              </p>
            </div>
          </div>

          <div>
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">
                  4
                </div>
                <h3 className="text-xl font-bold">Manage Your Snippets</h3>
              </div>
              <p className="text-gray-600 ml-11">
                Switch to the "Saved Snippets" tab to view, load, or delete your saved code snippets. Click on a snippet
                to load it into the editor.
              </p>
            </div>

            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">
                  5
                </div>
                <h3 className="text-xl font-bold">Use Undo/Redo</h3>
              </div>
              <p className="text-gray-600 ml-11">
                Made a mistake? Use the Undo and Redo buttons to navigate through your edit history. This allows you to
                experiment freely with your code.
              </p>
            </div>

            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">
                  6
                </div>
                <h3 className="text-xl font-bold">Download or Upload Code</h3>
              </div>
              <p className="text-gray-600 ml-11">
                Use the Download button to save your code as a .js file on your computer. You can also upload existing
                JavaScript files to edit them in the browser.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
