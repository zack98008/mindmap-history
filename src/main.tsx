
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add Arabic font
document.documentElement.dir = 'rtl';
document.documentElement.lang = 'ar';

createRoot(document.getElementById("root")!).render(<App />);
