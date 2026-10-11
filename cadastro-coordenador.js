const token = sessionStorage.getItem("unicap_coord_token") || "";
const athletic = sessionStorage.getItem("unicap_coord_athletic") || "";
const user = sessionStorage.getItem("unicap_coord_user") || "";
const coordinatorName = sessionStorage.getItem("unicap_coord_name") || "Coordenador";

if (!token || !athletic) {
  window.location.href = "./coordenador.html";
}

let dashboardCache = null;
let activeManageTeamId = "";
const $ = id => document.getElementById(id);
const nums = v => (v || "").replace(/\D/g, "");
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

function toast(msg, type="success"){
  const e = $("toast");
  e.textContent = msg;
  e.className = `toast show ${type}`;
  setTimeout(() => e.className = "toast", 3000);
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

$("sideAthletic").textContent = athletic;
$("athleticChip").textContent = athletic;
$("sideUser").textContent = coordinatorName;

// ===== Navegação lateral =====
const panelMeta = {
  teams: { eyebrow: "Gestão da atlética", title: "Minhas equipes" },
  athletes: { eyebrow: "Gestão da atlética", title: "Atletas" },
  guidance: { eyebrow: "Suporte", title: "Orientações" }
};

function setView(view){
  if(!panelMeta[view]) view = "teams";

  document.querySelectorAll("[data-panel]").forEach(panel => {
    panel.hidden = panel.dataset.panel !== view;
  });

  document.querySelectorAll(".official-nav [data-view]").forEach(button => {
    button.classList.toggle("active", button.dataset.view === view);
  });

  $("panelEyebrow").textContent = panelMeta[view].eyebrow;
  $("panelTitle").textContent = panelMeta[view].title;

  history.replaceState(null, "", `#${view}`);

  if(view === "teams") loadDashboard(false);
  if(view === "athletes") loadDashboard(false);
  window.scrollTo({top:0, behavior:"smooth"});
}

document.querySelectorAll(".official-nav [data-view]").forEach(button => {
  button.addEventListener("click", () => setView(button.dataset.view));
});
document.querySelectorAll("[data-view-jump]").forEach(button => {
  button.addEventListener("click", () => setView(button.dataset.viewJump));
});

// ===== Dados do painel =====
async function loadDashboard(force = false){
  if(dashboardCache && !force){
    renderDashboard(dashboardCache);
    return;
  }

  const teamList = $("teamList");
  const athleteDirectory = $("athleteDirectory");
  if(teamList) teamList.innerHTML = '<div class="panel-loading">Carregando equipes…</div>';
  if(athleteDirectory) athleteDirectory.innerHTML = '<div class="panel-loading">Carregando atletas…</div>';

  try{
    dashboardCache = await unicapApi("dashboard", {token});
    renderDashboard(dashboardCache);
  }catch(err){
    const message = err instanceof Error ? err.message : "Não foi possível carregar o painel.";
    if(/sessão/i.test(message)){
      sessionStorage.removeItem("unicap_coord_token");
      toast(message, "error");
      setTimeout(() => window.location.href = "./coordenador.html", 1200);
      return;
    }
    if(teamList) teamList.innerHTML = `<div class="panel-empty error">${esc(message)}</div>`;
    if(athleteDirectory) athleteDirectory.innerHTML = `<div class="panel-empty error">${esc(message)}</div>`;
    toast(message, "error");
  }
}

function renderDashboard(data){
  if($("dashTeams")) $("dashTeams").textContent = data.equipes ?? 0;
  if($("dashAthletes")) $("dashAthletes").textContent = data.atletas ?? 0;
  if($("dashSports")) $("dashSports").textContent = Object.keys(data.modalidades || {}).length;
  renderTeamDirectory(data.listaEquipes || []);
  renderAthleteDirectory(data.listaAtletas || []);
}

function renderTeamDirectory(teams){
  const root = $("teamList");
  if(!root) return;

  if(!teams.length){
    root.innerHTML = '<div class="panel-empty"><strong>Nenhuma equipe cadastrada.</strong><span>O cadastro de novas equipes está encerrado.</span></div>';
    return;
  }

  root.innerHTML = `
    <div class="data-table-wrap">
      <table class="panel-table">
        <thead><tr><th>Equipe</th><th>Modalidade</th><th>Atletas</th><th>Status</th><th>ID</th><th>Ações</th></tr></thead>
        <tbody>${teams.map(t => `
          <tr>
            <td><strong>${esc(t.nomeEquipe)}</strong></td>
            <td>${esc(t.modalidade)}</td>
            <td>${esc(t.atletas)}</td>
            <td><span class="status-pill">${esc(t.status || "INSCRITA")}</span></td>
            <td><code>${esc(t.idEquipe)}</code></td>
            <td><div class="team-action-group"><button class="table-action" type="button" data-manage-team="${esc(t.idEquipe)}">Adicionar atletas</button></div></td>
          </tr>`).join("")}</tbody>
      </table>
    </div>`;

  root.querySelectorAll("[data-manage-team]").forEach(button => {
    button.addEventListener("click", () => openRosterManager(button.dataset.manageTeam));
  });

}

function renderAthleteDirectory(list){
  const root = $("athleteDirectory");
  if(!root) return;

  const query = String($("athleteSearch")?.value || "").trim().toLowerCase();
  const filtered = list.filter(a => [a.nome,a.ra,a.curso,a.equipe,a.modalidade,a.vinculo]
    .some(v => String(v || "").toLowerCase().includes(query)));

  if($("athleteTotal")) $("athleteTotal").textContent = `${filtered.length} atleta${filtered.length === 1 ? "" : "s"}`;

  if(!list.length){
    root.innerHTML = '<div class="panel-empty"><strong>Nenhum atleta encontrado.</strong><span>Os atletas aparecerão aqui depois que uma equipe for salva.</span></div>';
    return;
  }

  if(!filtered.length){
    root.innerHTML = '<div class="panel-empty"><strong>Nenhum resultado.</strong><span>Tente buscar por outro nome, curso ou modalidade.</span></div>';
    return;
  }

  root.innerHTML = `
    <div class="data-table-wrap">
      <table class="panel-table">
        <thead><tr><th>Atleta</th><th>R.A</th><th>Curso</th><th>Equipe</th><th>Modalidade</th><th>Vínculo</th></tr></thead>
        <tbody>${filtered.map(a => `
          <tr>
            <td><div class="athlete-name-cell"><span class="avatar small">${initials(a.nome)}</span><strong>${esc(a.nome)}</strong></div></td>
            <td>${esc(a.ra || "—")}</td>
            <td>${esc(a.curso || "—")}</td>
            <td>${esc(a.equipe || "—")}</td>
            <td>${esc(a.modalidade || "—")}</td>
            <td>${esc(a.vinculo || "—")}</td>
          </tr>`).join("")}</tbody>
      </table>
    </div>`;
}

// ===== Gerenciar elenco de uma equipe já salva =====
function openRosterManager(teamId){
  activeManageTeamId = teamId;
  renderRosterManager();
  $("rosterModal").hidden = false;
  document.body.classList.add("modal-open");
}

function closeRosterManager(){
  activeManageTeamId = "";
  $("rosterModal").hidden = true;
  document.body.classList.remove("modal-open");
}

function renderRosterManager(){
  const team = (dashboardCache?.listaEquipes || []).find(t => t.idEquipe === activeManageTeamId);
  const roster = (dashboardCache?.listaAtletas || []).filter(a => a.idEquipe === activeManageTeamId);
  if(!team) return closeRosterManager();

  $("rosterTitle").textContent = team.nomeEquipe || "Equipe";
  $("rosterSubtitle").textContent = `${team.modalidade || "Modalidade"} · ${athletic}`;
  $("rosterCount").textContent = String(roster.length);
  $("rosterList").innerHTML = roster.map(a => `
    <div class="roster-athlete">
      <div class="avatar">${initials(a.nome)}</div>
      <div>
        <strong>${esc(a.nome)}</strong>
        <span>${esc(a.curso || "—")} · ${esc(a.vinculo || "—")}${a.ra ? ` · RA ${esc(a.ra)}` : ""}</span>
      </div>
    </div>`).join("") || '<div class="panel-empty">Nenhum atleta nesta equipe.</div>';


}

async function addSavedAthlete(){
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

  if(!atleta.nome || !atleta.cpf){ toast("Preencha nome e CPF.", "error"); return; }
  if(vinculo !== "Convidado extracurricular" && (!atleta.ra || !atleta.curso)){ toast("Aluno precisa de R.A e curso.", "error"); return; }
  if(!validCPF(atleta.cpf)){ toast("CPF inválido.", "error"); return; }
  if(vinculo === "Convidado extracurricular" && !atleta.autorizacao){ toast("Informe a autorização do convidado.", "error"); return; }

  const button = $("manageAddAthlete");
  const original = button.textContent;
  button.disabled = true;
  button.textContent = "Adicionando...";
  try{
    const result = await unicapApi("manageOfficialTeam", {
      token,
      operacao:"adicionar",
      idEquipe:activeManageTeamId,
      atleta
    });
    dashboardCache = result;
    ["manageNome","manageRa","manageCpf","manageTel","manageCurso","manageAuth"].forEach(id => $(id).value = "");
    renderDashboard(result);
    renderRosterManager();
    toast("Atleta adicionado ao elenco.");
  }catch(err){
    toast(err instanceof Error ? err.message : "Não foi possível adicionar o atleta.", "error");
  }finally{
    button.disabled = false;
    button.textContent = original;
  }
}

$("manageCpf")?.addEventListener("input", () => $("manageCpf").value = cpfMask($("manageCpf").value));
$("manageTel")?.addEventListener("input", () => $("manageTel").value = phoneMask($("manageTel").value));
$("manageVinculo")?.addEventListener("change", () => {
  $("manageAuthWrap").hidden = $("manageVinculo").value !== "Convidado extracurricular";
});
$("manageAddAthlete")?.addEventListener("click", addSavedAthlete);
document.querySelectorAll("[data-close-roster]").forEach(button => button.addEventListener("click", closeRosterManager));
document.addEventListener("keydown", e => {
  if(e.key !== "Escape") return;
  if(!$("rosterModal").hidden) closeRosterManager();
});

$("refreshTeams")?.addEventListener("click", () => loadDashboard(true));
$("refreshAthletes")?.addEventListener("click", () => loadDashboard(true));
$("athleteSearch")?.addEventListener("input", () => renderAthleteDirectory(dashboardCache?.listaAtletas || []));

setView(location.hash.replace("#", "") || "teams");
