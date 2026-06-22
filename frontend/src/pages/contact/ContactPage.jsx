import { useRef } from 'react';
import SectionBadge     from '../../components/common/SectionBadge';
import ContactInfoCards from '../../components/contact/ContactInfoCards';
import ContactForm      from '../../components/contact/ContactForm';
import Footer           from '../../components/common/Footer';

export default function ContactPage() {
  const formRef = useRef(null);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* Hero */}
      <section className="hero-bg pt-32 pb-16 px-6 relative overflow-hidden">
        <div className="blob" style={{ bottom: '-20%', left: '-5%', width: 500, height: 500, background: 'rgba(57,184,253,0.12)' }} />
        <div className="max-w-4xl mx-auto text-center relative animate-fade-up">
          <div className="mb-5">
            <SectionBadge light>Get in Touch</SectionBadge>
          </div>
          <h1
            className="font-headline font-extrabold text-white mb-5"
            style={{ fontSize: 'clamp(2rem,5vw,3rem)' }}
          >
            We'd love to hear<br />
            <span style={{ background: 'linear-gradient(135deg,#c3c0ff,#89ceff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              from your school
            </span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', lineHeight: 1.8 }}>
            Whether you want a demo, have a question, or are ready to subscribe — we're just a message away.
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="py-20 px-6" style={{ background: '#f8f9ff' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <ContactInfoCards onBookDemo={scrollToForm} />
            <ContactForm formRef={formRef} />
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
