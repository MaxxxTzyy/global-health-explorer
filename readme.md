# Global Health Explorer 🌍📊  

An interactive web application for exploring global health indicators (life expectancy and infant mortality) by country, gender, and time period.

Data is loaded from a Kaggle-style CSV file into SQLite and visualized in a modern dashboard using Chart.js.  
The app is suitable for:

- Exploratory data analysis (EDA)
- Teaching materials and classroom demonstrations
- Quick analytical report generation for assignments, articles, or research

---

## ✨ Key Features

- **Country filters**
  - Select **Country 1** (required) and optional **Country 2** for comparison.
- **Indicator filter**
  - `Life Expectancy`
  - `Infant Mortality Rate`
- **Gender filter**
  - `Both sexes`
  - `Male`
  - `Female`
- **Year range filter**
  - Optional `Start year` and `End year` to focus on a specific period.
- **Data table**
  - Shows `Country`, `Year`, `Gender`, `Life Expectancy`, and `Infant Mortality Rate`.
- **Line chart (Chart.js)**
  - Single-country or two-country comparison over time.
- **Auto-generated analytical insight**
  - Describes trend (upward/downward/stable), magnitude of change, and comparative gaps.
- **Report generator**
  - One-click **“Generate Report Summary”** → ready to paste into Word or a research document.
- **Saved dashboards (SQLite)**
  - Save, reload, and delete dashboard presets.
- **CSV export**
  - Export the currently filtered dataset (1–2 countries) for further analysis in Excel/SPSS/R/etc.

---

## 🧱 Tech Stack

**Frontend**

- HTML5  
- CSS3 (dark-themed dashboard layout)  
- Vanilla JavaScript  
- [Chart.js](https://www.chartjs.org/) for charts  

**Backend**

- Node.js  
- Express.js  

**Database**

- SQLite  
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) as the Node driver  

**Tools**

- DB Browser for SQLite (for importing CSV and inspecting tables)  
- Visual Studio Code (recommended editor)  

---

## 📂 Project Structure

```text
project-root/
├─ index.html          # Main HTML page (UI layout and controls)
├─ style.css           # Styling (dark theme, simple responsive-ish layout)
├─ main.js             # Frontend logic (fetch API, charts, insights, export, reports)
├─ server.js           # Express server + API routes + SQLite connection
├─ global_health.db    # SQLite database (health_data + dashboards)
├─ UnifiedDataset.csv  # Source CSV dataset imported into SQLite
├─ package.json        # Node.js dependencies & scripts
└─ node_modules/       # Installed dependencies (created by npm install)


<<<<<<< HEAD
🛠️ Setup & Installation
1. Prerequisites
You need:
•	Node.js (v18+ recommended)
•	DB Browser for SQLite (or any SQLite GUI)
•	A CSV dataset named UnifiedDataset.csv containing at least these columns:
o	Country
o	Year
o	Gender
o	Life Expectancy
o	Infant Mortality Rate
The values in the Gender column must match exactly:
Both sexes, Male, Female.
________________________________________
2. Install dependencies
From the project root folder, run:
npm install
Your package.json should look roughly like this:
{
  "name": "global-health-explorer",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "better-sqlite3": "^9.0.0",
    "express": "^4.18.0"
  }
}
If you don’t have package.json yet:
npm init -y
npm install express better-sqlite3
________________________________________
3. Prepare the SQLite database (global_health.db)
1.	Open DB Browser for SQLite.
2.	File → New Database…, save as global_health.db in the project root.
3.	Create the dashboards table (if it does not exist):
4.	CREATE TABLE IF NOT EXISTS dashboards (
5.	  id INTEGER PRIMARY KEY AUTOINCREMENT,
6.	  name TEXT NOT NULL,
7.	  country TEXT NOT NULL,
8.	  indicator TEXT NOT NULL,
9.	  created_at TEXT
10.	);
11.	Import your CSV into a table called health_data:
o	File → Import → Table from CSV file…
o	Choose UnifiedDataset.csv
o	Table name: health_data
o	Check: ✅ “Column names in first line”
o	Separator: ,
o	Encoding: UTF-8
o	Click through until finish.
o	Click Write Changes (disk icon) to save.
o	Close DB Browser (to avoid “database is locked” when running the Node server).
After import, health_data should contain at least:
Country | Year | Gender | Life Expectancy | Infant Mortality Rate | ...
________________________________________
🚀 Running the Application
From the project root:
npm start
# or
node server.js
You should see:
Server running at http://localhost:3000
Then open your browser and visit:
http://localhost:3000
If you change server.js, stop the server with Ctrl + C and run node server.js again.
________________________________________
📖 Detailed Behaviour & Logic
Bagian ini menjelaskan cara kerja dashboard, logika analisis, dan API backend secara lebih rinci.
________________________________________
1. Frontend Behaviour
1.1 Controls (Top Panel)
Di bagian atas halaman terdapat beberapa kontrol:
•	Country 1
Wajib dipilih; ini negara utama yang akan dianalisis.
•	Country 2 (optional)
Opsional; jika diisi, dashboard akan menampilkan perbandingan dua negara.
•	Indicator
o	Life Expectancy
o	Infant Mortality Rate
•	Gender
o	Both sexes
o	Male
o	Female
•	Start year / End year (optional)
o	Jika keduanya diisi → analisis dibatasi dalam rentang tahun tersebut.
o	Jika hanya start atau end yang diisi → dianggap batas bawah/atas.
o	Jika keduanya kosong → digunakan seluruh rentang tahun yang tersedia di data.
Saat tombol “Show Data” diklik:
1.	Frontend memanggil endpoint GET /api/data dengan parameter:
o	country1, optional country2, optional startYear, endYear, dan gender.
2.	Respons dari backend dipakai untuk:
o	Mengisi tabel data,
o	Menggambar grafik garis,
o	Menghitung ringkasan numerik,
o	Menghasilkan teks insight analitis.
________________________________________
1.2 Summary Panel
Panel Summary menampilkan ringkasan numerik, misalnya:
Country: Indonesia | Indicator: Life Expectancy | Gender: Both sexes | Year range: 1990–2019 | Average: 67.25
Karakteristik:
•	Selalu berdasarkan Country 1.
•	Menggunakan nilai indikator dan filter gender + tahun yang sedang aktif.
Langkah logika:
1.	Mengambil semua nilai numerik dari indikator terpilih (Life Expectancy atau Infant Mortality Rate).
2.	Menghitung rata-rata (mean) nilai indikator tersebut.
3.	Menentukan rentang tahun efektif:
o	Jika pengguna mengisi Start year / End year, gunakan itu.
o	Jika kosong, ambil tahun pertama dan terakhir dari data yang sudah terfilter.
________________________________________
1.3 Data Table & CSV Export
Tabel menampilkan data untuk Country 1 dengan kolom:
•	Country
•	Year
•	Gender
•	Life Expectancy
•	Infant Mortality Rate
Data ini sepenuhnya bersumber dari array country1 pada respons GET /api/data.
Export CSV:
•	Tombol “Export CSV” mengekspor semua baris data yang saat ini dimuat:
o	Baris untuk Country 1
o	Ditambah baris untuk Country 2 (jika ada)
•	Nama file otomatis mencakup:
o	Indikator,
o	Gender,
o	Negara (Country 1 dan opsional Country 2),
o	Rentang tahun (jika tersedia).
________________________________________
1.4 Chart (Line Chart)
Grafik memanfaatkan Chart.js dan beradaptasi sesuai filter:
•	Sumbu-X: Year
•	Sumbu-Y: nilai indikator yang dipilih
Dataset:
•	Jika hanya Country 1 → satu garis.
•	Jika Country 1 dan Country 2 → dua garis, masing-masing satu negara.
Label dataset mencantumkan nama indikator dan negara.
________________________________________
2. Analytical Insight Logic
Dashboard menghasilkan teks insight otomatis berdasarkan data terfilter. Logika utama berada di main.js.
________________________________________
2.1 Single-Country Insight
Untuk satu negara dengan indikator + gender tertentu:
1.	Data diurutkan berdasarkan Year.
2.	Diambil:
o	firstYear dan lastYear
o	firstVal = nilai indikator pada firstYear
o	lastVal = nilai indikator pada lastYear
o	avg = rata-rata semua nilai indikator
o	diffAbs = lastVal - firstVal
o	diffPct = (diffAbs / firstVal) * 100 (jika firstVal ≠ 0)
3.	Menentukan jenis tren:
o	Jika diffAbs > 0.5 → “shows an upward trend”
o	Jika diffAbs < -0.5 → “shows a downward trend”
o	Selain itu → “is relatively stable”
4.	Menyusun teks akhir yang memuat:
o	Indikator,
o	Negara,
o	Gender,
o	Periode (tahun awal–akhir),
o	Arah tren,
o	Besarnya perubahan (absolut + persen),
o	Nilai rata-rata.
Contoh output:
“Life Expectancy for both sexes in Indonesia over the period 1990–2019 shows an upward trend with a change of about 10.20 (15.3%). The average value during this period is 67.25.”
________________________________________
2.2 Comparative Insight (Two Countries)
Jika Country 2 diisi, insight komparatif dihasilkan:
1.	Hitung rata-rata indikator untuk masing-masing negara:
o	avg1 = rata-rata Country 1
o	avg2 = rata-rata Country 2
2.	Cari tahun yang sama-sama ada di kedua negara (common years).
3.	Untuk tahun awal dan akhir yang sama-sama dimiliki:
o	Hitung nilai indikator di tiap negara.
o	Hitung gap awal dan gap akhir.
4.	Deskripsikan:
o	Apakah gap:
	relatif stabil,
	makin melebar,
	atau makin menyempit.
o	Negara mana yang lebih tinggi rata-ratanya dan selisihnya berapa.
o	Periode komparasi (tahun awal–akhir efektif).
Contoh output:
“This comparison of Life Expectancy for female between Indonesia and Japan covers the period 1990–2019. The average Life Expectancy in Indonesia is 69.10, while in Japan it is 82.30. Life Expectancy for female in Japan is, on average, about 13.20 higher than in Indonesia. The gap between the two countries tends to narrow over time.”
________________________________________
3. Report Generator
Tombol “Generate Report Summary” menyusun laporan pendek dalam bahasa Inggris yang terdiri dari:
1.	Paragraf pembuka
o	Menyebut indikator, gender, negara, periode, dan pendekatan (dashboard web-based).
2.	Ringkasan numerik
o	Mengambil teks dari panel Summary.
3.	Analytical insight
o	Mengambil teks insight (single-country atau comparative).
4.	Paragraf penutup
o	Jika satu negara:
	Menekankan dinamika indikator negara tersebut dan relevansinya bagi kebijakan/program/riset.
o	Jika dua negara:
	Menekankan pentingnya perbandingan antarnegara untuk analisis kebijakan dan riset.
Output muncul di textarea dan bisa langsung di-copy ke:
•	Dokumen Word,
•	Artikel,
•	Bahan ajar,
•	Laporan penelitian.
________________________________________
4. Saved Dashboards
Preset dashboard disimpan di tabel dashboards dalam SQLite.
Kolom yang disimpan:
•	name – nama preset (bebas, mis. “Indo vs Japan – LifeExp”)
•	country – Country 1
•	indicator – indikator yang digunakan
•	created_at – timestamp saat preset dibuat
Catatan: gender dan rentang tahun tidak disimpan dalam skema saat ini, sehingga tetap fleksibel ketika preset di-load kembali.
________________________________________
4.1 Menyimpan Dashboard
•	Pengguna mengisi Dashboard name.
•	Klik “Save Dashboard”.
•	Frontend mengirim:
•	POST /api/dashboards
•	Content-Type: application/json
dengan body:
{
  "name": "Indo vs Japan – LifeExp",
  "country": "Indonesia",
  "indicator": "Life Expectancy"
}
•	Backend menyimpan ke tabel dashboards dan mengembalikan rekaman yang baru dibuat.
________________________________________
4.2 Memuat Dashboard
•	Daftar preset diambil dari GET /api/dashboards.
•	Klik bagian kiri item (nama + meta) akan:
o	Mengatur ulang Country 1 dan Indicator pada kontrol.
o	Mengosongkan Start/End year.
o	Membiarkan gender tetap seperti pilihan user saat ini.
o	Memanggil ulang GET /api/data dengan konfigurasi tersebut.
________________________________________
4.3 Menghapus Dashboard
•	Klik tombol Delete di samping item.
•	Akan muncul konfirmasi.
•	Jika disetujui, frontend memanggil:
•	DELETE /api/dashboards/:id
•	Jika sukses, frontend memuat ulang daftar dashboard.
________________________________________
5. Backend API
Backend menggunakan Express.js dan better-sqlite3 untuk akses database.
________________________________________
5.1 GET /api/countries
Mengembalikan daftar negara unik dari tabel health_data, urut alfabetis.
Response contoh:
[
  "Afghanistan",
  "Albania",
  "Algeria",
  "Indonesia",
  "Japan",
  "United States"
]
________________________________________
5.2 GET /api/data
Mengambil data terfilter untuk Country 1 dan opsional Country 2, dengan filter gender dan tahun.
Query parameters:
•	country1 (required) – nama negara utama.
•	country2 (optional) – nama negara kedua.
•	startYear (optional) – batas bawah tahun (inklusif).
•	endYear (optional) – batas atas tahun (inklusif).
•	gender (optional) – Both sexes, Male, atau Female.
Contoh:
GET /api/data?country1=Indonesia&country2=Japan&startYear=1990&endYear=2019&gender=Both%20sexes
Format response:
{
  "country1": [
    {
      "Country": "Indonesia",
      "Year": 1990,
      "Gender": "Both sexes",
      "Life Expectancy": 61.2,
      "Infant Mortality Rate": 65.3
    }
  ],
  "country2": [
    {
      "Country": "Japan",
      "Year": 1990,
      "Gender": "Both sexes",
      "Life Expectancy": 78.4,
      "Infant Mortality Rate": 5.5
    }
  ]
}
Jika country2 tidak dikirim, country2 akan berupa array kosong.
________________________________________
5.3 GET /api/dashboards
Mengembalikan seluruh dashboard yang tersimpan, urut dari yang terbaru.
Contoh response:
[
  {
    "id": 1,
    "name": "Indo – Life Expectancy",
    "country": "Indonesia",
    "indicator": "Life Expectancy",
    "created_at": "2025-11-28 14:30:12"
  },
  {
    "id": 2,
    "name": "Indo vs Japan – LifeExp",
    "country": "Indonesia",
    "indicator": "Life Expectancy",
    "created_at": "2025-11-28 15:02:45"
  }
]
________________________________________
5.4 POST /api/dashboards
Membuat preset dashboard baru.
Request body:
{
  "name": "Indo vs Japan – LifeExp",
  "country": "Indonesia",
  "indicator": "Life Expectancy"
}
Response sukses:
{
  "id": 3,
  "name": "Indo vs Japan – LifeExp",
  "country": "Indonesia",
  "indicator": "Life Expectancy",
  "created_at": "2025-11-28 15:02:45"
}
Jika field wajib tidak lengkap, server mengembalikan HTTP 400 Bad Request dengan pesan error.
________________________________________
5.5 DELETE /api/dashboards/:id
Menghapus satu dashboard berdasarkan ID.
Contoh:
DELETE /api/dashboards/3
Response sukses:
{ "success": true }
Jika ID tidak valid atau tidak ditemukan, server mengembalikan error yang sesuai (400 atau 404).
________________________________________
6. Possible Extensions
Beberapa ide pengembangan lanjutan:
1.	Tambahan indikator
o	Menambah kolom baru dari dataset (misalnya under-5 mortality, maternal mortality) dan menampilkannya di dropdown indikator.
2.	Global benchmark
o	Menghitung rata-rata global untuk setiap indikator + gender, lalu menampilkan seberapa jauh suatu negara di atas atau di bawah rata-rata dunia.
3.	Menyimpan lebih banyak setting di dashboard
o	Menambah kolom di tabel dashboards untuk menyimpan:
	gender,
	startYear,
	endYear,
	nama Country 2.
4.	Visualisasi lanjutan
o	Multi-indicator chart,
o	Dual-axis chart (misalnya Life Expectancy dan Infant Mortality dalam satu grafik).
5.	Deployment
o	Deploy ke layanan hosting (Railway, Render, dll.) agar bisa diakses tanpa menjalankan Node secara lokal.
6.	Internationalisation (i18n)
o	Menambahkan toggle bahasa (mis. English / Bahasa Indonesia) untuk UI dan teks insight.
________________________________________
📝 Usage & License
This project is intended for learning, teaching, and research support.
You are free to modify and extend it to fit your own datasets, courses, or analytical needs.
=======
>>>>>>> 4b15e8dcad2c7cb377246a1fd0a388afdfb00a24


