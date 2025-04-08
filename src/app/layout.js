import "@fontsource/jetbrains-mono"; // Import variable font
import { Toaster } from "react-hot-toast";
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-jetbrains">
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              fontSize: "0.8rem",
              padding: "10px 14px",
              borderRadius: "8px",
            },
            success: {
              style: {
                background: "white",
                color: "green",
              },
            },
            error: {
              style: {
                background: "white", // fixed typo here
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
