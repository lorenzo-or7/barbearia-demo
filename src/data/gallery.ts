import type { ImageName } from './images'

export interface GalleryItem {
  id: string
  title: string
  note: string
  image: ImageName
  /** Serviço sugerido para "agendar este estilo". */
  serviceId: string
  /** Formato no mosaico em telas pequenas (no desktop as posições são fixas em CSS). */
  shape: 'tall' | 'wide' | 'square'
}

/** A ordem segue a leitura do mosaico (esquerda → direita, de cima para baixo). */
export const gallery: GalleryItem[] = [
  { id: 'g1', title: 'Barba cheia desenhada', note: 'Contorno na navalha, degradê baixo', image: 'g-beard-profile', serviceId: 'combo-classico', shape: 'tall' },
  { id: 'g2', title: 'Degradê com risco', note: 'Nuca baixa e risco livre', image: 'g-fade-line', serviceId: 'degrade', shape: 'square' },
  { id: 'g3', title: 'Topete clássico', note: 'Laterais batidas, volume no topo', image: 'g-pompadour', serviceId: 'corte-assinatura', shape: 'tall' },
  { id: 'g4', title: 'Contorno alinhado', note: 'Testa e têmporas na navalha', image: 'g-lineup', serviceId: 'barba-desenho', shape: 'square' },
  { id: 'g5', title: 'Degradê navalhado', note: 'Do zero à tesoura', image: 'g-skin-fade', serviceId: 'degrade', shape: 'wide' },
  { id: 'g6', title: 'Finalização com escova', note: 'Topete com pomada de fixação média', image: 'g-classic', serviceId: 'corte-assinatura', shape: 'tall' },
  { id: 'g7', title: 'Textura natural', note: 'Corte na tesoura, barba curta', image: 'g-textured', serviceId: 'tesoura', shape: 'tall' },
  { id: 'g8', title: 'Máquina rente', note: 'Uniforme, nuca limpa', image: 'g-buzz', serviceId: 'maquina', shape: 'square' },
  { id: 'g9', title: 'Volume controlado', note: 'Desbaste no topo, laterais curtas', image: 'g-scissor', serviceId: 'tesoura', shape: 'square' },
]
