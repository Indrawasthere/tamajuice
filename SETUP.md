# 🚀 SETUP INSTRUCTIONS - JUS BUAH TAMA POS

## Prerequisites Yang Lo Butuhin Bre:
- Node.js 18+ (check: `node --version`)
- PostgreSQL 15+ (install via Homebrew di Mac)
- npm atau pnpm

## Step 1: Install PostgreSQL (kalo belum punya)
```bash
# Install PostgreSQL via Homebrew
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Create database
createdb tama_pos
```

## Step 2: Setup Backend
```bash
cd server

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env file - update DATABASE_URL
nano .env
# Ganti jadi: DATABASE_URL="postgresql://username:password@localhost:5432/tama_pos"

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database dengan data awal
npm run db:seed

# Start server
npm run dev
```

Server bakal jalan di `http://localhost:5001`

## Step 3: Setup Frontend
```bash
# Buka terminal baru
cd client

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

Frontend bakal jalan di `http://localhost:3000`

## Step 4: Login
Buka browser ke `http://localhost:3000/login`

**Credentials:**
- Username: `kasir`
- Password: `kasir123`

atau

- Username: `admin`
- Password: `admin123`

## Troubleshooting Common Issues:

### Database connection error
```bash
# Check PostgreSQL status
brew services list

# Restart PostgreSQL
brew services restart postgresql@15
```

### Port already in use
```bash
# Kill process on port 5000
lsof -ti:5001 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Prisma migration error
```bash
cd server
npx prisma migrate reset
npm run db:seed
```

## Deployment ke Production:

### Option 1: VPS (Rekomendasi)
1. Sewa VPS (Niagahoster, Dewaweb, DigitalOcean)
2. Install Node.js & PostgreSQL
3. Clone repo
4. Setup .env dengan production values
5. Run migrations
6. Setup PM2 untuk auto-restart
7. Setup Nginx sebagai reverse proxy

### Option 2: Vercel + Railway
1. Frontend ke Vercel:
   ```bash
   cd client
   vercel --prod
   ```

2. Backend + DB ke Railway:
   - Create project di railway.app
   - Connect GitHub repo
   - Add PostgreSQL service
   - Deploy backend

## Printer Setup (Optional):

1. Connect thermal printer via USB atau Bluetooth
2. Find device path:
   ```bash
   ls /dev/usb/
   ```
3. Update `.env`:
   ```
   PRINTER_TYPE=usb
   PRINTER_INTERFACE=/dev/usb/lp0
   ```

## Next Steps:
- Ganti password default di `/settings`
- Tambah menu produk sesuai kebutuhan
- Test print struk
- Configure backup database

Need help? Check README.md atau contact gue bre! 🍹
