/**
 * Configuração comercial central.
 * Para apresentar a outra barbearia, comece por aqui: nome, contatos, endereço,
 * horários, redes e SEO. Serviços, equipe, planos e galeria ficam em `src/data/`.
 * Cores e tipografia ficam em `src/styles/tokens.css`.
 */

export interface DayHours {
  /** 0 = domingo … 6 = sábado */
  day: number
  label: string
  /** null = fechado. Formato 'HH:MM'. */
  open: string | null
  close: string | null
}

export interface SiteConfig {
  /** Exibe avisos de conteúdo demonstrativo. Desative apenas com dados reais. */
  demoMode: boolean
  brand: {
    name: string
    /** Linha curta exibida junto ao nome no logotipo tipográfico. */
    descriptor: string
    slogan: string
    description: string
    /** Caminho de um logo em imagem. null = logotipo tipográfico. */
    logoSrc: string | null
    foundedLabel: string
  }
  contact: {
    /** Somente dígitos com DDI, ex.: '5541999999999'. null desativa o WhatsApp. */
    whatsappNumber: string | null
    /** Telefone exibido. null = não exibir. */
    phoneDisplay: string | null
    email: string | null
  }
  address: {
    lines: string[]
    /** Texto curto exibido no hero e no rodapé. */
    short: string
    /** Link externo para rotas (Google Maps etc.). null = sem botão. */
    mapsUrl: string | null
    /** URL de iframe de mapa. null = painel ilustrativo. */
    mapEmbedUrl: string | null
  }
  hours: DayHours[]
  booking: {
    /** Intervalo da grade de horários, em minutos. */
    slotMinutes: number
    /** Quantos dias à frente o calendário aceita. */
    maxDaysAhead: number
    /** Antecedência mínima para horários de hoje, em minutos. */
    minLeadMinutes: number
  }
  socials: { label: string; handle: string; href: string | null }[]
  seo: { title: string; description: string }
  credits: { studio: string; url: string; signatureSrc: string }
  currency: { locale: string; code: string }
}

export const site: SiteConfig = {
  demoMode: true,
  brand: {
    name: 'Ofício',
    descriptor: 'Barbearia',
    slogan: 'Seu estilo. Nossa assinatura.',
    description:
      'Barbearia contemporânea com corte de precisão, barba na navalha e atendimento com hora marcada.',
    logoSrc: null,
    foundedLabel: 'Casa fictícia · demonstração',
  },
  contact: {
    whatsappNumber: null,
    phoneDisplay: null,
    email: null,
  },
  address: {
    lines: ['Rua das Tesouras, 120 — Centro', 'Cidade Exemplo · UF'],
    short: 'Centro · Cidade Exemplo',
    mapsUrl: null,
    mapEmbedUrl: null,
  },
  hours: [
    { day: 1, label: 'Segunda', open: '13:00', close: '20:00' },
    { day: 2, label: 'Terça', open: '09:00', close: '20:00' },
    { day: 3, label: 'Quarta', open: '09:00', close: '20:00' },
    { day: 4, label: 'Quinta', open: '09:00', close: '21:00' },
    { day: 5, label: 'Sexta', open: '09:00', close: '21:00' },
    { day: 6, label: 'Sábado', open: '08:00', close: '18:00' },
    { day: 0, label: 'Domingo', open: null, close: null },
  ],
  booking: {
    slotMinutes: 30,
    maxDaysAhead: 30,
    minLeadMinutes: 60,
  },
  socials: [
    { label: 'Instagram', handle: '@oficio.barbearia', href: null },
    { label: 'TikTok', handle: '@oficio.barbearia', href: null },
  ],
  seo: {
    title: 'Ofício Barbearia — Protótipo Or7.dev',
    description:
      'Protótipo demonstrativo Or7.dev de site para barbearias: catálogo de serviços, galeria, equipe, planos de assinatura e agendamento em seis etapas.',
  },
  credits: {
    studio: 'Or7.dev',
    url: 'https://lorenzo-or7.github.io/',
    signatureSrc: `${import.meta.env.BASE_URL}brand/or7-assinatura.webp`,
  },
  currency: { locale: 'pt-BR', code: 'BRL' },
}

export const whatsappLink = (message: string): string | null =>
  site.contact.whatsappNumber
    ? `https://wa.me/${site.contact.whatsappNumber}?text=${encodeURIComponent(message)}`
    : null
