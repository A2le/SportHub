import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { CssBaseline, ThemeProvider } from "@mui/material";

//import App from "./App";
import { sportsHubTheme } from "./theme/sportsHubTheme";

import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={sportsHubTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>
);
