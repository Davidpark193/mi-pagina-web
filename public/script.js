// ====================== script.js - TU CÓDIGO ORIGINAL + EXPORTACIÓN ARREGLADA ======================

const meses = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];

const listaTareas = [
  "Instalación de plywood (paredes, pisos, techos)", "Corte y ajuste de madera", "Marcando y trazando lo que se va a hacer",
  "Instalación de siding", "Framing de paredes", "Framing de techos (ceiling)", "Instalación de vigas y soportes",
  "Nivelación y alineación", "Instalación de ventanas", "Instalación de puertas", "Instalación de trims (molduras)",
  "Instalación de marcos de puertas/ventanas", "Armando closets", "Armando estructuras internas", "Instalación de drywall",
  "Preparación de superficies", "Ajustes y modificaciones", "Reparando / arreglando (según trabajo)", "Colocando insulation",
  "Colocando spray foam en ventanas, puertas u openings", "Aplicación de adhesivos y fijaciones", "Instalación de herrajes (bisagras, tornillos, etc.)",
  "Descarga de materiales", "Transporte de herramientas/materiales", "Organización de materiales", "Limpieza del área de trabajo",
  "Retiro de escombros", "Corrección de detalles", "Instalación de cajones", "Instalación de tracks de cajones",
  "Framing de deck", "Framing de basement"
];

let dropdownAbierto = null;
let semanaBase = new Date();
let cargandoLocal = false;

// ==================== AUTOGUARDADO LOCAL ====================
function guardarLocal() {
  if (cargandoLocal) return;
  const data = {
    semanaBase: semanaBase.toISOString(),
    month: document.getElementById("month")?.value || "",
    total: document.getElementById("total")?.getAttribute("data-total") || document.getElementById("total")?.innerText || "0.0",
    rows: []
  };
  document.querySelectorAll("#body tr").forEach(tr => {
    const placeSelect = tr.querySelector("select");
    const placeEditable = tr.cells[1]?.querySelector(".editable");
    const taskInput = tr.querySelector(".task-search-input");
    const horasCell = tr.querySelector(".horas");
    data.rows.push({
      date: tr.cells[0]?.innerText.trim() || "",
      placeSelect: placeSelect?.value || "",
      placeText: placeEditable?.innerText.trim() || "",
      task: taskInput?.value.trim() || "",
      time: tr.cells[3]?.innerText.trim() || "",
      hours: horasCell?.innerText.trim() || "0.0",
      manual: horasCell?.dataset.manual === "true"
    });
  });
  localStorage.setItem("semana_actual_payroll", JSON.stringify(data));
}

function cargarLocal() {
  const saved = localStorage.getItem("semana_actual_payroll");
  if (!saved) return;
  try {
    cargandoLocal = true;
    const data = JSON.parse(saved);
    if (data.semanaBase) semanaBase = new Date(data.semanaBase);
    const filas = document.querySelectorAll("#body tr");
    data.rows?.forEach((row, index) => {
      const tr = filas[index];
      if (!tr) return;
      if (tr.cells[0]) tr.cells[0].innerText = row.date || "";
      const select = tr.querySelector("select");
      if (select && row.placeSelect) select.value = row.placeSelect;
      const placeEditable = tr.cells[1]?.querySelector(".editable");
      if (placeEditable) placeEditable.innerText = row.placeText || "";
      const taskInput = tr.querySelector(".task-search-input");
      if (taskInput) taskInput.value = row.task || "";
      if (tr.cells[3]) tr.cells[3].innerText = row.time || "";
      const horasCell = tr.querySelector(".horas");
      if (horasCell) {
        horasCell.innerText = row.hours || "0.0";
        if (row.manual) horasCell.dataset.manual = "true";
        else delete horasCell.dataset.manual;
      }
    });
    if (data.month) {
      const monthEl = document.getElementById("month");
      if (monthEl) monthEl.value = data.month;
    }
    const totalEl = document.getElementById("total");
    if (totalEl) {
      const total = data.total || "0.0";
      totalEl.setAttribute("data-total", total);
      totalEl.innerText = parseFloat(total).toFixed(1);
    }
    calcularHoras(false);
  } catch (error) {
    console.error("Error cargando guardado local:", error);
  } finally {
    cargandoLocal = false;
  }
}

function limpiarGuardadoLocal() {
  localStorage.removeItem("semana_actual_payroll");
}

function activarAutoGuardado() {
  document.addEventListener("input", () => { guardarLocal(); });
  document.addEventListener("change", () => { guardarLocal(); });
}

// ==================== FUNCIONES ORIGINALES ====================
function fechaUSA(fecha) {
  return fecha.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function actualizarMes(lunes) {
  let domingo = new Date(lunes);
  domingo.setDate(lunes.getDate() + 6);
  let mesInicio = meses[lunes.getMonth()];
  let mesFin = meses[domingo.getMonth()];
  let resultado = (mesInicio === mesFin) ? mesInicio : mesInicio + " - " + mesFin;
  document.getElementById("month").value = resultado;
}

function generarSemana() {
  const body = document.getElementById("body");
  body.innerHTML = "";

  let lunes = new Date(semanaBase);
  lunes.setHours(0, 0, 0, 0);
  const dia = lunes.getDay();
  const diff = lunes.getDate() - dia + (dia === 0 ? -6 : 1);
  lunes.setDate(diff);

  actualizarMes(lunes);

  for (let i = 0; i < 7; i++) {
    let d = new Date(lunes);
    d.setDate(lunes.getDate() + i);

    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="px-6 py-5 font-medium">${fechaUSA(d)}</td>
      <td class="px-6 py-5">
        <div class="flex gap-3 items-center">
          <select class="bg-slate-800 text-white rounded-3xl px-4 py-3 text-sm flex-1">
            <option>HOUSE 34 Seaview Montauk</option>
            <option>HOUSE 34 Seaside Montauk</option>
            <option>HOUSE 73 Seaview Montauk</option>
            <option>HOUSE 69 Kettle Hole Rd Montauk</option>
            <option>HOUSE 19 Roberson Blv Sag Harbor</option>
            <option>HOUSE 35 Old Mtk Hwy Amagansett</option>
            <option>HOUSE 200 Bluff Rd Amagansett</option>
            <option>HOUSE 35 Mc Elnea St East Hampton</option>
            <option>HOUSE 16 Sanger Pl Montauk</option>
            <option>HOUSE 124 Old West Lake Montauk</option>
            <option>HOUSE 142 Bull Path East Hampton</option>
            <option>HOUSE 41 Montauk Ave Sag Harbor</option>
            <option>HOUSE 23 Roberson Blv Sag Harbor</option>
            <option>HOUSE 34 High St</option>
            <option>HOUSE 34 Montauk</option>
            <option>HOUSE 69 Montauk</option>
            <option>Other Location</option>
          </select>
          <button onclick="obtenerDireccion(this)" class="loc-btn w-10 h-10 flex items-center justify-center text-xl">📍</button>
        </div>
        <div contenteditable="true" class="editable mt-3 text-slate-300 text-sm min-h-[42px] px-4 py-2 rounded-3xl border border-transparent focus:border-indigo-400"></div>
      </td>
      <td class="px-6 py-5">
        <div class="task-search-container relative">
          <input type="text" class="task-search-input" placeholder="Buscar o escribir tarea..." 
                 onfocus="mostrarOpciones(this)" oninput="filtrarOpciones(this); limpiarHorasAlEscribir(this)">
          <div class="task-options hidden absolute w-full mt-2 z-50"></div>
        </div>
      </td>
      <td contenteditable="true" class="editable text-center px-6 py-5 font-medium" oninput="calcularHoras()"></td>
      <td contenteditable="true" class="horas text-center px-6 py-5 font-bold text-emerald-400 text-xl" oninput="marcarManual(this)">0.0</td>
    `;
    body.appendChild(row);

    const input = row.querySelector('.task-search-input');
    input.addEventListener('blur', () => {
      setTimeout(() => {
        if (document.activeElement.closest('.task-search-container') === null) {
          cerrarTodosLosDropdowns();
        }
      }, 150);
    });
  }
}

// ==================== EL RESTO DE TU CÓDIGO ORIGINAL ====================
function resetearSemanaActual() {
  if (!confirm("¿Reiniciar la semana actual? Se borrará el avance guardado localmente.")) return;
  semanaBase = new Date();
  limpiarGuardadoLocal();
  generarSemana();
  alert("✅ Semana reiniciada a la actual");
}

function obtenerDireccion(btn) { /* tu código original */ 
  if (!navigator.geolocation) { alert("Geolocation not supported"); return; }
  btn.innerHTML = "⏳";
  navigator.geolocation.getCurrentPosition(async (pos) => {
    try {
      const { latitude: lat, longitude: lon } = pos.coords;
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18`);
      const data = await res.json();
      const addr = data.address || {};
      const direccionBonita = [addr.road || addr.residential || "", addr.city || addr.town || addr.village || "", addr.country || ""].filter(Boolean).join(", ");
      btn.parentElement.parentElement.querySelector(".editable").innerText = direccionBonita || "Location captured";
      guardarLocal();
    } catch (e) {
      btn.parentElement.parentElement.querySelector(".editable").innerText = "Could not get address";
      guardarLocal();
    }
    btn.innerHTML = "📍";
  }, () => { alert("Location access denied"); btn.innerHTML = "📍"; });
}

// Buscador de tareas (completo)
function cerrarTodosLosDropdowns() {
  document.querySelectorAll('.task-options').forEach(opt => { opt.style.display = 'none'; });
  dropdownAbierto = null;
}

function mostrarOpciones(input) { /* tu código original */ 
  const container = input.parentElement;
  const optionsDiv = container.querySelector('.task-options');
  cerrarTodosLosDropdowns();
  dropdownAbierto = optionsDiv;
  optionsDiv.innerHTML = '';
  optionsDiv.style.display = 'block';
  listaTareas.forEach(tarea => {
    const div = document.createElement('div');
    div.className = 'task-option px-5 py-3 hover:bg-indigo-500/20 text-slate-200 cursor-pointer text-sm';
    div.textContent = tarea;
    div.onclick = () => seleccionarTarea(input, tarea);
    optionsDiv.appendChild(div);
  });
}

function filtrarOpciones(input) { /* tu código original */ 
  const container = input.parentElement;
  const optionsDiv = container.querySelector('.task-options');
  const filtro = input.value.toLowerCase().trim();
  optionsDiv.innerHTML = '';
  const filtradas = listaTareas.filter(tarea => tarea.toLowerCase().includes(filtro));
  if (filtradas.length > 0) {
    filtradas.forEach(tarea => {
      const div = document.createElement('div');
      div.className = 'task-option px-5 py-3 hover:bg-indigo-500/20 text-slate-200 cursor-pointer text-sm';
      div.textContent = tarea;
      div.onclick = () => seleccionarTarea(input, tarea);
      optionsDiv.appendChild(div);
    });
  } else if (filtro !== '') {
    const customDiv = document.createElement('div');
    customDiv.className = 'task-option custom px-5 py-3 italic text-slate-400 cursor-pointer';
    customDiv.textContent = `Usar: "${filtro}"`;
    customDiv.onclick = () => seleccionarTarea(input, filtro);
    optionsDiv.appendChild(customDiv);
  }
  optionsDiv.style.display = 'block';
}

function seleccionarTarea(input, texto) { /* tu código original */ 
  input.value = texto;
  const optionsDiv = input.parentElement.querySelector('.task-options');
  optionsDiv.style.display = 'none';
  dropdownAbierto = null;
  const row = input.closest('tr');
  const horasCell = row.querySelector(".horas");
  if (horasCell && horasCell.dataset.manual !== "true") {
    horasCell.innerText = "0.0";
    delete horasCell.dataset.manual;
  }
  guardarLocal();
  const timeCell = row.cells[3];
  setTimeout(() => timeCell.focus(), 50);
}

function limpiarHorasAlEscribir(input) { /* tu código original */ 
  const row = input.closest('tr');
  const horasCell = row.querySelector(".horas");
  if (horasCell && horasCell.dataset.manual !== "true") {
    horasCell.innerText = "0.0";
  }
  guardarLocal();
}

function marcarManual(td) {
  td.dataset.manual = "true";
  guardarLocal();
}

function calcularHoras(guardar = true) { /* tu código original */ 
  let total = 0;
  document.querySelectorAll("#body tr").forEach(fila => {
    const horasCell = fila.querySelector(".horas");
    if (horasCell.dataset.manual === "true") {
      total += parseFloat(horasCell.innerText) || 0;
      return;
    }
    const texto = fila.cells[3].innerText.toLowerCase().trim();
    let suma = 0;
    const bloques = texto.split(",");
    bloques.forEach(b => {
      if (b.includes("-")) {
        let [inicio, fin] = b.split("-").map(x => x.trim());
        let h1 = convertir(inicio);
        let h2 = convertir(fin);
        if (h1 !== null && h2 !== null) {
          let minutosTotales = h2 - h1;
          let horas = minutosTotales / 60;
          if (horas < 0) horas += 24;
          const inicioEs30 = inicio.includes(":30");
          const finEs30 = fin.includes(":30");
          if (inicioEs30 && finEs30) horas -= 1;
          else if (inicioEs30 || finEs30) horas -= 0.5;
          suma += horas;
        }
      }
    });
    horasCell.innerText = suma.toFixed(1);
    total += suma;
  });
  const totalEl = document.getElementById("total");
  totalEl.setAttribute("data-total", total.toFixed(1));
  totalEl.innerText = total.toFixed(1);
  if (guardar) guardarLocal();
}

function convertir(hora) { /* tu código original */ 
  const m = hora.match(/(\d+):?(\d+)?\s*(am|pm)?/i);
  if (!m) return null;
  let h = parseInt(m[1]);
  let min = parseInt(m[2] || 0);
  const periodo = (m[3] || "").toLowerCase();
  if (periodo === "pm" && h !== 12) h += 12;
  if (periodo === "am" && h === 12) h = 0;
  return h * 60 + min;
}

async function guardarSemana() { /* tu código original */ 
  if (!confirm("¿Guardar esta semana y pasar a la siguiente?")) return;
  const month = document.getElementById("month").value;
  const rows = [];
  document.querySelectorAll("#body tr").forEach(tr => {
    const date = tr.cells[0].innerText.trim();
    const placeSelect = tr.querySelector("select");
    const placeEditable = tr.querySelector(".editable");
    const place = (placeEditable && placeEditable.innerText.trim()) || (placeSelect ? placeSelect.value : "");
    const taskInput = tr.querySelector('.task-search-input');
    const task = taskInput ? taskInput.value.trim() : "";
    const time = tr.cells[3].innerText.trim();
    const hours = parseFloat(tr.querySelector(".horas").innerText) || 0;
    rows.push({ date, place, task, time, hours });
  });
  const total_hours = parseFloat(document.getElementById("total").getAttribute("data-total")) || 0;
  try {
    const response = await fetch('/api/semanas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ month, rows, total_hours })
    });
    const data = await response.json();
    if (data.success) {
      alert("✅ Semana guardada correctamente en la base de datos");
      limpiarGuardadoLocal();
      semanaBase.setDate(semanaBase.getDate() + 7);
      generarSemana();
      guardarLocal();
    } else {
      alert("Error al guardar: " + (data.message || "Desconocido"));
    }
  } catch (error) {
    console.error(error);
    alert("❌ No se pudo conectar con el servidor.");
  }
}

// ==================== EXPORTAR PNG - ARREGLADO (LIMPIO) ====================
function descargar() {
  calcularHoras();
  const capture = document.getElementById("capture");

  html2canvas(capture, {
    scale: 3,
    backgroundColor: "#0f172a",
    logging: false,
    onclone: (clonedDoc) => {
      const clonedCapture = clonedDoc.getElementById("capture");

      // Header con nombre y mes
      const headerHTML = `
        <div style="padding: 30px 40px 20px; text-align: center; border-bottom: 4px solid #334155;">
          <div style="font-size: 26px; font-weight: 700; color: #e2e8f0;">Cristian Farez</div>
          <div style="font-size: 17px; color: #94a3b8; margin-top: 4px;">${document.getElementById("month").value || "APRIL - MAY"}</div>
        </div>`;
      clonedCapture.insertAdjacentHTML('afterbegin', headerHTML);

      // Limpiar filas
      clonedCapture.querySelectorAll("tr").forEach(tr => {
        const placeCell = tr.cells[1];
        if (placeCell) {
          const select = placeCell.querySelector("select");
          const editable = placeCell.querySelector(".editable");
          let text = (editable && editable.innerText.trim()) || (select && select.value) || "—";
          placeCell.innerHTML = `<div style="padding: 16px 20px; font-weight: 600; color: #e2e8f0;">${text}</div>`;
        }

        const taskCell = tr.cells[2];
        if (taskCell) {
          const input = taskCell.querySelector("input");
          let text = (input && input.value.trim()) || "—";
          taskCell.innerHTML = `<div style="padding: 16px 20px; color: #e2e8f0;">${text}</div>`;
        }

        const hoursCell = tr.cells[4];
        if (hoursCell) {
          hoursCell.style.fontSize = "1.5rem";
          hoursCell.style.fontWeight = "700";
          hoursCell.style.color = "#10b981";
          hoursCell.style.background = "transparent";
        }
      });
    }
  }).then(canvas => {
    const link = document.createElement("a");
    const monthValue = document.getElementById("month").value.replace(/\s+/g, '_') || "Semana";
    link.download = `Payroll_${monthValue}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
}

// ==================== MODALES (TU CÓDIGO ORIGINAL) ====================
async function verSemanasGuardadas() { /* tu código original */ }
async function eliminarSemana(id) { /* tu código original */ }
async function verDetallesSemana(id) { /* tu código original */ }
function descargarDetalle(id) { /* tu código original */ }
function cerrarModal() { /* tu código original */ }
function cerrarModalDetalle() { /* tu código original */ }

document.addEventListener('keydown', function(e) {
  if (e.key === "Escape") {
    cerrarModal();
    cerrarModalDetalle();
  }
});

// ==================== INICIO ====================
window.onload = () => {
  generarSemana();
  cargarLocal();
  activarAutoGuardado();
};