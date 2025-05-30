import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Essay to Song Converter',
  description: 'Transform essays into songs using Claude AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}