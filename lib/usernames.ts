const ADJECTIVES = [
  'Patacon',
  'Criollo',
  'Austral',
  'Federal',
  'Noble',
  'Picante',
  'Sereno',
  'Valiente',
  'Cauto',
  'Veloz',
  'Mateado',
  'Ahorrador',
];

const NOUNS = [
  'Sueldo',
  'Monotributo',
  'Recibo',
  'Peso',
  'Aguinaldo',
  'Planilla',
  'Mate',
  'Quincena',
  'Billetera',
  'Factura',
  'Paritaria',
  'Liquidacion',
];

export function generateUsername() {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const suffix = Math.floor(1000 + Math.random() * 9000);

  return `${adjective}_${noun}_${suffix}`;
}

