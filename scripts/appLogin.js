const sign_in_btn = document.querySelector("#sign-in-btn");
const sign_up_btn = document.querySelector("#sign-up-btn");
const container = document.querySelector(".container");

sign_up_btn.addEventListener("click", () => {
  container.classList.add("sign-up-mode");
});

sign_in_btn.addEventListener("click", () => {
  container.classList.remove("sign-up-mode");
});

//JavaScript para Conectar com o Backend

const server_url = "https://agenda-online-back-end.vercel.app"

//Cadastro
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
      const response = await fetch(`${server_url}/api/users/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password })
      });

      if (response.ok) {
          alert('Usuário cadastrado com sucesso!');
          window.location.href = 'LoginPage.html'; // Redireciona para a página de login
      } else {
          const error = await response.json();
          alert(error.error || 'Falha ao cadastrar usuário');
      }
  } catch (error) {
      console.error('Erro ao cadastrar:', error);
      alert('Erro ao conectar ao servidor');
  }
});

//Login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username_login').value;
  const password = document.getElementById('password_login').value;

  try {
      const response = await fetch(`${server_url}/api/users/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
      });

      if (response.ok) {
          const data = await response.json();
          localStorage.setItem('token', data.token); // Armazena o token JWT no navegador
          alert('Login bem-sucedido!');
          window.location.href = '../index.html'; // Redireciona para a página do calendário
      } else {
          const error = await response.json();
          alert(error.error || 'Falha no login');
      }
  } catch (error) {
      console.error('Erro ao fazer login:', error);
      alert('Erro ao conectar ao servidor');
  }
});

