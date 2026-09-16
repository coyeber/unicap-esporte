const form = document.getElementById("coordinatorPageLogin");
const toast = document.getElementById("toast");

function showToast(msg, type="error"){
  toast.textContent = msg;
  toast.className = `toast show ${type}`;
  setTimeout(() => toast.className = "toast", 2800);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const user = document.getElementById("coordUser").value.trim();
  const pass = document.getElementById("coordPass").value.trim();

  if (!user || !pass) {
    showToast("Informe usuário e senha.");
    return;
  }

  const button = form.querySelector('button[type="submit"]');
  const original = button.innerHTML;
  button.disabled = true;
  button.textContent = "Entrando...";

  try {
    const result = await unicapApi("login", {
      usuario: user,
      senha: pass
    });

    sessionStorage.setItem("unicap_coord_token", result.token);
    sessionStorage.setItem("unicap_coord_user", user);
    sessionStorage.setItem("unicap_coord_athletic", result.atletica);
    sessionStorage.setItem("unicap_coord_name", result.nome || "Coordenador");

    showToast("Acesso autorizado.", "success");

    setTimeout(() => {
      window.location.href = "./cadastro-coordenador.html";
    }, 350);
  } catch (err) {
    showToast(err instanceof Error ? err.message : "Falha no login.");
  } finally {
    button.disabled = false;
    button.innerHTML = original;
  }
});
