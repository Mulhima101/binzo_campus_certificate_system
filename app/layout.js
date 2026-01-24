import './globals.css'

export const metadata = {
  title: 'BinzO Campus Certificates',
  description: 'Generate and download certificates for students',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}