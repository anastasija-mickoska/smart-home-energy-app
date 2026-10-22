import localFont from "next/font/local";
import "./globals.css";

const robotoFlex = localFont({
  src: "../../public/RobotoFlex.ttf",
  variable: "--font-roboto-flex",
  display: "swap",
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={robotoFlex.className}>
        {children}
      </body>
    </html>
  );
}