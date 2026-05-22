import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Foro Financiero Argentina | Inversiones, Ahorro y Empleo',
  description: 'Comunidad argentina para hablar sobre finanzas, inversiones, sueldos, monotributo, empleo y ahorro. Sin filtros y con opiniones reales.',
  keywords: ['foro finanzas', 'inversiones argentina', 'foro sueldos', 'monotributo', 'trabajar en blanco', 'trabajar en negro'],
  openGraph: {
    title: 'Foro Financiero Argentina - Cuánto Cobras',
    description: 'Comunidad argentina para hablar sobre finanzas, inversiones, sueldos y ahorro. Participá de forma anónima.',
  }
};

export default function ForoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>;
}
