import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="fade-in">
      {/* HERO SECTION */}
      <section className="hero-bg min-h-screen flex items-center pt-20 relative overflow-hidden">
        <div className="blob absolute" style={{ top: '-10%', right: '-5%', width: '600px', height: '600px', background: 'rgba(53,37,205,0.2)' }}></div>
        <div className="blob absolute" style={{ bottom: '-10%', left: '-5%', width: '500px', height: '500px', background: 'rgba(57,184,253,0.15)' }}></div>
        <div className="max-w-7xl mx-auto px-6 py-20 w-full">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 min-w-0">
              <div className="section-badge mb-6" style={{ background: 'rgba(195,192,255,0.15)', color: '#c3c0ff' }}>✨ Smart School ERP & Online Learning Platform</div>
              <h1 className="font-headline font-extrabold leading-tight mb-6 text-white text-4xl md:text-6xl">
                Manage Your Entire<br/>
                <span style={{ background: 'linear-gradient(135deg,#c3c0ff,#89ceff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>School with Zubi Dubi</span>
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1.05rem', lineHeight: '1.8' }} className="max-w-[500px] mb-10">
                One platform for Students, Teachers, Administrators, Online Classes, Attendance, Assignments, and full Academic Management — all in one place.
              </p>
              <div className="flex flex-wrap gap-4 mb-10">
                <Link to="/login" className="btn-primary" style={{ boxShadow: '0 8px 32px rgba(53,37,205,0.45)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>rocket_launch</span> Start Free Trial
                </Link>
                <Link to="/contact" className="btn-outline" style={{ color: '#c3c0ff', borderColor: 'rgba(195,192,255,0.5)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>calendar_month</span> Request Demo
                </Link>
              </div>
            </div>

            {/* Dashboard Mockup Component */}
            <div className="float-anim w-full max-w-[420px]">
              <div style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '20px', padding: '24px', backdropFilter: 'blur(20px)' }} className="relative">
                <div className="flex justify-between items-center mb-5">
                  <span className="font-headline font-bold text-white text-sm">📊 School Dashboard</span>
                  <span className="tag" style={{ background: '#006e4b', color: '#67f4b7' }}>
                    <span className="pulse-dot inline-block w-1.5 h-1.5 rounded-full mr-1" style={{ background: '#67f4b7' }}></span>LIVE
                  </span>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      <span>Active Students</span><span className="font-bold text-white">2,840</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }} className="overflow-hidden">
                      <div style={{ height: '100%', width: '84%', background: '#c3c0ff', borderRadius: '10px' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      <span>Attendance Rate</span><span className="font-bold text-white">94.2%</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }} className="overflow-hidden">
                      <div style={{ height: '100%', width: '94%', background: '#fbbf24', borderRadius: '10px' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-24 px-6 bg-[#f8f9ff]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="section-badge mb-4">Everything You Need</div>
            <h2 className="font-headline font-extrabold text-3xl md:text-4xl text-on-surface mb-4">Powerful Features for <span style={{ color: '#3525cd' }}>Modern Schools</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6">
              <div className="feature-icon-wrap mb-4 bg-[#e2dfff]">
                <span className="material-symbols-outlined text-[#3525cd]">school</span>
              </div>
              <h3 className="font-headline font-bold text-lg mb-2">Academic Management</h3>
              <p className="text-on-surface-variant text-sm mb-4">Manage students, teachers, classes, sections and subjects from a single layout context.</p>
            </div>
            <div className="card p-6">
              <div className="feature-icon-wrap mb-4 bg-[#c9e6ff]">
                <span className="material-symbols-outlined text-[#006591]">video_call</span>
              </div>
              <h3 className="font-headline font-bold text-lg mb-2">Learning Management</h3>
              <p className="text-on-surface-variant text-sm mb-4">Conduct live classes, post interactive assignments, and process analytical grade metrics.</p>
            </div>
            <div className="card p-6">
              <div className="feature-icon-wrap mb-4 bg-emerald-50">
                <span className="material-symbols-outlined text-emerald-800">analytics</span>
              </div>
              <h3 className="font-headline font-bold text-lg mb-2">Administration Control</h3>
              <p className="text-on-surface-variant text-sm mb-4">Streamline operations with cloud logs, dynamic notifications, and direct messaging components.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}