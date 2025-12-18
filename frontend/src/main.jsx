import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css'

// Hidden flag in console
console.log("%cFLAG{look_in_the_console}", "color: #4a9eff; font-size: 20px; font-weight: bold;");

// Store flag in localStorage
if (typeof window !== 'undefined') {
  localStorage.setItem("flag", "FLAG{localstorage_looter}");

  // Add to window object
  window.__hiddenFlag = "FLAG{window_object_inspection}";
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
)

