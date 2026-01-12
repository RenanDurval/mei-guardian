import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'MEI Guardian',
    description: 'Automação fiscal e gestão inteligente para MEI',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="pt-BR">
            <body>{children}</body>
        </html>
    )
}
