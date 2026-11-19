/**
 * Testes de ponta a ponta com o Chrome/Edge instalado (playwright-core, sem download de navegador).
 *
 *   npm run build && npm run preview   (em outro terminal)
 *   npm run test:e2e                    (BASE_URL opcional, padrão http://localhost:4173)
 *   SHOTS=1 npm run test:e2e            (salva capturas em ./test-results)
 */
import { chromium } from 'playwright-core'
import fs from 'node:fs'
import path from 'node:path'

const BASE = process.env.BASE_URL ?? 'http://localhost:4173'
const SHOTS = Boolean(process.env.SHOTS)
const outDir = path.resolve('test-results')
if (SHOTS) fs.mkdirSync(outDir, { recursive: true })

const executablePath = [
  process.env.BROWSER_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
]
  .filter(Boolean)
  .find((p) => fs.existsSync(p))
if (!executablePath) {
  console.error('Nenhum Chrome/Edge encontrado. Defina BROWSER_PATH.')
  process.exit(2)
}

const results = []
const check = (cond, name, info = '') => results.push({ ok: !!cond, name, info })
const shot = async (page, name) => SHOTS && page.screenshot({ path: path.join(outDir, `${name}.png`) })

const browser = await chromium.launch({ executablePath, headless: true })

async function newPage(viewport, opts = {}) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1, ...opts })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1800)
  return { page, ctx, errors }
}

const dialog = (page) => page.locator('.booking[role="dialog"]')
const currentStep = (page) => page.locator('.stepper__item.is-current .stepper__label').first().textContent()

/* ------------------------------------------------------------------ */
/* 1. Desktop                                                          */
/* ------------------------------------------------------------------ */
{
  const { page, ctx, errors } = await newPage({ width: 1440, height: 900 })
  await shot(page, 'desktop-hero')

  // Skip link é o primeiro foco
  await page.keyboard.press('Tab')
  check((await page.evaluate(() => document.activeElement?.className)) === 'skip-link', 'Primeiro Tab foca o link "Pular para o conteúdo"')

  // Metadados
  check((await page.title()).includes('Or7.dev'), 'Title com identificação do protótipo')
  check(await page.locator('meta[name="description"]').count(), 'Meta description presente')
  check(await page.locator('meta[property="og:image"]').count(), 'Open Graph presente')
  check((await page.locator('h1').count()) === 1, 'Exatamente um H1')

  // Navegação por âncoras + indicador ativo
  await page.locator('.nav__links a[href="#planos"]').click()
  await page.waitForTimeout(1600)
  const planosTop = await page.evaluate(() => document.getElementById('planos').getBoundingClientRect().top)
  check(Math.abs(planosTop) < 140, 'Âncora "Planos" leva à seção', `top=${planosTop}`)
  check((await page.locator('.nav__links a[aria-current]').getAttribute('href')) === '#planos', 'Indicador de seção ativa acompanha o scroll')
  check(await page.locator('.nav.is-scrolled').count(), 'Navbar muda de estado após o scroll')
  const emptyLinks = await page.locator('a[href="#"], a:not([href])').count()
  check(emptyLinks === 0, 'Nenhum link vazio (#)', `encontrados=${emptyLinks}`)

  // Tema + persistência
  const themeBtn = page.locator('.nav__theme')
  await themeBtn.click()
  await page.waitForTimeout(600)
  check((await page.evaluate(() => document.documentElement.dataset.theme)) === 'light', 'Alterna para tema claro')
  await page.reload({ waitUntil: 'networkidle' })
  check((await page.evaluate(() => document.documentElement.dataset.theme)) === 'light', 'Tema claro persiste após recarregar')
  await page.waitForTimeout(1500)
  await shot(page, 'desktop-hero-light')
  await page.locator('.nav__theme').click()
  await page.waitForTimeout(600)
  check((await page.evaluate(() => document.documentElement.dataset.theme)) === 'dark', 'Volta ao tema escuro')

  // Filtros e ordenação
  await page.evaluate(() => document.getElementById('servicos').scrollIntoView())
  await page.waitForTimeout(800)
  const count = () => page.locator('.service-list > .service').count()
  check((await count()) === 14, 'Catálogo mostra 14 serviços em "Todos"')
  await page.locator('.filter', { hasText: 'Barba' }).click()
  await page.waitForTimeout(700)
  check((await count()) === 3, 'Filtro "Barba" mostra 3 serviços', `n=${await count()}`)
  check((await page.locator('.filter[aria-pressed="true"]').textContent()).includes('Barba'), 'Filtro ativo marcado com aria-pressed')
  await page.locator('.filter', { hasText: 'Tratamentos' }).click()
  await page.waitForTimeout(700)
  const cats = await page.locator('.service .service__meta span:first-child').allTextContents()
  check(cats.length === 4 && cats.every((c) => c === 'Tratamentos'), 'Filtro "Tratamentos" exibe só tratamentos')
  await page.locator('.filter', { hasText: 'Todos' }).click()
  await page.selectOption('.sort__select', 'preco-asc')
  await page.waitForTimeout(700)
  const firstPrice = await page.locator('.service .service__price').first().textContent()
  check(firstPrice.replace(/\s/g, ' ').includes('30'), 'Ordenar por menor preço coloca R$ 30 primeiro', firstPrice)
  await page.selectOption('.sort__select', 'recomendados')
  await shot(page, 'desktop-servicos')

  // Agendar a partir do catálogo
  await page.waitForTimeout(500)
  await page.locator('.service', { hasText: 'Degradê de precisão' }).locator('.service__cta').click()
  await page.waitForTimeout(900)
  check(await dialog(page).isVisible(), 'CTA do serviço abre o agendamento')
  check((await currentStep(page)) === 'Profissional', 'Serviço já vem selecionado (abre na etapa Profissional)')
  check((await page.locator('.booking__aside').textContent()).includes('Degradê de precisão'), 'Resumo lateral mostra o serviço escolhido')
  await page.keyboard.press('Escape')
  await page.waitForTimeout(700)
  check(!(await dialog(page).isVisible()), 'Escape fecha o agendamento')

  // Galeria + lightbox
  await page.evaluate(() => document.getElementById('galeria').scrollIntoView())
  await page.waitForTimeout(1200)
  await page.locator('.mosaic__btn').first().click()
  await page.waitForTimeout(700)
  const lb = page.locator('.lightbox')
  check(await lb.isVisible(), 'Clique na foto abre o lightbox')
  check((await lb.locator('.lightbox__count span').textContent()) === '01', 'Lightbox começa na foto clicada')
  await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(700)
  check((await lb.locator('.lightbox__count span').textContent()) === '02', 'Seta → avança no lightbox')
  await page.keyboard.press('ArrowLeft')
  await page.keyboard.press('ArrowLeft')
  await page.waitForTimeout(700)
  check((await lb.locator('.lightbox__count span').textContent()) === '09', 'Seta ← volta (com loop)')
  // arraste (toque)
  const box = await lb.locator('.lightbox__figure').boundingBox()
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width / 2 - 200, box.y + box.height / 2, { steps: 8 })
  await page.mouse.up()
  await page.waitForTimeout(800)
  check((await lb.locator('.lightbox__count span').textContent()) === '01', 'Arrastar para o lado troca a foto')
  await shot(page, 'desktop-lightbox')
  await page.keyboard.press('Escape')
  await page.waitForTimeout(600)
  check(!(await lb.isVisible()), 'Escape fecha o lightbox')
  check((await page.evaluate(() => document.activeElement?.className)).includes('mosaic__btn'), 'Foco volta à foto após fechar')

  // "Agendar este estilo" no lightbox
  await page.locator('.mosaic__btn').nth(1).click()
  await page.waitForTimeout(600)
  await page.locator('.lightbox .btn--primary').click()
  await page.waitForTimeout(900)
  check((await page.locator('.booking__aside').textContent()).includes('Degradê de precisão'), 'Lightbox "Agendar este estilo" preenche o serviço')
  await page.keyboard.press('Escape')
  await page.waitForTimeout(600)

  // Profissionais
  await page.evaluate(() => document.getElementById('equipe').scrollIntoView())
  await page.waitForTimeout(1000)
  await page.locator('.barber__cta', { hasText: 'Thiago' }).click()
  await page.waitForTimeout(900)
  check((await page.locator('.booking__aside').textContent()).includes('Thiago Brandão'), 'Selecionar profissional atualiza o agendamento')
  await page.keyboard.press('Escape')
  await page.waitForTimeout(600)
  check(await page.locator('.barber.is-selected').count(), 'Card do profissional fica marcado como selecionado')

  // Planos
  await page.evaluate(() => document.getElementById('planos').scrollIntoView())
  await page.waitForTimeout(1000)
  await page.locator('.plan__cta', { hasText: 'Signature' }).click()
  await page.waitForTimeout(800)
  const pd = page.locator('.plan-dialog')
  check(await pd.isVisible(), 'Plano abre resumo demonstrativo')
  check((await pd.textContent()).includes('Você economiza'), 'Resumo do plano mostra economia')
  check((await pd.locator('a[href*="wa.me"]').count()) === 0, 'Sem número configurado, não há link de WhatsApp')
  check((await pd.textContent()).includes('nenhuma assinatura é criada'), 'Resumo deixa claro que nada é contratado')
  await shot(page, 'desktop-plano')
  await page.keyboard.press('Escape')
  await page.waitForTimeout(600)
  check(!(await pd.isVisible()), 'Escape fecha o resumo do plano')

  /* ---------- Agendamento completo ---------- */
  await page.evaluate(() => sessionStorage.clear())
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  await page.locator('.hero .btn--primary').click()
  await page.waitForTimeout(900)
  check((await currentStep(page)) === 'Serviço', 'Etapa 01 — Serviço')
  // Continuar sem escolher não avança
  await page.locator('.booking__foot .btn--primary').click({ force: true })
  await page.waitForTimeout(300)
  check((await currentStep(page)) === 'Serviço', 'Não avança sem escolher serviço')
  await shot(page, 'booking-1-servico')
  await page.locator('.choice', { hasText: 'Corte + barba' }).click()
  await page.waitForTimeout(900)
  check((await currentStep(page)) === 'Profissional', 'Escolher serviço avança para Profissional')
  check((await page.locator('.booking__aside').textContent()).includes('1h30'), 'Duração exibida no resumo')

  await page.locator('.barber-choice', { hasText: 'Sem preferência' }).click()
  await page.waitForTimeout(900)
  check((await currentStep(page)) === 'Data', 'Etapa 03 — Data')
  await shot(page, 'booking-3-data')
  const pastDisabled = await page.locator('.day--past').evaluateAll((els) => els.every((e) => e.disabled))
  check(pastDisabled, 'Datas passadas bloqueadas')
  check((await page.locator('.day--closed').count()) > 0, 'Domingos aparecem como fechados')
  // Clicar em dia fechado não seleciona
  const closed = page.locator('.day--closed').first()
  if (await closed.isEnabled()) await closed.click()
  check(!(await page.locator('.day.is-selected').count()), 'Dia fechado não pode ser selecionado')
  let openDay = page.locator('.day--open').first()
  if (!(await openDay.count())) {
    await page.locator('[aria-label="Próximo mês"]').click()
    openDay = page.locator('.day--open').first()
  }
  const dayLabel = await openDay.getAttribute('aria-label')
  await openDay.click()
  await page.waitForTimeout(900)
  check((await currentStep(page)) === 'Horário', 'Escolher dia avança para Horário', dayLabel)

  await page.waitForTimeout(700)
  check((await page.locator('.slot:disabled').count()) > 0, 'Horários ocupados aparecem indisponíveis')
  const firstFree = page.locator('.slot:not(:disabled)').first()
  const time1 = (await firstFree.textContent()).trim()
  await firstFree.click()
  check(await page.locator('.slot.is-selected').count(), 'Horário livre selecionado', time1)
  check((await page.locator('.slot-groups__assigned').textContent()).includes('atendido por'), '"Sem preferência" indica o profissional do horário')
  await shot(page, 'booking-4-horario')
  // Determinismo: mesma data/profissional → mesma grade
  const grid1 = await page.locator('.slot').evaluateAll((els) => els.map((e) => e.disabled ? 0 : 1).join(''))
  await page.locator('.booking__foot .btn--primary').click({ force: true })
  await page.waitForTimeout(700)
  check((await currentStep(page)) === 'Seus dados', 'Etapa 05 — Seus dados')

  // Voltar e conferir que a escolha foi preservada
  await page.locator('.booking__foot .btn--ghost').click()
  await page.waitForTimeout(1300)
  check((await currentStep(page)) === 'Horário', 'Botão Voltar retorna à etapa anterior')
  check(((await page.locator('.slot.is-selected').textContent()) ?? '').trim() === time1, 'Escolha anterior preservada ao voltar')
  const grid2 = await page.locator('.slot').evaluateAll((els) => els.map((e) => e.disabled ? 0 : 1).join(''))
  check(grid1 === grid2, 'Agenda fictícia é determinística')
  await page.locator('.booking__foot .btn--primary').click({ force: true })
  await page.waitForTimeout(700)

  // Validação
  await page.locator('.booking__foot .btn--primary').click({ force: true })
  await page.waitForTimeout(400)
  check((await page.locator('.form .field-error').count()) === 2, 'Campos vazios mostram dois erros')
  check((await page.locator('.field__input[aria-invalid="true"]').count()) === 2, 'Campos inválidos marcados com aria-invalid')
  check((await page.evaluate(() => document.activeElement?.getAttribute('autocomplete'))) === 'name', 'Foco vai para o primeiro campo inválido')
  await page.locator('input[autocomplete="name"]').fill('Lu')
  await page.locator('input[type="tel"]').fill('119')
  await page.locator('input[type="tel"]').blur()
  await page.waitForTimeout(200)
  check((await page.locator('.form').textContent()).includes('incompleto'), 'Telefone incompleto é rejeitado')
  await page.locator('input[autocomplete="name"]').fill('Lucas Andrade')
  await page.locator('input[type="tel"]').fill('11987654321')
  check((await page.locator('input[type="tel"]').inputValue()) === '(11) 98765-4321', 'Máscara de telefone aplicada')
  await shot(page, 'booking-5-dados')
  await page.locator('.booking__foot .btn--primary').click({ force: true })
  await page.waitForTimeout(800)
  check((await currentStep(page)) === 'Revisão', 'Etapa 06 — Revisão')
  const review = await page.locator('.review').textContent()
  check(['Corte + barba', 'R$', '1h30', time1, 'Lucas Andrade', '(11) 98765-4321', 'sem preferência'].every((t) => review.includes(t)), 'Revisão mostra serviço, profissional, data, horário, duração, valor e dados')
  await shot(page, 'booking-6-revisao')

  // Alterar etapa anterior pela revisão
  await page.locator('.review__row', { hasText: 'Data' }).locator('.summary__edit').click()
  await page.waitForTimeout(900)
  check((await currentStep(page)) === 'Data', '"Alterar" leva de volta à etapa escolhida')
  // stepper permite pular para revisão de novo
  await page.locator('.stepper__item', { hasText: 'Revisão' }).click()
  await page.waitForTimeout(800)
  check((await currentStep(page)) === 'Revisão', 'Stepper navega para etapas já concluídas')

  await page.locator('.booking__foot .btn--primary').click({ force: true })
  await page.waitForTimeout(400)
  check((await page.locator('.booking__foot .btn--primary').textContent()).includes('Processando'), 'Estado de processamento visível')
  await page.waitForTimeout(1600)
  const doneText = await page.locator('.done').textContent()
  check(doneText.includes('Simulação concluída'), 'Confirmação de simulação concluída')
  check(doneText.includes('Nenhum horário foi reservado'), 'Confirmação não afirma reserva real')
  check((await page.locator('.done a[href*="wa.me"]').count()) === 0, 'Sem WhatsApp configurado, nenhum envio é oferecido')
  await shot(page, 'booking-7-concluido')
  await page.locator('.done .btn', { hasText: 'Simular novo agendamento' }).click()
  await page.waitForTimeout(800)
  check((await currentStep(page)) === 'Serviço', 'Reinício volta à etapa 01')
  check(!(await page.locator('.choice.is-checked').count()), 'Reinício limpa as escolhas')
  await page.keyboard.press('Escape')

  check(errors.length === 0, 'Sem erros de console (desktop)', errors.join(' | '))
  await ctx.close()
}

/* ------------------------------------------------------------------ */
/* 2. Mobile                                                           */
/* ------------------------------------------------------------------ */
{
  const { page, ctx, errors } = await newPage({ width: 390, height: 844 }, { isMobile: true, hasTouch: true })
  await shot(page, 'mobile-hero')
  check(await page.locator('.nav__burger').isVisible(), 'Menu mobile visível em 390px')
  await page.locator('.nav__burger').click()
  await page.waitForTimeout(800)
  const menu = page.locator('#mobile-menu')
  check(await menu.isVisible(), 'Menu mobile abre')
  check((await page.evaluate(() => document.getElementById('root').hasAttribute('inert'))), 'Fundo fica inerte com o menu aberto')
  await shot(page, 'mobile-menu')
  await page.keyboard.press('Escape')
  await page.waitForTimeout(800)
  check(!(await menu.isVisible()), 'Escape fecha o menu mobile')
  check((await page.evaluate(() => document.activeElement?.className)) === 'nav__burger', 'Foco volta ao botão do menu')
  await page.locator('.nav__burger').click()
  await page.waitForTimeout(800)
  await page.locator('.menu__link', { hasText: 'Galeria' }).click()
  await page.waitForTimeout(1800)
  const gTop = await page.evaluate(() => document.getElementById('galeria').getBoundingClientRect().top)
  check(!(await menu.isVisible()) && Math.abs(gTop) < 140, 'Link do menu fecha e navega até a seção', `top=${gTop}`)

  // Agendamento em tela cheia no celular
  await page.locator('.nav__cta').click()
  await page.waitForTimeout(900)
  const bb = await dialog(page).boundingBox()
  check(bb && bb.x >= 0 && bb.y >= 0 && bb.width <= 390 && bb.height <= 844, 'Agendamento cabe na viewport mobile', JSON.stringify(bb))
  check(await page.locator('.stepper__mobile').isVisible(), 'Stepper compacto no mobile')
  await page.locator('.choice', { hasText: 'Corte Assinatura' }).click()
  await page.waitForTimeout(900)
  await page.locator('.barber-choice', { hasText: 'Rafael' }).click()
  await page.waitForTimeout(900)
  await shot(page, 'mobile-booking-data')
  const dayBox = await page.locator('.day').first().boundingBox()
  check(dayBox.width >= 40 && dayBox.height >= 40, 'Dias do calendário com área de toque adequada', `${Math.round(dayBox.width)}px`)
  await page.locator('.day--open, .day--few').first().click()
  await page.waitForTimeout(1500)
  await shot(page, 'mobile-booking-horario')
  const slotBox = await page.locator('.slot').first().boundingBox()
  check(slotBox.height >= 44, 'Horários com altura mínima de toque', `${slotBox.height}px`)
  await page.keyboard.press('Escape')
  check(errors.length === 0, 'Sem erros de console (mobile)', errors.join(' | '))
  await ctx.close()
}

/* ------------------------------------------------------------------ */
/* 3. Overflow horizontal em várias larguras                           */
/* ------------------------------------------------------------------ */
for (const [w, h] of [[320, 640], [375, 667], [568, 320], [768, 1024], [1024, 768], [1280, 800], [1920, 1080]]) {
  const { page, ctx } = await newPage({ width: w, height: h })
  const sw = await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 30))
    }
    return document.documentElement.scrollWidth
  })
  check(sw <= w, `Sem overflow horizontal em ${w}px`, `scrollWidth=${sw}`)
  if (w === 320 || w === 568) {
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.locator('.nav__cta').click()
    await page.waitForTimeout(900)
    const bb = await dialog(page).boundingBox()
    check(bb && bb.width <= w && bb.height <= h + 1, `Agendamento dentro da viewport em ${w}×${h}`, JSON.stringify(bb))
    await shot(page, `booking-${w}`)
  }
  await ctx.close()
}

/* ------------------------------------------------------------------ */
/* 4. Movimento reduzido                                               */
/* ------------------------------------------------------------------ */
{
  const { page, ctx } = await newPage({ width: 1280, height: 800 }, { reducedMotion: 'reduce' })
  const t = await page.evaluate(() => getComputedStyle(document.querySelector('.hero__title .mask-line__inner')).transform)
  check(t === 'none' || t === 'matrix(1, 0, 0, 1, 0, 0)', 'Com movimento reduzido o título aparece sem animação', t)
  const visible = await page.evaluate(() => {
    document.getElementById('servicos').scrollIntoView()
    return getComputedStyle(document.querySelector('#servicos .section-index').parentElement).opacity
  })
  check(visible === '1', 'Conteúdo visível sem esperar animações de scroll', visible)
  await ctx.close()
}

await browser.close()

const failed = results.filter((r) => !r.ok)
for (const r of results) console.log(`${r.ok ? '✓' : '✗'} ${r.name}${!r.ok && r.info ? `  → ${r.info}` : ''}`)
console.log(`\n${results.length - failed.length}/${results.length} verificações passaram`)
process.exit(failed.length ? 1 : 0)
