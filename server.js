const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// 🔥 CONEXIÓN A RAILWAY (AQUÍ ESTABA EL ERROR)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// 🔥 CREAR TABLAS AUTOMÁTICAMENTE
async function crearTablas() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS semanas (
        id SERIAL PRIMARY KEY,
        month TEXT,
        total_hours FLOAT,
        date_saved TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS detalles (
        id SERIAL PRIMARY KEY,
        semana_id INTEGER REFERENCES semanas(id) ON DELETE CASCADE,
        date TEXT,
        place TEXT,
        task TEXT,
        time TEXT,
        hours FLOAT
      );
    `);

    console.log("✅ Tablas creadas");
  } catch (error) {
    console.error("❌ Error creando tablas:", error);
  }
}

// 👇 IMPORTANTE: ejecutar después de crear pool
crearTablas();

// ================= GUARDAR =================
app.post("/api/semanas", async (req, res) => {
  try {
    const { month, rows, total_hours } = req.body;

    const result = await pool.query(
      "INSERT INTO semanas(month, total_hours) VALUES($1,$2) RETURNING id",
      [month, total_hours]
    );

    const semana_id = result.rows[0].id;

    for (let row of rows) {
      await pool.query(
        "INSERT INTO detalles(semana_id, date, place, task, time, hours) VALUES($1,$2,$3,$4,$5,$6)",
        [semana_id, row.date, row.place, row.task, row.time, row.hours]
      );
    }

    res.json({ success: true });

  } catch (err) {
    console.error("❌ ERROR GUARDAR:", err);
    res.json({ success: false, message: err.message });
  }
});

// ================= LISTAR =================
app.get("/api/semanas", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM semanas ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ ERROR LISTAR:", err);
    res.json([]);
  }
});

// ================= DETALLE =================
app.get("/api/semanas/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM detalles WHERE semana_id=$1",
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ ERROR DETALLE:", err);
    res.json([]);
  }
});

// ================= ELIMINAR =================
app.delete("/api/semanas/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM detalles WHERE semana_id=$1", [req.params.id]);
    await pool.query("DELETE FROM semanas WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ ERROR ELIMINAR:", err);
    res.json({ success: false });
  }
});

// ================= START SERVER =================
app.listen(PORT, () => {
  console.log("🚀 Servidor corriendo en puerto " + PORT);
});