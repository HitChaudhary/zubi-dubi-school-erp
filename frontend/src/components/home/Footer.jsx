import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ background: '#0b1c30', padding: '3rem 1.5rem 2rem' }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg,#3525cd,#39b8fd)', borderRadius: '8px' }} className="flex items-center justify-center">
                <span className="material-symbols-outlined text-white" style={{ fontSize: '16px' }}>school</span>
              </div>
              <span className="font-headline font-extrabold text-lg" style={{ color: '#c3c0ff' }}>Zubi Dubi</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', lineHeight: '1.7' }}>Simplifying Education Through Technology.</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold tracking-widest text-white/30 uppercase mb-[14px]">Product</p>
            <ul className="space-y-2">
              <li><Link to="/" className="text-white/50 text-[0.88rem] hover:text-white transition-colors">Features</Link></li>
              <li><a href="#pricing" className="text-white/50 text-[0.88rem] hover:text-white transition-colors">Pricing</a></li>
              <li><span className="text-white/50 text-[0.88rem] cursor-not-allowed">Changelog</span></li>
            </ul>
          </div>
          <div>
            <p className="text-[11px] font-semibold tracking-widest text-white/30 uppercase mb-[14px]">Company</p>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-white/50 text-[0.88rem] hover:text-white transition-colors">About</Link></li>
              <li><Link to="/contact" className="text-white/50 text-[0.88rem] hover:text-white transition-colors">Contact</Link></li>
              <li><span className="text-white/50 text-[0.88rem] cursor-not-allowed">Careers</span></li>
            </ul>
          </div>
          <div>
            <p className="text-[11px] font-semibold tracking-widest text-white/30 uppercase mb-[14px]">Legal</p>
            <ul className="space-y-2">
              <li><span className="text-white/50 text-[0.88rem]">Privacy Policy</span></li>
              <li><span className="text-white/50 text-[0.88rem]">Terms of Service</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/5 pt-6 text-center">
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.82rem' }}>© 2024 Zubi Dubi — Simplifying Education Through Technology. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}