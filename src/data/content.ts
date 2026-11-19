import type { ImageName } from './images'

/** Textos editoriais das seções. */

export const nav = [
  { id: 'servicos', label: 'Serviços' },
  { id: 'galeria', label: 'Galeria' },
  { id: 'equipe', label: 'Profissionais' },
  { id: 'planos', label: 'Planos' },
  { id: 'contato', label: 'Contato' },
] as const

export const hero = {
  eyebrow: 'Barbearia com hora marcada',
  titleTop: 'Seu estilo.',
  titleBottom: 'Nossa assinatura.',
  lead: 'Precisão em cada detalhe. Uma experiência feita para quem valoriza o próprio estilo.',
  primaryCta: 'Agendar horário',
  secondaryCta: 'Explorar serviços',
}

export const manifesto = {
  index: 'Nº 01 — A casa',
  titleTop: 'Mais que um corte.',
  titleBottom: 'Um ritual.',
  paragraphs: [
    'Toalha quente, conversa sem pressa e um espelho que só gira quando o resultado está certo.',
    'Cada horário é reservado para uma pessoa. Sem fila, sem encaixe, sem correria.',
  ],
  facts: [
    { value: '45 min', label: 'tempo médio por cliente' },
    { value: '1 : 1', label: 'um profissional, um cliente' },
    { value: '6 etapas', label: 'para marcar seu horário' },
  ],
}

export interface Benefit {
  title: string
  text: string
  image: ImageName
}

export const benefits: Benefit[] = [
  {
    title: 'Atendimento personalizado',
    text: 'Antes da primeira tesourada, a gente conversa sobre rotina, tipo de fio e o que você quer evitar. O corte parte daí.',
    image: 'exp-care',
  },
  {
    title: 'Ambiente confortável',
    text: 'Poltronas de couro, café coado na hora e música baixa. Um lugar para chegar alguns minutos antes.',
    image: 'lounge',
  },
  {
    title: 'Profissionais especializados',
    text: 'Cada barbeiro tem uma especialidade. Você escolhe com quem cortar ou deixa a agenda sugerir.',
    image: 'exp-barber',
  },
  {
    title: 'Agendamento simplificado',
    text: 'Serviço, profissional, data e horário em menos de um minuto, sem baixar aplicativo.',
    image: 'chair',
  },
]

export const closing = {
  eyebrow: 'Agenda aberta',
  title: 'O próximo corte começa aqui.',
  cta: 'Escolher meu horário',
}
