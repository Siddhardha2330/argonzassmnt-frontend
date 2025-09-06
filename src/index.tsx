import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter as Router } from 'react-router-dom';

console.log('🚀 Starting React application...');

const rootElement = document.getElementById('root') as HTMLElement;
console.log('🔍 Root element found:', rootElement);

if (!rootElement) {
  console.error('❌ Root element not found!');
} else {
  console.log('✅ Root element found, creating React root...');
  const root = ReactDOM.createRoot(rootElement);
  
  console.log('🎯 Rendering App component...');
  root.render(
    <React.StrictMode>
      <Router>
        <App />
      </Router>
    </React.StrictMode>
  );
  console.log('✅ App component rendered!');
}
