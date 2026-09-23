
const form = document.getElementById("creatorLogin");
const toast = document.getElementById("toast");

function showToast(msg, type="error"){
  toast.textContent = msg;
  toast.className = `toast show ${type}`;
  setTimeout(() => toast.className = "toast", 3000);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("creatorEmail").value.trim();
  const senha = document.getElementById("creatorPass").value;

  if(!email || !senha){
    showToast("Informe e-mail e senha.");
    return;
  }

  const button = form.querySelector('button[type="submit"]');
  const original = button.innerHTML;
  button.disabled = true;
  button.textContent = "Entrando...";

  try{
    const result = await unicapApi("creatorLogin", {email, senha});
    sessionStorage.setItem("unicap_creator_token", result.token);
    sessionStorage.setItem("unicap_creator_name", result.nome || "Criador de Equipe");
    sessionStorage.setItem("unicap_creator_email", result.email || email);
    showToast("Acesso autorizado.", "success");
    setTimeout(() => window.location.href = "./painel-criador.html", 350);
  }catch(err){
    showToast(err instanceof Error ? err.message : "Falha no login.");
  }finally{
    button.disabled = false;
    button.innerHTML = original;
  }
});
