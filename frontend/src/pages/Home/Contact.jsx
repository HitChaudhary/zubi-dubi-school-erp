import React, { useState } from 'react';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="fade-in">
      <section className="hero-bg pt-32 pb-16 px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="section-badge mb-5" style={{ background: 'rgba(195,192,255,0.15)', color: '#c3c0ff' }}>Get in Touch</div>
          <h1 className="font-headline font-extrabold text-white text-3xl md:text-5xl mb-5">We'd love to hear<br/><span style={{ background: 'linear-gradient(135deg,#c3c0ff,#89ceff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>from your school</span></h1>
        </div>
      </section>

      <section className="py-20 px-6 bg-[#f8f9ff]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="font-headline font-bold text-2xl mb-2">Contact Information</h2>
            <p className="text-on-surface-variant text-sm mb-8">Our processing teams answer active client records sequentially within operational standard offsets.</p>
            
            <div className="space-y-4">
              <div className="card p-5 flex items-center gap-4">
                <div className="feature-icon-wrap bg-[#e2dfff]"><span className="material-symbols-outlined text-[#3525cd]">mail</span></div>
                <div><p className="text-xs font-bold uppercase text-on-surface-variant">Email Context</p><p className="text-sm font-bold">hello@zubidubi.in</p></div>
              </div>
            </div>
          </div>

          <div>
            <div className="card p-8">
              <h3 className="font-headline font-bold text-xl mb-6">Send us a reactive request</h3>
              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="form-label">School / Organisation Name</label>
                    <input type="text" placeholder="Sunrise Public School" className="form-input w-full" required />
                  </div>
                  <div>
                    <label className="form-label">Message Details</label>
                    <textarea placeholder="State institutional scale parameter profiles..." className="form-input w-full h-24 p-3" required></textarea>
                  </div>
                  <button type="submit" className="btn-primary w-full justify-center">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>send</span> Send Message
                  </button>
                </form>
              ) : (
                <div className="bg-emerald-50 text-emerald-900 rounded-xl p-6 text-center">
                  <span className="material-symbols-outlined text-4xl mb-2">check_circle</span>
                  <p className="font-bold">Dispatch Operations Finalized!</p>
                  <p className="text-sm">An assignment engineer will evaluate transmission files shortly.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}