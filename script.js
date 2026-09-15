// ============================================================
// Sistema de Gestión de Equipos y Componentes Informáticos
// Lógica de la aplicación: conexión, CRUD, validaciones,
// búsqueda y filtrado.
// ============================================================

// ---------- 1. Conexión con Supabase ----------
// window.supabase viene de la librería @supabase/supabase-js
// cargada en index.html. Creamos el cliente con la URL y la
// clave anon definidas en config.js
const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const TABLA = "componentes";

// ---------- 2. Referencias al DOM ----------
const form = document.getElementById("form-componente");
const btnSubmit = document.getElementById("btn-submit");
const btnCancelar = document.getElementById("btn-cancelar");
const tablaBody = document.getElementById("tabla-body");
const contador = document.getElementById("contador");
const connStatus = document.getElementById("conn-status");

const campos = {
  id: document.getElementById("f-id"),
  codigo: document.getElementById("f-codigo"),
  nombre: document.getElementById("f-nombre"),
  categoria: document.getElementById("f-categoria"),
  marca: document.getElementById("f-marca"),
  cantidad: document.getElementById("f-cantidad"),
  estado: document.getElementById("f-estado"),
  descripcion: document.getElementById("f-descripcion"),
};

const buscarInput = document.getElementById("f-buscar");
const filtroCategoria = document.getElementById("f-filtro-categoria");
const filtroEstado = document.getElementById("f-filtro-estado");

const modal = document.getElementById("modal-confirmar");
const modalTexto = document.getElementById("modal-texto");
const modalCancelar = document.getElementById("modal-cancelar");
const modalConfirmarBtn = document.getElementById("modal-confirmar-btn");

const toast = document.getElementById("toast");

// Guarda en memoria la última lista traída de la base, así los
// filtros y la búsqueda no necesitan volver a consultar el
// servidor cada vez que el usuario tipea.
let registros = [];
let idPendienteEliminar = null;

// ============================================================
// 3. Cargar datos (Listado / Consultar)
// ============================================================
async function cargarComponentes() {
  tablaBody.innerHTML = `<tr><td colspan="7" class="tabla-vacia">Cargando datos…</td></tr>`;

  const { data, error } = await client
    .from(TABLA)
    .select("*")
    .order("fecha_registro", { ascending: false });

  if (error) {
    marcarConexion(false);
    mostrarToast("No se pudo conectar con Supabase: " + error.message, true);
    tablaBody.innerHTML = `<tr><td colspan="7" class="tabla-vacia">Error al cargar los datos.</td></tr>`;
    return;
  }

  marcarConexion(true);
  registros = data;
  renderizarTabla();
}

function marcarConexion(ok) {
  connStatus.innerHTML = ok
    ? `<span class="dot dot--ok"></span> conectado a Supabase`
    : `<span class="dot dot--error"></span> sin conexión`;
}

// ============================================================
// 4. Renderizado de la tabla aplicando búsqueda + filtros
// ============================================================
function renderizarTabla() {
  const texto = buscarInput.value.trim().toLowerCase();
  const categoria = filtroCategoria.value;
  const estado = filtroEstado.value;

  const filtrados = registros.filter((r) => {
    const coincideTexto =
      !texto ||
      r.codigo.toLowerCase().includes(texto) ||
      r.nombre.toLowerCase().includes(texto) ||
      (r.marca || "").toLowerCase().includes(texto);

    const coincideCategoria = !categoria || r.categoria === categoria;
    const coincideEstado = !estado || r.estado === estado;

    return coincideTexto && coincideCategoria && coincideEstado;
  });

  contador.textContent = `${filtrados.length} registro${filtrados.length === 1 ? "" : "s"}`;

  if (filtrados.length === 0) {
    tablaBody.innerHTML = `<tr><td colspan="7" class="tabla-vacia">No se encontraron componentes.</td></tr>`;
    return;
  }

  tablaBody.innerHTML = filtrados
    .map(
      (r) => `
    <tr>
      <td class="codigo-cell">${escapeHtml(r.codigo)}</td>
      <td>${escapeHtml(r.nombre)}</td>
      <td>${escapeHtml(r.categoria)}</td>
      <td>${escapeHtml(r.marca || "—")}</td>
      <td>${r.cantidad}</td>
      <td>${pillEstado(r.estado)}</td>
      <td class="acciones-cell">
        <button class="btn btn--icon" data-accion="editar" data-id="${r.id}">Editar</button>
        <button class="btn btn--icon danger" data-accion="eliminar" data-id="${r.id}">Eliminar</button>
      </td>
    </tr>`
    )
    .join("");
}

function pillEstado(estado) {
  const clase =
    {
      Disponible: "disponible",
      "En uso": "enuso",
      Reparación: "reparacion",
      Baja: "baja",
    }[estado] || "enuso";
  return `<span class="estado-pill estado-pill--${clase}">${estado}</span>`;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

// ============================================================
// 5. Validaciones del formulario (Alta / Modificación)
// ============================================================
function validarFormulario() {
  let valido = true;
  limpiarErrores();

  if (!campos.codigo.value.trim()) {
    marcarError("codigo", "El código es obligatorio.");
    valido = false;
  }
  if (!campos.nombre.value.trim()) {
    marcarError("nombre", "El nombre es obligatorio.");
    valido = false;
  }
  if (!campos.categoria.value) {
    marcarError("categoria", "Seleccioná una categoría.");
    valido = false;
  }
  if (campos.cantidad.value === "" || isNaN(campos.cantidad.value) || Number(campos.cantidad.value) < 0) {
    marcarError("cantidad", "Ingresá un número válido (≥ 0).");
    valido = false;
  }
  if (!campos.estado.value) {
    marcarError("estado", "Seleccioná un estado.");
    valido = false;
  }

  return valido;
}

function marcarError(campo, mensaje) {
  document.getElementById(`err-${campo}`).textContent = mensaje;
  campos[campo].classList.add("invalid");
}

function limpiarErrores() {
  document.querySelectorAll(".field__error").forEach((e) => (e.textContent = ""));
  document.querySelectorAll("input, select").forEach((e) => e.classList.remove("invalid"));
}

// ============================================================
// 6. Alta / Modificación (Crear y Actualizar)
// ============================================================
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!validarFormulario()) return;

  const payload = {
    codigo: campos.codigo.value.trim(),
    nombre: campos.nombre.value.trim(),
    categoria: campos.categoria.value,
    marca: campos.marca.value.trim() || null,
    cantidad: Number(campos.cantidad.value),
    estado: campos.estado.value,
    descripcion: campos.descripcion.value.trim() || null,
  };

  btnSubmit.disabled = true;
  const idEditando = campos.id.value;

  let error;
  if (idEditando) {
    // UPDATE: identificamos el registro por su id (uuid, clave primaria)
    ({ error } = await client.from(TABLA).update(payload).eq("id", idEditando));
  } else {
    // INSERT: alta de un nuevo registro
    ({ error } = await client.from(TABLA).insert(payload));
  }
  btnSubmit.disabled = false;

  if (error) {
    mostrarToast("Error al guardar: " + error.message, true);
    return;
  }

  mostrarToast(idEditando ? "Registro actualizado correctamente." : "Componente registrado correctamente.");
  resetFormulario();
  cargarComponentes();
});

btnCancelar.addEventListener("click", resetFormulario);

function resetFormulario() {
  form.reset();
  campos.id.value = "";
  limpiarErrores();
  btnSubmit.textContent = "Guardar registro";
  btnCancelar.hidden = true;
}

// ============================================================
// 7. Editar: carga los datos existentes en el formulario
// ============================================================
function cargarEnFormulario(id) {
  const r = registros.find((x) => x.id === id);
  if (!r) return;

  campos.id.value = r.id;
  campos.codigo.value = r.codigo;
  campos.nombre.value = r.nombre;
  campos.categoria.value = r.categoria;
  campos.marca.value = r.marca || "";
  campos.cantidad.value = r.cantidad;
  campos.estado.value = r.estado;
  campos.descripcion.value = r.descripcion || "";

  btnSubmit.textContent = "Actualizar registro";
  btnCancelar.hidden = false;
  form.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ============================================================
// 8. Eliminar (con confirmación previa)
// ============================================================
function pedirConfirmacionEliminar(id) {
  const r = registros.find((x) => x.id === id);
  idPendienteEliminar = id;
  modalTexto.textContent = `Se eliminará "${r ? r.nombre : "este componente"}" (${r ? r.codigo : ""}). Esta acción no se puede deshacer.`;
  modal.hidden = false;
}

modalCancelar.addEventListener("click", () => {
  idPendienteEliminar = null;
  modal.hidden = true;
});

modalConfirmarBtn.addEventListener("click", async () => {
  if (!idPendienteEliminar) return;

  const { error } = await client.from(TABLA).delete().eq("id", idPendienteEliminar);
  modal.hidden = true;

  if (error) {
    mostrarToast("Error al eliminar: " + error.message, true);
    return;
  }

  mostrarToast("Registro eliminado.");
  idPendienteEliminar = null;
  cargarComponentes();
});

// ============================================================
// 9. Delegación de eventos para los botones de la tabla
// ============================================================
tablaBody.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-accion]");
  if (!btn) return;
  const id = btn.dataset.id;

  if (btn.dataset.accion === "editar") cargarEnFormulario(id);
  if (btn.dataset.accion === "eliminar") pedirConfirmacionEliminar(id);
});

// ============================================================
// 10. Búsqueda y filtrado en vivo
// ============================================================
buscarInput.addEventListener("input", renderizarTabla);
filtroCategoria.addEventListener("change", renderizarTabla);
filtroEstado.addEventListener("change", renderizarTabla);

// ============================================================
// 11. Mensajes de éxito / error (toast)
// ============================================================
let toastTimeout;
function mostrarToast(mensaje, esError = false) {
  clearTimeout(toastTimeout);
  toast.textContent = mensaje;
  toast.classList.toggle("toast--error", esError);
  toast.hidden = false;
  toastTimeout = setTimeout(() => (toast.hidden = true), 3500);
}

// ============================================================
// 12. Inicio
// ============================================================
cargarComponentes();
