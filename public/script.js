const socket = io();

const staticSound = document.getElementById('staticSound');
const radioSound = new Audio('som_real.mp3');
radioSound.loop = true;

const startButton = document.getElementById('startSound');
const messageInput = document.getElementById('messageInput');
const messagesDiv = document.getElementById('messages');
messagesDiv.scrollTop = messagesDiv.scrollHeight;

const fakeMessages = [
    "🎵 Tocando: 'Clube da Esquina nº 2'",
    "🗞️ Notícias: Previsão de chuva à tarde nas montanhas.",
    "📻 Dica do dia: Café com pão resolve tudo!",
    "🎶 Agora: 'Garota de Ipanema' - versão instrumental.",
    "🗣️ Voz ao fundo: 'Alô, alguém me escuta?'",
    "🔊 Aviso: trânsito intenso na Avenida Principal.",
    "🎵 Música clássica: Sonata nº14 de Beethoven.",
    "📢 Interferência detectada... continue na escuta.",
    "🎧 Entrevista com morador antigo do bairro central.",
    "🎶 Reprise de programa musical das 18h."
];

let radioLigado = false;
let ghostMessageInterval;
let frequenciaAtual = null;
let nomeUsuario = null;

function definirNome() {
    const input = document.getElementById('nomeInput');
    const nome = input.value.trim();

    if (nome !== "") {
        nomeUsuario = nome;
        socket.emit('set nome', nomeUsuario);
        document.getElementById('terminalPrompt').style.display = 'none';
        document.getElementById('chat').style.display = 'block';
        document.getElementById('startSound').style.display = 'inline-block';
        document.getElementById('frequency').disabled = false;
    }
}


function atualizarEstadoDoChat() {
    messageInput.disabled = !radioLigado;
}

document.getElementById('chat').style.display = 'none';

function mostrarBoot(callback) {
    const mensagensBoot = [
        "Iniciando sistema...",
        "Estabelecendo conexão com o servidor...",
        "Sintonizando transceptor Ômega...",
        "Carregando interface de usuário...",
        "Pronto. Sistema operacional online."
    ];

    let index = 0;
    function mostrarLinha() {
        if (index < mensagensBoot.length) {
            digitarMensagem(mensagensBoot[index]);
            index++;
            setTimeout(mostrarLinha, 600);
        } else {
            callback();
        }
    }
    mostrarLinha();
}


function startGhostMessages() {
    ghostMessageInterval = setInterval(() => {
        if (![101.1, 202.2, 303.3].includes(frequenciaAtual)) {
            const randomMessage = fakeMessages[Math.floor(Math.random() * fakeMessages.length)];
            const messageElement = document.createElement('div');
            messageElement.textContent = randomMessage;
            messagesDiv.appendChild(messageElement);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }
    }, Math.random() * 5000 + 3000);
}

function alternarRadio() {
    if (!radioLigado) {
        mostrarBoot(() => {
            staticSound.volume = 0.1;
            staticSound.play().catch(err => console.log('Autoplay bloqueado:', err));
            startButton.textContent = "Desligar Rádio";
            startButton.classList.add("active");
            radioLigado = true;
            startGhostMessages();
            atualizarEstadoDoChat();
        });
    }
     else {
        staticSound.pause();
        staticSound.currentTime = 0;
        radioSound.pause();
        radioSound.currentTime = 0;
        startButton.textContent = "Ligar Rádio";
        startButton.classList.remove("active");
        radioLigado = false;
        clearInterval(ghostMessageInterval);
        frequenciaAtual = null;
        socket.emit('desligar rádio');  // Enviar ao servidor que o rádio foi desligado
    }
    atualizarEstadoDoChat();
}

function setFrequency() {
    const freq = parseFloat(document.getElementById('frequency').value);

    if (!radioLigado) {
        alert("Ligue o rádio primeiro!");
        return;
    }

    frequenciaAtual = freq;
    messagesDiv.innerHTML = "";

    if ([101.1, 202.2, 303.3].includes(freq)) {
        socket.emit('trocar frequencia', freq);
        staticSound.pause();
        staticSound.currentTime = 0;
        radioSound.volume = 0.1;
        radioSound.play().catch(err => console.log('Erro ao tocar som real:', err));
    } else {
        radioSound.pause();
        radioSound.currentTime = 0;
        staticSound.volume = 0.1;
        staticSound.play().catch(err => console.log('Erro ao tocar chiado:', err));
    }

    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function sendMessage() {
    const message = messageInput.value;
    if (message.trim() === '') return;

    if (message.startsWith('!')) {
        tratarComando(message.trim());
        messageInput.value = '';
        return;
    }

    if (radioLigado) {
        socket.emit('chat message', message, frequenciaAtual);
        messageInput.value = '';
    }
}

function tratarComando(comando) {
    switch (comando) {
        case '!help':
            digitarMensagem("Comandos disponíveis: !help, !status");
            break;
        case '!status':
            digitarMensagem(`Usuário: ${nomeUsuario} | Frequência: ${frequenciaAtual || 'Nenhuma'} | Rádio: ${radioLigado ? 'Ligado' : 'Desligado'}`);
            break;
        default:
            digitarMensagem("Comando não reconhecido. Digite !help para ver a lista.");
    }
}


socket.on('chat message', (msg) => {
    digitarMensagem(msg);
});


startButton.addEventListener('click', alternarRadio);

document.getElementById('frequency').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') setFrequency();
});

document.querySelector('#chat button').addEventListener('click', sendMessage);

function digitarMensagem(mensagem) {
    const msgElement = document.createElement('div');
    msgElement.classList.add('linha');
    messagesDiv.appendChild(msgElement);

    let i = 0;
    function escrever() {
        if (i < mensagem.length) {
            msgElement.textContent += mensagem.charAt(i);
            i++;
            setTimeout(escrever, 30);
        } else {
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }
    }
    escrever();
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('chat').style.display = 'none';
    document.getElementById('startSound').style.display = 'none';
    document.getElementById('frequency').disabled = true;
});
