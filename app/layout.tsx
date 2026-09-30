import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Runway Guard — Can your treasury pay your team?",
  description:
    "Turn CoinMarketCap market data into treasury runway, payroll stress tests, and an auditable reserve plan. Built by Shivam Gupta.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
