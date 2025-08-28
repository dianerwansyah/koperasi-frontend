# Koperasi Frontend (React)

Frontend aplikasi koperasi berbasis **React.js** dengan:

- React 18+
- Redux Toolkit + localStorage untuk state persistence
- Tailwind CSS + DaisyUI
- Axios untuk komunikasi API

## Setup Proyek

1. **Clone repository:**

```bash
git clone https://github.com/dianerwansyah/koperasi-frontend.git
cd koperasi-frontend
```

2. **Install dependencies:**

```bash
npm install
```

atau jika menggunakan yarn:

```bash
yarn install
```

3. **Buat file `.env`** di root proyek:

```env
REACT_APP_API_URL=http://localhost:8000
```

> Ganti URL sesuai lokasi backend Anda.

4. **Menjalankan aplikasi development:**

```bash
npm start
```

atau

```bash
yarn start
```

Aplikasi akan berjalan di [http://localhost:3000](http://localhost:3000)

5. **Build untuk production:**

```bash
npm run build
```

atau

```bash
yarn build
```

Hasil build berada di folder `build/`.

---

## Catatan

- **State Management**: Redux Toolkit + localStorage
- **UI**: Tailwind CSS + DaisyUI, sudah mendukung tema light/dark
- **API**: Axios menggunakan `REACT_APP_API_URL` dari `.env`
- **Routing**: React Router v6