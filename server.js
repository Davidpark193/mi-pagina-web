const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;   // ← Muy importante

app.use(cors());
app.use(express.json());

// Servir archivos estáticos del frontend (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '..')));  // sube un nivel

// Tus rutas API...
app.get('/api/semanas', (req, res) => { ... });
app.post('/api/semanas', (req, res) => { ... });
app.delete('/api/semanas/:id', (req, res) => { ... });

// Ruta catch-all para SPA (importante)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

app.listen(PORT, '0.0.0.0', () => {   // ← 0.0.0.0 es clave en Railway
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});