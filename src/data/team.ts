import type { ImageName } from './images'

/** Equipe fictícia. Substitua nomes, fotos e especialidades pelos reais. */
export interface Barber {
  id: string
  name: string
  role: string
  bio: string
  since: string
  image: ImageName
  /** IDs de serviços em que o profissional é referência. */
  signatureServices: string[]
  /** Dias da semana sem atendimento (0 = domingo). */
  daysOff: number[]
}

export const team: Barber[] = [
  {
    id: 'rafael',
    name: 'Rafael Moura',
    role: 'Degradê e navalha',
    bio: 'Transições limpas e contorno milimétrico. Confere o espelho com você antes de finalizar.',
    since: '11 anos de cadeira',
    image: 'team-1',
    signatureServices: ['degrade', 'maquina', 'barba-desenho'],
    daysOff: [1],
  },
  {
    id: 'thiago',
    name: 'Thiago Brandão',
    role: 'Tesoura e cortes clássicos',
    bio: 'Formado em visagismo. Gosta de cabelo com movimento e de cortes que crescem bem.',
    since: '8 anos de cadeira',
    image: 'team-2',
    signatureServices: ['corte-assinatura', 'tesoura', 'camuflagem'],
    daysOff: [3],
  },
  {
    id: 'andre',
    name: 'André Ventura',
    role: 'Barba e tratamentos',
    bio: 'Responsável pelo ritual da toalha quente. Atende do desenho de barba à limpeza facial.',
    since: '9 anos de cadeira',
    image: 'team-3',
    signatureServices: ['barba-toalha', 'barba-pigmentacao', 'limpeza-facial'],
    daysOff: [6],
  },
]

export const ANY_BARBER = 'any'

export const getBarber = (id: string | null | undefined) => team.find((b) => b.id === id) ?? null
