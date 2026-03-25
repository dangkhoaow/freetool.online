import './runtime-env';
import '../app/globals.css';
import { createRoot } from 'react-dom/client';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element #root was not found.');
}

void import('./App').then(({ App }) => {
  createRoot(rootElement).render(<App />);
});
