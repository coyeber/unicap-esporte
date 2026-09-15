const adminToken = sessionStorage.getItem("unicap_admin_token") || "";
const adminSavedName = sessionStorage.getItem("unicap_admin_name") || "Administrador";
const $ = id => document.getElementById(id);
let adminData = null;

if(!adminToken){
  window.location.href = "./administrador.html";
}

function esc(value){
  return String(value ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;");
}

function toast(message, type="success"){
  const el = $("toast");
  el.textContent = message;
  el.className = `toast show ${type}`;
  setTimeout(() => el.className = "toast", 3200);
}

function dateLabel(value){
  if(!value) return "—";
  const d = new Date(value);
  if(Number.isNaN(d.getTime())) return String(value);
  return new Intl.DateTimeFormat("pt-BR", {dateStyle:"short", timeStyle:"short"}).format(d);
}

function initials(name){
  return String(name || "").split(/\s+/).filter(Boolean).slice(0,2).map(p => p[0]).join("").toUpperCase() || "AT";
}

const panelMeta = {
  overview:["Administração","Visão geral"],
  teams:["Inscrições","Todas as equipes"],
  athletes:["Participantes","Todos os atletas"],
  updates:["Atualizações","Inscrições recentes"]
};

function setView(view){
  if(!panelMeta[view]) view = "overview";
  document.querySelectorAll(".admin-panel").forEach(panel => panel.hidden = panel.dataset.panel !== view);
  document.querySelectorAll(".admin-nav [data-view]").forEach(btn => btn.classList.toggle("active", btn.dataset.view === view));
  $("adminEyebrow").textContent = panelMeta[view][0];
  $("adminTitle").textContent = panelMeta[view][1];
  history.replaceState(null, "", `#${view}`);
  window.scrollTo({top:0,behavior:"smooth"});
}

document.querySelectorAll(".admin-nav [data-view]").forEach(btn => btn.addEventListener("click", () => setView(btn.dataset.view)));
$("adminName").textContent = adminSavedName;

async function loadAdmin(force=false){
  const button = $("adminRefresh");
  if(button) button.disabled = true;
  try{
    adminData = await unicapApi("adminDashboard", {token:adminToken});
    sessionStorage.setItem("unicap_admin_name", adminData.nome || adminSavedName);
    $("adminName").textContent = adminData.nome || adminSavedName;
    renderAll();
    if(force) toast("Dados atualizados.");
  }catch(err){
    const message = err instanceof Error ? err.message : "Não foi possível carregar o painel.";
    if(/sessão|administrador/i.test(message) && /expirada|inválida|acesso/i.test(message)){
      sessionStorage.removeItem("unicap_admin_token");
      sessionStorage.removeItem("unicap_admin_name");
      toast(message,"error");
      setTimeout(() => window.location.href = "./administrador.html", 1200);
      return;
    }
    toast(message,"error");
    ["adminTeams","adminAthletes","overviewRecent","sportSummary","adminUpdates"].forEach(id => {
      if($(id)) $(id).innerHTML = `<div class="admin-empty"><div><strong>Não foi possível carregar.</strong><span>${esc(message)}</span></div></div>`;
    });
  }finally{
    if(button) button.disabled = false;
  }
}

function fillSportSelects(){
  const sports = Object.keys(adminData?.modalidades || {}).sort((a,b)=>a.localeCompare(b,"pt-BR"));
  ["teamSport","athleteSport"].forEach(id => {
    const select = $(id);
    const current = select.value;
    select.innerHTML = `<option value="">Todas as modalidades</option>` + sports.map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join("");
    if(sports.includes(current)) select.value = current;
  });
}

function renderAll(){
  const r = adminData?.resumo || {};
  $("statTeams").textContent = r.equipes ?? 0;
  $("statAthletes").textContent = r.atletas ?? 0;
  $("statOfficial").textContent = r.oficiais ?? 0;
  $("statIndependent").textContent = r.independentes ?? 0;
  $("statSports").textContent = r.modalidades ?? 0;
  $("statAthletics").textContent = r.atleticas ?? 0;
  fillSportSelects();
  renderSportSummary();
  renderRecent("overviewRecent", (adminData.recentes || []).slice(0,8));
  renderRecent("adminUpdates", adminData.recentes || []);
  renderTeams();
  renderAthletes();
}

function renderSportSummary(){
  const root = $("sportSummary");
  const entries = Object.entries(adminData?.modalidades || {}).sort((a,b)=>b[1]-a[1]);
  if(!entries.length){
    root.innerHTML = '<div class="admin-empty"><div><strong>Nenhuma inscrição ainda.</strong><span>As modalidades aparecerão quando houver equipes.</span></div></div>';
    return;
  }
  root.innerHTML = entries.map(([name,total]) => `<div class="admin-sport-row"><strong>${esc(name)}</strong><span>${esc(total)} equipe${total===1?"":"s"}</span></div>`).join("");
}

function renderRecent(id, list){
  const root = $(id);
  if(!root) return;
  if(!list.length){
    root.innerHTML = '<div class="admin-empty"><div><strong>Nenhuma atualização.</strong><span>As novas inscrições aparecerão aqui.</span></div></div>';
    return;
  }
  root.innerHTML = list.map(item => `
    <div class="admin-recent-item">
      <div class="admin-recent-icon">${item.tipo === "INDEPENDENTE" ? "IND" : "ATL"}</div>
      <div><strong>${esc(item.nomeEquipe)}</strong><span>${esc(item.modalidade)} · ${esc(item.origem)} · ${esc(item.atletas)} atleta${item.atletas===1?"":"s"}</span></div>
      <time>${esc(dateLabel(item.dataHora))}</time>
    </div>`).join("");
}

function renderTeams(){
  const root = $("adminTeams");
  if(!root || !adminData) return;
  const q = String($("teamSearch")?.value || "").trim().toLowerCase();
  const type = $("teamType")?.value || "";
  const sport = $("teamSport")?.value || "";
  const list = (adminData.equipes || []).filter(t => {
    const hay = [t.nomeEquipe,t.modalidade,t.origem,t.cursoBase,t.responsavel,t.idEquipe,t.status].join(" ").toLowerCase();
    return (!q || hay.includes(q)) && (!type || t.tipo === type) && (!sport || t.modalidade === sport);
  });
  if(!list.length){
    root.innerHTML = '<div class="admin-empty"><div><strong>Nenhuma equipe encontrada.</strong><span>Altere os filtros ou aguarde novas inscrições.</span></div></div>';
    return;
  }
  root.innerHTML = `<div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Data</th><th>Equipe</th><th>Tipo</th><th>Origem</th><th>Modalidade</th><th>Responsável</th><th>Contato</th><th>Atletas</th><th>Status</th><th>ID</th></tr></thead><tbody>${list.map(t => `
    <tr>
      <td>${esc(dateLabel(t.dataHora))}</td>
      <td><strong>${esc(t.nomeEquipe)}</strong></td>
      <td><span class="admin-type ${t.tipo === "INDEPENDENTE" ? "ind" : ""}">${t.tipo === "INDEPENDENTE" ? "Independente" : "Atlética"}</span></td>
      <td>${esc(t.origem || t.cursoBase || "—")}</td>
      <td>${esc(t.modalidade)}</td>
      <td>${esc(t.responsavel || "—")}${t.responsavelRA ? `<br><small>R.A ${esc(t.responsavelRA)}</small>` : ""}</td>
      <td>${esc(t.responsavelTelefone || t.responsavelEmail || "—")}${t.responsavelTelefone && t.responsavelEmail ? `<br><small>${esc(t.responsavelEmail)}</small>` : ""}</td>
      <td>${esc(t.atletas)}</td>
      <td><span class="status-pill">${esc(t.status || "INSCRITA")}</span></td>
      <td><code>${esc(t.idEquipe)}</code></td>
    </tr>`).join("")}</tbody></table></div>`;
}

function renderAthletes(){
  const root = $("adminAthletes");
  if(!root || !adminData) return;
  const q = String($("athleteAdminSearch")?.value || "").trim().toLowerCase();
  const type = $("athleteType")?.value || "";
  const sport = $("athleteSport")?.value || "";
  const list = (adminData.atletas || []).filter(a => {
    const hay = [a.nome,a.ra,a.curso,a.equipe,a.modalidade,a.origem,a.vinculo,a.status].join(" ").toLowerCase();
    return (!q || hay.includes(q)) && (!type || a.tipo === type) && (!sport || a.modalidade === sport);
  });
  if(!list.length){
    root.innerHTML = '<div class="admin-empty"><div><strong>Nenhum atleta encontrado.</strong><span>Altere os filtros ou aguarde novas inscrições.</span></div></div>';
    return;
  }
  root.innerHTML = `<div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Atleta</th><th>R.A / Matrícula</th><th>Telefone</th><th>Curso</th><th>Equipe</th><th>Modalidade</th><th>Origem</th><th>Vínculo</th><th>Status</th></tr></thead><tbody>${list.map(a => `
    <tr>
      <td><div class="athlete-name-cell"><span class="avatar small">${initials(a.nome)}</span><strong>${esc(a.nome)}</strong></div></td>
      <td>${esc(a.ra || "—")}</td>
      <td>${esc(a.telefone || "—")}</td>
      <td>${esc(a.curso || "—")}</td>
      <td>${esc(a.equipe || "—")}</td>
      <td>${esc(a.modalidade || "—")}</td>
      <td>${esc(a.origem || "—")}</td>
      <td>${esc(a.vinculo || "—")}</td>
      <td><span class="status-pill">${esc(a.status || "INSCRITA")}</span></td>
    </tr>`).join("")}</tbody></table></div>`;
}

["teamSearch","teamType","teamSport"].forEach(id => $(id)?.addEventListener("input", renderTeams));
["teamType","teamSport"].forEach(id => $(id)?.addEventListener("change", renderTeams));
["athleteAdminSearch","athleteType","athleteSport"].forEach(id => $(id)?.addEventListener("input", renderAthletes));
["athleteType","athleteSport"].forEach(id => $(id)?.addEventListener("change", renderAthletes));
$("adminRefresh").addEventListener("click", () => loadAdmin(true));

$("adminLogout").addEventListener("click", async () => {
  try{ await unicapApi("adminLogout", {token:adminToken}); }catch(_){ }
  sessionStorage.removeItem("unicap_admin_token");
  sessionStorage.removeItem("unicap_admin_name");
  window.location.href = "./administrador.html";
});

setView(location.hash.replace("#","") || "overview");
loadAdmin();
