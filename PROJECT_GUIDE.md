# 🍹 Super Juice - COMPLETE PROJECT GUIDE

## 📦 DELIVERABLES - Apa Aja yang Gue Kasih

### Backend (Server)
✅ Express.js REST API
✅ PostgreSQL database dengan Prisma ORM
✅ JWT authentication & authorization
✅ Receipt printer integration (ESC/POS)
✅ Complete CRUD operations:
   - Auth (login, logout, change password)
   - Products management
   - Categories management
   - Orders & transactions
   - User management
   - Analytics & dashboard stats
✅ Database seeding dengan sample data
✅ Error handling & validation
✅ API documentation ready

### Frontend (Client)
✅ React 18 + Vite
✅ Tailwind CSS + shadcn/ui ready
✅ Responsive design (mobile-friendly)
✅ Color theme sesuai spanduk lo (yellow, green, red)
✅ Pages:
   - Login page (auth)
   - Counter/POS page (kasir input order & cetak struk)
   - Dashboard page (analytics untuk admin)
   - Products page (skeleton - untuk future development)
   - Orders page (skeleton - untuk future development)
✅ State management dengan Zustand
✅ Shopping cart functionality
✅ Real-time calculation
✅ Payment methods (Cash & QRIS)

### Database Schema
✅ Users (admin & kasir roles)
✅ Categories (Jus Buah, Mix, Add-ons)
✅ Products (harga 10-20rb sesuai request)
✅ Orders & OrderItems
✅ Timestamps & audit trail

### Features Lengkap:
✅ Login system dengan role-based access
✅ Product catalog dengan kategori
✅ Shopping cart dengan quantity control
✅ Order checkout dengan multiple payment methods
✅ Receipt printing (thermal printer support)
✅ Dashboard analytics (today, month, all-time)
✅ Sales tracking
✅ Responsive UI (desktop & mobile)

## 🚀 CARA INSTALL & JALANIN

### Prerequisites
```bash
# Check Node.js version (butuh 18+)
node --version

# Install PostgreSQL via Homebrew
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb tama_pos
```

### Backend Setup
```bash
cd server
npm install
cp .env.example .env

# Edit .env - ganti database URL
DATABASE_URL="postgresql://YOUR_USERNAME@localhost:5432/tama_pos"

# Run migrations & seed
npm run db:generate
npm run db:migrate
npm run db:seed

# Start server
npm run dev
```

Server running di `http://localhost:5001`

### Frontend Setup
```bash
cd client
npm install
cp .env.example .env

# Start client
npm run dev
```

Client running di `http://localhost:3000`

### Login Credentials
```
Kasir:
Username: kasir
Password: kasir123

Admin:
Username: admin
Password: admin123
```

## 📱 CARA PAKE POS SYSTEM

### Untuk Kasir (Bini Lo):
1. Login pake username `kasir`
2. Di halaman Counter, pilih kategori jus
3. Klik produk untuk add to cart
4. Atur quantity pake tombol +/-
5. Pilih metode pembayaran (Cash/QRIS)
6. Input jumlah bayar
7. Klik "CHECKOUT & CETAK" untuk finalize
8. Struk otomatis tercetak (kalo printer connected)

### Untuk Admin (Lo):
1. Login pake username `admin`
2. Akses dashboard untuk lihat analytics
3. Bisa manage products, categories, users (via API)
4. View sales reports & statistics

## 🎨 DESIGN SYSTEM

### Colors (dari spanduk lo):
- Primary Yellow: `#FDB913`
- Primary Green: `#7A9B5E`
- Primary Red: `#E63946`
- Background: `#FFFBF0`

### Typography:
- Headings: Poppins Bold
- Body: Inter Regular
- Numbers/Prices: JetBrains Mono

### UI Components:
- Buttons dengan gradient
- Cards dengan shadow & hover effects
- Tropical wavy background
- Responsive grid layout

## 🖨️ PRINTER SETUP

### Supported Printers:
- Thermal 58mm (ESC/POS compatible)
- Recommended brands:
  * Zjiang ZJ-5802 (Bluetooth) ~300-400rb
  * Epson TM-T82 (USB) ~1.5jt
  * Iware IP-58 (Budget) ~200rb

### Configuration:
```bash
# Di server/.env
PRINTER_TYPE=bluetooth  # or usb
PRINTER_INTERFACE=/dev/usb/lp0
PRINTER_WIDTH=32
```

### Find Device Path (Mac):
```bash
ls /dev/usb/
# atau
ls /dev/tty.*
```

### Print Test:
Printer akan otomatis print struk setiap kali order completed.
Kalo printer ga connect, data tetap kesave di database & bisa reprint.

## 📊 API ENDPOINTS

### Authentication
```
POST   /api/auth/login
GET    /api/auth/me
POST   /api/auth/change-password
```

### Products
```
GET    /api/products
GET    /api/products/:id
POST   /api/products (admin only)
PUT    /api/products/:id (admin only)
DELETE /api/products/:id (admin only)
```

### Orders
```
GET    /api/orders
GET    /api/orders/:id
POST   /api/orders
POST   /api/orders/:id/print
PUT    /api/orders/:id/cancel (admin only)
```

### Analytics
```
GET    /api/analytics/dashboard
GET    /api/analytics/sales-chart
GET    /api/analytics/top-products
GET    /api/analytics/payment-methods
```

### Categories
```
GET    /api/categories
POST   /api/categories (admin only)
PUT    /api/categories/:id (admin only)
DELETE /api/categories/:id (admin only)
```

## 🚢 DEPLOYMENT OPTIONS

### Option 1: VPS (Recommended untuk production)
**Pros:** Full control, no vendor lock-in, cheaper long-term
**Cons:** Butuh setup manual

**Steps:**
1. Sewa VPS (Niagahoster, Dewaweb, DigitalOcean)
2. Install Node.js 18+, PostgreSQL 15+, Nginx
3. Clone repo ke server
4. Setup .env dengan production values
5. Run migrations & build
6. Setup PM2 untuk auto-restart
7. Configure Nginx reverse proxy
8. Setup SSL dengan Let's Encrypt

**Estimated Cost:** 100-300rb/bulan

### Option 2: Vercel + Railway (Easiest)
**Pros:** Auto deployment, managed infrastructure
**Cons:** Bisa mahal kalo traffic tinggi

**Frontend (Vercel):**
```bash
cd client
npm run build
vercel --prod
```

**Backend + DB (Railway):**
1. Buat account di railway.app
2. Create new project
3. Add PostgreSQL service
4. Deploy dari GitHub repo
5. Set environment variables
6. Deploy

**Estimated Cost:** $5-20/bulan

### Option 3: Local Network Only
**Pros:** Gratis, full control
**Cons:** Cuma bisa diakses di jaringan lokal

Just run `npm run dev` di kedua folder.
Access via IP lokal (e.g., `192.168.1.10:3000`)

## 🔧 TROUBLESHOOTING

### Database Error
```bash
# Reset database
cd server
npx prisma migrate reset
npm run db:seed
```

### Port Already in Use
```bash
# Mac
lsof -ti:5001 | xargs kill -9
lsof -ti:3000 | xargs kill -9
```

### Prisma Error
```bash
cd server
npm run db:generate
```

### Can't Login
- Check server is running (`http://localhost:5001/health`)
- Check database is connected
- Try default credentials: kasir/kasir123

## 📈 FUTURE ENHANCEMENTS

### Phase 2 (Recommended):
- [ ] Complete products management UI
- [ ] Orders history dengan filter & search
- [ ] Sales reports (daily, weekly, monthly)
- [ ] Export data ke Excel/PDF
- [ ] Stock management
- [ ] Customer loyalty program
- [ ] WhatsApp order integration
- [ ] Multiple outlet support

### Phase 3 (Advanced):
- [ ] Mobile app (React Native)
- [ ] Payment gateway integration (Midtrans/Xendit)
- [ ] Real-time sync antar device
- [ ] Inventory alerts
- [ ] Employee management
- [ ] Shift management

## 🎯 NEXT STEPS

1. **Testing**
   - Test semua flow: login → add product → checkout
   - Test printer connection
   - Test dengan berbagai device (laptop, tablet, phone)

2. **Customization**
   - Ganti password default
   - Add more products sesuai menu
   - Adjust prices
   - Add product images (optional)

3. **Training**
   - Ajarin bini lo cara pake POS
   - Practice checkout flow
   - Test receipt printing

4. **Launch**
   - Deploy ke production (pilih option deployment di atas)
   - Setup backup database
   - Monitor performance

## 💡 TIPS & BEST PRACTICES

1. **Backup Database Regularly**
```bash
pg_dump tama_pos > backup_$(date +%Y%m%d).sql
```

2. **Monitor Logs**
```bash
# Server logs
cd server && npm run dev

# Check errors
tail -f logs/error.log
```

3. **Security**
- Ganti JWT_SECRET di production
- Ganti default passwords
- Enable HTTPS
- Regular updates

4. **Performance**
- Gunakan indexes di database
- Cache frequently accessed data
- Optimize images
- Use CDN untuk assets

## 🙏 SUPPORT

Kalo ada issue atau butuh help:
1. Check SETUP.md
2. Check error logs
3. Search di Stack Overflow
4. Contact gue bre!

## 📝 NOTES

- Project ini production-ready dengan proper error handling
- Database schema sudah optimized
- UI responsive & user-friendly
- Code clean & maintainable
- Ready untuk scale

Good luck dengan bisnis jus lo bre! Semoga laris manis! 🍹💰

---

**Built with ❤️ for Super Juice**
*Fresh juice everyday!*
