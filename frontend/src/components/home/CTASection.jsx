import { useNavigate } from 'react-router-dom';

export default function CTASection() {
  const navigate = useNavigate();

  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-3xl mx-auto">
        <div
          style={{
            background: 'linear-gradient(135deg,#3525cd,#006591)',
            borderRadius: 24,
            padding: '4rem 3rem',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 24px 80px rgba(53,37,205,0.3)',
          }}
        >
          {/* Decorative circles */}
          <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: -40, left: -20, width: 200, height: 200, background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }} />

          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🚀</div>
            <h2 className="font-headline font-extrabold text-2xl md:text-3xl text-white mb-4">
              Ready to Transform Your School?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, marginBottom: '2rem' }}>
              Start your free 30-day trial. No credit card required.<br />
              Set up your school in under 10 minutes.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => navigate('/login')}
                style={{
                  background: '#fff', color: '#3525cd', border: 'none',
                  borderRadius: 9999, padding: '14px 36px',
                  fontWeight: 800, cursor: 'pointer',
                  fontFamily: "'Plus Jakarta Sans',sans-serif",
                  boxShadow: '0 6px 24px rgba(0,0,0,0.15)',
                }}
              >
                Start Free Trial →
              </button>
              <button
                onClick={() => navigate('/contact')}
                style={{
                  background: 'transparent', color: '#fff',
                  border: '2px solid rgba(255,255,255,0.4)',
                  borderRadius: 9999, padding: '12px 32px',
                  fontWeight: 700, cursor: 'pointer',
                  fontFamily: "'Plus Jakarta Sans',sans-serif",
                }}
              >
                Request Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
