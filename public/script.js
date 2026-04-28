const meses = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];

const listaTareas = [
  "Instalación de plywood (paredes, pisos, techos)",
  "Corte y ajuste de madera",
  "Marcando y trazando lo que se va a hacer",
  "Instalación de siding",
  "Framing de paredes",
  "Framing de techos (ceiling)",
  "Instalación de vigas y soportes",
  "Nivelación y alineación",
  "Instalación de ventanas",
  "Instalación de puertas",
  "Instalación de trims (molduras)",
  "Instalación de marcos de puertas/ventanas",
  "Armando closets",
  "Armando estructuras internas",
  "Instalación de drywall",
  "Preparación de superficies",
  "Ajustes y modificaciones",
  "Reparando / arreglando (según trabajo)",
  "Colocando insulation",
  "Colocando spray foam en ventanas, puertas u openings",
  "Aplicación de adhesivos y fijaciones",
  "Instalación de herrajes (bisagras, tornillos, etc.)",
  "Descarga de materiales",
  "Transporte de herramientas/materiales",
  "Organización de materiales",
  "Limpieza del área de trabajo",
  "Retiro de escombros",
  "Corrección de detalles",
  "Instalación de cajones",
  "Instalación de tracks de cajones",
  "Framing de deck",
  "Framing de basement"
];

// Variables globales
let dropdownAbierto = null;
let semanaBase = new Date();
let semanasGuardadas = JSON.parse(localStorage.getItem("semanasGuardadas")) || [];

// ==================== FUNCIONES ORIGINALES ====================

function fechaUSA(fecha) {
  return fecha.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

function actualizarMes(lunes) {
  let domingo = new Date(lunes);
  domingo.setDate(lunes.getDate() + 6);
  let mesInicio = meses[lunes.getMonth()];
  let mesFin = meses[domingo.getMonth()];
  let resultado = (mesInicio === mesFin) ? mesInicio : mesInicio + " - " + mesFin;
  document.getElementById("month").value = resultado;
}

// ==================== FUNCIÓN ACTUALIZADA CON TODAS LAS CASAS ====================
function generarSemana() {
  const body = document.getElementById("body");
  body.innerHTML = "";

  // === FORZAR INICIO DE SEMANA EN LUNES ===
  let lunes = new Date(semanaBase);
  lunes.setHours(0, 0, 0, 0); // Limpiar hora

  const dia = lunes.getDay();
  const diff = lunes.getDate() - dia + (dia === 0 ? -6 : 1); // Lunes
  lunes.setDate(diff);

  actualizarMes(lunes);

  for (let i = 0; i < 7; i++) {
    let d = new Date(lunes);
    d.setDate(lunes.getDate() + i);

    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="date-cell" contenteditable="true">${fechaUSA(d)}</td>
      <td>
        <div class="place-box">
          <select>
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
          <button class="loc-btn" onclick="obtenerDireccion(this)" title="Get current location">📍</button>
        </div>
        <div contenteditable="true" class="editable"></div>
      </td>
      <td>
        <div class="task-search-container">
          <input type="text" class="task-search-input" placeholder="Buscar o escribir tarea..." 
                 onfocus="mostrarOpciones(this)" oninput="filtrarOpciones(this); limpiarHorasAlEscribir(this)">
          <div class="task-options" style="display:none;"></div>
        </div>
      </td>
      <td contenteditable="true" class="editable" oninput="calcularHoras()"></td>
      <td contenteditable="true" class="horas" oninput="marcarManual(this)">0.0</td>
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

// Botón para resetear a la semana actual (útil cuando se desincroniza)
function resetearSemanaActual() {
  semanaBase = new Date();
  generarSemana();
  alert("✅ Semana reiniciada a la actual");
}

function obtenerDireccion(btn) {
  if (!navigator.geolocation) {
    alert("Geolocation not supported");
    return;
  }
  btn.innerHTML = "⏳";
  navigator.geolocation.getCurrentPosition(async (pos) => {
    try {
      const { latitude: lat, longitude: lon } = pos.coords;
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18`);
      const data = await res.json();
      const addr = data.address || {};
      const direccionBonita = [
        addr.road || addr.residential || "",
        addr.city || addr.town || addr.village || "",
        addr.country || ""
      ].filter(Boolean).join(", ");
      btn.parentElement.parentElement.querySelector(".editable").innerText = direccionBonita || "Location captured";
    } catch (e) {
      btn.parentElement.parentElement.querySelector(".editable").innerText = "Could not get address";
    }
    btn.innerHTML = "📍";
  }, () => {
    alert("Location access denied");
    btn.innerHTML = "📍";
  });
}

// ==================== BUSCADOR DE TAREAS ====================

function cerrarTodosLosDropdowns() {
  document.querySelectorAll('.task-options').forEach(opt => {
    opt.style.display = 'none';
  });
  dropdownAbierto = null;
}

function mostrarOpciones(input) {
  const container = input.parentElement;
  const optionsDiv = container.querySelector('.task-options');

  cerrarTodosLosDropdowns();
  dropdownAbierto = optionsDiv;

  optionsDiv.innerHTML = '';
  optionsDiv.style.display = 'block';

  listaTareas.forEach(tarea => {
    const div = document.createElement('div');
    div.className = 'task-option';
    div.textContent = tarea;
    div.onclick = () => seleccionarTarea(input, tarea);
    optionsDiv.appendChild(div);
  });
}

function filtrarOpciones(input) {
  const container = input.parentElement;
  const optionsDiv = container.querySelector('.task-options');
  const filtro = input.value.toLowerCase().trim();

  optionsDiv.innerHTML = '';

  const filtradas = listaTareas.filter(tarea => tarea.toLowerCase().includes(filtro));

  if (filtradas.length > 0) {
    filtradas.forEach(tarea => {
      const div = document.createElement('div');
      div.className = 'task-option';
      div.textContent = tarea;
      div.onclick = () => seleccionarTarea(input, tarea);
      optionsDiv.appendChild(div);
    });
  } else if (filtro !== '') {
    const customDiv = document.createElement('div');
    customDiv.className = 'task-option custom';
    customDiv.textContent = `Usar: "${filtro}"`;
    customDiv.onclick = () => seleccionarTarea(input, filtro);
    optionsDiv.appendChild(customDiv);
  }

  optionsDiv.style.display = 'block';
}

function seleccionarTarea(input, texto) {
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

  const timeCell = row.cells[3];
  setTimeout(() => timeCell.focus(), 50);
}

function limpiarHorasAlEscribir(input) {
  const row = input.closest('tr');
  const horasCell = row.querySelector(".horas");
  if (horasCell && horasCell.dataset.manual !== "true") {
    horasCell.innerText = "0.0";
  }
}

function marcarManual(td) {
  td.dataset.manual = "true";
}

// ==================== CALCULAR HORAS ====================

function calcularHoras() {
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
}

function convertir(hora) {
  const m = hora.match(/(\d+):?(\d+)?\s*(am|pm)?/i);
  if (!m) return null;
  let h = parseInt(m[1]);
  let min = parseInt(m[2] || 0);
  const periodo = (m[3] || "").toLowerCase();
  if (periodo === "pm" && h !== 12) h += 12;
  if (periodo === "am" && h === 12) h = 0;
  return h * 60 + min;
}

// ==================== GUARDAR SEMANA ====================
async function guardarSemana() {
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
      semanaBase.setDate(semanaBase.getDate() + 7);
      generarSemana();
    } else {
      alert("Error al guardar: " + (data.message || "Desconocido"));
    }
  } catch (error) {
    console.error(error);
    alert("❌ No se pudo conectar con el servidor.\nAsegúrate de que 'node server/server.js' esté corriendo.");
  }
}

// ==================== EXPORTAR PNG ====================
function descargar() {
    calcularHoras();

    const capture = document.getElementById("capture");

    html2canvas(capture, {
        scale: 3,
        backgroundColor: "#ffffff",
        logging: false,
        onclone: (clonedDoc) => {
            const clonedCapture = clonedDoc.getElementById("capture");
            if (!clonedCapture) return;

            clonedCapture.classList.add("export-mode");

            // === ANCHO OPTIMO PARA MÓVIL Y PC ===
            clonedCapture.style.width = "auto";
            clonedCapture.style.minWidth = "1080px";
            clonedCapture.style.maxWidth = "1380px";
            clonedCapture.style.margin = "0 auto";
            clonedCapture.style.padding = "32px 38px";
            clonedCapture.style.boxSizing = "border-box";
            clonedCapture.style.fontFamily = "Arial, sans-serif";

            const tabla = clonedCapture.querySelector("#tabla");
            if (tabla) {
                tabla.style.width = "100%";
                tabla.style.tableLayout = "fixed";
            }

            // === MEJORAR ENCABEZADOS ===
            const headers = clonedCapture.querySelectorAll("th");
            headers.forEach((th, index) => {
                th.style.textAlign = "center";
                th.style.verticalAlign = "middle";
                th.style.padding = "15px 10px";
                th.style.fontSize = "15.5px";
                th.style.fontWeight = "600";
            });

            limpiarParaExportarClonada(clonedCapture);
        }
    })
    .then(canvas => {
        const link = document.createElement("a");
        const monthValue = document.getElementById("month").value.replace(/\s+/g, '_') || "Semana";
        link.download = `Payroll_${monthValue}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
    })
    .catch(err => console.error(err));
}


function limpiarParaExportarClonada(captureElement) {
    const rows = captureElement.querySelectorAll("#tabla tbody tr");

    rows.forEach(fila => {
        // PLACE / LOCATION
        const select = fila.querySelector("select");
        const direccion = fila.querySelector(".editable");
        let textoLugar = (direccion && direccion.innerText.trim()) || (select && select.value) || "HOUSE 34 Seaview Montauk";

        const divLugar = document.createElement("div");
        divLugar.style.fontWeight = "600";
        divLugar.style.fontSize = "14px";
        divLugar.style.lineHeight = "1.4";
        divLugar.style.wordBreak = "break-word";
        divLugar.style.whiteSpace = "normal";
        divLugar.innerText = textoLugar;
        fila.cells[1].innerHTML = "";
        fila.cells[1].appendChild(divLugar);

        // TASK
        const taskInput = fila.querySelector(".task-search-input");
        if (taskInput) {
            let taskText = taskInput.value.trim() || "—";
            const divTask = document.createElement("div");
            divTask.style.fontWeight = "500";
            divTask.style.fontSize = "14px";
            divTask.style.lineHeight = "1.4";
            divTask.style.wordBreak = "break-word";
            divTask.style.whiteSpace = "normal";
            divTask.innerText = taskText;
            fila.cells[2].innerHTML = "";
            fila.cells[2].appendChild(divTask);
        }

        // TIME
        const timeCell = fila.cells[3];
        const timeText = timeCell.innerText.trim() || "—";
        const divTime = document.createElement("div");
        divTime.style.fontWeight = "500";
        divTime.style.fontSize = "14.5px";
        divTime.style.textAlign = "center";
        divTime.innerText = timeText;
        fila.cells[3].innerHTML = "";
        fila.cells[3].appendChild(divTime);

        // HOURS
        const hoursCell = fila.cells[4];
        if (hoursCell) {
            hoursCell.style.fontWeight = "700";
            hoursCell.style.textAlign = "center";
        }
    });

    const totalEl = captureElement.querySelector("#total");
    if (totalEl) {
        totalEl.style.fontSize = "18px";
        totalEl.style.fontWeight = "bold";
    }
}

// ==================== MODALES ====================
async function verSemanasGuardadas() {
  try {
    const response = await fetch('/api/semanas');
    const semanas = await response.json();

    let contenido = '';

    if (semanas.length === 0) {
      contenido = `<p style="text-align:center; padding:40px; color:#666;">No hay semanas guardadas todavía.</p>`;
    } else {
      semanas.forEach(semana => {
        contenido += `
          <div class="saved-week-item">
            <div>
              <strong>${semana.month}</strong><br>
              <small style="color:#666;">Guardado: ${semana.date_saved}</small>
            </div>
            <div class="actions">
              <button onclick="verDetallesSemana(${semana.id})" class="btn-detalle">Ver Detalles</button>
              <button onclick="eliminarSemana(${semana.id})" class="btn-eliminar">Eliminar</button>
            </div>
          </div>`;
      });
    }

    const modalHTML = `
      <div id="modal-semanas" class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Semanas Guardadas (${semanas.length})</h2>
            <button onclick="cerrarModal()" class="btn-close">✕</button>
          </div>
          <div class="modal-body">
            ${contenido}
          </div>
          <div class="modal-footer">
            <button onclick="cerrarModal()" class="btn-secondary">Cerrar</button>
          </div>
        </div>
      </div>
    `;

    if (document.getElementById('modal-semanas')) document.getElementById('modal-semanas').remove();
    document.body.insertAdjacentHTML('beforeend', modalHTML);

  } catch (error) {
    alert("No se pudo conectar con el servidor.\nAsegúrate de que 'node server/server.js' esté corriendo.");
  }
}

async function eliminarSemana(id) {
  if (!confirm("¿Estás seguro de que quieres eliminar esta semana?\nEsta acción no se puede deshacer.")) return;
  try {
    await fetch(`/api/semanas/${id}`, { method: 'DELETE' });
    alert("✅ Semana eliminada correctamente");
    verSemanasGuardadas();
  } catch (error) {
    alert("Error al eliminar la semana");
  }
}

async function verDetallesSemana(id) {
  try {
    const response = await fetch(`/api/semanas/${id}`);
    const data = await response.json();

    const rows = data.rows || data; // por si el backend devuelve diferente
    let filasHTML = '';
    let totalHoras = 0;

    rows.forEach(row => {
      const horas = parseFloat(row.hours) || 0;
      totalHoras += horas;

      filasHTML += `
        <tr>
          <td>${row.date || ''}</td>
          <td>${row.place || '—'}</td>
          <td>${row.task || '—'}</td>
          <td style="text-align:center;">${row.time || '—'}</td>
          <td style="text-align:center; font-weight:700; color:#10b981;">${horas.toFixed(1)}</td>
        </tr>`;
    });

    const detalleHTML = `
      <div id="modal-detalle" class="modal-overlay">
        <div class="modal-content detalle-modal">
          <div class="modal-header">
            <h2>Detalles de la Semana</h2>
            <button onclick="cerrarModalDetalle()" class="btn-close">✕</button>
          </div>
          <div class="modal-body">
            <table class="detalle-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Place / Location</th>
                  <th>Notes / Task</th>
                  <th>Time</th>
                  <th>Hours</th>
                </tr>
              </thead>
              <tbody>${filasHTML}</tbody>
            </table>

            <!-- TOTAL HOURS -->
            <div class="total-row-modal">
              <span class="total-label">Total Hours:</span>
              <span class="total-value">${totalHoras.toFixed(1)}</span>
            </div>
          </div>
          <div class="modal-footer">
            <button onclick="descargarDetalle(${id})" class="btn-success">
              📥 Descargar como PNG
            </button>
            <button onclick="cerrarModalDetalle()" class="btn-secondary">Volver</button>
          </div>
        </div>
      </div>
    `;

    if (document.getElementById('modal-detalle')) document.getElementById('modal-detalle').remove();
    document.body.insertAdjacentHTML('beforeend', detalleHTML);

  } catch (error) {
    console.error(error);
    alert("Error al cargar los detalles de la semana.");
  }
}

// Descargar solo el modal de detalles como PNG
function descargarDetalle(id) {
  const modal = document.getElementById('modal-detalle');
  if (!modal) return;

  html2canvas(modal, {
    scale: 3,
    backgroundColor: "#ffffff",
    logging: false,
    onclone: (clonedDoc) => {
      const clonedModal = clonedDoc.getElementById('modal-detalle');
      if (clonedModal) {
        clonedModal.style.width = "1100px";
        clonedModal.style.margin = "0 auto";
        clonedModal.style.padding = "20px";
      }
    }
  }).then(canvas => {
    const link = document.createElement("a");
    link.download = `Detalle_Semana_${id}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
}

function cerrarModal() {
  const modal = document.getElementById('modal-semanas');
  if (modal) modal.remove();
}

function cerrarModalDetalle() {
  const modal = document.getElementById('modal-detalle');
  if (modal) modal.remove();
}

document.addEventListener('keydown', function(e) {
  if (e.key === "Escape") {
    cerrarModal();
    cerrarModalDetalle();
  }
});

// Iniciar la aplicación
window.onload = generarSemana;