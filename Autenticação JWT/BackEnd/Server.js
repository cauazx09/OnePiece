const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json()); 
app.use(cors());

app.use(express.static(path.join(__dirname, '../frontEnd')));

const SEGREDO = 'minha_chave_super_secreta_123';

const usuarioCadastrado = {
    id: 1,
    username: 'Cauã',
    password: '230309',
};
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (username === usuarioCadastrado.username && password === usuarioCadastrado.password) {

        const payload = { userId: usuarioCadastrado.id };

        const token = jwt.sign(payload, SEGREDO, { expiresIn: '1h' });

        return res.json({ auth: true, token: token });
    }

    return res.status(401).json({ auth: false, message: 'Login inválido!' });
});
function verificarToken(req, res, next) {

    const authHeader = req.headers['authorization'];

    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
    }
    jwt.verify(token, SEGREDO, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Token inválido ou expirado.' });
        }

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
