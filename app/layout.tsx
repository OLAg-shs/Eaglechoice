import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ToastProvider } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Eagle Choice",
  description:
    "Your trusted partner for laptops, Ghana Card registration, birth certificates, and visa services",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider defaultTheme="system">
          <TooltipProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
