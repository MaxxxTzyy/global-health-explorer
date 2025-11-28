const express = require("express");
const path = require("path");
const Database = require("better-sqlite3");

const app = express();
const PORT = 3000;

// pakai database global_health.db
const db = new Database("global_health.db");

app.use(express.json());

// serve file statis (index.html, main.js, dll)
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// =========================
// 1) API: daftar negara
// =========================
app.get("/api/countries", (req, res) => {
  try {
    const rows = db
      .prepare("SELECT DISTINCT Country FROM health_data ORDER BY Country ASC")
      .all();
    const countries = rows.map((r) => r.Country);
    res.json(countries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil daftar negara" });
  }
});

// =========================
// 2) API: data untuk grafik/tabel
// =========================
app.get("/api/data", (req, res) => {
  const { country1, country2, startYear, endYear } = req.query;

  if (!country1) {
    return res.status(400).json({ error: "parameter country1 wajib diisi" });
  }

  const sYear = parseInt(startYear);
  const eYear = parseInt(endYear);

  function queryForCountry(country) {
  if (!country) return [];

  let sql = `
    SELECT
      Country,
      Year,
      Gender,
      "Life Expectancy" AS "Life Expectancy",
      "Infant Mortality Rate" AS "Infant Mortality Rate"
    FROM health_data
    WHERE Country = ?
      AND Gender = 'Both sexes'
  `;
  const params = [country];

  if (!Number.isNaN(sYear)) {
    sql += " AND Year >= ?";
    params.push(sYear);
  }

  if (!Number.isNaN(eYear)) {
    sql += " AND Year <= ?";
    params.push(eYear);
  }

  sql += " ORDER BY Year ASC";

  return db.prepare(sql).all(...params);
}


  try {
    const rows1 = queryForCountry(country1);
    const rows2 =
      country2 && country2 !== country1 ? queryForCountry(country2) : [];

    res.json({ country1: rows1, country2: rows2 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil data" });
  }
});

// =========================
// 3) API: dashboards tersimpan
// =========================
app.get("/api/dashboards", (req, res) => {
  const rows = db
    .prepare(
      "SELECT id, name, country, indicator, created_at FROM dashboards ORDER BY id DESC"
    )
    .all();
  res.json(rows);
});

app.post("/api/dashboards", (req, res) => {
  const { name, country, indicator } = req.body;

  if (!name || !country || !indicator) {
    return res
      .status(400)
      .json({ error: "name, country, dan indicator wajib diisi" });
  }
  
  // hapus satu dashboard
app.delete("/api/dashboards/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!id) {
    return res.status(400).json({ error: "ID tidak valid" });
  }

  const stmt = db.prepare("DELETE FROM dashboards WHERE id = ?");
  const info = stmt.run(id);

  if (info.changes === 0) {
    return res
      .status(404)
      .json({ error: "Dashboard tidak ditemukan" });
  }

  res.json({ success: true });
});


  const stmt = db.prepare(`
    INSERT INTO dashboards (name, country, indicator, created_at)
    VALUES (?, ?, ?, datetime('now', 'localtime'))
  `);

  const info = stmt.run(name, country, indicator);

  const row = db
    .prepare(
      "SELECT id, name, country, indicator, created_at FROM dashboards WHERE id = ?"
    )
    .get(info.lastInsertRowid);

  res.status(201).json(row);
});

// start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
