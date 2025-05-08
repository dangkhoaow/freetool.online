/**
 * Type declarations for Monaco editor on the window object
 */

import * as monacoEditor from 'monaco-editor';

declare global {
  interface Window {
    monaco: typeof monacoEditor;
  }
}
