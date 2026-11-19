import { Logo, Or7Signature } from '../components/ui'
import { site } from '../config/site'
import { nav } from '../data/content'

/** Agrupa dias consecutivos com o mesmo horário (ex.: "Ter–Qua 09:00–20:00"). */
function summarizeHours() {
  const groups: { from: string; to: string; time: string }[] = []
  for (const h of site.hours) {
    const time = h.open ? `${h.open}–${h.close}` : 'Fechado'
    const short = h.label.slice(0, 3)
    const last = groups[groups.length - 1]
    if (last && last.time === time) last.to = short
    else groups.push({ from: short, to: short, time })
  }
  return groups.map((g) => ({ days: g.from === g.to ? g.from : `${g.from}–${g.to}`, time: g.time }))
}

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="footer" aria-labelledby="footer-title">
      <div className="container">
        <h2 id="footer-title" className="sr-only">
          Rodapé
        </h2>
        <div className="footer__top">
          <div className="footer__brand">
            <Logo className="logo--lg" />
            <p className="footer__slogan">{site.brand.slogan}</p>
          </div>

          <nav className="footer__col" aria-label="Rodapé">
            <p className="footer__label">Navegação</p>
            <ul>
              {nav.map((n) => (
                <li key={n.id}>
                  <a href={`#${n.id}`}>{n.label}</a>
                </li>
              ))}
              <li>
                <a href="#topo">Voltar ao topo</a>
              </li>
            </ul>
          </nav>

          <div className="footer__col">
            <p className="footer__label">Visite</p>
            <address>
              {site.address.lines.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </address>
            <ul className="footer__hours">
              {summarizeHours().map((h) => (
                <li key={h.days}>
                  <span>{h.days}</span> {h.time}
                </li>
              ))}
            </ul>
          </div>

          <div className="footer__col">
            <p className="footer__label">Redes</p>
            <ul>
              {site.socials.map((s) => (
                <li key={s.label}>
                  {s.href ? (
                    <a href={s.href} target="_blank" rel="noopener noreferrer">
                      {s.label} · {s.handle}
                    </a>
                  ) : (
                    <span>
                      {s.label} · {s.handle}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {site.demoMode && (
          <p className="footer__demo">
            <strong>Protótipo demonstrativo.</strong> {site.brand.name} é uma marca fictícia criada pela Or7.dev para apresentação comercial.
            Serviços, preços, equipe, endereço e agenda são ilustrativos. Nenhum agendamento ou pagamento é processado. Fotografias: Unsplash.
          </p>
        )}

        <div className="footer__bottom">
          <p>
            © {year} {site.brand.name} {site.brand.descriptor} · demonstração
          </p>
          <Or7Signature />
        </div>
      </div>
      <p className="footer__mark" aria-hidden="true">
        {site.brand.name}
      </p>
    </footer>
  )
}
