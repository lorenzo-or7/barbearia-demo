import { CalendarClock, MapPin, Navigation, Phone } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Img } from '../components/Img'
import { MaskText, Parallax, Reveal, RevealImage } from '../components/motion'
import { Button, DemoTag } from '../components/ui'
import { site, whatsappLink } from '../config/site'
import { useBooking } from '../features/booking/BookingContext'
import { timeToMinutes } from '../utils/format'

function openStatus(now: Date) {
  const today = site.hours.find((h) => h.day === now.getDay())
  const minutes = now.getHours() * 60 + now.getMinutes()
  if (today?.open && today.close) {
    const o = timeToMinutes(today.open)
    const c = timeToMinutes(today.close)
    if (minutes >= o && minutes < c) return { open: true, text: `Aberto agora · fecha às ${today.close}` }
    if (minutes < o) return { open: false, text: `Fechado agora · abre hoje às ${today.open}` }
  }
  for (let i = 1; i <= 7; i++) {
    const d = (now.getDay() + i) % 7
    const h = site.hours.find((x) => x.day === d)
    if (h?.open) return { open: false, text: `Fechado agora · abre ${i === 1 ? 'amanhã' : h.label.toLowerCase()} às ${h.open}` }
  }
  return { open: false, text: 'Fechado' }
}

export function Location() {
  const { open } = useBooking()
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(t)
  }, [])
  const status = openStatus(now)
  const todayIdx = now.getDay()
  const wa = whatsappLink(`Olá! Vim pelo site da ${site.brand.name}.`)

  return (
    <section id="contato" className="location section" aria-labelledby="location-title" tabIndex={-1}>
      <div className="container location__grid">
        <div className="location__media">
          <RevealImage className="location__photo">
            <Parallax distance={36}>
              <Img name="brick-room" sizes="(max-width: 899px) 92vw, 46vw" className="cover" />
            </Parallax>
          </RevealImage>
          {site.address.mapEmbedUrl ? (
            <iframe className="location__map" src={site.address.mapEmbedUrl} title={`Mapa — ${site.brand.name}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          ) : (
            <Reveal className="location__map location__map--placeholder" delay={0.2}>
              <MapPin size={20} strokeWidth={1.5} aria-hidden="true" />
              <p>
                <strong>Espaço reservado para o mapa.</strong> Na versão da barbearia, o mapa da unidade entra aqui com rota pelo celular.
              </p>
            </Reveal>
          )}
        </div>

        <div className="location__info">
          <Reveal>
            <p className="section-index">Nº 07 — Visite</p>
          </Reveal>
          <MaskText id="location-title" className="section-title" lines={['Endereço,', <em key="e">horários e contato.</em>]} />

          <Reveal className="location__block" delay={0.1}>
            <h3 className="location__label">Endereço</h3>
            <address className="location__address">
              {site.address.lines.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </address>
            <DemoTag>Endereço demonstrativo</DemoTag>
          </Reveal>

          <Reveal className="location__block" delay={0.15}>
            <div className="location__hours-head">
              <h3 className="location__label">Horários</h3>
              <p className={`status ${status.open ? 'is-open' : ''}`}>
                <span className="status__dot" aria-hidden="true" />
                {status.text}
              </p>
            </div>
            <table className="hours">
              <caption className="sr-only">Horário de funcionamento (ilustrativo)</caption>
              <tbody>
                {site.hours.map((h) => (
                  <tr key={h.day} className={h.day === todayIdx ? 'is-today' : ''} aria-current={h.day === todayIdx ? 'date' : undefined}>
                    <th scope="row">
                      {h.label}
                      {h.day === todayIdx && <span className="hours__today">hoje</span>}
                    </th>
                    <td>{h.open ? `${h.open} — ${h.close}` : 'Fechado'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="location__fine">Atendimento somente com horário marcado.</p>
          </Reveal>

          <Reveal className="location__actions" delay={0.2}>
            <Button arrow icon={<CalendarClock size={18} strokeWidth={1.6} aria-hidden="true" />} onClick={() => open()}>
              Agendar online
            </Button>
            {wa && (
              <a className="btn btn--outline btn--md" href={wa} target="_blank" rel="noopener noreferrer">
                <span className="btn__label">Falar no WhatsApp</span>
              </a>
            )}
            {site.contact.phoneDisplay && (
              <a className="btn btn--ghost btn--md" href={`tel:${site.contact.phoneDisplay.replace(/\D/g, '')}`}>
                <Phone size={16} strokeWidth={1.6} aria-hidden="true" />
                <span className="btn__label">{site.contact.phoneDisplay}</span>
              </a>
            )}
            {site.address.mapsUrl && (
              <a className="btn btn--ghost btn--md" href={site.address.mapsUrl} target="_blank" rel="noopener noreferrer">
                <Navigation size={16} strokeWidth={1.6} aria-hidden="true" />
                <span className="btn__label">Como chegar</span>
              </a>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  )
}
