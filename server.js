const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));  // Serve os arquivos na pasta 'public'

io.on('connection', (socket) => {
    let nomeUsuario = null;
    let frequenciaAtual = null;

    // Definir o nome do usuário apenas uma vez
    socket.on('set nome', (nome) => {
        nomeUsuario = nome;
        console.log(`Usuário ${nomeUsuario} entrou`);
        socket.emit('mensagem', `Você entrou no rádio como ${nomeUsuario}`);
    });

    // Enviar mensagem para a frequência, mas sem mostrar o nome do usuário no chat
    socket.on('chat message', (msg, frequencia) => {
        console.log(`Mensagem de ${nomeUsuario || 'usuário desconhecido'} na frequência ${frequencia}: ${msg}`);
        io.to(frequencia).emit('chat message', msg);
    });

    // Trocar a frequência
    socket.on('trocar frequencia', (frequencia) => {
        frequenciaAtual = frequencia;
        console.log(`Usuário ${nomeUsuario || 'usuário desconhecido'} se conectou na frequência ${frequencia}`);
        socket.join(frequencia);  // Faz o usuário "entrar" na sala da frequência
    });

    // Desconectar o usuário (também ao desligar o rádio)
    socket.on('desligar rádio', () => {
        console.log(`Usuário ${nomeUsuario || 'usuário desconhecido'} desconectou ao desligar o rádio na frequência ${frequenciaAtual}`);
        socket.leave(frequenciaAtual);  // Faz o usuário sair da frequência
    });

    // Desconexão do usuário
    socket.on('disconnect', () => {
        console.log(`Usuário ${nomeUsuario || 'usuário desconhecido'} desconectou`);
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
