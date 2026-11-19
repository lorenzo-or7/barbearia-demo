/** Catálogo de serviços. Valores ilustrativos em reais. */

export type ServiceCategory = 'cortes' | 'barba' | 'combos' | 'tratamentos'

export interface Service {
  id: string
  name: string
  category: ServiceCategory
  description: string
  /** Duração em minutos (usada no agendamento). */
  duration: number
  price: number
  /** Destaque editorial no catálogo. */
  featured?: boolean
  /** Posição na ordenação "Recomendados". */
  rank: number
}

export const categories: { id: ServiceCategory; label: string }[] = [
  { id: 'cortes', label: 'Cortes' },
  { id: 'barba', label: 'Barba' },
  { id: 'combos', label: 'Combos' },
  { id: 'tratamentos', label: 'Tratamentos' },
]

export const services: Service[] = [
  {
    id: 'corte-assinatura',
    name: 'Corte Assinatura',
    category: 'cortes',
    description: 'Consulta de estilo, tesoura e máquina, lavagem e finalização com pomada.',
    duration: 60,
    price: 95,
    featured: true,
    rank: 1,
  },
  {
    id: 'degrade',
    name: 'Degradê de precisão',
    category: 'cortes',
    description: 'Transição limpa nas laterais, do zero ao comprimento que você escolher.',
    duration: 45,
    price: 80,
    rank: 2,
  },
  {
    id: 'tesoura',
    name: 'Corte na tesoura',
    category: 'cortes',
    description: 'Textura e caimento natural para cabelos médios e longos.',
    duration: 60,
    price: 90,
    rank: 6,
  },
  {
    id: 'maquina',
    name: 'Corte na máquina',
    category: 'cortes',
    description: 'Um pente só, contorno alinhado. Prático e sempre em dia.',
    duration: 30,
    price: 55,
    rank: 9,
  },
  {
    id: 'barba-toalha',
    name: 'Barba com toalha quente',
    category: 'barba',
    description: 'Toalha quente, navalha, óleo e balm. O ritual completo da barba.',
    duration: 45,
    price: 70,
    featured: true,
    rank: 3,
  },
  {
    id: 'barba-desenho',
    name: 'Desenho de barba',
    category: 'barba',
    description: 'Contorno e simetria na máquina e na navalha, sem perder volume.',
    duration: 30,
    price: 50,
    rank: 7,
  },
  {
    id: 'barba-pigmentacao',
    name: 'Pigmentação de barba',
    category: 'barba',
    description: 'Preenche falhas e uniformiza o tom com acabamento natural.',
    duration: 45,
    price: 75,
    rank: 12,
  },
  {
    id: 'combo-classico',
    name: 'Corte + barba',
    category: 'combos',
    description: 'Corte e barba no mesmo horário, com toalha quente no final.',
    duration: 90,
    price: 145,
    featured: true,
    rank: 4,
  },
  {
    id: 'combo-ritual',
    name: 'Ritual completo',
    category: 'combos',
    description: 'Corte, barba com toalha quente, limpeza facial e sobrancelha.',
    duration: 120,
    price: 210,
    rank: 5,
  },
  {
    id: 'combo-pai-filho',
    name: 'Pai e filho',
    category: 'combos',
    description: 'Dois cortes em sequência, para crianças a partir de 4 anos.',
    duration: 90,
    price: 150,
    rank: 10,
  },
  {
    id: 'limpeza-facial',
    name: 'Limpeza facial',
    category: 'tratamentos',
    description: 'Esfoliação, extração leve e máscara calmante. Pele pronta para a navalha.',
    duration: 45,
    price: 85,
    rank: 8,
  },
  {
    id: 'hidratacao',
    name: 'Hidratação capilar',
    category: 'tratamentos',
    description: 'Tratamento para fios ressecados, com massagem no couro cabeludo.',
    duration: 30,
    price: 60,
    rank: 11,
  },
  {
    id: 'camuflagem',
    name: 'Camuflagem de grisalhos',
    category: 'tratamentos',
    description: 'Suaviza os fios brancos sem tingir por completo. Resultado discreto.',
    duration: 45,
    price: 90,
    rank: 13,
  },
  {
    id: 'sobrancelha',
    name: 'Sobrancelha na navalha',
    category: 'tratamentos',
    description: 'Limpeza e alinhamento sutil, sem afinar demais.',
    duration: 15,
    price: 30,
    rank: 14,
  },
]

export const getService = (id: string | null | undefined) =>
  services.find((s) => s.id === id) ?? null

export type SortKey = 'recomendados' | 'preco-asc' | 'preco-desc' | 'duracao'

export const sortOptions: { id: SortKey; label: string }[] = [
  { id: 'recomendados', label: 'Recomendados' },
  { id: 'preco-asc', label: 'Menor preço' },
  { id: 'preco-desc', label: 'Maior preço' },
  { id: 'duracao', label: 'Mais rápidos' },
]

export function sortServices(list: Service[], key: SortKey): Service[] {
  const copy = [...list]
  switch (key) {
    case 'preco-asc':
      return copy.sort((a, b) => a.price - b.price || a.rank - b.rank)
    case 'preco-desc':
      return copy.sort((a, b) => b.price - a.price || a.rank - b.rank)
    case 'duracao':
      return copy.sort((a, b) => a.duration - b.duration || a.rank - b.rank)
    default:
      return copy.sort((a, b) => a.rank - b.rank)
  }
}
