const state = {step:1, athletes:[], data:{}};
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
  const n=nums(cpf);
  if(n.length!==11 || /^(\d)\1{10}$/.test(n)) return false;
  const calc=(b,f)=>{
    let t=0;
    for(const d of b) t += Number(d)*f--;
    const r=(t*10)%11;
    return r===10?0:r;
  };
  return calc(n.slice(0,9),10)===+n[9] &&
         calc(n.slice(0,10),11)===+n[10];
}

function toast(msg,type="success"){
  const e=$("toast");
  e.textContent=msg;
  e.className=`toast show ${type}`;
  setTimeout(()=>e.className="toast",3000);
}

function esc(v){
  return String(v??"")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;");
}

function initials(name){
  return name.split(/\s+/).filter(Boolean).slice(0,2).map(n=>n[0]).join("").toUpperCase()||"AT";
}

function content(){
  const d=state.data;

  if(state.step===1) return `
    <div class="student-card-head">
      <div class="section-number">01</div>
      <div><h3>Dados do responsável</h3><p>Você será o contato oficial da equipe.</p></div>
    </div>
    <div class="form-grid">
      <label><span>Nome completo *</span><input id="respNome" value="${esc(d.respNome||"")}"></label>
      <label><span>R.A / Matrícula *</span><input id="respRa" value="${esc(d.respRa||"")}"></label>
      <label><span>CPF *</span><input id="respCpf" value="${esc(d.respCpf||"")}" placeholder="000.000.000-00"></label>
      <label><span>Telefone *</span><input id="respTel" value="${esc(d.respTel||"")}" placeholder="(81) 99999-9999"></label>
      <label class="full"><span>E-mail institucional *</span><input id="respEmail" type="email" value="${esc(d.respEmail||"")}"></label>
    </div>
    <div class="form-actions">
      <span></span>
      <button class="btn btn-primary" type="button" data-next>Continuar →</button>
    </div>`;

  if(state.step===2) return `
    <div class="student-card-head">
      <div class="section-number">02</div>
      <div><h3>Dados da equipe</h3><p>Defina nome, curso base e modalidade.</p></div>
    </div>
    <div class="form-grid">
      <label><span>Nome da equipe *</span><input id="teamName" value="${esc(d.teamName||"")}"></label>
      <label><span>Curso base *</span><input id="baseCourse" value="${esc(d.baseCourse||"")}"></label>
      <label class="full"><span>Modalidade *</span>
        <select id="teamSport">
          ${["Dominó","Vôlei Misto","Tênis de Mesa","Futsal Masculino","Futsal Feminino","Basquete","Futmesa"]
            .map(x=>`<option ${d.teamSport===x?"selected":""}>${x}</option>`).join("")}
        </select>
      </label>
    </div>
    <div class="form-actions">
      <button class="btn btn-outline" type="button" data-prev>← Voltar</button>
      <button class="btn btn-primary" type="button" data-next>Continuar →</button>
    </div>`;

  if(state.step===3) return `
    <div class="student-card-head">
      <div class="section-number">03</div>
      <div><h3>Atletas da equipe</h3><p>Adicione um participante por vez.</p></div>
    </div>
    <div class="athlete-builder">
      <div class="form-grid">
        <label><span>Nome completo *</span><input id="athNome"></label>
        <label><span>R.A / Matrícula *</span><input id="athRa"></label>
        <label><span>CPF *</span><input id="athCpf" placeholder="000.000.000-00"></label>
        <label><span>Telefone</span><input id="athTel" placeholder="(81) 99999-9999"></label>
        <label><span>Curso *</span><input id="athCurso"></label>
        <label><span>Vínculo *</span>
          <select id="athVinculo">
            <option>Aluno do próprio curso</option>
            <option>Aluno de outro curso</option>
            <option>Convidado extracurricular</option>
          </select>
        </label>
        <label class="full" id="authWrap" hidden>
          <span>Autorização / observação *</span>
          <textarea id="athAuth" rows="3"></textarea>
        </label>
      </div>
      <button class="btn btn-gold" type="button" id="addAthlete">＋ Adicionar atleta</button>
    </div>
    <div class="official-athletes" id="athleteList">${athleteList()}</div>
    <div class="form-actions">
      <button class="btn btn-outline" type="button" data-prev>← Voltar</button>
      <button class="btn btn-primary" type="button" data-next>Continuar →</button>
    </div>`;

  return `
    <div class="student-card-head">
      <div class="section-number">04</div>
      <div><h3>Revisar e confirmar</h3><p>Confira as informações antes do envio.</p></div>
    </div>
    <div class="term-box">
      <div><strong>Termo de responsabilidade</strong>
        <div style="font-size:10px;margin-top:4px">
          O responsável declara que acompanhará a equipe e responderá pelas informações e participantes cadastrados.
        </div>
      </div>
    </div>
    <label style="margin-top:15px">
      <span>Declaração do responsável *</span>
      <textarea id="termText" rows="6" placeholder="Declaro que sou responsável pela equipe...">${esc(d.termText||"")}</textarea>
    </label>
    <label class="checkbox-line">
      <input type="checkbox" id="acceptTerm">
      <div><strong>Confirmo e aceito</strong>
        <span>As informações fornecidas são verdadeiras e estou de acordo com o termo.</span>
      </div>
    </label>
    <div class="student-review">
      <div class="student-review-box"><span>Equipe</span><strong>${esc(d.teamName||"Não informada")}</strong></div>
      <div class="student-review-box"><span>Modalidade</span><strong>${esc(d.teamSport||"Dominó")}</strong></div>
      <div class="student-review-box"><span>Curso base</span><strong>${esc(d.baseCourse||"Não informado")}</strong></div>
      <div class="student-review-box"><span>Atletas</span><strong>${state.athletes.length}</strong></div>
    </div>
    <div class="form-actions">
      <button class="btn btn-outline" type="button" data-prev>← Voltar</button>
      <button class="btn btn-primary" type="submit">Finalizar inscrição →</button>
    </div>`;
}

function athleteList(){
  if(!state.athletes.length) return '<div class="empty-list">Nenhum atleta adicionado ainda.</div>';

  return state.athletes.map((a,i)=>`
    <div class="official-athlete-row">
      <div class="avatar">${initials(a.nome)}</div>
      <div>
        <strong>${esc(a.nome)}</strong>
        <span>${esc(a.curso || "Convidado")} · ${esc(a.vinculo)}${a.ra ? " · RA " + esc(a.ra) : ""}</span>
      </div>
      <button type="button" class="remove-athlete" data-remove="${i}">×</button>
    </div>
  `).join("");
}

function save(){
  ["respNome","respRa","respCpf","respTel","respEmail","teamName","baseCourse","teamSport","termText"]
    .forEach(id=>{
      const e=$(id);
      if(e) state.data[id]=e.value;
    });
}

function updateSteps(){
  $("studentProgress").textContent=`Etapa ${state.step} de 4`;
  document.querySelectorAll("[data-step-item]").forEach(el=>{
    const n=Number(el.dataset.stepItem);
    el.classList.toggle("active",n===state.step);
    el.classList.toggle("done",n<state.step);
    el.querySelector("b").textContent=n<state.step?"✓":String(n);
  });
}

function validate(){
  if(state.step===1){
    if(["respNome","respRa","respCpf","respTel","respEmail"].some(id=>!$(id).value.trim())){
      toast("Preencha todos os campos obrigatórios.","error");
      return false;
    }
    if(!validCPF($("respCpf").value)){
      toast("CPF inválido.","error");
      return false;
    }
  }

  if(state.step===2 && (!$("teamName").value.trim() || !$("baseCourse").value.trim())){
    toast("Preencha o nome da equipe e o curso base.","error");
    return false;
  }

  if(state.step===3 && !state.athletes.length){
    toast("Adicione pelo menos um atleta.","error");
    return false;
  }

  return true;
}

function render(){
  $("studentStepContent").innerHTML=content();
  updateSteps();

  document.querySelector("[data-next]")?.addEventListener("click",()=>{
    if(!validate()) return;
    save();
    state.step++;
    render();
  });

  document.querySelector("[data-prev]")?.addEventListener("click",()=>{
    save();
    state.step--;
    render();
  });

  const cpf=$("respCpf");
  if(cpf) cpf.addEventListener("input",()=>cpf.value=cpfMask(cpf.value));

  const tel=$("respTel");
  if(tel) tel.addEventListener("input",()=>tel.value=phoneMask(tel.value));

  const acpf=$("athCpf");
  if(acpf) acpf.addEventListener("input",()=>acpf.value=cpfMask(acpf.value));

  const atel=$("athTel");
  if(atel) atel.addEventListener("input",()=>atel.value=phoneMask(atel.value));

  $("athVinculo")?.addEventListener("change",()=>{
    $("authWrap").hidden=$("athVinculo").value!=="Convidado extracurricular";
  });

  $("addAthlete")?.addEventListener("click",()=>{
    const vinculo=$("athVinculo").value;
    const a={
      nome:$("athNome").value.trim(),
      ra:$("athRa").value.trim(),
      cpf:$("athCpf").value.trim(),
      telefone:$("athTel").value.trim(),
      curso:$("athCurso").value.trim(),
      vinculo,
      autorizacao:$("athAuth").value.trim()
    };

    if(!a.nome || !a.cpf){
      toast("Preencha nome e CPF.","error");
      return;
    }

    if(vinculo !== "Convidado extracurricular" && (!a.ra || !a.curso)){
      toast("Aluno precisa de R.A e curso.","error");
      return;
    }

    if(!validCPF(a.cpf)){
      toast("CPF do atleta inválido.","error");
      return;
    }

    if(vinculo==="Convidado extracurricular" && !a.autorizacao){
      toast("Informe a autorização do convidado.","error");
      return;
    }

    state.athletes.push({...a,cpf:nums(a.cpf)});
    render();
    toast("Atleta adicionado.");
  });

  document.querySelectorAll("[data-remove]").forEach(b=>b.addEventListener("click",()=>{
    state.athletes.splice(Number(b.dataset.remove),1);
    render();
  }));
}

$("studentDedicatedForm").addEventListener("submit", async (e)=>{
  e.preventDefault();
  save();

  if(!$("acceptTerm").checked){
    toast("Confirme o termo de responsabilidade.","error");
    return;
  }

  if(!state.data.termText?.trim()){
    toast("Escreva a declaração do responsável.","error");
    return;
  }

  const button=e.currentTarget.querySelector('button[type="submit"]');
  const original=button.innerHTML;
  button.disabled=true;
  button.textContent="Enviando...";

  try{
    const result=await unicapApi("saveIndependentTeam",{
      nomeEquipe:state.data.teamName,
      modalidade:state.data.teamSport,
      cursoBase:state.data.baseCourse,
      responsavel:{
        nome:state.data.respNome,
        ra:state.data.respRa,
        cpf:nums(state.data.respCpf),
        telefone:state.data.respTel,
        emailInstitucional:state.data.respEmail,
        termo:state.data.termText
      },
      atletas:state.athletes
    });

    toast(`Inscrição enviada com sucesso! ID: ${result.idEquipe}`,"success");

    state.step=1;
    state.athletes=[];
    state.data={};
    setTimeout(()=>render(),600);

  }catch(err){
    toast(err instanceof Error ? err.message : "Erro ao enviar inscrição.","error");
  }finally{
    button.disabled=false;
    button.innerHTML=original;
  }
});

render();
