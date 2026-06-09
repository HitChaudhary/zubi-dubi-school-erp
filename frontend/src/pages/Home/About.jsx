import React from 'react';

export default function About() {
  return (
    <div className="fade-in">
      <section className="hero-bg pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="blob absolute" style={{ top: '-10%', right: '-5%', width: '500px', height: '500px', background: 'rgba(53,37,205,0.15)' }}></div>
        <div className="max-w-5xl mx-auto text-center relative">
          <div className="section-badge mb-5" style={{ background: 'rgba(195,192,255,0.15)', color: '#c3c0ff' }}>Our Story</div>
          <h1 className="font-headline font-extrabold text-white text-3xl md:text-5xl mb-6">Built for Schools,<br/><span style={{ background: 'linear-gradient(135deg,#c3c0ff,#89ceff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>By Educators</span></h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1.05rem', lineHeight: '1.85' }} className="max-w-[600px] mx-auto">
            Zubi Dubi was born from a basic vision: simplifying workflow infrastructure. We deliver modern solutions tailored perfectly for local institutional environments.
          </p>
        </div>
      </section>

      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="section-badge mb-5">Our Mission</div>
            <h2 className="font-headline font-extrabold text-3xl mb-5">Making infrastructure applications <span style={{ color: '#3525cd' }}>accessible to every institution</span></h2>
            <p className="text-on-surface-variant leading-relaxed">
              We design mobile-first dashboards that thrive natively on unstable networking ecosystems. Our direct channel metrics bridge structural updates straight to student panels effortlessly.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div className="card p-6 flex gap-4 items-start">
              <div className="feature-icon-wrap bg-[#e2dfff]"><span className="material-symbols-outlined text-[#3525cd]">visibility</span></div>
              <div>
                <h4 className="font-headline font-bold text-md mb-1">Our Core Vision</h4>
                <p className="text-sm text-on-surface-variant">Accelerating growth paradigms across regional spaces reliably.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}