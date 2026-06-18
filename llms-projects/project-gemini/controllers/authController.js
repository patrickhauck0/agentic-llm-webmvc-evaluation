const UsuarioModel = require('../models/UsuarioModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AuthController {
    static async registrar(req, res) {
        try {
            const { nome, email, senha } = req.body;

            // Validações básicas
            if (!nome || nome.length > 100) {
                return res.status(400).json({ erro: 'Nome inválido ou excede 100 caracteres' });
            }
            if (!email || email.length > 255) {
                return res.status(400).json({ erro: 'E-mail inválido' });
            }
            if (!senha || senha.length < 6) {
                return res.status(400).json({ erro: 'Senha deve conter no mínimo 6 caracteres' });
            }

            // Verificar se o e-mail já existe
            const emailExiste = await UsuarioModel.verificarEmailExiste(email);
            if (emailExiste) {
                return res.status(409).json({ erro: 'E-mail já cadastrado' });
            }

            // Gerar hash da senha
            const salt = await bcrypt.genSalt(10);
            const senhaHash = await bcrypt.hash(senha, salt);

            // Criar o usuário
            const novoUsuario = await UsuarioModel.criarUsuario(nome, email, senhaHash);

            return res.status(201).json(novoUsuario);
        } catch (error) {
            console.error('Erro no registro de usuário:', error);
            return res.status(500).json({ erro: 'Erro interno do servidor' });
        }
    }

    static async login(req, res) {
        try {
            const { email, senha } = req.body;

            if (!email || !senha) {
                return res.status(401).json({ erro: 'E-mail ou senha incorretos' });
            }

            const usuario = await UsuarioModel.buscarPorEmail(email);

            if (!usuario) {
                return res.status(401).json({ erro: 'E-mail ou senha incorretos' });
            }

            const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

            if (!senhaValida) {
                return res.status(401).json({ erro: 'E-mail ou senha incorretos' });
            }

            // Gerar Token JWT com duração de 24h
            const token = jwt.sign(
                { id_usuario: usuario.id_usuario },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            return res.status(200).json({ token });
        } catch (error) {
            console.error('Erro no login:', error);
            return res.status(500).json({ erro: 'Erro interno do servidor' });
        }
    }

    static async logout(req, res) {
        // Como o JWT é stateless, o logout real é feito no frontend descartando o token.
        // Retornamos 200 de forma simbólica.
        return res.status(200).json({ mensagem: 'Logout realizado com sucesso' });
    }
}

module.exports = AuthController;
