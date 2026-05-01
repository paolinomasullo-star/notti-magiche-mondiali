
import './globals.css'

export const metadata = {
  title: 'Notti Magiche Mondiali',
  description: 'Gioco di pronostici sui Mondiali',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  )
}
