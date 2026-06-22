# Zubi Dubi — Smart School ERP

React + Vite + Tailwind CSS project.

## 🚀 Get Started

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev
```

Then open → http://localhost:5173

## 📦 Build for Production

```bash
npm run build
npm run preview
```

## 🗂 Project Structure

```
src/
├── main.jsx                        # Vite entry point
├── App.jsx                         # Router setup
├── styles/index.css                # Global styles + Tailwind
├── components/
│   ├── common/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   └── SectionBadge.jsx
│   ├── home/
│   │   ├── HeroSection.jsx
│   │   ├── FeaturesSection.jsx
│   │   ├── UserRolesSection.jsx
│   │   ├── StatsSection.jsx
│   │   ├── PricingSection.jsx
│   │   └── CTASection.jsx
│   ├── about/
│   │   ├── MissionSection.jsx
│   │   ├── TeamSection.jsx
│   │   └── AboutStatsSection.jsx
│   ├── contact/
│   │   ├── ContactInfoCards.jsx
│   │   └── ContactForm.jsx
│   └── login/
│       ├── LoginLeftPanel.jsx
│       └── RoleSelector.jsx
└── pages/
    ├── home/HomePage.jsx
    ├── about/AboutPage.jsx
    ├── contact/ContactPage.jsx
    └── login/LoginPage.jsx
```

## 🛠 Tech Stack

- React 18
- Vite 5
- Tailwind CSS 3
- React Router DOM 6
