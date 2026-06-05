# Root Homepage Brainstorm

Discovery mode: solution-shaping.

## Current Context

Verified facts:

- Project adalah Daily Journal + Mood Tracker.
- Root route `/` masih memakai template bawaan Next.js.
- Fitur utama sudah diarahkan ke `/dashboard`, `/journal`, `/journal/new`,
  `/login`, dan `/register`.
- Aplikasi bersifat privat, berbasis akun, dan memakai UI copy Bahasa
  Indonesia.
- Dashboard adalah halaman utama untuk user yang sudah login.

Existing constraints:

- Journal data harus private dan user-scoped.
- AI analysis memakai Gemini server-only.
- Desain harus tenang, personal, tidak terlalu marketing-heavy.
- Root layout belum memakai app shell global; shell hanya untuk area protected.

## Problem Framing

Saat user membuka `/`, aplikasi belum memberi arah. Halaman ini perlu menjawab
dua kondisi utama: user yang sudah login harus cepat kembali ke dashboard,
sedangkan user baru perlu paham manfaat app dan punya CTA jelas untuk mulai.

## Target Users

Primary user:

- Orang yang ingin membangun kebiasaan journaling harian secara pribadi.
- Trigger: membuka app untuk menulis refleksi atau melihat pola mood.
- Desired outcome: langsung tahu harus login, daftar, atau lanjut ke dashboard.

## Feature Directions

### Option 1: Auth-Aware Landing Page

Isi:

- Jika sudah login: redirect otomatis ke `/dashboard`.
- Jika belum login: tampilkan landing singkat dengan CTA `Masuk` dan `Daftar`.
- Hero menekankan manfaat: tulis jurnal, pilih mood, dapat insight AI.
- Tampilkan preview fitur utama: mood tracking, ringkasan AI, grafik mingguan,
  privasi.

Tradeoff:

- Paling cocok untuk produk private dan user baru.
- Butuh sedikit desain landing, tapi tetap ringan.

### Option 2: Always Redirect To Dashboard

Isi:

- `/` langsung redirect ke `/dashboard`.
- Jika belum login, protected route mengarah ke `/login`.

Tradeoff:

- Paling cepat diimplementasikan.
- Kurang ramah untuk user baru karena tidak menjelaskan nilai produk.

### Option 3: Minimal Welcome Screen

Isi:

- Satu halaman sederhana: nama app, deskripsi pendek, tombol login/register.
- Tanpa preview fitur atau section tambahan.

Tradeoff:

- Lebih cepat dari landing penuh.
- Cukup baik untuk MVP, tapi terasa kurang matang setelah phase 8 selesai.

### Option 4: Public Product Landing

Isi:

- Landing lengkap dengan hero, benefit, screenshot/mock preview, FAQ, dan CTA.

Tradeoff:

- Bagus untuk akuisisi publik.
- Terlalu besar untuk kebutuhan saat ini karena app fokus private journaling,
  bukan marketing site.

## Recommended MVP

Gunakan Option 1: Auth-Aware Landing Page.

Recommended behavior:

- Pada server component `app/page.tsx`, panggil `auth()`.
- Jika session ada, `redirect("/dashboard")`.
- Jika session tidak ada, render landing singkat.

Recommended content for guest:

- H1: `Daily Journal + Mood Tracker`
- Supporting copy:
  `Ruang pribadi untuk menulis harian, mencatat mood, dan memahami pola emosi
  lewat ringkasan AI.`
- Primary CTA: `Mulai menulis` menuju `/register`.
- Secondary CTA: `Masuk` menuju `/login`.
- Feature strip:
  - `Jurnal pribadi` - entry tersimpan per akun.
  - `Mood harian` - lima pilihan mood dengan skor konsisten.
  - `Insight AI` - summary, sentiment, dan keywords dari Gemini.
  - `Grafik mingguan` - dashboard mood trend dan streak.
- Privacy note:
  `Tulisanmu hanya ditampilkan untuk akunmu. Analisis AI diproses dari server.`

Suggested visual direction:

- Hero first viewport yang tenang dan personal.
- Gunakan panel preview dashboard/journal sebagai visual utama, bukan dekorasi
  abstrak.
- Pakai neutral surface, aksen ungu secukupnya, dan mood colors sebagai detail.
- Hindari halaman marketing panjang; cukup 1 viewport dengan sedikit hint fitur
  di bawahnya.

## Key Risks

- Landing terlalu panjang bisa terasa seperti marketing site dan memperlambat
  core action.
- Jika memakai redirect penuh untuk user login, jangan sampai menyebabkan loop
  dengan protected routes.
- Jangan menampilkan contoh journal yang terlihat seperti data user sungguhan.
- Jangan menaruh app shell protected pada guest landing karena nav dashboard
  tidak relevan untuk user yang belum login.

## Assumptions

- `/dashboard` tetap menjadi home utama setelah login.
- App ditujukan untuk single private account flow, bukan komunitas atau sharing.
- User baru perlu penjelasan singkat sebelum register.
- Screenshot asli belum wajib; preview UI statis cukup untuk MVP.

## Open Questions

- Apakah root page harus langsung redirect untuk semua user demi app-like feel?
- Apakah user ingin landing bisa diakses lagi setelah login, misalnya di
  `/about`?
- Apakah nanti perlu public SEO landing, atau app ini hanya untuk penggunaan
  personal/private?

## Next Step

Gunakan `flow-wireframe-lite` jika ingin menentukan detail layout dan state
halaman `/`. Untuk implementasi langsung, gunakan `implement-from-plan` dengan
scope kecil: replace `app/page.tsx` menjadi auth-aware landing + redirect.
