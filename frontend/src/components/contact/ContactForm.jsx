import { useState } from 'react';

const INTERESTS = [
  'Free Demo / Trial',
  'Starter Plan (₹999/mo)',
  'Growth Plan (₹2,499/mo)',
  'Unlimited Plan (₹4,999/mo)',
  'General Enquiry',
];

function InputField({ label, icon, type = 'text', placeholder, value, onChange }) {
  return (
    <div>
      <label className="form-label">{label}</label>
      <div style={{ position: 'relative' }}>
        <span
          className="material-symbols-outlined"
          style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#777587', fontSize: 18 }}
        >
          {icon}
        </span>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="form-input"
        />
      </div>
    </div>
  );
}

export default function ContactForm({ formRef }) {
  const [form, setForm]       = useState({ firstName: '', lastName: '', school: '', email: '', phone: '', interest: '', message: '' });
  const [submitted, setSubmit] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = () => {
    setSubmit(true);
    if (formRef?.current) formRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="card p-8" ref={formRef}>
      <h3 className="font-headline font-bold text-xl text-on-surface mb-6">Send us a message</h3>

      {!submitted ? (
        <div className="space-y-5">
          {/* Name row */}
          <div className="grid grid-cols-2 gap-4">
            <InputField label="First Name"  icon="person" placeholder="Arjun"  value={form.firstName} onChange={set('firstName')} />
            <InputField label="Last Name"   icon="person" placeholder="Rathod" value={form.lastName}  onChange={set('lastName')}  />
          </div>

          <InputField label="School / Organisation" icon="domain"   placeholder="Sunrise Public School"    value={form.school} onChange={set('school')} />
          <InputField label="Email Address"          icon="mail"    type="email" placeholder="principal@school.in" value={form.email}  onChange={set('email')}  />
          <InputField label="Phone / WhatsApp"       icon="phone"   type="tel"   placeholder="+91 98765 43210"     value={form.phone}  onChange={set('phone')}  />

          {/* Interest select */}
          <div>
            <label className="form-label">I'm interested in</label>
            <div style={{ position: 'relative' }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#777587', fontSize: 18 }}>category</span>
              <select
                className="form-input"
                style={{ appearance: 'none', cursor: 'pointer' }}
                value={form.interest}
                onChange={set('interest')}
              >
                <option value="">Select an option</option>
                {INTERESTS.map((opt) => <option key={opt}>{opt}</option>)}
              </select>
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="form-label">Message</label>
            <div style={{ position: 'relative' }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', left: 12, top: 14, color: '#777587', fontSize: 18 }}>chat</span>
              <textarea
                className="form-input"
                placeholder="Tell us about your school and what you're looking for..."
                style={{ paddingTop: 12, height: 110, resize: 'vertical' }}
                value={form.message}
                onChange={set('message')}
              />
            </div>
          </div>

          <button onClick={handleSubmit} className="btn-primary w-full justify-center" style={{ padding: '14px 24px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>send</span>
            Send Message
          </button>
        </div>
      ) : (
        <div
          style={{
            background: '#e1f5ee', borderRadius: 12,
            padding: 28, textAlign: 'center',
          }}
        >
          <span className="material-symbols-outlined" style={{ color: '#005338', fontSize: 40 }}>check_circle</span>
          <p className="font-headline font-bold text-on-surface mt-3 text-lg">Message Sent!</p>
          <p className="text-sm text-on-surface-variant mt-1" style={{ lineHeight: 1.7 }}>
            We'll get back to you within 2 hours on WhatsApp or email.
          </p>
          <button
            onClick={() => setSubmit(false)}
            className="btn-outline mt-5"
            style={{ padding: '8px 24px', fontSize: 13 }}
          >
            Send Another
          </button>
        </div>
      )}
    </div>
  );
}
