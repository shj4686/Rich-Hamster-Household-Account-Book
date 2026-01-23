
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log("🐹 Rich Hamster App Initializing...");

const rootElement = document.getElementById('root');

if (!rootElement) {
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = "color:red; padding:20px; font-weight:bold;";
  errorDiv.innerText = "Error: Root element (#root) not found in HTML.";
  document.body.appendChild(errorDiv);
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("🐹 App rendered successfully!");
  } catch (err: any) {
    console.error("🐹 Rendering failed:", err);
    rootElement.innerHTML = `
      <div style="padding: 40px; text-align: center; font-family: sans-serif;">
        <h2 style="color: #004d40;">🐹 장부를 펼치다 떨어뜨렸츄!</h2>
        <p style="color: #666;">오류 내용: ${err.message}</p>
        <button onclick="window.location.reload()" style="padding: 10px 20px; background: #004d40; color: white; border: none; border-radius: 10px; cursor: pointer;">다시 시도하기</button>
      </div>
    `;
  }
}
