const token = sessionStorage.getItem("unicap_creator_token") || "";
const creatorName = sessionStorage.getItem("unicap_creator_name") || "Criador de Equipe";
const creatorEmail = sessionStorage.getItem("unicap_creator_email") || "";

if(!token) window.location.href = "./criador.html";

let dashboardCache = null;
let activeTeamId = "";
const $ = id => document.getElementById(id);
const nums = v => String(v || "").replace(/\D/g, "");
const cpfMask = v => nums(v).slice(0,11)
  .replace(/(\d{3})(\d)/,"$1.$2")
  .replace(/(\d{3})(\d)/,"$1.$2")
  .replace(/(\d{3})(\d{1,2})$/,"$1-$2");
const phoneMask = v => nums(v).slice(0,11)
  .replace(/(\d{2})(\d)/,"($1) $2")
  .replace(/(\d{5})(\d{1,4})$/,"$1-$2");

function validCPF(cpf){
  const n = nums(cpf);
  if(n.length !== 11 || /^(\d)\1{10}$/.test(n)) return false;
  const calc = (b,f) => {
    let t = 0;
    for(const d of b) t += Number(d) * f--;
    const r = (t * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return calc(n.slice(0,9),10) === +n[9] && calc(n.slice(0,10),11) === +n[10];
}

function esc(v){
  return String(v ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;");
}

function initials(name){
  return String(name || "").split(/\s+/).filter(Boolean).slice(0,2).map(n => n[0]).join("").toUpperCase() || "AT";
}

function toast(msg, type="success"){
  const e = $("toast");
  e.textContent = msg;
  e.className = `toast show ${type}`;
  setTimeout(() => e.className = "toast", 3000);
}

$("sideCreator").textContent = creatorName;
$("sideUser").textContent = creatorName;
$("sideEmail").textContent = creatorEmail || "Equipe independente";

const panelMeta = {
  teams:{eyebrow:"Gestão da equipe", title:"Minhas equipes"},
  athletes:{eyebrow:"Gestão da equipe", title:"Atletas"},
  new:{eyebrow:"Nova inscrição", title:"Cadastrar equipe"},
  guidance:{eyebrow:"Suporte", title:"Orientações"}
};

function setView(view){
  if(!panelMeta[view]) view = "teams";
  document.querySelectorAll("[data-panel]").forEach(panel => panel.hidden = panel.dataset.panel !== view);
  document.querySelectorAll(".official-nav [data-view]").forEach(btn => btn.classList.toggle("active", btn.dataset.view === view));
  $("panelEyebrow").textContent = panelMeta[view].eyebrow;
  $("panelTitle").textContent = panelMeta[view].title;
  history.replaceState(null,"",`#${view}`);
  if(view === "teams" || view === "athletes") loadDashboard(false);
  window.scrollTo({top:0,behavior:"smooth"});
}

document.querySelectorAll(".official-nav [data-view]").forEach(btn => btn.addEventListener("click", () => setView(btn.dataset.view)));

async function loadDashboard(force=false){
  if(dashboardCache && !force){
    renderDashboard(dashboardCache);
    return;
  }
  try{
    dashboardCache = await unicapApi("creatorDashboard", {token});
    renderDashboard(dashboardCache);
  }catch(err){
    const message = err instanceof Error ? err.message : "Não foi possível carregar o painel.";
    if(/sessão/i.test(message)){
      sessionStorage.removeItem("unicap_creator_token");
      toast(message,"error");
      setTimeout(() => window.location.href = "./criador.html", 900);
      return;
    }
    $("teamList").innerHTML = `<div class="panel-empty error">${esc(message)}</div>`;
    $("athleteDirectory").innerHTML = `<div class="panel-empty error">${esc(message)}</div>`;
  }
}

function renderDashboard(data){
  $("dashTeams").textContent = data.equipes ?? 0;
  $("dashAthletes").textContent = data.atletas ?? 0;
  $("dashSports").textContent = Object.keys(data.modalidades || {}).length;
  renderTeams(data.listaEquipes || []);
  renderAthletesDirectory(data.listaAtletas || []);
}

function renderTeams(teams){
  const root = $("teamList");
  if(!teams.length){
    root.innerHTML = '<div class="panel-empty"><div><strong>Nenhuma equipe vinculada.</strong><span>Cadastre uma equipe independente para ela aparecer aqui.</span></div></div>';
    return;
  }
  root.innerHTML = `
    <div class="data-table-wrap">
      <table class="panel-table">
        <thead><tr><th>Equipe</th><th>Modalidade</th><th>Curso base</th><th>Atletas</th><th>Status</th><th>Ações</th></tr></thead>
        <tbody>${teams.map(t => `
          <tr>
            <td><strong>${esc(t.nomeEquipe)}</strong><br><code>${esc(t.idEquipe)}</code></td>
            <td>${esc(t.modalidade)}</td>
            <td>${esc(t.cursoBase || "—")}</td>
            <td>${esc(t.atletas)}</td>
            <td><span class="status-pill">${esc(t.status || "INSCRITA")}</span></td>
            <td><button class="table-action" type="button" data-manage-team="${esc(t.idEquipe)}">Gerenciar elenco</button></td>
          </tr>`).join("")}</tbody>
      </table>
    </div>`;
  root.querySelectorAll("[data-manage-team]").forEach(btn => btn.addEventListener("click", () => openRoster(btn.dataset.manageTeam)));
}

function renderAthletesDirectory(list){
  const root = $("athleteDirectory");
  const query = String($("athleteSearch")?.value || "").trim().toLowerCase();
  const filtered = list.filter(a => [a.nome,a.ra,a.curso,a.equipe,a.modalidade,a.vinculo].some(v => String(v || "").toLowerCase().includes(query)));
  $("athleteTotal").textContent = `${filtered.length} atleta${filtered.length === 1 ? "" : "s"}`;
  if(!filtered.length){
    root.innerHTML = '<div class="panel-empty"><div><strong>Nenhum atleta encontrado.</strong><span>Os participantes das suas equipes aparecerão aqui.</span></div></div>';
    return;
  }
  root.innerHTML = `
    <div class="data-table-wrap">
      <table class="panel-table">
        <thead><tr><th>Atleta</th><th>R.A</th><th>Curso</th><th>Equipe</th><th>Modalidade</th><th>Vínculo</th></tr></thead>
        <tbody>${filtered.map(a => `
          <tr>
            <td><div class="athlete-name-cell"><span class="avatar small">${initials(a.nome)}</span><strong>${esc(a.nome)}</strong></div></td>
            <td>${esc(a.ra || "—")}</td><td>${esc(a.curso || "—")}</td><td>${esc(a.equipe || "—")}</td><td>${esc(a.modalidade || "—")}</td><td>${esc(a.vinculo || "—")}</td>
          </tr>`).join("")}</tbody>
      </table>
    </div>`;
}

function openRoster(teamId){
  activeTeamId = teamId;
  renderRoster();
  $("rosterModal").hidden = false;
  document.body.classList.add("modal-open");
}

function closeRoster(){
  activeTeamId = "";
  $("rosterModal").hidden = true;
  document.body.classList.remove("modal-open");
}

function renderRoster(){
  const team = (dashboardCache?.listaEquipes || []).find(t => t.idEquipe === activeTeamId);
  const roster = (dashboardCache?.listaAtletas || []).filter(a => a.idEquipe === activeTeamId);
  if(!team) return closeRoster();
  $("rosterTitle").textContent = team.nomeEquipe || "Equipe";
  $("rosterSubtitle").textContent = `${team.modalidade || "Modalidade"} · ${team.cursoBase || "Equipe independente"}`;
  $("rosterCount").textContent = String(roster.length);
  $("rosterList").innerHTML = roster.map(a => `
    <div class="roster-athlete">
      <div class="avatar">${initials(a.nome)}</div>
      <div><strong>${esc(a.nome)}</strong><span>${esc(a.curso || "—")} · ${esc(a.vinculo || "—")}${a.ra ? ` · RA ${esc(a.ra)}` : ""}</span></div>
      <button type="button" class="roster-remove" data-remove-id="${esc(a.atletaId)}" data-remove-name="${esc(a.nome)}">Remover</button>
    </div>`).join("") || '<div class="panel-empty">Nenhum atleta nesta equipe.</div>';
  $("rosterList").querySelectorAll("[data-remove-id]").forEach(btn => btn.addEventListener("click", () => removeAthlete(btn.dataset.removeId, btn.dataset.removeName)));
}

async function removeAthlete(atletaId, nome){
  if(!confirm(`Remover ${nome || "este atleta"} da equipe?`)) return;
  try{
    const result = await unicapApi("manageIndependentTeam", {token, operacao:"remover", idEquipe:activeTeamId, atletaId});
    dashboardCache = result;
    renderDashboard(result);
    renderRoster();
    toast("Atleta removido do elenco.");
  }catch(err){
    toast(err instanceof Error ? err.message : "Não foi possível remover o atleta.","error");
  }
}

async function addAthlete(){
  const vinculo = $("manageVinculo").value;
  const atleta = {
    nome:$("manageNome").value.trim(),
    ra:$("manageRa").value.trim(),
    cpf:nums($("manageCpf").value),
    telefone:$("manageTel").value.trim(),
    curso:$("manageCurso").value.trim(),
    vinculo,
    autorizacao:$("manageAuth").value.trim()
  };
  if(!atleta.nome || !atleta.cpf){ toast("Preencha nome e CPF.","error"); return; }
  if(vinculo !== "Convidado extracurricular" && (!atleta.ra || !atleta.curso)){ toast("Aluno precisa de R.A e curso.","error"); return; }
  if(!validCPF(atleta.cpf)){ toast("CPF inválido.","error"); return; }
  if(vinculo === "Convidado extracurricular" && !atleta.autorizacao){ toast("Informe a autorização do convidado.","error"); return; }

  const button = $("manageAddAthlete");
  button.disabled = true;
  const original = button.textContent;
  button.textContent = "Adicionando...";
  try{
    const result = await unicapApi("manageIndependentTeam", {token, operacao:"adicionar", idEquipe:activeTeamId, atleta});
    dashboardCache = result;
    ["manageNome","manageRa","manageCpf","manageTel","manageCurso","manageAuth"].forEach(id => $(id).value = "");
    renderDashboard(result);
    renderRoster();
    toast("Atleta adicionado ao elenco.");
  }catch(err){
    toast(err instanceof Error ? err.message : "Não foi possível adicionar o atleta.","error");
  }finally{
    button.disabled = false;
    button.textContent = original;
  }
}

$("manageCpf").addEventListener("input", () => $("manageCpf").value = cpfMask($("manageCpf").value));
$("manageTel").addEventListener("input", () => $("manageTel").value = phoneMask($("manageTel").value));
$("manageVinculo").addEventListener("change", () => $("manageAuthWrap").hidden = $("manageVinculo").value !== "Convidado extracurricular");
$("manageAddAthlete").addEventListener("click", addAthlete);
document.querySelectorAll("[data-close-roster]").forEach(btn => btn.addEventListener("click", closeRoster));
document.addEventListener("keydown", e => { if(e.key === "Escape" && !$("rosterModal").hidden) closeRoster(); });

$("refreshTeams").addEventListener("click", () => loadDashboard(true));
$("refreshAthletes").addEventListener("click", () => loadDashboard(true));
$("athleteSearch").addEventListener("input", () => renderAthletesDirectory(dashboardCache?.listaAtletas || []));

$("creatorLogout").addEventListener("click", async () => {
  try{ await unicapApi("creatorLogout", {token}); }catch(_err){}
  ["unicap_creator_token","unicap_creator_name","unicap_creator_email"].forEach(k => sessionStorage.removeItem(k));
  window.location.href = "./criador.html";
});

setView(location.hash.replace("#","") || "teams");
loadDashboard(true);
