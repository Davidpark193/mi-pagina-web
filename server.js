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

// 🔥 CONEXIÓN CORRECTA A RAILWAY
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

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
    console.error(err);
    res.json({ success: false });
  }
});

// ================= LISTAR =================
app.get("/api/semanas", async (req, res) => {
  const result = await pool.query("SELECT * FROM semanas ORDER BY id DESC");
  res.json(result.rows);
});

// ================= DETALLE =================
app.get("/api/semanas/:id", async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM detalles WHERE semana_id=$1",
    [req.params.id]
  );
  res.json(result.rows);
});

// ================= ELIMINAR =================
app.delete("/api/semanas/:id", async (req, res) => {
  await pool.query("DELETE FROM detalles WHERE semana_id=$1", [req.params.id]);
  await pool.query("DELETE FROM semanas WHERE id=$1", [req.params.id]);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log("Servidor corriendo en puerto " + PORT);
});