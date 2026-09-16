const $ = id => document.getElementById(id);

function toast(message, type="success"){
  const el = $("toast");
  el.textContent = message;
  el.className = `toast show ${type}`;
  setTimeout(() => el.className = "toast", 3200);
}

$("adminLogin").addEventListener("submit", async (event) => {
  event.preventDefault();
  const usuario = $("adminUser").value.trim();
  const senha = $("adminPass").value;

  if(!usuario || !senha){
    toast("Informe usuário e senha.", "error");
    return;
  }

  const button = event.currentTarget.querySelector('button[type="submit"]');
  const original = button.textContent;
  button.disabled = true;
  button.textContent = "Entrando...";

  try{
    const result = await unicapApi("adminLogin", {usuario, senha});
    sessionStorage.setItem("unicap_admin_token", result.token);
    sessionStorage.setItem("unicap_admin_name", result.nome || "Administrador");
    window.location.href = "./painel-admin.html";
  }catch(err){
    toast(err instanceof Error ? err.message : "Não foi possível entrar.", "error");
  }finally{
    button.disabled = false;
    button.textContent = original;
  }
});
