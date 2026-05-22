import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Salarios y Sueldos en Argentina | Buscador Reales',
  description: 'Descubre sueldos reales actualizados de diversas profesiones en Argentina. Aportados de forma anónima por la comunidad.',
  keywords: ['sueldos argentina', 'salarios', 'buscador de sueldos', 'cuanto gana un', 'cuanto cobra un'],
  openGraph: {
    title: 'Buscador Salarial Colaborativo - Cuánto Cobras',
    description: 'Explora sueldos reales en Argentina, aportados de forma anónima por la propia comunidad.',
  }
};

export default function SalariosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>;
}
