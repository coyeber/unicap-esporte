/**
 * UNICAP ESPORTE — BACKEND GOOGLE SHEETS
 *
 * Esta versão usa UMA ÚNICA ABA para os acessos dos coordenadores:
 * ACESSOS_ATLETICAS
 *
 * O login é lido diretamente dessa aba.
 * Você pode editar usuário, senha, nome do coordenador e status
 * diretamente no Google Sheets.
 */

// ============================================================
// CONFIGURAÇÃO
// ============================================================

const CFG = {
  SPREADSHEET_ID: '1uyScG9Premstru5K-6zkH0c6C1-OGuqxd1A257E2x_0',
  ABA_ACESSOS: 'ACESSOS_ATLETICAS',
  ABA_INDEPENDENTES: 'EQUIPES_INDEPENDENTES',
  SESSION_SECONDS: 21600, // 6 horas
  STATUS_PADRAO: 'INSCRITA',
  VALIDAR_DUPLICIDADE_GLOBAL_POR_MODALIDADE: true,

  MODALIDADES: [
    'Dominó',
    'Vôlei Misto',
    'Tênis de Mesa',
    'Futsal Masculino',
    'Futsal Feminino',
    'Basquete',
    'Futmesa'
  ],

  ATLETICAS: {
    'Sistemas para Internet': 'SISTEMAS',
    'Fisioterapia': 'FISIOTERAPIA',
    'História': 'HISTORIA',
    'Medicina': 'MEDICINA',
    'Direito': 'DIREITO',
    'Ciência da Computação': 'CIENCIA_COMPUTACAO',
    'Matemática': 'MATEMATICA',
    'Arquitetura': 'ARQUITETURA',
    'Administração': 'ADMINISTRACAO'
  }
};

const HEADERS_ACESSOS = [
  'Atletica',
  'Usuario',
  'Senha',
  'NomeCoordenador',
  'Ativo'
];

const ACESSOS_PADRAO = [
  ['Sistemas para Internet', 'sistemas', 'Sistemas@2026', 'Coordenador de Sistemas para Internet', true],
  ['Fisioterapia', 'fisioterapia', 'Fisio@2026', 'Coordenador de Fisioterapia', true],
  ['História', 'historia', 'Historia@2026', 'Coordenador de História', true],
  ['Medicina', 'medicina', 'Medicina@2026', 'Coordenador de Medicina', true],
  ['Direito', 'direito', 'Direito@2026', 'Coordenador de Direito', true],
  ['Ciência da Computação', 'computacao', 'Computacao@2026', 'Coordenador de Ciência da Computação', true],
  ['Matemática', 'matematica', 'Matematica@2026', 'Coordenador de Matemática', true],
  ['Arquitetura', 'arquitetura', 'Arquitetura@2026', 'Coordenador de Arquitetura', true],
  ['Administração', 'administracao', 'Administracao@2026', 'Coordenador de Administração', true]
];

const HEADERS_ATLETICA = [
  'DataHora',
  'ID_Equipe',
  'Tipo',
  'Atletica',
  'Nome_Equipe',
  'Modalidade',
  'Curso_Base',
  'Coordenador',
  'Atleta_Nome',
  'Atleta_RA',
  'Atleta_CPF',
  'Atleta_Telefone',
  'Atleta_Curso',
  'Vinculo',
  'Autorizacao',
  'Status'
];

const HEADERS_INDEPENDENTES = [
  'DataHora',
  'ID_Equipe',
  'Tipo',
  'Nome_Equipe',
  'Modalidade',
  'Curso_Base',
  'Responsavel_Nome',
  'Responsavel_RA',
  'Responsavel_CPF',
  'Responsavel_Telefone',
  'Responsavel_Email',
  'Termo',
  'Atleta_Nome',
  'Atleta_RA',
  'Atleta_CPF',
  'Atleta_Telefone',
  'Atleta_Curso',
  'Vinculo',
  'Autorizacao',
  'Status'
];

// ============================================================
// SETUP
// ============================================================

function configurarProjeto() {
  const ss = SpreadsheetApp.openById(CFG.SPREADSHEET_ID);

  criarOuPrepararAba_(ss, CFG.ABA_ACESSOS, HEADERS_ACESSOS);
  preencherAcessosPadrao_(ss);

  Object.keys(CFG.ATLETICAS).forEach(function(atletica) {
    criarOuPrepararAba_(ss, CFG.ATLETICAS[atletica], HEADERS_ATLETICA);
  });

  criarOuPrepararAba_(ss, CFG.ABA_INDEPENDENTES, HEADERS_INDEPENDENTES);

  formatarTodasAsAbas_(ss);
  SpreadsheetApp.flush();

  Logger.log('Projeto configurado na planilha vinculada.');
  Logger.log('Planilha ID: ' + CFG.SPREADSHEET_ID);
  Logger.log('Os logins estão na aba: ' + CFG.ABA_ACESSOS);
}

function preencherAcessosPadrao_(ss) {
  const sh = ss.getSheetByName(CFG.ABA_ACESSOS);
  if (!sh) return;

  // Só preenche automaticamente quando a aba ainda não tem usuários.
  if (sh.getLastRow() <= 1) {
    sh.getRange(2, 1, ACESSOS_PADRAO.length, HEADERS_ACESSOS.length)
      .setValues(ACESSOS_PADRAO);
  }
}

function criarOuPrepararAba_(ss, nome, headers) {
  let sh = ss.getSheetByName(nome);
  if (!sh) sh = ss.insertSheet(nome);

  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  }

  sh.setFrozenRows(1);
  return sh;
}

function formatarTodasAsAbas_(ss) {
  const nomes = [CFG.ABA_ACESSOS, CFG.ABA_INDEPENDENTES]
    .concat(Object.keys(CFG.ATLETICAS).map(a => CFG.ATLETICAS[a]));

  nomes.forEach(function(nome) {
    const sh = ss.getSheetByName(nome);
    if (!sh) return;

    const lastCol = sh.getLastColumn();
    if (!lastCol) return;

    sh.getRange(1, 1, 1, lastCol)
      .setBackground('#8B0018')
      .setFontColor('#FFFFFF')
      .setFontWeight('bold')
      .setHorizontalAlignment('center');

    sh.setRowHeight(1, 32);

    for (let c = 1; c <= lastCol; c++) {
      sh.setColumnWidth(c, 160);
    }

    if (nome === CFG.ABA_ACESSOS) {
      sh.setColumnWidth(1, 210);
      sh.setColumnWidth(2, 150);
      sh.setColumnWidth(3, 180);
      sh.setColumnWidth(4, 270);
      sh.setColumnWidth(5, 90);
    }
  });
}

// ============================================================
// LOGIN — LÊ DIRETAMENTE A ABA ACESSOS_ATLETICAS
// ============================================================

function login_(data) {
  const usuario = limparTexto_(data && data.usuario).toLowerCase();
  const senha = String(data && data.senha || '').trim();

  if (!usuario || !senha) {
    return fail_('Informe usuário e senha.');
  }

  const ss = getSpreadsheet_();
  const sh = ss.getSheetByName(CFG.ABA_ACESSOS);

  if (!sh || sh.getLastRow() < 2) {
    return fail_('A aba de acessos ainda não foi configurada.');
  }

  const dados = sh.getRange(2, 1, sh.getLastRow() - 1, HEADERS_ACESSOS.length).getValues();

  for (let i = 0; i < dados.length; i++) {
    const atletica = String(dados[i][0] || '').trim();
    const userPlanilha = String(dados[i][1] || '').trim().toLowerCase();
    const senhaPlanilha = String(dados[i][2] || '').trim();
    const nome = String(dados[i][3] || '').trim();
    const ativo = normalizarBoolean_(dados[i][4]);

    if (userPlanilha === usuario) {
      if (!ativo) return fail_('Este acesso está desativado.');
      if (senhaPlanilha !== senha) return fail_('Usuário ou senha inválidos.');
      if (!CFG.ATLETICAS[atletica]) return fail_('Atlética inválida na aba de acessos.');

      const token = Utilities.getUuid() + '-' + Utilities.getUuid();

      const session = {
        usuario: userPlanilha,
        atletica: atletica,
        nome: nome || ('Coordenador de ' + atletica),
        criadoEm: new Date().toISOString()
      };

      CacheService.getScriptCache().put(
        'session:' + token,
        JSON.stringify(session),
        CFG.SESSION_SECONDS
      );

      return {
        ok: true,
        token: token,
        atletica: atletica,
        nome: session.nome,
        expiresIn: CFG.SESSION_SECONDS
      };
    }
  }

  return fail_('Usuário ou senha inválidos.');
}

function validarSessao_(token) {
  token = String(token || '').trim();
  if (!token) return null;

  const raw = CacheService.getScriptCache().get('session:' + token);
  if (!raw) return null;

  try {
    const session = JSON.parse(raw);
    if (!session || !session.atletica || !CFG.ATLETICAS[session.atletica]) return null;

    CacheService.getScriptCache().put(
      'session:' + token,
      raw,
      CFG.SESSION_SECONDS
    );

    return session;
  } catch (err) {
    return null;
  }
}

function logout_(data) {
  const token = String(data && data.token || '').trim();
  if (token) CacheService.getScriptCache().remove('session:' + token);
  return { ok: true };
}

// ============================================================
// API
// ============================================================

function doGet() {
  return json_({
    ok: true,
    service: 'UNICAP Esporte',
    status: 'online',
    version: '2.0.0'
  });
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return json_(fail_('Requisição vazia.'));
    }

    let body;
    try {
      body = JSON.parse(e.postData.contents);
    } catch (err) {
      return json_(fail_('JSON inválido.'));
    }

    const action = limparTexto_(body.action);
    const data = body.data || {};

    switch (action) {
      case 'login':
        return json_(login_(data));

      case 'logout':
        return json_(logout_(data));

      case 'saveIndependentTeam':
        return json_(salvarEquipeIndependente_(data));

      case 'saveOfficialTeam':
        return json_(salvarEquipeOficial_(data));

      case 'saveTeam':
        if (data.tipoCadastro === 'independente') {
          return json_(salvarEquipeIndependente_(data));
        }
        if (data.tipoCadastro === 'atletica') {
          return json_(salvarEquipeOficial_(data));
        }
        return json_(fail_('Tipo de cadastro inválido.'));

      case 'dashboard':
        return json_(dashboard_(data));

      default:
        return json_(fail_('Ação inválida.'));
    }
  } catch (err) {
    return json_(fail_(err && err.message ? err.message : 'Erro interno do servidor.'));
  }
}

// ============================================================
// SALVAR EQUIPE INDEPENDENTE
// ============================================================

function salvarEquipeIndependente_(data) {
  const validacao = validarEquipeIndependente_(data);
  if (!validacao.ok) return validacao;

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);

  try {
    const ss = getSpreadsheet_();
    const sh = ss.getSheetByName(CFG.ABA_INDEPENDENTES);

    const equipeId = gerarIdEquipe_('IND');
    const agora = new Date();
    const responsavel = data.responsavel;
    const atletas = data.atletas;

    const duplicados = verificarDuplicidadesDaEquipe_(atletas);
    if (duplicados) return fail_(duplicados);

    if (CFG.VALIDAR_DUPLICIDADE_GLOBAL_POR_MODALIDADE) {
      const conflito = buscarConflitoGlobal_(atletas, data.modalidade, null);
      if (conflito) return fail_(conflito);
    }

    const rows = atletas.map(function(a) {
      return [
        agora,
        equipeId,
        'INDEPENDENTE',
        limparTexto_(data.nomeEquipe),
        limparTexto_(data.modalidade),
        limparTexto_(data.cursoBase),
        limparTexto_(responsavel.nome),
        limparTexto_(responsavel.ra),
        normalizarCpf_(responsavel.cpf),
        limparTexto_(responsavel.telefone),
        limparTexto_(responsavel.emailInstitucional),
        limparTextoLongo_(responsavel.termo, 3000),
        limparTexto_(a.nome),
        limparTexto_(a.ra),
        normalizarCpf_(a.cpf),
        limparTexto_(a.telefone),
        limparTexto_(a.curso),
        limparTexto_(a.vinculo),
        limparTextoLongo_(a.autorizacao, 1000),
        CFG.STATUS_PADRAO
      ];
    });

    sh.getRange(sh.getLastRow() + 1, 1, rows.length, HEADERS_INDEPENDENTES.length)
      .setValues(rows);

    SpreadsheetApp.flush();

    return {
      ok: true,
      idEquipe: equipeId,
      tipo: 'independente',
      nomeEquipe: limparTexto_(data.nomeEquipe),
      modalidade: limparTexto_(data.modalidade),
      atletas: atletas.length
    };
  } finally {
    lock.releaseLock();
  }
}

// ============================================================
// SALVAR EQUIPE OFICIAL
// ============================================================

function salvarEquipeOficial_(data) {
  const token = String(data && data.token || '').trim();
  const session = validarSessao_(token);

  if (!session) {
    return fail_('Sessão expirada ou inválida. Faça login novamente.');
  }

  const validacao = validarEquipeOficial_(data);
  if (!validacao.ok) return validacao;

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);

  try {
    const atletica = session.atletica;
    const aba = CFG.ATLETICAS[atletica];
    if (!aba) return fail_('Atlética inválida.');

    const ss = getSpreadsheet_();
    const sh = ss.getSheetByName(aba);

    const equipeId = gerarIdEquipe_('ATL');
    const agora = new Date();
    const atletas = data.atletas;

    const duplicados = verificarDuplicidadesDaEquipe_(atletas);
    if (duplicados) return fail_(duplicados);

    if (CFG.VALIDAR_DUPLICIDADE_GLOBAL_POR_MODALIDADE) {
      const conflito = buscarConflitoGlobal_(atletas, data.modalidade, equipeId);
      if (conflito) return fail_(conflito);
    }

    const rows = atletas.map(function(a) {
      return [
        agora,
        equipeId,
        'ATLETICA',
        atletica,
        limparTexto_(data.nomeEquipe),
        limparTexto_(data.modalidade),
        limparTexto_(data.cursoBase || atletica),
        limparTexto_(session.nome),
        limparTexto_(a.nome),
        limparTexto_(a.ra),
        normalizarCpf_(a.cpf),
        limparTexto_(a.telefone),
        limparTexto_(a.curso),
        limparTexto_(a.vinculo),
        limparTextoLongo_(a.autorizacao, 1000),
        CFG.STATUS_PADRAO
      ];
    });

    sh.getRange(sh.getLastRow() + 1, 1, rows.length, HEADERS_ATLETICA.length)
      .setValues(rows);

    SpreadsheetApp.flush();

    return {
      ok: true,
      idEquipe: equipeId,
      tipo: 'atletica',
      atletica: atletica,
      nomeEquipe: limparTexto_(data.nomeEquipe),
      modalidade: limparTexto_(data.modalidade),
      atletas: atletas.length
    };
  } finally {
    lock.releaseLock();
  }
}

// ============================================================
// DASHBOARD
// ============================================================

function dashboard_(data) {
  const token = String(data && data.token || '').trim();
  const session = validarSessao_(token);

  if (!session) return fail_('Sessão expirada ou inválida.');

  const ss = getSpreadsheet_();
  const aba = CFG.ATLETICAS[session.atletica];
  const sh = ss.getSheetByName(aba);

  if (!sh || sh.getLastRow() < 2) {
    return {
      ok: true,
      atletica: session.atletica,
      nome: session.nome,
      equipes: 0,
      atletas: 0,
      modalidades: {},
      listaEquipes: []
    };
  }

  const dados = sh.getRange(2, 1, sh.getLastRow() - 1, HEADERS_ATLETICA.length).getValues();
  const ids = {};
  const modalidades = {};
  const equipesMap = {};
  const listaAtletas = [];

  dados.forEach(function(r) {
    const id = String(r[1] || '');
    const nomeEquipe = String(r[4] || '');
    const modalidade = String(r[5] || '');
    const status = String(r[15] || '');

    if (id) ids[id] = true;
    if (modalidade) modalidades[modalidade] = (modalidades[modalidade] || 0) + 1;

    if (id && !equipesMap[id]) {
      equipesMap[id] = {
        idEquipe: id,
        nomeEquipe: nomeEquipe,
        modalidade: modalidade,
        status: status,
        atletas: 0
      };
    }

    if (id) equipesMap[id].atletas++;

    // Não devolvemos CPF ao navegador.
    listaAtletas.push({
      idEquipe: id,
      equipe: nomeEquipe,
      modalidade: modalidade,
      nome: String(r[8] || ''),
      ra: String(r[9] || ''),
      curso: String(r[12] || ''),
      vinculo: String(r[13] || ''),
      status: status
    });
  });

  return {
    ok: true,
    atletica: session.atletica,
    nome: session.nome,
    equipes: Object.keys(ids).length,
    atletas: dados.length,
    modalidades: modalidades,
    listaEquipes: Object.keys(equipesMap).map(k => equipesMap[k]),
    listaAtletas: listaAtletas
  };
}

// ============================================================
// VALIDAÇÕES
// ============================================================

function validarEquipeIndependente_(data) {
  if (!data) return fail_('Dados da inscrição não enviados.');

  if (!limparTexto_(data.nomeEquipe)) return fail_('Informe o nome da equipe.');
  if (!modalidadeValida_(data.modalidade)) return fail_('Modalidade inválida.');
  if (!limparTexto_(data.cursoBase)) return fail_('Informe o curso base.');

  const r = data.responsavel || {};

  if (!limparTexto_(r.nome)) return fail_('Informe o nome do responsável.');
  if (!limparTexto_(r.ra)) return fail_('Informe o R.A / matrícula do responsável.');
  if (!cpfValido_(r.cpf)) return fail_('CPF do responsável inválido.');
  if (!limparTexto_(r.telefone)) return fail_('Informe o telefone do responsável.');
  if (!emailValido_(r.emailInstitucional)) return fail_('E-mail institucional inválido.');
  if (limparTextoLongo_(r.termo, 3000).length < 10) return fail_('Preencha o termo de responsabilidade.');

  return validarAtletas_(data.atletas);
}

function validarEquipeOficial_(data) {
  if (!data) return fail_('Dados da equipe não enviados.');
  if (!limparTexto_(data.nomeEquipe)) return fail_('Informe o nome da equipe.');
  if (!modalidadeValida_(data.modalidade)) return fail_('Modalidade inválida.');

  return validarAtletas_(data.atletas);
}

function validarAtletas_(atletas) {
  if (!Array.isArray(atletas) || atletas.length < 1) {
    return fail_('Adicione pelo menos um atleta.');
  }

  const vinculosValidos = [
    'Aluno do próprio curso',
    'Aluno de outro curso',
    'Convidado extracurricular'
  ];

  for (let i = 0; i < atletas.length; i++) {
    const a = atletas[i] || {};
    const vinculo = limparTexto_(a.vinculo);

    if (!limparTexto_(a.nome)) return fail_('Atleta ' + (i + 1) + ': informe o nome.');

    if (vinculosValidos.indexOf(vinculo) < 0) {
      return fail_('Atleta ' + (i + 1) + ': vínculo inválido.');
    }

    if (vinculo !== 'Convidado extracurricular' && !limparTexto_(a.ra)) {
      return fail_('Atleta ' + (i + 1) + ': informe o R.A / matrícula.');
    }

    if (!cpfValido_(a.cpf)) {
      return fail_('Atleta ' + (i + 1) + ': CPF inválido.');
    }

    if (!limparTexto_(a.curso) && vinculo !== 'Convidado extracurricular') {
      return fail_('Atleta ' + (i + 1) + ': informe o curso.');
    }

    if (vinculo === 'Convidado extracurricular' && !limparTextoLongo_(a.autorizacao, 1000)) {
      return fail_('Atleta ' + (i + 1) + ': convidado extracurricular precisa de autorização.');
    }
  }

  return { ok: true };
}

function verificarDuplicidadesDaEquipe_(atletas) {
  const cpfs = {};
  const ras = {};

  for (let i = 0; i < atletas.length; i++) {
    const cpf = normalizarCpf_(atletas[i].cpf);
    const ra = limparTexto_(atletas[i].ra);

    if (cpf) {
      if (cpfs[cpf]) return 'Há CPF repetido dentro da própria equipe.';
      cpfs[cpf] = true;
    }

    if (ra) {
      const key = ra.toLowerCase();
      if (ras[key]) return 'Há R.A / matrícula repetido dentro da própria equipe.';
      ras[key] = true;
    }
  }

  return '';
}

function buscarConflitoGlobal_(atletas, modalidade, ignorarEquipeId) {
  const cpfs = {};
  atletas.forEach(a => cpfs[normalizarCpf_(a.cpf)] = true);

  const ss = getSpreadsheet_();

  const shInd = ss.getSheetByName(CFG.ABA_INDEPENDENTES);
  if (shInd && shInd.getLastRow() >= 2) {
    const dados = shInd.getRange(2, 1, shInd.getLastRow() - 1, HEADERS_INDEPENDENTES.length).getValues();

    for (let i = 0; i < dados.length; i++) {
      const id = String(dados[i][1] || '');
      const mod = String(dados[i][4] || '');
      const cpf = normalizarCpf_(dados[i][14]);

      if (ignorarEquipeId && id === ignorarEquipeId) continue;

      if (mod === modalidade && cpf && cpfs[cpf]) {
        return 'Um dos atletas já está inscrito na modalidade "' + modalidade + '".';
      }
    }
  }

  const abas = Object.keys(CFG.ATLETICAS).map(a => CFG.ATLETICAS[a]);

  for (let a = 0; a < abas.length; a++) {
    const sh = ss.getSheetByName(abas[a]);
    if (!sh || sh.getLastRow() < 2) continue;

    const dados = sh.getRange(2, 1, sh.getLastRow() - 1, HEADERS_ATLETICA.length).getValues();

    for (let i = 0; i < dados.length; i++) {
      const id = String(dados[i][1] || '');
      const mod = String(dados[i][5] || '');
      const cpf = normalizarCpf_(dados[i][10]);

      if (ignorarEquipeId && id === ignorarEquipeId) continue;

      if (mod === modalidade && cpf && cpfs[cpf]) {
        return 'Um dos atletas já está inscrito na modalidade "' + modalidade + '".';
      }
    }
  }

  return '';
}

// ============================================================
// HELPERS
// ============================================================

function getSpreadsheet_() {
  return SpreadsheetApp.openById(CFG.SPREADSHEET_ID);
}

function modalidadeValida_(modalidade) {
  return CFG.MODALIDADES.indexOf(limparTexto_(modalidade)) >= 0;
}

function gerarIdEquipe_(prefixo) {
  return prefixo + '-' +
    Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss') +
    '-' + Utilities.getUuid().slice(0, 8).toUpperCase();
}

function limparTexto_(valor) {
  return String(valor == null ? '' : valor)
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 300);
}

function limparTextoLongo_(valor, limite) {
  return String(valor == null ? '' : valor)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, ' ')
    .trim()
    .slice(0, limite || 3000);
}

function normalizarCpf_(cpf) {
  return String(cpf || '').replace(/\D/g, '').slice(0, 11);
}

function cpfValido_(cpf) {
  const n = normalizarCpf_(cpf);

  if (!/^\d{11}$/.test(n)) return false;
  if (/^(\d)\1{10}$/.test(n)) return false;

  function calc(base, fator) {
    let total = 0;
    for (let i = 0; i < base.length; i++) {
      total += Number(base[i]) * fator--;
    }
    const resto = (total * 10) % 11;
    return resto === 10 ? 0 : resto;
  }

  return (
    calc(n.slice(0, 9), 10) === Number(n[9]) &&
    calc(n.slice(0, 10), 11) === Number(n[10])
  );
}

function emailValido_(email) {
  email = limparTexto_(email);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizarBoolean_(valor) {
  if (valor === true) return true;
  const s = String(valor || '').trim().toLowerCase();
  return ['true', '1', 'sim', 'ativo', 'yes'].indexOf(s) >= 0;
}

function fail_(message) {
  return { ok: false, message: String(message || 'Não foi possível concluir a operação.') };
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
