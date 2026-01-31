import "./globals.css";
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <head>
        {/* Google Search Console 所有権確認 */}
        <meta
          name="google-site-verification"
          content="U3rgvTMTOMOMHrD2ocE4ADOS6OrePh_VYuIycJ3OUT8"
        />

        {/* Fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@400;500;700;800&family=Nunito:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}