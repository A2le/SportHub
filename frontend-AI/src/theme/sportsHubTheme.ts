
import { createTheme } from "@mui/material/styles";

export const C = {
  navy: "#101D33",
  green: "#079447",
  greenHover: "#06783A",
  greenLight: "#DDF7E7",
  background: "#F3F6FA",
  white: "#FFFFFF",
  muted: "#64748B",
  border: "#E2E8F0",
};

export const sportsHubTheme = createTheme({
  palette: {
    primary: { main: C.green, dark: C.greenHover },
    success: { main: C.green },
    background: {
      default: C.background,
      paper: C.white,
    },
    text: {
      primary: C.navy,
      secondary: C.muted,
    },
  },
  typography: {
    fontFamily: "Inter, Roboto, Arial, sans-serif",
    button: { textTransform: "none", fontWeight: 700 },
    h6: { fontWeight: 700 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
          fontWeight: 700,
        },
      },
    },
  },
});
