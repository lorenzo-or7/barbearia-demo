/** Planos de assinatura demonstrativos. Valores ilustrativos. */
export interface Plan {
  id: string
  name: string
  tagline: string
  monthly: number
  /** Soma dos serviços avulsos equivalentes, para comparação. */
  standalone: number
  includes: string[]
  perks: string[]
  cta: string
  highlight?: boolean
}

export const plans: Plan[] = [
  {
    id: 'essencial',
    name: 'Essencial',
    tagline: 'Para manter o corte sempre em dia.',
    monthly: 139,
    standalone: 190,
    includes: ['2 cortes por mês', 'Acabamento de nuca entre as visitas'],
    perks: ['Agendamento com 7 dias de antecedência', '5% em produtos da casa'],
    cta: 'Conhecer o Essencial',
  },
  {
    id: 'signature',
    name: 'Signature',
    tagline: 'Corte e barba alinhados o mês inteiro.',
    monthly: 239,
    standalone: 360,
    includes: ['4 cortes por mês', '2 barbas com toalha quente', 'Sobrancelha quando quiser'],
    perks: ['Agenda liberada com 14 dias', '10% em produtos da casa', 'Troca de profissional sem custo'],
    cta: 'Quero o Signature',
    highlight: true,
  },
  {
    id: 'black',
    name: 'Black',
    tagline: 'A cadeira reservada para você.',
    monthly: 389,
    standalone: 590,
    includes: ['Cortes ilimitados', '4 barbas com toalha quente', '1 limpeza facial por mês'],
    perks: ['Horário fixo semanal garantido na agenda', '15% em produtos da casa', 'Bebida da casa em toda visita'],
    cta: 'Falar sobre o Black',
  },
]
