const $ = id => document.getElementById(id);
const nums = v => String(v || "").replace(/\D/g,"");
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
  const calc=(base,factor)=>{
    let total=0;
    for(const digit of base) total += Number(digit)*factor--;
    const rest=(total*10)%11;
    return rest===10?0:rest;
  };
  return calc(n.slice(0,9),10)===Number(n[9]) && calc(n.slice(0,10),11)===Number(n[10]);
}
function toast(msg,type="success"){
  const e=$("toast");
  e.textContent=msg;
  e.className=`toast show ${type}`;
  setTimeout(()=>e.className="toast",3500);
}
$("espCpf").addEventListener("input",()=> $("espCpf").value=cpfMask($("espCpf").value));
$("espTelefone").addEventListener("input",()=> $("espTelefone").value=phoneMask($("espTelefone").value));

$("esportsForm").addEventListener("submit",async e=>{
  e.preventDefault();
  const data={
    nome:$("espNome").value.trim(),
    ra:$("espRa").value.trim(),
    cpf:nums($("espCpf").value),
    telefone:$("espTelefone").value.trim(),
    email:$("espEmail").value.trim(),
    curso:$("espCurso").value.trim(),
    game:$("espGame").value
  };
  if(!data.nome || !data.ra || !data.cpf || !data.telefone || !data.email || !data.curso || !data.game){
    toast("Preencha todos os campos.","error"); return;
  }
  if(!validCPF(data.cpf)){ toast("CPF inválido.","error"); return; }
  const button=e.currentTarget.querySelector('button[type="submit"]');
  const original=button.textContent;
  button.disabled=true; button.textContent="Enviando...";
  try{
    const result=await unicapApi("saveEsportsRegistration",data);
    toast(`Inscrição realizada! ID: ${result.idInscricao}`);
    e.currentTarget.reset();
  }catch(err){
    toast(err instanceof Error ? err.message : "Não foi possível realizar a inscrição.","error");
  }finally{
    button.disabled=false; button.textContent=original;
  }
});
