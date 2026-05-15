const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json()); // Permite que a API entenda JSON
app.use(cors()); // Libera o acesso do Front-end

// Servir arquivos estáticos do front-end
app.use(express.static(path.join(__dirname, '../frontEnd')));

// Nossa "Chave Secreta" para assinar a pulseira VIP.
// Em projetos reais, guarde isso em um arquivo .env!
const SEGREDO = 'minha_chave_super_secreta_123';

// Nosso banco de dados de mentirinha
const usuarioCadastrado = {
    id: 1,
    username: 'aluno',
    password: '123',
};
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // 1. Verifica se o usuário e senha estão corretos
    if (username === usuarioCadastrado.username && password === usuarioCadastrado.password) {
        // 2. Cria o payload (dados que vão dentro do token)
        const payload = { userId: usuarioCadastrado.id };

        // 3. Gera o Token! (Assina o token com nosso SEGREDO e define validade de 1 hora)
        const token = jwt.sign(payload, SEGREDO, { expiresIn: '1h' });

        // 4. Devolve o token para o front-end
        return res.json({ auth: true, token: token });
    }

    // Se errar a senha...
    return res.status(401).json({ auth: false, message: 'Login inválido!' });
});
function verificarToken(req, res, next) {
    // 1. Pega o token que vem no cabeçalho (Header) da requisição
    const authHeader = req.headers['authorization'];

    // O padrão é enviar: "Bearer meutoken123". Então vamos separar o "Bearer" do token em si.
    const token = authHeader && authHeader.split(' ')[1];

    // 2. Se não tem token, barra na porta
    if (!token) {
        return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
    }

    // 3. Verifica se o token é válido e foi assinado pelo nosso SEGREDO
    jwt.verify(token, SEGREDO, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Token inválido ou expirado.' });
        }

        // Se deu tudo certo, salva o ID do usuário na requisição e deixa passar (next)
        req.userId = decoded.userId;
        next();
    });
}
app.get('/painel-secreto', verificarToken, (req, res) => {
    res.json({
        message: 'Bem-vindo à área VIP!',
        seuId: req.userId,
    });
});

app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000 🚀');
});
