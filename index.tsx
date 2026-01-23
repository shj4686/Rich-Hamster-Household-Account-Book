
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log("🐹 Rich Hamster App Initializing...");

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("Critical: Root element not found!");
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log("🐹 App rendered successfully!");
} catch (err) {
  console.error("🐹 Rendering failed:", err);
  rootElement.innerHTML = `<div style="padding: 20px; color: red;">오류 발생: ${err.message}</div>`;
}
