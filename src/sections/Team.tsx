import { ArrowRight } from 'lucide-react'
import { Img } from '../components/Img'
import { MaskText, Reveal, RevealImage } from '../components/motion'
import { Button } from '../components/ui'
import { getService } from '../data/services'
import { ANY_BARBER, team } from '../data/team'
import { useBooking } from '../features/booking/BookingContext'

const weekday = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']

export function Team() {
  const { open, draft } = useBooking()

  return (
    <section id="equipe" className="team section" aria-labelledby="team-title" tabIndex={-1}>
      <div className="container">
        <header className="section-head">
          <div>
            <Reveal>
              <p className="section-index">Nº 04 — Profissionais</p>
            </Reveal>
            <MaskText id="team-title" className="section-title" lines={['Quem assina', <em key="e">o seu corte.</em>]} />
          </div>
          <Reveal className="section-head__aside" delay={0.15}>
            <p>Escolha com quem quer cortar. O agendamento abre com o profissional selecionado e mostra só os horários dele.</p>
          </Reveal>
        </header>

        <ul className="team__list">
          {team.map((b, i) => {
            const selected = draft.barberId === b.id
            return (
              <li key={b.id} className={`barber ${selected ? 'is-selected' : ''}`} style={{ ['--i' as string]: i }}>
                <RevealImage className="barber__photo" delay={i * 0.12}>
                  <Img name={b.image} sizes="(max-width: 699px) 82vw, (max-width: 1023px) 45vw, 30vw" className="cover" />
                </RevealImage>
                <Reveal className="barber__body" delay={0.15 + i * 0.1}>
                  <p className="barber__index">0{i + 1}</p>
                  <h3 className="barber__name">{b.name}</h3>
                  <p className="barber__role">{b.role}</p>
                  <p className="barber__bio">{b.bio}</p>
                  <p className="barber__since">
                    {b.since} · folga às {weekday[b.daysOff[0]]}s
                  </p>
                  <ul className="barber__tags" aria-label={`Serviços de referência de ${b.name.split(' ')[0]}`}>
                    {b.signatureServices.map((id) => (
                      <li key={id}>{getService(id)?.name}</li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    className="barber__cta"
                    aria-pressed={selected}
                    onClick={() => open({ barberId: b.id })}
                  >
                    <span>{selected ? 'Selecionado · continuar agendamento' : `Agendar com ${b.name.split(' ')[0]}`}</span>
                    <ArrowRight size={16} strokeWidth={1.6} aria-hidden="true" />
                  </button>
                </Reveal>
              </li>
            )
          })}
        </ul>

        <Reveal className="team__any">
          <p>
            <span className="serif-italic">Sem preferência?</span> A agenda encontra o primeiro horário livre entre os três.
          </p>
          <Button variant="outline" arrow onClick={() => open({ barberId: ANY_BARBER })}>
            Primeiro horário livre
          </Button>
        </Reveal>
      </div>
    </section>
  )
}
