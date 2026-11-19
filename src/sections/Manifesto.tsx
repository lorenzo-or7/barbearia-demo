import { Img } from '../components/Img'
import { MaskText, Parallax, Reveal, RevealImage } from '../components/motion'
import { manifesto } from '../data/content'

export function Manifesto() {
  return (
    <section id="manifesto" className="manifesto section" aria-labelledby="manifesto-title" tabIndex={-1}>
      <div className="container manifesto__grid">
        <div className="manifesto__head">
          <Reveal>
            <p className="section-index">{manifesto.index}</p>
          </Reveal>
          <MaskText
            id="manifesto-title"
            className="manifesto__title"
            lines={[manifesto.titleTop, <em key="r">{manifesto.titleBottom}</em>]}
          />
        </div>

        <div className="manifesto__media">
          <RevealImage className="manifesto__main">
            <Parallax distance={40}>
              <Img name="ritual-beard" sizes="(max-width: 767px) 92vw, 34vw" className="cover" />
            </Parallax>
          </RevealImage>
          <RevealImage className="manifesto__aside" from="right" delay={0.25}>
            <Img name="ritual-shave" sizes="(max-width: 767px) 60vw, 22vw" className="cover" />
          </RevealImage>
        </div>

        <div className="manifesto__body">
          {manifesto.paragraphs.map((p, i) => (
            <Reveal key={i} delay={0.1 + i * 0.1}>
              <p className={i === 0 ? 'manifesto__lead' : 'manifesto__text'}>{p}</p>
            </Reveal>
          ))}
          <dl className="manifesto__facts">
            {manifesto.facts.map((f, i) => (
              <Reveal key={f.label} className="manifesto__fact" delay={0.2 + i * 0.08}>
                <dt>{f.label}</dt>
                <dd>{f.value}</dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
