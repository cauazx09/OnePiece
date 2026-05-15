const loginForm = document.getElementById('login-form');
const loginSection = document.getElementById('login-section');
const secretSection = document.getElementById('secret-section');
const loginMessage = document.getElementById('login-message');
const secretMessage = document.getElementById('secret-message');
const logoutButton = document.getElementById('logout-button');

const API_URL = 'http://localhost:3000';

async function accessSecretPanel() {
    const token = localStorage.getItem('jwt-token');
    if (!token) {
        showLogin();
        return;
    }

    try {
        const response = await fetch(`${API_URL}/painel-secreto`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.ok) {
            const data = await response.json();
            secretMessage.textContent = `${data.message} (Seu ID: ${data.seuId})`;
            secretMessage.style.color = 'green';
            showSecret();
        } else {
            localStorage.removeItem('jwt-token');
            showLogin();
            loginMessage.textContent = 'Sessão expirada. Faça login novamente.';
        }
    } catch (error) {
        console.error('Erro ao acessar painel:', error);
        showLogin();
        loginMessage.textContent = 'Erro ao conectar ao servidor.';
    }
}
if(window.location.pathname.includes('aluno.html')) {
    accessSecretPanel();
}


loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (data.auth) {
            localStorage.setItem('jwt-token', data.token);
            window.location.href = 'aluno.html';
        } else {
            loginMessage.textContent = data.message || 'Login falhou!';
        }
    } catch (error) {
        console.error('Erro no login:', error);
        loginMessage.textContent = 'Erro ao conectar ao servidor.';
    }
});


logoutButton.addEventListener('click', () => {
    localStorage.removeItem('jwt-token');
    showLogin();
    loginMessage.textContent = 'Você saiu.';
});

function showLogin() {
    loginSection.classList.remove('hidden');
    secretSection.classList.add('hidden');
}

function showSecret() {
    loginSection.classList.add('hidden');
    secretSection.classList.remove('hidden');
}

accessSecretPanel();
