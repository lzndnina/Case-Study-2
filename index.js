import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
reportWebVitals(console.log);



// Only call reportWebVitals once to log or track performance
reportWebVitals(console.log);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// No need to call reportWebVitals again
