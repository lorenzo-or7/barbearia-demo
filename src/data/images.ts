import meta from './image-meta.json'

/**
 * Fotografias: arquivos em `public/images/<nome>-<480|960|1600>.webp`,
 * gerados por `npm run images` a partir de `scripts/images.json`.
 * Para trocar uma foto, altere o ID em `scripts/images.json`, rode o script
 * e ajuste o texto alternativo abaixo.
 */
export type ImageName = keyof typeof meta

export interface ImageAsset {
  name: ImageName
  alt: string
  width: number
  height: number
  /** Ponto focal (CSS object-position). */
  focus?: string
}

const alts: Record<ImageName, string> = {
  hero: 'Cliente reclinado na cadeira enquanto o barbeiro acerta a barba com tesoura, em luz quente',
  'hero-detail': 'Barbeiro aparando a barba de um cliente com tesoura, em perfil',
  'hero-mobile': 'Barbeiro finalizando um degradê com pente e tesoura',
  'ritual-beard': 'Barba sendo aparada com tesoura, fotografia em preto e branco',
  'ritual-shave': 'Cliente com espuma de barbear no rosto antes da navalha, em preto e branco',
  chair: 'Cadeira de barbeiro clássica em couro preto e metal cromado',
  room: 'Salão comprido com cadeiras de barbeiro e luminárias pendentes',
  'brick-room': 'Interior com parede de tijolos, espelhos e cadeira de barbeiro',
  lounge: 'Poltronas de barbeiro em couro e bancadas iluminadas em tom âmbar',
  'tools-wood': 'Tesouras e navalha dispostas sobre bancada de madeira',
  'svc-cut': 'Barbeiro de luvas pretas cortando com pente e tesoura',
  'svc-beard': 'Barba feita na navalha, com vapor de toalha quente ao fundo',
  'svc-clipper': 'Degradê sendo acertado com máquina na lateral da cabeça',
  'svc-towel': 'Mãos do barbeiro pressionando a toalha quente no rosto do cliente',
  'exp-care': 'Cliente sorrindo de olhos fechados enquanto recebe espuma de barbear',
  'exp-barber': 'Barbeiro segurando a tesoura em primeiro plano, em preto e branco',
  'g-beard-profile': 'Perfil de homem com barba cheia desenhada e degradê nas laterais',
  'g-fade-line': 'Nuca com degradê baixo e risco desenhado na lateral',
  'g-textured': 'Homem com corte texturizado e barba curta, ao ar livre',
  'g-pompadour': 'Topete clássico com laterais batidas',
  'g-classic': 'Barbeiro finalizando um topete clássico com escova',
  'g-skin-fade': 'Degradê navalhado sendo feito com máquina',
  'g-lineup': 'Cliente de olhos fechados enquanto o barbeiro acerta o contorno da testa',
  'g-buzz': 'Corte na máquina visto por trás, rente e uniforme',
  'g-scissor': 'Tesoura de desbaste e pente trabalhando o volume do topo',
  'team-1': 'Retrato de barbeiro de barba aparada em fundo escuro',
  'team-2': 'Retrato em preto e branco de barbeiro de barba cheia e cabelo ondulado',
  'team-3': 'Retrato em preto e branco de barbeiro de barba e camisa escura',
}

const focus: Partial<Record<ImageName, string>> = {
  hero: '58% 40%',
  'hero-mobile': '50% 35%',
  'g-fade-line': '50% 40%',
  'team-1': '50% 30%',
  'team-2': '50% 25%',
  'team-3': '50% 25%',
}

export const img = (name: ImageName): ImageAsset => ({
  name,
  alt: alts[name],
  width: meta[name].w,
  height: meta[name].h,
  focus: focus[name],
})

export const imageSources = Object.fromEntries(
  Object.entries(meta).map(([k, v]) => [k, v.source]),
) as Record<ImageName, string>
