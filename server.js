const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Servir archivos estáticos (tu HTML)
app.use(express.static(path.join(__dirname, "public")));

// Ruta de prueba
app.get("/api", (req, res) => {
    res.json({ mensaje: "Servidor funcionando 🚀" });
});

app.listen(PORT, () => {
    console.log("Servidor corriendo en puerto " + PORT);
});