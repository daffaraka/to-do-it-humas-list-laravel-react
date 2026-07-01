# Setup Ngrok untuk Development

## Cara Setup Agar Aplikasi Bisa Diakses dari Laptop Lain

### 1. Jalankan Backend dengan Ngrok

**Di laptop server:**

```bash
# Terminal 1 - Jalankan Laravel backend
cd backend
php artisan serve --host=0.0.0.0 --port=8000

# Terminal 2 - Jalankan ngrok untuk backend
ngrok http 8000
```

**Copy ngrok URL** yang muncul, contoh: `https://abcd-1234-5678.ngrok-free.app`

### 2. Update Frontend Environment

Edit file `frontend/.env.ngrok` dan ganti dengan ngrok URL baru:

```env
VITE_API_URL=https://abcd-1234-5678.ngrok-free.app/api
```

### 3. Jalankan Frontend

**Pilihan A - Development Mode (untuk development):**
```bash
cd frontend
cp .env.ngrok .env
npm run dev
```

Frontend akan jalan di `http://localhost:5173`

**Pilihan B - Build & Preview (untuk testing production-like):**
```bash
cd frontend
cp .env.ngrok .env
npm run build
npm run preview
```

### 4. Akses dari Laptop Lain

**Opsi 1: Akses langsung ke laptop server**
- Cari IP address laptop server: `ipconfig` (Windows) atau `ifconfig` (Mac/Linux)
- Akses dari laptop lain: `http://IP_ADDRESS:5173`
- Contoh: `http://192.168.1.100:5173`

**Opsi 2: Setup ngrok untuk frontend juga (perlu ngrok account berbayar untuk multiple tunnels)**
```bash
# Terminal 3 - Ngrok untuk frontend
ngrok http 5173
```

## Switch Environment dengan Cepat

### Development Lokal (tanpa ngrok):
```bash
cd frontend
cp .env .env.backup
echo "VITE_API_URL=http://localhost:8000/api" > .env
npm run dev
```

### Development dengan Ngrok:
```bash
cd frontend
cp .env.ngrok .env
npm run dev
```

## Troubleshooting

### Error 403 Forbidden dari Ngrok
- Sudah dihandle dengan middleware `HandleNgrokCors`
- Header `ngrok-skip-browser-warning` sudah ditambahkan otomatis

### Error 404 Not Found
- Pastikan ngrok tunnel mengarah ke **backend** (port 8000), bukan frontend
- Cek ngrok URL di browser, harus return JSON response Laravel, bukan HTML

### CORS Error
- Pastikan middleware `HandleNgrokCors` ada di `backend/app/Http/Middleware/`
- Pastikan sudah di-register di `bootstrap/app.php`

### Frontend tidak bisa diakses dari laptop lain
- Pastikan firewall tidak memblokir port 5173
- Pastikan kedua laptop dalam network yang sama (WiFi/LAN yang sama)
- Coba akses dengan IP address bukan `localhost`

## Tips

1. **Ngrok URL berubah setiap restart** (free plan) - update `.env.ngrok` setiap kali restart ngrok
2. **Gunakan ngrok account** untuk URL yang persistent
3. **Jangan commit `.env` files** - sudah ada di `.gitignore`
