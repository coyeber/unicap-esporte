const token = sessionStorage.getItem("unicap_coord_token") || "";
const athletic = sessionStorage.getItem("unicap_coord_athletic") || "";
const user = sessionStorage.getItem("unicap_coord_user") || "";
const coordinatorName = sessionStorage.getItem("unicap_coord_name") || "Coordenador";

if (!token || !athletic) {
  window.location.href = "./coordenador.html";
}

const athletes = [];
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
  return calc(n.slice(0,9),10) === +n[9] &&
         calc(n.slice(0,10),11) === +n[10];
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
  return name.split(/\s+/).filter(Boolean).slice(0,2).map(n => n[0]).join("").toUpperCase() || "AT";
}

$("sideAthletic").textContent = athletic;
$("athleticChip").textContent = athletic;
$("officialAthletic").value = athletic;
$("sumAthletic").textContent = athletic;
$("sideUser").textContent = coordinatorName;

$("athCpf").addEventListener("input", () => $("athCpf").value = cpfMask($("athCpf").value));
$("athTel").addEventListener("input", () => $("athTel").value = phoneMask($("athTel").value));
$("athVinculo").addEventListener("change", () => {
  $("authWrap").hidden = $("athVinculo").value !== "Convidado extracurricular";
});
$("officialName").addEventListener("input", updateSummary);
$("officialSport").addEventListener("change", updateSummary);

$("addOfficialAthlete").addEventListener("click", () => {
  const vinculo = $("athVinculo").value;
  const a = {
    nome: $("athNome").value.trim(),
    ra: $("athRa").value.trim(),
    cpf: $("athCpf").value.trim(),
    telefone: $("athTel").value.trim(),
    curso: $("athCurso").value.trim(),
    vinculo,
    autorizacao: $("athAuth").value.trim()
  };

  if(!a.nome || !a.cpf) {
    toast("Preencha nome e CPF.", "error");
    return;
  }

  if(vinculo !== "Convidado extracurricular" && (!a.ra || !a.curso)) {
    toast("Aluno precisa de R.A e curso.", "error");
    return;
  }

  if(!validCPF(a.cpf)) {
    toast("CPF inválido.", "error");
    return;
  }

  if(vinculo === "Convidado extracurricular" && !a.autorizacao) {
    toast("Informe a autorização do convidado.", "error");
    return;
  }

  athletes.push({...a, cpf: nums(a.cpf)});

  ["athNome","athRa","athCpf","athTel","athCurso","athAuth"].forEach(id => $(id).value = "");

  renderAthletes();
  updateSummary();
  toast("Atleta adicionado.");
});

function renderAthletes(){
  if(!athletes.length){
    $("officialAthletes").innerHTML = '<div class="empty-list">Nenhum atleta adicionado ainda.</div>';
    return;
  }

  $("officialAthletes").innerHTML = athletes.map((a,i) => `
    <div class="official-athlete-row">
      <div class="avatar">${initials(a.nome)}</div>
      <div>
        <strong>${esc(a.nome)}</strong>
        <span>${esc(a.curso || "Convidado")} · ${esc(a.vinculo)}${a.ra ? " · RA " + esc(a.ra) : ""}</span>
      </div>
      <button class="remove-athlete" type="button" data-remove="${i}">×</button>
    </div>
  `).join("");

  document.querySelectorAll("[data-remove]").forEach(b => b.addEventListener("click", () => {
    athletes.splice(Number(b.dataset.remove), 1);
    renderAthletes();
    updateSummary();
  }));
}

function updateSummary(){
  $("sumTeam").textContent = $("officialName").value.trim() || "Não informado";
  $("sumSport").textContent = $("officialSport").value;
  $("sumAthletes").textContent = String(athletes.length);
}

document.getElementById("officialRegistration").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nomeEquipe = $("officialName").value.trim();
  const modalidade = $("officialSport").value;

  if(!nomeEquipe) {
    toast("Informe o nome da equipe.", "error");
    return;
  }

  if(!athletes.length) {
    toast("Adicione pelo menos um atleta.", "error");
    return;
  }

  const button = e.currentTarget.querySelector('button[type="submit"]');
  const original = button.innerHTML;
  button.disabled = true;
  button.textContent = "Salvando...";

  try {
    const result = await unicapApi("saveOfficialTeam", {
      token,
      nomeEquipe,
      modalidade,
      cursoBase: athletic,
      atletas: athletes
    });

    toast(`Equipe salva com sucesso! ID: ${result.idEquipe}`, "success");

    athletes.splice(0, athletes.length);
    $("officialName").value = "";
    renderAthletes();
    updateSummary();
  } catch(err) {
    const message = err instanceof Error ? err.message : "Erro ao salvar equipe.";

    if (/sessão/i.test(message)) {
      sessionStorage.removeItem("unicap_coord_token");
      toast(message, "error");
      setTimeout(() => window.location.href = "./coordenador.html", 1200);
      return;
    }

    toast(message, "error");
  } finally {
    button.disabled = false;
    button.innerHTML = original;
  }
});

renderAthletes();
updateSummary();
