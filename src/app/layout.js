import { JetBrains_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";

import "./globals.css";
const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={jetBrainsMono.variable}>
      <body className="font-jetbrains">
      <Toaster
          position="top-center"
          toastOptions={{
            style: {
              fontSize: "0.8rem", // smaller font size
              padding: "10px 14px",
              borderRadius: "8px",
            },
            success: {
              style: {
                background: "white", // green background for success
                color: "green",
              },
            },
            error: {
              style: {
                background: "#hite", // red background for errors
                color: "red",
              },
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
