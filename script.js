/*
  Memorial IFRR - front-end
  Para habilitar envio e armazenamento real, configure as variáveis abaixo
  com o Project URL e a anon/public key do seu projeto Supabase.
  Nunca coloque uma service_role key no navegador.
*/
const SUPABASE_URL = "COLE_AQUI_A_URL_DO_PROJETO";
const SUPABASE_ANON_KEY = "COLE_AQUI_A_CHAVE_PUBLICA_ANON";
const STORAGE_BUCKET = "memorial-fotos";

const courses = ["Letras","TADS","Biologia","Educação Física","Saneamento Ambiental","Matemática","Gestão Hospitalar","Gestão de Turismo","Memória institucional / evento"];
const grid = document.getElementById("gallery-grid");
const statusEl = document.getElementById("gallery-status");
const emptyState = document.getElementById("empty-state");
const uploadForm = document.getElementById("upload-form");
const fileInput = document.getElementById("photo-file");
const fileName = document.getElementById("file-name");
const captionInput = document.getElementById("caption");
const captionCount = document.getElementById("caption-count");
const formMessage = document.getElementById("form-message");
const submitButton = document.getElementById("submit-button");
const photoDialog = document.getElementById("photo-dialog");
let supabaseClient = null;
let activeCourse = "Todos";
let memories = [];
let visibleMemories = [];
let activePhotoIndex = 0;
const connected = !SUPABASE_URL.startsWith("COLE_AQUI") && !SUPABASE_ANON_KEY.startsWith("COLE_AQUI");

if (connected && window.supabase) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[char]));
}

function formatYear(value) {
  return value ? String(value) : "Data não informada";
}

function demoMemories() {
  // Exemplos ilustrativos para visualizar o layout. Não são fotos reais do IFRR.
  return [
    {id:"demo1",course:"Biologia",caption:"Aprender também é descobrir o mundo ao nosso redor.",year:"Exemplo",contributor:"Memória ilustrativa",image_url:"https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=900&q=80",demo:true},
    {id:"demo2",course:"TADS",caption:"Ideias compartilhadas que viram projetos e novas possibilidades.",year:"Exemplo",contributor:"Memória ilustrativa",image_url:"https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",demo:true},
    {id:"demo3",course:"Educação Física",caption:"Movimento, parceria e espírito de equipe.",year:"Exemplo",contributor:"Memória ilustrativa",image_url:"https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&w=900&q=80",demo:true},
    {id:"demo4",course:"Letras",caption:"Palavras, encontros e histórias que ganham vida.",year:"Exemplo",contributor:"Memória ilustrativa",image_url:"https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=900&q=80",demo:true}
  ];
}

function renderGallery() {
  visibleMemories = memories.filter(item => activeCourse === "Todos" || item.course === activeCourse);
  grid.innerHTML = visibleMemories.map((item, index) => `
    <article class="memory-card" tabindex="0" role="button" aria-label="Abrir fotografia: ${escapeHtml(item.caption)}" data-index="${index}">
      <div class="memory-image-wrap">
        <img class="memory-image" src="${escapeHtml(item.image_url)}" alt="${escapeHtml(item.caption)}" loading="lazy">
        <span class="memory-course">${escapeHtml(item.course)}</span>
      </div>
      <div class="memory-info">
        <h3>${escapeHtml(item.caption)}</h3>
        <div class="memory-meta"><span>${escapeHtml(item.contributor || "Comunidade IFRR")}</span><span>${escapeHtml(formatYear(item.year))}</span></div>
      </div>
    </article>`).join("");
  grid.hidden = visibleMemories.length === 0;
  emptyState.hidden = visibleMemories.length !== 0;
  statusEl.textContent = connected
    ? `${visibleMemories.length} memória(s) publicada(s)${activeCourse !== "Todos" ? " em " + activeCourse : ""}.`
    : `Prévia demonstrativa: ${visibleMemories.length} cartões ilustrativos. Configure o Supabase para carregar e armazenar contribuições reais.`;
}

async function loadMemories() {
  if (!supabaseClient) {
    memories = demoMemories();
    statusEl.textContent = "Carregando prévia demonstrativa…";
    renderGallery();
    return;
  }
  statusEl.textContent = "Carregando memórias aprovadas…";
  const {data, error} = await supabaseClient.from("memories")
    .select("id,course,caption,memory_year,contributor,image_url,created_at")
    .eq("status","approved").order("created_at",{ascending:false});
  if (error) {
    statusEl.textContent = "Não foi possível carregar o memorial. Verifique a configuração do banco de dados.";
    console.error(error);
    memories = [];
  } else {
    memories = (data || []).map(row => ({...row, year:row.memory_year, image_url:row.image_url}));
  }
  renderGallery();
}

document.getElementById("course-filters").addEventListener("click", event => {
  const button = event.target.closest("[data-course]");
  if (!button) return;
  activeCourse = button.dataset.course;
  document.querySelectorAll(".filter-chip").forEach(chip => chip.classList.toggle("active", chip === button));
  renderGallery();
});

grid.addEventListener("click", event => {
  const card = event.target.closest(".memory-card");
  if (card) openPhoto(Number(card.dataset.index));
});
grid.addEventListener("keydown", event => {
  const card = event.target.closest(".memory-card");
  if (card && (event.key === "Enter" || event.key === " ")) {
    event.preventDefault(); openPhoto(Number(card.dataset.index));
  }
});

function openPhoto(index) {
  if (!visibleMemories.length) return;
  activePhotoIndex = (index + visibleMemories.length) % visibleMemories.length;
  const item = visibleMemories[activePhotoIndex];
  document.getElementById("dialog-image").src = item.image_url;
  document.getElementById("dialog-image").alt = item.caption;
  document.getElementById("dialog-course").textContent = item.course;
  document.getElementById("dialog-title").textContent = item.caption;
  document.getElementById("dialog-meta").textContent = `${item.contributor || "Comunidade IFRR"} • ${formatYear(item.year)}`;
  if (!photoDialog.open) photoDialog.showModal();
}
document.getElementById("dialog-close").addEventListener("click", () => photoDialog.close());
document.getElementById("dialog-prev").addEventListener("click", () => openPhoto(activePhotoIndex - 1));
document.getElementById("dialog-next").addEventListener("click", () => openPhoto(activePhotoIndex + 1));
photoDialog.addEventListener("click", event => { if (event.target === photoDialog) photoDialog.close(); });

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  fileName.textContent = file ? `${file.name} (${(file.size/1024/1024).toFixed(2)} MB)` : "Nenhum arquivo selecionado";
});
captionInput.addEventListener("input", () => captionCount.textContent = captionInput.value.length);

const dropZone = document.getElementById("upload-drop");
["dragenter","dragover"].forEach(type => dropZone.addEventListener(type, event => {
  event.preventDefault(); dropZone.classList.add("dragover");
}));
["dragleave","drop"].forEach(type => dropZone.addEventListener(type, event => {
  event.preventDefault(); dropZone.classList.remove("dragover");
}));
dropZone.addEventListener("drop", event => {
  const file = event.dataTransfer.files[0];
  if (!file) return;
  if (!["image/jpeg","image/png","image/webp"].includes(file.type) || file.size > 8*1024*1024) {
    showMessage("Escolha JPG, PNG ou WebP de até 8 MB.", true); return;
  }
  fileInput.files = event.dataTransfer.files;
  fileName.textContent = `${file.name} (${(file.size/1024/1024).toFixed(2)} MB)`;
});

function showMessage(message, isError = false) {
  formMessage.textContent = message;
  formMessage.className = `form-message ${isError ? "error" : "success"}`;
}

uploadForm.addEventListener("submit", async event => {
  event.preventDefault();
  formMessage.textContent = "";
  const file = fileInput.files[0];
  if (!file) return showMessage("Selecione uma fotografia antes de enviar.", true);
  if (!["image/jpeg","image/png","image/webp"].includes(file.type)) return showMessage("Formato não permitido. Use JPG, PNG ou WebP.", true);
  if (file.size > 8*1024*1024) return showMessage("A imagem deve ter no máximo 8 MB.", true);
  if (!supabaseClient) {
    return showMessage("O formulário está em modo de demonstração. Configure o Supabase (URL, chave pública, tabela e bucket) para receber e armazenar fotos de verdade.", true);
  }
  const course = document.getElementById("course").value;
  const caption = captionInput.value.trim();
  const yearValue = document.getElementById("memory-year").value;
  const contributor = document.getElementById("contributor").value.trim();
  if (!course || !caption) return showMessage("Preencha o curso e a legenda.", true);
  submitButton.disabled = true;
  submitButton.textContent = "Enviando…";
  try {
    const extension = file.name.split(".").pop().toLowerCase();
    const path = `${crypto.randomUUID()}.${extension}`;
    const {error:uploadError} = await supabaseClient.storage.from(STORAGE_BUCKET).upload(path, file, {
      cacheControl:"3600", upsert:false, contentType:file.type
    });
    if (uploadError) throw uploadError;
    const {data:publicData} = supabaseClient.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    const {error:insertError} = await supabaseClient.from("memories").insert({
      course, caption, memory_year:yearValue ? Number(yearValue) : null,
      contributor:contributor || null, image_url:publicData.publicUrl,
      storage_path:path, status:"pending", permission_confirmed:true
    });
    if (insertError) throw insertError;
    uploadForm.reset();
    fileName.textContent = "Nenhum arquivo selecionado";
    captionCount.textContent = "0";
    showMessage("Recebemos sua memória! Ela ficará aguardando análise antes de aparecer no memorial.");
  } catch (error) {
    console.error(error);
    showMessage("Não foi possível concluir o envio. Confira a configuração e as permissões do Supabase.", true);
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = 'Enviar para análise <span aria-hidden="true">↗</span>';
  }
});

loadMemories();
