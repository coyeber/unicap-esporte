
const CONFIG = {
  API_URL: ""
};

const SPORTS = [
  {name:"Dominó", icon:"domino", desc:"Estratégia, foco e tomada de decisão.", image:"", tag:"Mesa"},
  {name:"Vôlei Misto", icon:"volley", desc:"Integração, técnica e muita energia em quadra.", image:"./assets/volei-1.jpg", tag:"Quadra"},
  {name:"Tênis de Mesa", icon:"ping", desc:"Velocidade, reflexo e precisão.", image:"./assets/tenis-mesa.jpg", tag:"Mesa"},
  {name:"Futsal Masculino", icon:"soccer", desc:"Intensidade, disputa e talento.", image:"./assets/futsal-1.jpg", tag:"Futsal"},
  {name:"Futsal Feminino", icon:"soccer", desc:"Força, técnica e protagonismo.", image:"./assets/futsal-2.jpg", tag:"Futsal"},
  {name:"Basquete", icon:"basket", desc:"Coletivo, ritmo e vibração.", image:"./assets/basquete.jpg", tag:"Quadra"},
  {name:"Futmesa", icon:"table", desc:"Criatividade, controle e espetáculo.", image:"./assets/futmesa.jpg", tag:"Areia"}
];

const COURSES = [
  ["Sistemas para Internet","code"],
  ["Fisioterapia","physio"],
  ["História","history"],
  ["Medicina","medicine"],
  ["Direito","law"],
  ["Ciência da Computação","computer"],
  ["Matemática","math"],
  ["Arquitetura","architecture"],
  ["Administração","business"]
];

const state = {
  portalTab:"aluno",
  studentStep:1,
  athletes:[],
  studentData:{},
  coordinatorLogged:false,
  coordinatorAthletic:"",
  coordinatorName:"Coordenador",
  dashboardTab:"equipes"
};

const app = document.querySelector("#app");
const onlyNumbers = value => (value || "").replace(/\D/g,"");
const cpfMask = value => onlyNumbers(value).slice(0,11)
  .replace(/(\d{3})(\d)/,"$1.$2")
  .replace(/(\d{3})(\d)/,"$1.$2")
  .replace(/(\d{3})(\d{1,2})$/,"$1-$2");
const phoneMask = value => onlyNumbers(value).slice(0,11)
  .replace(/(\d{2})(\d)/,"($1) $2")
  .replace(/(\d{5})(\d{1,4})$/,"$1-$2");

function validCPF(cpf){
  const n=onlyNumbers(cpf);
  if(n.length!==11 || /^(\d)\1{10}$/.test(n)) return false;
  const calc=(base,factor)=>{
    let total=0;
    for(const digit of base) total += Number(digit)*factor--;
    const rest=(total*10)%11;
    return rest===10?0:rest;
  };
  return calc(n.slice(0,9),10)===Number(n[9]) && calc(n.slice(0,10),11)===Number(n[10]);
}

function icon(name){
  const base='width="40" height="40" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"';
  const map={
    arrow:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>`,
    users:`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="8" r="3"/><circle cx="17" cy="10" r="2.5"/><path d="M2.5 20c1-4 3-6 6-6s5 2 6 6"/><path d="M14 16c3 0 5 1.5 6 4"/></svg>`,
    trophy:`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3h8v5a4 4 0 0 1-8 0V3Z"/><path d="M6 5H3v2a4 4 0 0 0 4 4"/><path d="M18 5h3v2a4 4 0 0 1-4 4"/><path d="M12 12v5"/><path d="M8 21h8"/></svg>`,
    heart:`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 8c0 6-8 11-8 11S4 14 4 8a4 4 0 0 1 7-3 4 4 0 0 1 7 0 4 4 0 0 1 2 3Z"/></svg>`,
    student:`<svg ${base}><path d="m4 15 20-9 20 9-20 9L4 15Z"/><path d="M12 19v10c7 6 17 6 24 0V19"/><path d="M44 16v14"/></svg>`,
    manager:`<svg ${base}><circle cx="17" cy="15" r="7"/><path d="M5 40c2-10 7-15 12-15s10 5 12 15"/><rect x="28" y="19" width="16" height="18" rx="3"/><path d="M32 24h8M32 29h8"/></svg>`,
    admin:`<svg ${base}><path d="M24 5 39 11v11c0 10-6 17-15 21C15 39 9 32 9 22V11l15-6Z"/><path d="M17 24h14M24 17v14"/></svg>`,
    domino:`<svg ${base}><rect x="8" y="5" width="14" height="32" rx="3" transform="rotate(-10 8 5)"/><path d="M8 21h15"/><circle cx="14" cy="13" r="1.2" fill="currentColor"/><circle cx="17" cy="29" r="1.2" fill="currentColor"/><circle cx="12" cy="31" r="1.2" fill="currentColor"/><rect x="27" y="9" width="14" height="32" rx="3" transform="rotate(8 27 9)"/><path d="m27 25 14 2"/><circle cx="33" cy="17" r="1.2" fill="currentColor"/><circle cx="35" cy="34" r="1.2" fill="currentColor"/></svg>`,
    volley:`<svg ${base}><circle cx="24" cy="24" r="18"/><path d="M12 10c10 3 17 9 21 18M15 40c2-12 8-22 18-29M7 28c12-4 24-4 35 2"/></svg>`,
    ping:`<svg ${base}><circle cx="18" cy="18" r="11"/><path d="m26 26 12 12"/><circle cx="38" cy="12" r="4"/></svg>`,
    soccer:`<svg ${base}><circle cx="24" cy="24" r="18"/><path d="m24 15 7 5-3 8h-8l-3-8 7-5Z"/><path d="M17 20 9 17M31 20l8-3M20 28l-4 9M28 28l4 9M24 15V6"/></svg>`,
    basket:`<svg ${base}><circle cx="24" cy="24" r="18"/><path d="M9 12c8 7 12 15 13 30M26 6c-5 11-6 23 1 36M6 24h36M10 35c11-7 21-10 31-8"/></svg>`,
    table:`<svg ${base}><path d="M6 19h36"/><path d="m11 19-5 23M37 19l5 23M24 19v23"/><circle cx="34" cy="10" r="4"/></svg>`,
    code:`<svg ${base}><rect x="5" y="8" width="38" height="26" rx="3"/><path d="M15 42h18M24 34v8M18 17l-5 4 5 4M30 17l5 4-5 4"/></svg>`,
    physio:`<svg ${base}><path d="M24 6v36M8 24h32"/><path d="M16 9c3 2 5 5 5 9M32 9c-3 2-5 5-5 9"/></svg>`,
    history:`<svg ${base}><path d="M6 16h36L24 6 6 16ZM9 38h30M12 18v17M20 18v17M28 18v17M36 18v17"/></svg>`,
    medicine:`<svg ${base}><path d="M16 6v18c0 5 3 8 8 8s8-3 8-8V6"/><circle cx="36" cy="34" r="6"/><path d="M30 34h-6"/></svg>`,
    law:`<svg ${base}><path d="M24 7v34M12 12h24M9 12l-6 12h12L9 12ZM39 12l-6 12h12L39 12ZM14 41h20"/></svg>`,
    computer:`<svg ${base}><path d="m18 14-7 10 7 10M30 14l7 10-7 10M27 10l-6 28"/></svg>`,
    math:`<svg ${base}><path d="M37 8H14l12 16-12 16h23"/></svg>`,
    architecture:`<svg ${base}><path d="M9 39 24 7l15 32H9Z"/><path d="M24 16v17M17 33h14"/></svg>`,
    business:`<svg ${base}><path d="M9 39V26h6v13M21 39V18h6v21M33 39V10h6v29"/></svg>`,
    calendar:`<svg ${base}><rect x="6" y="10" width="36" height="32" rx="4"/><path d="M14 5v10M34 5v10M6 19h36"/><path d="M14 27h5M24 27h5M34 27h2M14 34h5M24 34h5"/></svg>`,
    check:`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m5 12 4 4L19 6"/></svg>`
  };
  return map[name] || "";
}

function showToast(message,type="success"){
  const el=document.querySelector("#toast");
  el.textContent=message;
  el.className=`toast show ${type}`;
  setTimeout(()=>el.className="toast",3000);
}

function appMarkup(){
  return `
  <section class="hero" id="inicio">
    <div class="dove-watermark"></div>
    <div class="hero-copy reveal">
      <div class="hero-kicker">UNICAP ESPORTE</div>
      <h1>Inscrições <span>abertas</span></h1>
      <p class="hero-lead">Participe dos jogos, represente seu curso e viva o melhor do esporte universitário. Um portal pensado para unir equipes, atléticas e modalidades em uma experiência organizada e profissional.</p>
      <div class="hero-benefits">
        <div class="benefit"><div class="benefit-icon">${icon("trophy")}</div><div><strong>Competição</strong><span>saudável</span></div></div>
        <div class="benefit"><div class="benefit-icon">${icon("users")}</div><div><strong>Integração</strong><span>entre cursos</span></div></div>
        <div class="benefit"><div class="benefit-icon">${icon("heart")}</div><div><strong>Universidade</strong><span>mais forte</span></div></div>
      </div>
      <div class="hero-actions">
        <button class="btn btn-primary" data-action="openStudent">Fazer minha inscrição ${icon("arrow")}</button>
        <button class="btn btn-ghost" data-scroll="modalidades">Conheça as modalidades</button>
      </div>
    </div>
    <div class="hero-art reveal">
      <div class="hero-photo-frame">
        <img src="./assets/hero-inscricoes.jpg" alt="Troféus, medalhas e banner da Supercopa UNICAP 2026">
        <div class="hero-badge-overlay">
          <small>SUPER COPA</small>
          <strong>UNICAP<br>2026</strong>
        </div>
      </div>
    </div>
  </section>

  <section class="section white" id="como-funciona">
    <div class="section-heading reveal">
      <div class="eyebrow">Como fazer sua inscrição</div>
      <h2>Escolha seu perfil e acesse a área correspondente.</h2>
    </div>
    <div class="path-grid">
      <article class="path-card reveal">
        <div class="path-icon">${icon("student")}</div>
        <h3>Aluno</h3>
        <p>Crie sua equipe de forma independente, escolha o curso base, defina a modalidade e cadastre todos os participantes.</p>
        <button class="mini-action" data-action="openStudent">→</button>
        <div class="path-art">${icon("student")}</div>
      </article>
      <article class="path-card manager reveal">
        <div class="path-icon">${icon("manager")}</div>
        <h3>Coordenador de Atlética</h3>
        <p>Acesse o painel da sua atlética para cadastrar equipes oficiais, organizar atletas e acompanhar as inscrições por modalidade.</p>
        <button class="mini-action" data-action="openManager">→</button>
        <div class="path-art">${icon("manager")}</div>
      </article>
      <article class="path-card admin reveal">
        <div class="path-icon">${icon("admin")}</div>
        <h3>Administrador</h3>
        <p>Visualize todas as equipes inscritas, atletas, matrículas, modalidades e as inscrições mais recentes em um painel geral.</p>
        <button class="mini-action" data-action="openAdmin">→</button>
        <div class="path-art">${icon("admin")}</div>
      </article>
    </div>
  </section>

  <section class="section" id="modalidades">
    <div class="section-heading row reveal">
      <div>
        <div class="eyebrow">Modalidades esportivas</div>
        <h2>Tradição, diversidade e esporte para todos.</h2>
      </div>
      <p>Escolha sua modalidade. Faça parte dessa história.</p>
    </div>
    <div class="sports-grid">
      ${SPORTS.map((s,i)=> s.image ? `
        <article class="sport-card photo reveal">
          <img src="${s.image}" alt="${s.name}">
          <div class="sport-content">
            <div class="sport-topline">
              <span class="sport-pill">${s.tag}</span>
              <span class="circle-arrow">→</span>
            </div>
            <h3>${s.name}</h3>
            <p>${s.desc}</p>
          </div>
        </article>` : `
        <article class="sport-card neutral reveal">
          <div class="sport-topline">
            <span class="sport-pill">${s.tag}</span>
          </div>
          <div class="sport-visual">${icon(s.icon)}</div>
          <div class="sport-content">
            <h3>${s.name}</h3>
            <p>${s.desc}</p>
          </div>
          <span class="circle-arrow">→</span>
        </article>`).join("")}
    </div>
    <div class="gallery-strip">
      <article class="gallery-card reveal"><img src="./assets/volei-2.jpg" alt="Vôlei de praia UNICAP"><div class="label"><strong>Vôlei</strong><span>Quadra e areia</span></div></article>
      <article class="gallery-card reveal"><img src="./assets/futsal-2.jpg" alt="Futsal UNICAP"><div class="label"><strong>Futsal</strong><span>Masculino e feminino</span></div></article>
      <article class="gallery-card reveal"><img src="./assets/basquete.jpg" alt="Basquete UNICAP"><div class="label"><strong>Basquete</strong><span>Energia universitária</span></div></article>
    </div>
  </section>

  <section class="section white" id="atleticas">
    <div class="section-heading row reveal">
      <div>
        <div class="eyebrow">Atléticas e cursos</div>
        <h2>Orgulho de cada curso. Força de uma só universidade.</h2>
      </div>
      <p>Nove atléticas oficiais + equipes independentes.</p>
    </div>
    <div class="course-grid">
      ${COURSES.map(([name,ico])=>`<article class="course-card reveal"><div class="course-icon">${icon(ico)}</div><strong>${name}</strong></article>`).join("")}
    </div>
  </section>

  <section class="section registration-stage" id="inscricoes">
    <div class="section-heading row reveal">
      <div>
        <div class="eyebrow">Portal de inscrições</div>
        <h2>Faça tudo em um só lugar.</h2>
      </div>
      <p>Cadastros completos, organizados e preparados para o Google Sheets.</p>
    </div>

    <div class="portal-tabs reveal">
      <button data-portal="aluno" class="${state.portalTab==="aluno"?"active":""}">Sou aluno</button>
      <button data-portal="coordenador" class="${state.portalTab==="coordenador"?"active":""}">Sou coordenador</button>
    </div>

    <div class="preview-grid">
      <div class="form-panel reveal" id="portalForm">
        ${state.portalTab==="aluno" ? studentFormMarkup() : coordinatorMarkup()}
      </div>
      <div class="dashboard-panel reveal">
        ${dashboardPreviewMarkup()}
      </div>
    </div>
  </section>

  <section class="section white" id="calendario">
    <div class="section-heading reveal">
      <div class="eyebrow">Calendário e informações</div>
      <h2>Programação centralizada.</h2>
      <p>O espaço já está preparado para receber datas oficiais, avisos e atualizações da coordenação esportiva.</p>
    </div>
    <div class="calendar-grid">
      <article class="calendar-card reveal">
        <h3>Calendário esportivo</h3>
        <div class="placeholder-calendar">
          <div>
            ${icon("calendar")}
            <strong>Pronto para o calendário oficial</strong>
            <p>Assim que as datas forem definidas, elas podem ser carregadas pelo mesmo backend do Google Sheets sem precisar redesenhar o site.</p>
          </div>
        </div>
      </article>
      <aside class="info-card reveal">
        <h3>Informações importantes</h3>
        <div class="info-list">
          <div class="info-item"><strong>Equipes independentes</strong><span>O aluno responsável cadastra a equipe inteira e assina o termo de responsabilidade.</span></div>
          <div class="info-item"><strong>Convidado extracurricular</strong><span>É obrigatório informar a autorização da coordenação esportiva.</span></div>
          <div class="info-item"><strong>Atléticas</strong><span>O acesso de coordenadores será controlado por usuário e senha vinculados à planilha.</span></div>
        </div>
      </aside>
    </div>
  </section>

  <section class="quote-band">
    <strong>🏆 ESPORTE HOJE.<br>PROFISSIONAIS MELHORES AMANHÃ.</strong>
    <p>“O esporte na UNICAP é encontro, aprendizado e futuro.”</p>
    <div class="dove-mark">✦</div>
  </section>`;
}

function studentFormMarkup(){
  const steps=["Responsável","Equipe","Atletas","Confirmar"];
  return `
  <div class="panel-title">
    <div><h3>Inscrição de equipe independente</h3><small>Etapa ${state.studentStep} de 4</small></div>
    <span class="dash-pill">Aluno</span>
  </div>
  <div class="wizard-steps">
    ${steps.map((s,i)=>`<div class="w-step ${state.studentStep===i+1?"active":""} ${state.studentStep>i+1?"done":""}"><b>${state.studentStep>i+1?"✓":i+1}</b><span>${s}</span></div>`).join("")}
  </div>
  <form class="form-content" id="studentForm">${studentStepMarkup()}</form>`;
}

function studentStepMarkup(){
  const d=state.studentData;
  if(state.studentStep===1){
    return `
      <div class="form-grid">
        <label><span>Nome completo *</span><input id="respNome" value="${esc(d.respNome||"")}" placeholder="Nome do responsável"></label>
        <label><span>R.A / Matrícula *</span><input id="respRa" value="${esc(d.respRa||"")}" placeholder="R.A / matrícula"></label>
        <label><span>CPF *</span><input id="respCpf" value="${esc(d.respCpf||"")}" placeholder="000.000.000-00"></label>
        <label><span>Telefone *</span><input id="respTelefone" value="${esc(d.respTelefone||"")}" placeholder="(81) 99999-9999"></label>
        <label class="full"><span>E-mail institucional *</span><input id="respEmail" value="${esc(d.respEmail||"")}" type="email" placeholder="seuemail@...unicap.br"></label>
      </div>
      <div class="inline-note">O responsável será o contato oficial da equipe e responderá pelas informações enviadas.</div>
      <div class="form-actions"><span></span><button class="btn btn-primary" type="button" data-student-next>Próximo passo ${icon("arrow")}</button></div>`;
  }
  if(state.studentStep===2){
    return `
      <div class="form-grid">
        <label><span>Nome da equipe *</span><input id="teamName" value="${esc(d.teamName||"")}" placeholder="Ex.: Fênix UNICAP"></label>
        <label><span>Curso base *</span><input id="baseCourse" value="${esc(d.baseCourse||"")}" placeholder="Ex.: Sistemas para Internet"></label>
        <label class="full"><span>Modalidade *</span>
          <select id="teamSport">${SPORTS.map(s=>`<option ${d.teamSport===s.name?"selected":""}>${s.name}</option>`).join("")}</select>
        </label>
      </div>
      <div class="form-actions"><button class="btn btn-outline" type="button" data-student-prev>← Voltar</button><button class="btn btn-primary" type="button" data-student-next>Próximo passo ${icon("arrow")}</button></div>`;
  }
  if(state.studentStep===3){
    return `
      <div class="athlete-builder">
        <div class="form-grid">
          <label><span>Nome do atleta *</span><input id="athNome"></label>
          <label><span>R.A / Matrícula *</span><input id="athRa"></label>
          <label><span>CPF *</span><input id="athCpf" placeholder="000.000.000-00"></label>
          <label><span>Telefone</span><input id="athTelefone" placeholder="(81) 99999-9999"></label>
          <label><span>Curso *</span><input id="athCurso"></label>
          <label><span>Vínculo *</span><select id="athVinculo"><option>Aluno do próprio curso</option><option>Aluno de outro curso</option><option>Convidado extracurricular</option></select></label>
          <label class="full" id="athAuthWrap" hidden><span>Autorização / observação *</span><textarea id="athAutorizacao" rows="3" placeholder="Informe quem autorizou a participação."></textarea></label>
        </div>
        <button class="btn btn-gold" type="button" data-add-athlete>＋ Adicionar atleta</button>
      </div>
      <div class="athletes-list">${athleteListMarkup()}</div>
      <div class="form-actions"><button class="btn btn-outline" type="button" data-student-prev>← Voltar</button><button class="btn btn-primary" type="button" data-student-next>Próximo passo ${icon("arrow")}</button></div>`;
  }
  return `
    <div class="term-box">${icon("check")}<div><strong>Termo de responsabilidade</strong><div style="font-size:10px;margin-top:4px">O responsável declara que acompanhará a equipe, receberá as comunicações oficiais e responderá pelos participantes inscritos.</div></div></div>
    <label style="margin-top:14px"><span>Declaração do responsável *</span><textarea id="termText" rows="6" placeholder="Declaro que sou responsável pela equipe e pelos participantes cadastrados...">${esc(d.termText||"")}</textarea></label>
    <label class="checkbox-line"><input type="checkbox" id="acceptTerm"><div><strong>Confirmo e aceito</strong><span>As informações fornecidas são verdadeiras e estou de acordo com o termo.</span></div></label>
    <div class="form-actions"><button class="btn btn-outline" type="button" data-student-prev>← Voltar</button><button class="btn btn-primary" type="submit">Finalizar inscrição ${icon("arrow")}</button></div>`;
}

function athleteListMarkup(){
  if(!state.athletes.length) return `<div class="empty-list">Nenhum atleta adicionado ainda.</div>`;
  return state.athletes.map((a,i)=>`
    <div class="athlete-row">
      <div class="avatar">${initials(a.nome)}</div>
      <div><strong>${esc(a.nome)}</strong><span>${esc(a.curso)} · ${esc(a.vinculo)} · RA ${esc(a.ra)}</span></div>
      <button class="remove-athlete" type="button" data-remove-athlete="${i}">×</button>
    </div>`).join("");
}

function coordinatorMarkup(){
  if(!state.coordinatorLogged){
    return `
      <div class="panel-title">
        <div><h3>Acesso do coordenador</h3><small>Entre com o usuário da sua atlética</small></div>
        <span class="dash-pill">Restrito</span>
      </div>
      <form class="form-content" id="coordinatorLogin">
        <div class="form-grid">
          <label class="full"><span>Usuário *</span><input id="loginUser" placeholder="Usuário da atlética"></label>
          <label class="full"><span>Senha *</span><input id="loginPass" type="password" placeholder="••••••••"></label>
          <label class="full"><span>Atlética para demonstração</span>
            <select id="loginAthletic">${COURSES.map(([name])=>`<option>${name}</option>`).join("")}</select>
          </label>
        </div>
        <div class="inline-note">Enquanto o Google Apps Script não estiver conectado, este login funciona apenas como demonstração visual.</div>
        <div class="form-actions"><span></span><button class="btn btn-primary" type="submit">Entrar no painel ${icon("arrow")}</button></div>
      </form>`;
  }
  return `
    <div class="panel-title">
      <div><h3>Nova equipe oficial</h3><small>${esc(state.coordinatorAthletic)}</small></div>
      <button class="btn btn-outline" style="padding:8px 12px;font-size:10px" type="button" data-logout>Trocar acesso</button>
    </div>
    <form class="form-content" id="officialTeamForm">
      <div class="form-grid">
        <label><span>Nome da equipe *</span><input id="officialTeamName" placeholder="Ex.: Sistemas Futsal A"></label>
        <label><span>Modalidade *</span><select id="officialSport">${SPORTS.map(s=>`<option>${s.name}</option>`).join("")}</select></label>
      </div>
      <div class="inline-note">A atlética será definida pelo login do coordenador. No backend real, o navegador não poderá alterar esse vínculo.</div>
      <div class="form-actions"><span></span><button class="btn btn-primary" type="submit">Preparar cadastro ${icon("arrow")}</button></div>
    </form>`;
}

function dashboardPreviewMarkup(){
  return `
    <aside class="dash-side">
      <div class="dash-brand"><span class="round-logo"><img src="./assets/unicap-esporte.jpg" alt=""></span><strong>UNICAP<br>Esporte</strong></div>
      <nav class="dash-nav">
        <button class="${state.dashboardTab==="dashboard"?"active":""}" data-dash-tab="dashboard">⌂ Dashboard</button>
        <button class="${state.dashboardTab==="equipes"?"active":""}" data-dash-tab="equipes">◉ Minhas equipes</button>
        <button data-dash-tab="inscricoes">□ Inscrições</button>
        <button data-dash-tab="atletas">♙ Atletas</button>
        <button data-dash-tab="orientacoes">? Orientações</button>
      </nav>
      <div class="dash-user">Coordenador<br><strong>${esc(state.coordinatorAthletic || "Atlética UNICAP")}</strong></div>
    </aside>
    <div class="dash-body">
      <div class="dash-top">
        <div><h3>Olá, Coordenador!</h3><p>Aqui está o panorama da sua atlética.</p></div>
        <div class="dash-pill">${esc(state.coordinatorAthletic || "Atlética UNICAP")}</div>
      </div>
      <div class="stats">
        <div class="stat"><b>3</b><span>Equipes inscritas</span></div>
        <div class="stat"><b>42</b><span>Atletas cadastrados</span></div>
        <div class="stat"><b>7</b><span>Modalidades</span></div>
        <div class="stat"><b style="color:#16855f">100%</b><span>Inscrições em dia</span></div>
      </div>
      <div class="dash-tabs"><button class="active">Equipes</button><button>Atletas</button><button>Inscrições</button><button>Estatísticas</button></div>
      <div class="team-table">
        <div class="t-row t-head"><span>Nome da equipe</span><span>Modalidade</span><span>Atletas</span><span>Status</span></div>
        <div class="t-row"><strong>Equipe A</strong><span>Futsal Masculino</span><span>12</span><span class="badge-ok">Inscrita</span></div>
        <div class="t-row"><strong>Equipe B</strong><span>Vôlei Misto</span><span>10</span><span class="badge-ok">Inscrita</span></div>
        <div class="t-row"><strong>Equipe C</strong><span>Basquete</span><span>11</span><span class="badge-wait">Pendente</span></div>
      </div>
    </div>`;
}

function esc(value){
  return String(value??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
}
function initials(name){return name.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join("").toUpperCase() || "AT"}

function saveCurrentStudentStep(){
  const ids=["respNome","respRa","respCpf","respTelefone","respEmail","teamName","baseCourse","teamSport","termText"];
  ids.forEach(id=>{const el=document.getElementById(id);if(el)state.studentData[id]=el.value});
}

function validateStudentStep(){
  if(state.studentStep===1){
    const required=["respNome","respRa","respCpf","respTelefone","respEmail"];
    if(required.some(id=>!document.getElementById(id)?.value.trim())){showToast("Preencha todos os campos obrigatórios.","error");return false}
    if(!validCPF(document.getElementById("respCpf").value)){showToast("Informe um CPF válido.","error");return false}
  }
  if(state.studentStep===2){
    if(!document.getElementById("teamName").value.trim() || !document.getElementById("baseCourse").value.trim()){showToast("Preencha o nome da equipe e o curso base.","error");return false}
  }
  if(state.studentStep===3 && !state.athletes.length){showToast("Adicione pelo menos um atleta.","error");return false}
  return true;
}

function addAthlete(){
  const nome=document.getElementById("athNome").value.trim();
  const ra=document.getElementById("athRa").value.trim();
  const cpf=document.getElementById("athCpf").value.trim();
  const telefone=document.getElementById("athTelefone").value.trim();
  const curso=document.getElementById("athCurso").value.trim();
  const vinculo=document.getElementById("athVinculo").value;
  const autorizacao=document.getElementById("athAutorizacao")?.value.trim() || "";
  if(!nome||!ra||!cpf||!curso){showToast("Preencha nome, R.A, CPF e curso do atleta.","error");return}
  if(!validCPF(cpf)){showToast("CPF do atleta inválido.","error");return}
  if(vinculo==="Convidado extracurricular"&&!autorizacao){showToast("Informe a autorização do convidado extracurricular.","error");return}
  state.athletes.push({nome,ra,cpf:onlyNumbers(cpf),telefone,curso,vinculo,autorizacao});
  renderPortalOnly();
  showToast("Atleta adicionado.");
}

function renderPortalOnly(){
  document.querySelector("#portalForm").innerHTML = state.portalTab==="aluno" ? studentFormMarkup() : coordinatorMarkup();
  wirePortal();
  document.querySelector(".dashboard-panel").innerHTML=dashboardPreviewMarkup();
  wireDashboardTabs();
}

function wirePortal(){
  document.querySelectorAll("[data-student-next]").forEach(btn=>btn.addEventListener("click",()=>{
    if(!validateStudentStep()) return;
    saveCurrentStudentStep();state.studentStep++;renderPortalOnly();
  }));
  document.querySelectorAll("[data-student-prev]").forEach(btn=>btn.addEventListener("click",()=>{saveCurrentStudentStep();state.studentStep--;renderPortalOnly()}));
  document.querySelector("[data-add-athlete]")?.addEventListener("click",addAthlete);
  document.querySelectorAll("[data-remove-athlete]").forEach(btn=>btn.addEventListener("click",()=>{state.athletes.splice(Number(btn.dataset.removeAthlete),1);renderPortalOnly()}));
  const vinculo=document.getElementById("athVinculo");
  const authWrap=document.getElementById("athAuthWrap");
  if(vinculo&&authWrap)vinculo.addEventListener("change",()=>{authWrap.hidden=vinculo.value!=="Convidado extracurricular"});
  const athCpf=document.getElementById("athCpf");if(athCpf)athCpf.addEventListener("input",()=>athCpf.value=cpfMask(athCpf.value));
  const athTel=document.getElementById("athTelefone");if(athTel)athTel.addEventListener("input",()=>athTel.value=phoneMask(athTel.value));
  const respCpf=document.getElementById("respCpf");if(respCpf)respCpf.addEventListener("input",()=>respCpf.value=cpfMask(respCpf.value));
  const respTel=document.getElementById("respTelefone");if(respTel)respTel.addEventListener("input",()=>respTel.value=phoneMask(respTel.value));

  document.getElementById("studentForm")?.addEventListener("submit",e=>{
    e.preventDefault();saveCurrentStudentStep();
    if(!document.getElementById("acceptTerm")?.checked){showToast("Confirme o termo de responsabilidade.","error");return}
    if(!state.studentData.termText?.trim()){showToast("Escreva a declaração do responsável.","error");return}
    if(!CONFIG.API_URL){showToast("Inscrição validada. Falta conectar o Google Apps Script.");return}
  });

  document.getElementById("coordinatorLogin")?.addEventListener("submit",e=>{
    e.preventDefault();
    const user=document.getElementById("loginUser").value.trim();
    const pass=document.getElementById("loginPass").value.trim();
    if(!user||!pass){showToast("Informe usuário e senha.","error");return}
    state.coordinatorLogged=true;
    state.coordinatorAthletic=document.getElementById("loginAthletic").value;
    state.coordinatorName="Coordenador";
    renderPortalOnly();showToast("Painel aberto em modo demonstração.");
  });
  document.querySelector("[data-logout]")?.addEventListener("click",()=>{state.coordinatorLogged=false;state.coordinatorAthletic="";renderPortalOnly()});
  document.getElementById("officialTeamForm")?.addEventListener("submit",e=>{
    e.preventDefault();
    if(!document.getElementById("officialTeamName").value.trim()){showToast("Informe o nome da equipe.","error");return}
    showToast("Estrutura da equipe pronta. O salvamento real entra com o Código.gs.");
  });
}

function wireDashboardTabs(){
  document.querySelectorAll("[data-dash-tab]").forEach(btn=>btn.addEventListener("click",()=>{
    state.dashboardTab=btn.dataset.dashTab;
    document.querySelector(".dashboard-panel").innerHTML=dashboardPreviewMarkup();
    wireDashboardTabs();
  }));
}

function wireGlobal(){
  document.querySelectorAll("[data-scroll]").forEach(btn=>btn.addEventListener("click",()=>{
    document.querySelector("#mobileMenu")?.classList.remove("open");
    document.getElementById(btn.dataset.scroll)?.scrollIntoView({behavior:"smooth",block:"start"});
  }));
  document.querySelectorAll("[data-action='openStudent']").forEach(btn=>btn.addEventListener("click",()=>{
    window.location.href="./aluno.html";
  }));
  document.querySelectorAll("[data-action='openManager']").forEach(btn=>btn.addEventListener("click",()=>{
    window.location.href="./coordenador.html";
  }));
  document.querySelectorAll("[data-action='openAdmin']").forEach(btn=>btn.addEventListener("click",()=>{
    window.location.href="./administrador.html";
  }));
  document.querySelectorAll("[data-portal]").forEach(btn=>btn.addEventListener("click",()=>{
    if(btn.dataset.portal==="coordenador"){
      window.location.href="./coordenador.html";
      return;
    }
    window.location.href="./aluno.html";
  }));
  document.getElementById("mobileMenuBtn")?.addEventListener("click",()=>document.getElementById("mobileMenu").classList.toggle("open"));
}

function renderPortalSection(){
  const section=document.getElementById("inscricoes");
  const temp=document.createElement("div");
  temp.innerHTML=appMarkup();
  const fresh=temp.querySelector("#inscricoes");
  section.replaceWith(fresh);
  wireGlobal();
  wirePortal();
  wireDashboardTabs();
  observeReveals();
}

function observeReveals(){
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("visible");observer.unobserve(entry.target)}})
  },{threshold:.08});
  document.querySelectorAll(".reveal:not(.visible)").forEach(el=>observer.observe(el));
}

app.innerHTML=appMarkup();
wireGlobal();
wirePortal();
wireDashboardTabs();
observeReveals();
