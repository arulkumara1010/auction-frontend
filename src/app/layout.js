import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={jetBrainsMono.variable}>
      <body className="font-jetbrains">{children}</body>
    </html>
  );
}
