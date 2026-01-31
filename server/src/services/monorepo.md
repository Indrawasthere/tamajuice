README #1 — MONOREPO TEMPLATE (ROOT)
Judul
# Monorepo Template — React + Node + Express

Deskripsi
Monorepo ini digunakan sebagai template standar untuk seluruh project personal maupun profesional.
Tujuan utama:
- Konsistensi struktur
- Development lebih cepat
- Mudah scale
- Mudah onboard (bahkan buat diri sendiri di masa depan)

Struktur Folder Standar
monorepo/
├── apps/
│   ├── web/              # Frontend (React / Vite / Next)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── hooks/
│   │   │   ├── lib/
│   │   │   ├── store/
│   │   │   └── styles/
│   │   ├── public/
│   │   └── package.json
│   │
│   └── api/              # Backend (Node / Express)
│       ├── src/
│       │   ├── controllers/
│       │   ├── routes/
│       │   ├── services/
│       │   ├── middleware/
│       │   ├── utils/
│       │   └── index.ts
│       ├── prisma/
│       └── package.json
│
├── packages/
│   ├── ui/               # Shared UI components
│   ├── config/           # ESLint, TSConfig, Prettier
│   └── utils/            # Shared helpers
│
├── scripts/              # Automation scripts
├── .editorconfig
├── .gitignore
├── package.json
└── README.md


Repo Type
Jenis Repo: MONOREPO
Style: Apps + Packages


Dipakai oleh:

Google

Meta

Vercel

Shopify

Bukan gaya-gayaan. Emang efisien.

Tooling Wajib
- Node.js >= 18
- pnpm (wajib, bukan opsional)
- TypeScript
- ESLint
- Prettier
- TurboRepo (opsional tapi cakep)

Install & Run
pnpm install
pnpm dev

Rules Global
- Semua app HARUS di /apps
- Semua shared code HARUS di /packages
- Tidak ada logic bisnis di component UI
- Tidak ada config random di root app

Automation Cheatsheet
Init Project Cepat
pnpm create vite apps/web --template react-ts
pnpm init -y

Add Dependency ke App Tertentu
pnpm add axios --filter web
pnpm add express --filter api

Lint Semua
pnpm lint

Deployment Strategy
Frontend  : Vercel
Backend   : Render / Railway / Fly.io
Database  : Supabase / Neon / PlanetScale

Philosophy
Template ini dibuat supaya:
- Tidak mikir struktur lagi
- Fokus ke logic & product
- Tidak capek setup berulang
