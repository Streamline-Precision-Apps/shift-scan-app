import type { Metadata } from "next";
import "./globals.css";
import ClientIntlProvider from "./lib/client/ClientIntlProvider";

export const metadata: Metadata = {
  title: "Shift Scan - Payroll Made Simple",
  description:
    "Revolutionize your workforce management and payroll with instant, secure, and verifiable timekeeping—powered by QR codes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <ClientIntlProvider>{children}</ClientIntlProvider>
      </body>
    </html>
  );
}
