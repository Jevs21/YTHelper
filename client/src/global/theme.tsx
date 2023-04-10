import { createTheme } from "@suid/material";
import "./App.module.css";

const mainTheme = createTheme({
  palette: {
    primary: {
      // Purple and green play nicely together.
      main: "#1C1B1F",
    },
    secondary: {
      // This is green.A700 as hex.
      main: "#FFFFFF",
    },
    background: {
      default: "#FFFFFF",
      paper:   "#FFFFFF"
    },
  },
  typography: {
    fontFamily: 'Work Sans, Roboto, Helvetica, Arial, sans-serif',
    h1: { 
      // Key Metrics Large
      fontSize: "54px",
      fontWeight: 500,
      lineHeight: "63px",
      letterSpacing: "0em",
      textAlign: "left"
    },
    h2: {
      // Today's Date
      // My Account header
      fontSize: "26px",
      fontWeight: 500,
      lineHeight: "20px",
      // letter-spacing: 0.10000000149011612px;
      textAlign: "left",
    },
    h3: {
      fontSize: "22px",
      fontWeight: 500,
      lineHeight: "20px",
      // letter-spacing: 0.10000000149011612px;
      textAlign: "left",
    },
    h4: {
      fontWeight: 500
    },
    h5: {
      fontWeight: 500
    },
    h6: {
      // Key Metric Small
      fontSize: "36px",
      fontWeight: 500,
      lineHeight: "35px",
      letterSpacing: "0em",
      textAlign: "left"
    },
    subtitle1: {
      // Key Metric Text Large
      fontSize: "12px",
      fontWeight: 300,
      lineHeight: "14px",
      letterSpacing: "0em",
      textAlign: "left"
    },
    subtitle2: {
      // Key Metric Text Small
      fontSize: "14px",
      fontWeight: 400,
      lineHeight: "16px",
      letterSpacing: "0em",
      textAlign: "left"
    },
    body1: {
      // Navbar text ????
      fontSize: "0.85em",
      fontWeight: 500,
      lineHeight: "16px",
      letterSpacing: "0em",
      textAlign: "left",
    },
    body2: {
      // Dashboard "Today's Overview"
      // My Account Profile and My activity headers
      fontWeight: 300,
      fontSize: "14px",
      lineHeight: "20px",
    }
  },
  shape: {
    borderRadius: 20
  }
});


export {
  // themeColors,
  mainTheme,
  // navbarTheme
};