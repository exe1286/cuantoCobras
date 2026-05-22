import type {Metadata} from 'next';
import './globals.css'; // Global styles
import { AuthProvider } from '@/components/AuthProvider';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  metadataBase: new URL('https://cuantocobras.ar'),
  title: {
    template: '%s | Cuánto Cobras',
    default: 'Cuánto Cobras - Sueldos Reales Argentina',
  },
  description: 'Descubrí y compartí sueldos reales en Argentina de forma anónima. Participá en nuestro foro financiero para debatir sobre ahorros e inversiones.',
  keywords: ['sueldo', 'salario', 'cuanto cobra un', 'sueldos argentina', 'foro financiero', 'inversiones', 'ahorro', 'salarios reales'],
  authors: [{ name: 'Comunidad Cuánto Cobras' }],
  creator: 'Cuánto Cobras',
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: 'https://cuantocobras.ar',
    title: 'Cuánto Cobras - Sueldos y Finanzas en Argentina',
    description: 'Comunidad anónima de salarios y finanzas personales en Argentina. Buscá, compará y compartí tu sueldo real.',
    siteName: 'Cuánto Cobras',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cuánto Cobras - Sueldos y Finanzas en Argentina',
    description: 'Comunidad anónima de salarios y finanzas personales en Argentina.',
  }
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="es">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
             __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Cuánto Cobras",
              "url": "https://cuantocobras.ar",
              "description": "Comunidad anónima de salarios y finanzas personales en Argentina.",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://cuantocobras.ar/salarios?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </head>
      <body className="font-sans bg-slate-50 text-slate-900 min-h-screen flex flex-col overflow-x-hidden" suppressHydrationWarning>
        <AuthProvider>
          <Navbar />
          <main className="flex-1 p-4 lg:p-8 lg:pt-6">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
