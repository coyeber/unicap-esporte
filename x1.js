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

$("x1Cpf").addEventListener("input",()=> $("x1Cpf").value=cpfMask($("x1Cpf").value));
$("x1Telefone").addEventListener("input",()=> $("x1Telefone").value=phoneMask($("x1Telefone").value));

$("x1Form").addEventListener("submit",async e=>{
  e.preventDefault();
  const form=e.currentTarget;
  const data={
    nome:$("x1Nome").value.trim(),
    ra:$("x1Ra").value.trim(),
    cpf:nums($("x1Cpf").value),
    telefone:$("x1Telefone").value.trim(),
    email:$("x1Email").value.trim(),
    curso:$("x1Curso").value.trim(),
    game:"X1 Futebol"
  };

  if(!data.nome || !data.ra || !data.cpf || !data.telefone || !data.email || !data.curso){
    toast("Preencha todos os campos.","error");
    return;
  }

  if(!validCPF(data.cpf)){
    toast("CPF inválido.","error");
    return;
  }

  const button=form.querySelector('button[type="submit"]');
  const original=button.textContent;
  button.disabled=true;
  button.textContent="Enviando...";

  try{
    const result=await unicapApi("saveEsportsRegistration",data);
    toast(`Inscrição no X1 realizada! ID: ${result.idInscricao}`);
    form.reset();
  }catch(err){
    toast(err instanceof Error ? err.message : "Não foi possível realizar a inscrição no X1.","error");
  }finally{
    button.disabled=false;
    button.textContent=original;
  }
});
