# 🍹 Super Juice - Point of Sale System

![Super Juice Banner](https://img.shields.io/badge/Fresh-Juice-orange?style=for-the-badge)
![Built with React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?style=for-the-badge&logo=postgresql)

Modern POS system untuk **Super Juice** - Fresh juice everyday! 🌴

## 🎯 Features

### Counter/Kasir
- ⚡ Quick order input dengan UI yang intuitif
- 🧾 Print struk otomatis (thermal printer support)
- 💰 Multi payment method (Cash & QRIS)
- 📝 Custom notes untuk setiap pesanan
- 🎨 Theme tropical yang fun & fresh

### Admin Dashboard
- 📊 Real-time sales analytics
- 💹 Revenue tracking & reporting
- 📦 Product management (CRUD)
- 👥 User management
- 🐛 Debug & troubleshooting tools

## 🛠️ Tech Stack

### Frontend
- **React 18** + **Vite** - Lightning fast development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful component library
- **Recharts** - Data visualization
- **React Router** - Client-side routing
- **Zustand** - State management

### Backend
- **Node.js** + **Express** - RESTful API
- **Prisma ORM** - Type-safe database access
- **PostgreSQL** - Reliable relational database
- **JWT** - Authentication & authorization
- **node-thermal-printer** - Receipt printing

### DevOps
- **Vercel** - Frontend hosting
- **Railway/Render** - Backend & database hosting
- **GitHub Actions** - CI/CD pipeline

## 📁 Project Structure

```
jus-buah-tama-pos/
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities & helpers
│   │   ├── store/         # State management
│   │   └── styles/        # Global styles
│   ├── public/            # Static assets
│   └── package.json
│
├── server/                # Backend Express app
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   ├── services/      # Business logic
│   │   └── utils/         # Utilities
│   ├── prisma/            # Database schema
│   └── package.json
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- npm or pnpm

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/jus-buah-tama-pos.git
cd jus-buah-tama-pos
```

2. Install dependencies
```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

3. Setup environment variables
```bash
# Server (.env)
DATABASE_URL="postgresql://user:password@localhost:5432/tama_pos"
JWT_SECRET="your-secret-key"
PORT=5000

# Client (.env)
VITE_API_URL="http://localhost:5001/api"
```

4. Setup database
```bash
cd server
npx prisma migrate dev
npx prisma db seed
```

5. Run development servers
```bash
# Terminal 1 - Client
cd client
npm run dev

# Terminal 2 - Server
cd server
npm run dev
```

## 🎨 Design System

### Color Palette (from spanduk)
- **Primary Yellow**: `#FDB913` - Main accent color
- **Primary Green**: `#7A9B5E` - Secondary color
- **Primary Red**: `#E63946` - CTA & highlights
- **Background**: `#FFFBF0` - Warm white
- **Text**: `#2D3748` - Dark gray

### Typography
- **Headings**: Poppins Bold
- **Body**: Inter Regular
- **Numbers**: JetBrains Mono (for prices & totals)

## 📱 Printer Setup

### Supported Printers
- Thermal 58mm (ESC/POS compatible)
- Recommended: Zjiang ZJ-5802, Epson TM-T82, Iware IP-58

### Configuration
```javascript
// server/src/config/printer.js
{
  type: 'bluetooth', // or 'usb'
  interface: '/dev/usb/lp0',
  characterSet: 'INDONESIA',
  width: 32 // characters per line
}
```

## 🔐 Default Credentials

**Admin**
- Username: `admin`
- Password: `admin123`

**Kasir**
- Username: `kasir`
- Password: `kasir123`

⚠️ **Segera ganti password setelah deployment!**

## 📊 Database Schema

### Main Tables
- `users` - User accounts (admin, kasir)
- `categories` - Product categories
- `products` - Juice menu items
- `orders` - Customer orders
- `order_items` - Order line items
- `transactions` - Payment records

## 🚢 Deployment

### Vercel (Frontend)
```bash
cd client
vercel --prod
```

### Railway (Backend + Database)
```bash
cd server
railway up
```

## 🤝 Contributing

Ini project pribadi tapi kalo ada saran boleh banget! Open issue aja.

## 📄 License

MIT License - Feel free to use!

## 🙏 Credits

Built with ❤️ by Indra & Team Tama
- Designer: Abang Indra
- Developer: Indra
- Tester: Bini Indra 😄

---

**Super Juice** - Fresh juice everyday! 🍹🌴
