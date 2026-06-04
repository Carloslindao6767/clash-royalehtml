const arena = document.getElementById('arena');
const barraElixir = document.getElementById('barra-elixir');
const textoElixir = document.getElementById('texto-elixir');
const placarTxt = document.getElementById('placar');
const deckContainer = document.getElementById('deck');

let elixir = 5;
let placar = 0;
let tropas = [];
let torres = [];
let idCounter = 0;

// Lista de Cartas do Jogo
const cartasDisponiveis = [
    { nome: "Mega Cavaleiro", custo: 7, vida: 3200, dano: 200, tipo: "tropa", tanque: true },
    { nome: "P.E.K.K.A", custo: 7, vida: 3400, dano: 420, tipo: "tropa", tanque: true },
    { nome: "Corredor", custo: 4, vida: 1400, dano: 160, tipo: "tropa", focaTorre: true },
    
    { nome: "Goblins", custo: 2, vida: 300, dano: 65, tipo: "tropa", quantidade: 3 },
    { nome: "Gangue de Goblins", custo: 3, vida: 300, dano: 60, tipo: "tropa", quantidade: 5 },
    { nome: "Goblin com Dardo", custo: 3, vida: 420, dano: 85, tipo: "tropa" },
    { nome: "Lançador", custo: 5, vida: 1600, dano: 140, tipo: "tropa", tanque: true },
    { nome: "Barril de Goblins", custo: 3, tipo: "feitico", efeito: "barril" },
    { nome: "Maldição Goblin", custo: 2, tipo: "feitico", efeito: "maldicao" },

    { nome: "Esqueletos", custo: 1, vida: 110, dano: 35, tipo: "tropa", quantidade: 3 },
    { nome: "Exército Esqueletos", custo: 3, vida: 110, dano: 35, tipo: "tropa", quantidade: 14 },
    { nome: "Bombardeiro", custo: 2, vida: 550, dano: 120, tipo: "tropa" },
    { nome: "Arqueiras Supremas", custo: 3, vida: 450, dano: 75, tipo: "tropa", quantidade: 2 },
    { nome: "Gigante Esqueleto", custo: 6, vida: 2800, dano: 190, tipo: "tropa", tanque: true, focaTorre: true },

    { nome: "Servos", custo: 3, vida: 420, dano: 75, tipo: "tropa", voadora: true, quantidade: 3 },
    { nome: "Bola de Neve", custo: 2, tipo: "feitico", efeito: "lentidao" },
    { nome: "Fábrica de Elixir", custo: 5, vida: 1200, tipo: "estrutura" }
];

function inicializarTorres() {
    torres = [
        { id: "ta_esq", x: 100, y: 420, hp: 2500, time: "aliada" },
        { id: "ta_dir", x: 320, y: 420, hp: 2500, time: "aliada" },
        { id: "ta_rei", x: 210, y: 470, hp: 4000, time: "aliada" },
        { id: "ti_esq", x: 100, y: 100, hp: 2500, time: "inimiga" },
        { id: "ti_dir", x: 320, y: 100, hp: 2500, time: "inimiga" },
        { id: "ti_rei", x: 210, y: 50, hp: 4000, time: "inimiga" }
    ];
    renderizarTorres();
}

function renderizarTorres() {
    document.querySelectorAll('.torre').forEach(t => t.remove());
    torres.forEach(t => {
        if (t.hp <= 0) return;
        const e = document.createElement('div');
        e.className = `torre ${t.time}`;
        e.id = t.id;
        e.style.left = `${t.x - 22}px`;
        e.style.top = `${t.y - 22}px`;
        e.innerHTML = `${t.hp}`;
        arena.appendChild(e);
    });
}

function logicaAtaqueTorres() {
    const agora = Date.now();
    torres.forEach(torre => {
        if (torre.hp <= 0) return;
        
        if (!torre.ultimoAtaque || agora - torre.ultimoAtaque > 900) {
            let alvo = null;
            let menorDist = 140;

            tropas.forEach(tropa => {
                if (tropa.time !== torre.time && tropa.tipo === "tropa") {
                    const dist = Math.hypot(tropa.x - torre.x, tropa.y - torre.y);
                    if (dist < menorDist) {
                        menorDist = dist;
                        alvo = tropa;
                    }
                }
            });

            if (alvo) {
                alvo.vida -= 90;
                criarEfeitoProjetil(torre.x, torre.y, alvo.x, alvo.y, "#f1c40f");
                torre.ultimoAtaque = agora;
            }
        }
    });
}

function criarEfeitoProjetil(oX, oY, dX, dY, cor) {
    const proj = document.createElement('div');
    proj.className = 'projetil';
    proj.style.left = `${oX}px`;
    proj.style.top = `${oY}px`;
    if(cor) proj.style.background = cor;
    arena.appendChild(proj);
    setTimeout(() => {
        proj.style.left = `${dX}px`;
        proj.style.top = `${dY}px`;
        setTimeout(() => proj.remove(), 80);
    }, 20);
}

function lancarFeitico(carta, x, y) {
    const div = document.createElement('div');
    div.className = 'efeito-feitico';
    div.style.left = `${x}px`;
    div.style.top = `${y}px`;
    
    if (carta.efeito === "lentidao") {
        div.style.background = "rgba(135, 206, 250, 0.6)";
        tropas.forEach(t => {
            if (t.time === "inimiga" && Math.hypot(t.x - x, t.y - y) < 70) {
                t.vida -= 120;
                t.velocidade = 0.5; 
            }
        });
    } else if (carta.efeito === "maldicao") {
        div.style.background = "rgba(46, 204, 113, 0.6)";
        tropas.forEach(t => {
            if (t.time === "inimiga" && Math.hypot(t.x - x, t.y - y) < 70) {
                t.vida -= 200;
            }
        });
    } else if (carta.efeito === "barril") {
        div.style.background = "rgba(39, 174, 96, 0.4)";
        const refGoblin = cartasDisponiveis.find(c => c.nome === "Goblins");
        for(let i=0; i<3; i++) {
            invocarTropa(refGoblin, x + (Math.random()*30 - 15), y + (Math.random()*30 - 15), "aliada");
        }
    }
    arena.appendChild(div);
    setTimeout(() => div.remove(), 500);
}

function invocarTropa(carta, x, y, time) {
    idCounter++;
    const novaTropa = {
        id: idCounter,
        nome: carta.nome,
        x: x,
        y: y,
        vida: carta.vida,
        dano: carta.dano || 0,
        tipo: carta.tipo,
        voadora: carta.voadora || false,
        focaTorre: carta.focaTorre || false,
        velocidade: carta.nome === "Corredor" ? 2.5 : carta.tanque ? 0.9 : 1.4,
        time: time,
        ultimoAtaque: 0
    };

    if(carta.tipo === "estrutura") novaTropa.ultimoAtaque = Date.now();

    tropas.push(novaTropa);

    const div = document.createElement('div');
    div.className = `tropa ${time} ${carta.voadora ? 'voadora' : ''} ${carta.tipo === 'estrutura' ? 'estrutura' : ''} ${carta.tanque ? 'tanque' : ''}`;
    div.id = `tropa-${novaTropa.id}`;
    div.innerText = carta.nome.substring(0, 2);
    
    if(carta.nome.includes("Goblin") || carta.nome === "Lançador") div.style.backgroundColor = "#2ecc71";
    else if(carta.nome.includes("Esqueleto") || carta.nome === "Bombardeiro" || carta.nome.includes("Supremas")) div.style.backgroundColor = "#95a5a6";
    else if(carta.nome === "Servos") div.style.backgroundColor = "#9b59b6";
    else if(carta.nome === "Corredor") div.style.backgroundColor = "#e67e22";
    else if(carta.nome === "Fábrica de Elixir") div.style.backgroundColor = "#e84393";
    else if(carta.nome === "Mega Cavaleiro" || carta.nome === "P.E.K.K.A") div.style.backgroundColor = "#34495e";

    arena.appendChild(div);
}

function atualizarLoopJogo() {
    logicaAtaqueTorres();

    for (let i = tropas.length - 1; i >= 0; i--) {
        let t = tropas[i];
        const el = document.getElementById(`tropa-${t.id}`);

        if (t.vida <= 0) {
            if (el) el.remove();
            if (t.time === "inimiga") {
                placar++;
                placarTxt.innerText = placar;
            }
            tropas.splice(i, 1);
            continue;
        }

        if (t.tipo === "estrutura" && t.nome === "Fábrica de Elixir") {
            t.vida -= 2; 
            if (Date.now() - t.ultimoAtaque > 2200) { 
                if (t.time === "aliada" && elixir < 10) elixir = Math.min(10, elixir + 1);
                t.ultimoAtaque = Date.now();
            }
            continue;
        }

        let alvoAlvo = null;
        let menorDistancia = 9999;

        if (t.focaTorre) {
            torres.forEach(torre => {
                if (torre.time !== t.time && torre.hp > 0) {
                    const dist = Math.hypot(torre.x - t.x, torre.y - t.y);
                    if (dist < menorDistancia) { menorDistancia = dist; alvoAlvo = torre; }
                }
            });
        } else {
            tropas.forEach(oponente => {
                if (oponente.time !== t.time) {
                    if (!t.voadora && oponente.voadora) return; 
                    const dist = Math.hypot(oponente.x - t.x, oponente.y - t.y);
                    if (dist < menorDistancia) { menorDistancia = dist; alvoAlvo = oponente; }
                }
            });
            if (!alvoAlvo) {
                torres.forEach(torre => {
                    if (torre.time !== t.time && torre.hp > 0) {
                        const dist = Math.hypot(torre.x - t.x, torre.y - t.y);
                        if (dist < menorDistancia) { menorDistancia = dist; alvoAlvo = torre; }
                    }
                });
            }
        }

                if (alvoAlvo) {
                    if (menorDistancia > 24) {
                        const angulo = Math.atan2(alvoAlvo.y - t.y, alvoAlvo.x - t.x);
                        t.x += Math.cos(angulo) * t.velocidade;
                        t.y += Math.sin(angulo) * t.velocidade;
                    } else {
                        if (Date.now() - t.ultimoAtaque > 850) {
                            alvoAlvo.hp ? alvoAlvo.hp -= t.dano : alvoAlvo.vida -= t.dano;
                            if (alvoAlvo.hp && alvoAlvo.hp <= 0) renderizarTorres();
                            criarEfeitoProjetil(t.x, t.y, alvoAlvo.x, alvoAlvo.y, t.voadora ? "#9b59b6" : "#fff");
                            t.ultimoAtaque = Date.now();
                        }
                    }
                }

        if (el) {
            el.style.left = `${t.x}px`;
            el.style.top = `${t.y}px`;
        }
    }

    if (Math.random() < 0.025) {
        const cartasFiltro = cartasDisponiveis.filter(c => c.tipo === "tropa");
        const cartaAleatoria = cartasFiltro[Math.floor(Math.random() * cartasFiltro.length)];
        
        if (cartaAleatoria.quantidade) {
            for(let k=0; k < cartaAleatoria.quantidade; k++) {
                invocarTropa(cartaAleatoria, (Math.random() * 240) + 80, 60 + (k*8), "inimiga");
            }
        } else {
            invocarTropa(cartaAleatoria, (Math.random() * 240) + 80, 60, "inimiga");
        }
    }
}

function carregarDeck() {
    deckContainer.innerHTML = "";
    cartasDisponiveis.forEach(carta => {
        const cardEl = document.createElement('div');
        cardEl.className = 'carta';
        cardEl.innerHTML = `
            <div class="custo">${carta.custo}</div>
            <div class="nome">${carta.nome}</div>
            <div class="tipo">${carta.tipo === "feitico" ? "Feitiço" : carta.tipo === "estrutura" ? "Construção" : carta.voadora ? "Voadora" : "Terrestre"}</div>
        `;
        
        cardEl.addEventListener('click', () => {
            if (elixir >= carta.custo) {
                elixir -= carta.custo;
                
                if (carta.efeito === "barril") {
                    lancarFeitico(carta, Math.random() * 200 + 100, 110);
                } else if (carta.tipo === "feitico") {
                    lancarFeitico(carta, Math.random() * 200 + 100, Math.random() * 150 + 120);
                } else if (carta.quantidade) {
                    for(let i=0; i<carta.quantidade; i++) {
                        invocarTropa(carta, Math.random() * 260 + 70, Math.random() * 60 + 350, "aliada");
                    }
                } else {
                    invocarTropa(carta, Math.random() * 260 + 70, 370, "aliada");
                }
            }
        });
        deckContainer.appendChild(cardEl);
    });
}

setInterval(() => {
    if (elixir < 10) {
        elixir = parseFloat((elixir + 0.1).toFixed(1));
        textoElixir.innerText = Math.floor(elixir);
        barraElixir.style.width = `${elixir * 10}%`;
    }
}, 120);

inicializarTorres();
carregarDeck();
setInterval(atualizarLoopJogo, 30);
