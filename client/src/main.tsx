import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";

const customTheme = createTheme({
  palette: {
    primary: {
      main: "#0d4b34",
      light: "#3d7a5e",
      dark: "#083324",
      contrastText: "#fff",
    },
    secondary: {
      main: "#f5f5f5",
      light: "#ffffff",
      dark: "#eeeeee",
      contrastText: "#000000",
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={customTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>
);
