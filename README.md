# Or7.dev · 02.01 — Barbearia

Protótipo comercial de site para barbearias. Marca demonstrativa: **Ofício — Barbearia** (fictícia).
Referência de arquitetura: Barbearia Chapula (demo Or7.dev).

React 19 · TypeScript · Vite · Motion for React · Lucide · CSS por tokens (sem framework de UI).

## Executar

```bash
npm install
npm run dev            # desenvolvimento
npm run build          # typecheck + build de produção (dist/)
npm run preview        # serve o build em http://localhost:4173
```

## Verificações

```bash
npm run typecheck      # tsc -b
npm run lint           # oxlint
npm run test:e2e       # 90 verificações em Chrome/Edge local (precisa do preview rodando)
SHOTS=1 npm run test:e2e   # também salva capturas em ./test-results
```

`BASE_URL` muda o endereço testado; `BROWSER_PATH` aponta outro executável do Chrome/Edge.

## Personalizar para uma barbearia

| O quê | Onde |
|---|---|
| Nome, slogan, descrição, logo, WhatsApp, telefone, e-mail, endereço, mapa, horários, regras da agenda, redes, SEO, créditos | `src/config/site.ts` |
| Serviços, categorias, preços, durações | `src/data/services.ts` |
| Profissionais (nome, especialidade, foto, folgas, serviços de referência) | `src/data/team.ts` |
| Planos de assinatura | `src/data/plans.ts` |
| Galeria (fotos, títulos, serviço sugerido) | `src/data/gallery.ts` |
| Textos das seções (hero, manifesto, diferenciais, CTA final) | `src/data/content.ts` |
| Fotografias e textos alternativos | `scripts/images.json` + `npm run images`, alt em `src/data/images.ts` |
| Cores, tipografia, espaçamentos, curvas de movimento | `src/styles/tokens.css` |
| Title/meta estáticos e preload da hero | `index.html` |

- **WhatsApp:** defina `contact.whatsappNumber` (ex.: `"5541999999999"`). Sem número, nenhum botão de WhatsApp aparece; com número, surgem "Falar no WhatsApp" (contato), "Pedir informações" (planos) e "Enviar pedido" (fim do agendamento).
- **Mapa:** `address.mapsUrl` ativa "Como chegar"; `address.mapEmbedUrl` troca o espaço reservado por um iframe.
- **Logo:** `brand.logoSrc` troca o logotipo tipográfico por um arquivo.
- **Modo demo:** `demoMode: false` remove os avisos de conteúdo demonstrativo (use apenas com dados reais).
- **Imagens próprias:** gere `nome-480.webp`, `nome-960.webp`, `nome-1600.webp` em `public/images` e registre largura/altura em `src/data/image-meta.json` (evita CLS).

## Agendamento demonstrativo

Seis etapas (serviço → profissional → data → horário → dados → revisão) em diálogo acessível.
A agenda é fictícia e determinística (`src/features/booking/schedule.ts`): a ocupação de cada horário vem de um hash de profissional + data + hora, respeita horários de funcionamento, folgas e a duração do serviço. Nada é gravado nem enviado; as escolhas ficam só na sessão do navegador (`sessionStorage`).

## Estrutura

```
src/
  config/site.ts         configuração comercial
  data/                  serviços, equipe, planos, galeria, textos, imagens
  features/booking/      contexto, agenda fictícia, diálogo e etapas
  components/            Img, botões/logo/assinatura, motion (máscaras, reveals, parallax)
  hooks/                 tema, seção ativa, diálogo acessível
  sections/              Navbar, Hero, Manifesto, Services, Gallery, Team, Plans, Experience, Location, Closing, Footer
  styles/                tokens, base, componentes, seções, agendamento
  utils/format.ts        moeda, duração, datas, máscara de telefone
scripts/                 fetch-images, e2e
```

Fotografias de demonstração: [Unsplash](https://unsplash.com/license). As URLs de origem estão em `src/data/image-meta.json`.


## GitHub Pages

Repositório: `barbearia-demo`. Configurado com base `/barbearia-demo/` e deploy automático via GitHub Actions. Em Settings > Pages, escolha GitHub Actions.
