import SectionBadge      from '../../components/common/SectionBadge';
import MissionSection     from '../../components/about/MissionSection';
import TeamSection        from '../../components/about/TeamSection';
import AboutStatsSection  from '../../components/about/AboutStatsSection';
import Footer             from '../../components/common/Footer';

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section
        className="hero-bg pt-32 pb-20 px-6 relative overflow-hidden"
      >
        <div className="blob" style={{ top: '-10%', right: '-5%', width: 500, height: 500, background: 'rgba(53,37,205,0.15)' }} />
        <div className="max-w-5xl mx-auto text-center relative animate-fade-up">
          <div className="mb-5">
            <SectionBadge light>Our Story</SectionBadge>
          </div>
          <h1
            className="font-headline font-extrabold text-white mb-6"
            style={{ fontSize: 'clamp(2rem,5vw,3rem)' }}
          >
            Built for Schools,<br />
            <span style={{ background: 'linear-gradient(135deg,#c3c0ff,#89ceff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              By Educators
            </span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1.05rem', lineHeight: 1.85, maxWidth: 600, margin: '0 auto' }}>
            Zubi Dubi was born from a simple frustration — school management software was
            either too complex, too expensive, or built for someone else's country.
            We set out to fix that.
          </p>
        </div>
      </section>

      <MissionSection />
      <TeamSection />
      <AboutStatsSection />
      <Footer />
    </>
  );
}
