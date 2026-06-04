// --- DATABASE DE CARTAS ---
const CARD_POOL = [
    { id: 'caballero', name: 'Cavaleiro', cost: 3, type: 'tropa', hp: 1400, dmg: 160, range: 30, speed: 1.8, attackSpeed: 1200, target: 'terrestre' },
    { id: 'arquera', name: 'Arqueiras', cost: 3, type: 'tropa', hp: 550, dmg: 90, range: 140, speed: 2.2, attackSpeed: 1000, target: 'mixto' },
    { id: 'barbaro', name: 'Bárbaro', cost: 5, type: 'tropa', hp: 1150, dmg: 145, range: 30, speed: 1.5, attackSpeed: 1400, target: 'terrestre' },
    { id: 'mini_pekka', name: 'Mini P.E.K.K.A', cost: 4, type: 'tropa', hp: 1250, dmg: 480, range: 35, speed: 2.6, attackSpeed: 1600, target: 'terrestre' },
    { id: 'gigante', name: 'Gigante', cost: 5, type: 'tropa', hp: 3400, dmg: 220, range: 35, speed: 1.1, attackSpeed: 1500, target: 'estruturas' },
    { id: 'mosquetera', name: 'Mosqueteira', cost: 4, type: 'tropa', hp: 750, dmg: 190, range: 165, speed: 1.8, attackSpeed: 1100, target: 'mixto' },
    { id: 'mega_cavaleiro', name: 'Mega Cavaleiro', cost: 7, type: 'tropa', hp: 3300, dmg: 250, range: 40, speed: 1.7, attackSpeed: 1700, target: 'terrestre', splash: true },
    { id: 'pekka', name: 'P.E.K.K.A', cost: 7, type: 'tropa', hp: 3600, dmg: 680, range: 40, speed: 1.2, attackSpeed: 1800, target: 'terrestre' },
    { id: 'canon', name: 'Canhão', cost: 3, type: 'estructura', hp: 880, dmg: 160, range: 135, speed: 0, attackSpeed: 800, target: 'terrestre', lifetime: 30000 },
    { id: 'bola_fuego', name: 'Bola de Fogo', cost: 4, type: 'hechizo', dmg: 580, radius: 65 },
    { id: 'flechas', name: 'Flechas', cost: 3, type: 'hechizo', dmg: 300, radius: 95 }
];

const AppState = {
    selectedDeck: [],
    aiDifficulty: 'medium',
    gameRunning: false
};

// Rastreador global da mecânica Drag and Drop do Canvas
let dragTracker = {
    isDragging: false,
    card: null,
    handIndex: null,
    currentX: 0,
    currentY: 0
};

document.addEventListener("DOMContentLoaded", () => {
    initDeckBuilder();
    setupMenuEvents();
});

function initDeckBuilder() {
    const poolContainer = document.getElementById("cards-pool");
    const slotsContainer = document.getElementById("deck-slots-container");
    
    slotsContainer.innerHTML = "";
    for(let i=0; i<8; i++) {
        const slot = document.createElement("div");
        slot.className = "deck-slot";
        slot.innerHTML = `<span style="font-size:0.5rem; color:#475569;">VAZIO</span>`;
        slotsContainer.appendChild(slot);
    }

    poolContainer.innerHTML = "";
    CARD_POOL.forEach(card => {
        const cardEl = document.createElement("div");
        cardEl.className = "card-item";
        cardEl.innerHTML = `
            <div class="card-elixir">${card.cost}</div>
            <div style="font-size:1.1rem; margin-top:2px;">${getCardIcon(card.id)}</div>
            <div class="card-name">${card.name}</div>
        `;
        cardEl.addEventListener("click", () => toggleCardInDeck(card, cardEl));
        poolContainer.appendChild(cardEl);
    });
}

function getCardIcon(id) {
    const icons = {
        caballero: '⚔️', arquera: '🏹', barbaro: '🪓', mini_pekka: '🤖', gigante: '🛡️',
        mosquetera: '🔫', canon: '💥', bola_fuego: '🔥', flechas: '🏹'
    };
    return icons[id] || '🃏';
}

function toggleCardInDeck(card, element) {
    const index = AppState.selectedDeck.findIndex(c => c.id === card.id);
    if (index > -1) {
        AppState.selectedDeck.splice(index, 1);
        element.classList.remove("selected-in-deck");
    } else {
        if (AppState.selectedDeck.length >= 8) return;
        AppState.selectedDeck.push(card);
        element.classList.add("selected-in-deck");
    }
    updateDeckUI();
}

function updateDeckUI() {
    const slots = document.querySelectorAll(".deck-slot");
    slots.forEach((slot, i) => {
        const card = AppState.selectedDeck[i];
        if (card) {
            slot.innerHTML = `
                <div class="card-item" style="width:100%; height:100%; box-shadow:none; padding:2px;">
                    <div class="card-elixir" style="width:14px; height:14px; font-size:0.55rem; top:-2px; left:-2px;">${card.cost}</div>
                    <div style="font-size:0.8rem;">${getCardIcon(card.id)}</div>
                    <div class="card-name" style="font-size:0.5rem; margin:0;">${card.name}</div>
                </div>
            `;
        } else {
            slot.innerHTML = `<span style="font-size:0.5rem; color:#475569;">VAZIO</span>`;
        }
    });
    document.getElementById("start-battle-btn").disabled = (AppState.selectedDeck.length !== 8);
}

function setupMenuEvents() {
    document.getElementById("start-battle-btn").addEventListener("click", () => {
        AppState.aiDifficulty = document.getElementById("ai-difficulty").value;
        document.getElementById("deck-menu").classList.add("hidden");
        document.getElementById("game-screen").classList.remove("hidden");
        BattleEngine.init();
    });
}

// --- ENGINE DE EXECUÇÃO INTERNA DA ARENA ---
const BattleEngine = {
    canvas: null, ctx: null, width: 0, height: 0,
    entities: [], projectiles: [], particles: [],
    lastTime: 0, matchTimer: 180,
    playerElixir: 5.0, playerDeck: [], playerHand: [], playerNextCard: null,
    enemyElixir: 5.0, enemyDeck: [], enemyHand: [], aiDecisionTimer: 0, gameOver: false,

    init() {
        this.canvas = document.getElementById("battle-canvas");
        this.ctx = this.canvas.getContext("2d");
        
        this.resizeCanvas();
        this.entities = []; this.projectiles = []; this.particles = []; this.gameOver = false;
        this.matchTimer = 180; this.playerElixir = 5.0; this.enemyElixir = 5.0;

        this.playerDeck = [...AppState.selectedDeck].sort(() => Math.random() - 0.5);
        this.playerHand = this.playerDeck.splice(0, 4);
        this.playerNextCard = this.playerDeck.shift();

        this.enemyDeck = [...CARD_POOL].sort(() => Math.random() - 0.5).slice(0, 8);
        this.enemyHand = this.enemyDeck.splice(0, 4);

        this.spawnBases();
        this.setupDragAndDrop();
        this.updateHandUI();
        
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.loop(t));
    },

    resizeCanvas() {
        const container = document.getElementById("canvas-container");
        this.width = container.clientWidth;
        this.height = container.clientHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    },

    spawnBases() {
        const w = this.width; const h = this.height;
        // Aliadas
        this.entities.push({ id: 'base_jogador', type: 'estructura', side: 'player', isBase: true, x: w / 2, y: h - 50, radius: 24, hp: 4000, maxHp: 4000, dmg: 100, range: 140, attackSpeed: 1000, lastAttack: 0 });
        this.entities.push({ id: 'torre_p1', type: 'estructura', side: 'player', isBase: false, x: w * 0.25, y: h - 110, radius: 18, hp: 2500, maxHp: 2500, dmg: 80, range: 150, attackSpeed: 800, lastAttack: 0 });
        this.entities.push({ id: 'torre_p2', type: 'estructura', side: 'player', isBase: false, x: w * 0.75, y: h - 110, radius: 18, hp: 2500, maxHp: 2500, dmg: 80, range: 150, attackSpeed: 800, lastAttack: 0 });
        // Inimigas
        this.entities.push({ id: 'base_inimiga', type: 'estructura', side: 'enemy', isBase: true, x: w / 2, y: 50, radius: 24, hp: 4000, maxHp: 4000, dmg: 100, range: 140, attackSpeed: 1000, lastAttack: 0 });
        this.entities.push({ id: 'torre_e1', type: 'estructura', side: 'enemy', isBase: false, x: w * 0.25, y: 110, radius: 18, hp: 2500, maxHp: 2500, dmg: 80, range: 150, attackSpeed: 800, lastAttack: 0 });
        this.entities.push({ id: 'torre_e2', type: 'estructura', side: 'enemy', isBase: false, x: w * 0.75, y: 110, radius: 18, hp: 2500, maxHp: 2500, dmg: 80, range: 150, attackSpeed: 800, lastAttack: 0 });
    },

    setupDragAndDrop() {
        const slots = document.querySelectorAll(".hand-slot");
        
        const startDragHandler = (index, element) => {
            const card = this.playerHand[index];
            if (!card || this.playerElixir < card.cost) return;

            dragTracker.isDragging = true;
            dragTracker.card = card;
            dragTracker.handIndex = index;
            element.classList.add("dragging-active");
        };

        slots.forEach((slot, idx) => {
            slot.addEventListener("mousedown", () => startDragHandler(idx, slot));
            slot.addEventListener("touchstart", () => startDragHandler(idx, slot), { passive: true });
        });

        const updatePosition = (clientX, clientY) => {
            if (!dragTracker.isDragging) return;
            const rect = this.canvas.getBoundingClientRect();
            dragTracker.currentX = clientX - rect.left;
            dragTracker.currentY = clientY - rect.top;
        };

        window.addEventListener("mousemove", (e) => updatePosition(e.clientX, e.clientY));
        window.addEventListener("touchmove", (e) => {
            if(e.touches.length > 0) updatePosition(e.touches[0].clientX, e.touches[0].clientY);
        }, { passive: true });

        const releaseHandler = () => {
            if (!dragTracker.isDragging) return;

            const x = dragTracker.currentX; const y = dragTracker.currentY;
            const card = dragTracker.card;

            if (x >= 0 && x <= this.width && y >= 0 && y <= this.height) {
                if (this.playerElixir >= card.cost) {
                    if (card.type === 'hechizo' || y > this.height / 2 + 10) {
                        this.playerElixir -= card.cost;
                        this.deployCard(x, y, card, 'player');

                        this.playerHand[dragTracker.handIndex] = this.playerNextCard;
                        this.playerDeck.push(card);
                        this.playerNextCard = this.playerDeck.shift();
                        this.updateHandUI();
                    } else {
                        this.triggerStatusText("INVOCAÇÃO BLOQUEADA NO CAMPO INIMIGO!");
                    }
                } else {
                    this.triggerStatusText("ELIXIR INSUFICIENTE!");
                }
            }

            dragTracker.isDragging = false;
            slots.forEach(s => s.classList.remove("dragging-active"));
        };

        window.addEventListener("mouseup", releaseHandler);
        window.addEventListener("touchend", releaseHandler);
    },

    deployCard(x, y, card, side) {
        this.generateSparkParticles(x, y, side === 'player' ? '#3b82f6' : '#ef4444', 12);

        if (card.type === 'hechizo') {
            this.particles.push({ type: 'spell', x: x, y: y, maxRadius: card.radius, currentRadius: 0, duration: 300, startTime: Date.now() });
            setTimeout(() => {
                this.entities.filter(e => e.side !== side).forEach(enemy => {
                    if (Math.hypot(enemy.x - x, enemy.y - y) <= card.radius + enemy.radius) enemy.hp -= card.dmg;
                });
            }, 150);
            return;
        }

        const spawnCount = (card.id === 'arquera') ? 2 : (card.id === 'barbaro') ? 3 : 1;
        for (let i = 0; i < spawnCount; i++) {
            this.entities.push({
                ...card, id: card.id + "_" + Date.now() + "_" + i, side: side,
                x: x + (i * 15 - (spawnCount - 1) * 7), y: y + (side === 'enemy' ? -i*4 : i*4),
                radius: card.type === 'estructura' ? 16 : 12, maxHp: card.hp, lastAttack: 0
            });
        }
    },

    updateHandUI() {
        const slots = document.querySelectorAll(".hand-slot");
        slots.forEach((slot, i) => {
            const card = this.playerHand[i];
            slot.innerHTML = card ? `
                <div class="card-item">
                    <div class="card-elixir">${card.cost}</div>
                    <div style="font-size:1.1rem; margin-top:4px;">${getCardIcon(card.id)}</div>
                    <div class="card-name">${card.name}</div>
                </div>` : "";
        });

        document.getElementById("next-card-slot").innerHTML = this.playerNextCard ? `
            <div class="card-item" style="width:100%; height:100%; box-shadow:none; opacity:0.6;">
                <div class="card-elixir" style="width:14px; height:14px; font-size:0.55rem; top:-3px; left:-3px;">${this.playerNextCard.cost}</div>
                <div style="font-size:0.75rem; margin-top:4px;">${getCardIcon(this.playerNextCard.id)}</div>
            </div>` : "";
    },

    triggerStatusText(msg) {
        const textElement = document.getElementById("match-status-text");
        textElement.textContent = msg; textElement.style.opacity = 1;
        setTimeout(() => { textElement.style.opacity = 0; }, 1200);
    },

    loop(time) {
        if (this.gameOver) return;
        const dt = time - this.lastTime;
        this.lastTime = time;

        this.matchTimer -= dt / 1000;
        if (this.matchTimer <= 0) return this.endMatch('draw');

        // Regeneração de Elixir
        const regen = dt / 2800;
        this.playerElixir = Math.min(10, this.playerElixir + regen);
        this.enemyElixir = Math.min(10, this.enemyElixir + regen);

        document.getElementById("elixir-counter").textContent = Math.floor(this.playerElixir);
        document.getElementById("elixir-bar-fill").style.width = `${(this.playerElixir / 10) * 100}%`;

        // Inteligência Artificial Simples
        this.aiDecisionTimer += dt;
        let aiInterval = AppState.aiDifficulty === 'easy' ? 3000 : AppState.aiDifficulty === 'medium' ? 1800 : 1000;
        if (this.aiDecisionTimer >= aiInterval) {
            this.aiDecisionTimer = 0;
            const card = this.enemyHand[Math.floor(Math.random() * this.enemyHand.length)];
            if (card && this.enemyElixir >= card.cost) {
                this.enemyElixir -= card.cost;
                this.deployCard(this.width * (0.2 + Math.random() * 0.6), this.height * 0.2, card, 'enemy');
                const idx = this.enemyHand.indexOf(card);
                this.enemyHand[idx] = this.enemyDeck.shift(); this.enemyDeck.push(card);
            }
        }

        this.updatePhysics(dt);
        this.render();
        requestAnimationFrame((t) => this.loop(t));
    },

    updatePhysics(dt) {
        const w = this.width; const h = this.height;
        const now = Date.now();

        this.entities = this.entities.filter(e => {
            if (e.hp <= 0) {
                if (e.id === 'base_jogador') this.endMatch('enemy');
                if (e.id === 'base_inimiga') this.endMatch('player');
                return false;
            }
            return true;
        });

        this.entities.forEach(ent => {
            if (ent.speed === 0) return;

            let targets = this.entities.filter(t => t.side !== ent.side);
            if (ent.target === 'estructuras') targets = targets.filter(t => t.type === 'estructura');
            if (targets.length === 0) return;

            let closest = null; let minDist = Infinity;
            targets.forEach(t => {
                const d = Math.hypot(t.x - ent.x, t.y - ent.y);
                if (d < minDist) { minDist = d; closest = t; }
            });

            if (!closest) return;

            // Combate básico e disparo de Projéteis
            if (minDist <= ent.range + closest.radius) {
                if (now - ent.lastAttack >= ent.attackSpeed) {
                    ent.lastAttack = now;
                    if (ent.range > 40) {
                        this.projectiles.push({ x: ent.x, y: ent.y, target: closest, dmg: ent.dmg, speed: 5 });
                    } else {
                        closest.hp -= ent.dmg;
                    }
                }
                return;
            }

            // Pathfinding em direção às pontes artificiais do Rio Central
            let tx = closest.x; let ty = closest.y;
            const needsBridge = (ent.side === 'player' && ent.y > h/2 && ty < h/2) || (ent.side === 'enemy' && ent.y < h/2 && ty > h/2);
            if (needsBridge && Math.abs(ent.y - h/2) > 12) {
                tx = ent.x < w / 2 ? w * 0.25 : w * 0.75;
                ty = h / 2;
            }

            const angle = Math.atan2(ty - ent.y, tx - ent.x);
            ent.x += Math.cos(angle) * (ent.speed * (dt / 16.6));
            ent.y += Math.sin(angle) * (ent.speed * (dt / 16.6));
        });

        this.projectiles = this.projectiles.filter(p => {
            if (p.target.hp <= 0) return false;
            const angle = Math.atan2(p.target.y - p.y, p.target.x - p.x);
            p.x += Math.cos(angle) * p.speed; p.y += Math.sin(angle) * p.speed;

            if (Math.hypot(p.target.x - p.x, p.target.y - p.y) <= p.target.radius) {
                p.target.hp -= p.dmg; return false;
            }
            return true;
        });
    },

    generateSparkParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                type: 'spark', x: x, y: y,
                vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4,
                radius: Math.random() * 2 + 1, color: color, life: 300, startTime: Date.now()
            });
        }
    },

    render() {
        const ctx = this.ctx; const w = this.width; const h = this.height;
        ctx.clearRect(0, 0, w, h);

        // Estilização do Tabuleiro (Gramado Alternado)
        ctx.fillStyle = "#2e5c34"; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "#27522d"; 
        for(let i=0; i<h; i+=40){ if((i/40)%2===0) ctx.fillRect(0, i, w, 40); }

        // O Rio Central
        ctx.fillStyle = "#1d4ed8"; ctx.fillRect(0, h/2 - 10, w, 20);

        // Pontes
        ctx.fillStyle = "#78350f";
        ctx.fillRect(w * 0.16, h/2 - 14, w * 0.18, 28);
        ctx.fillRect(w * 0.66, h/2 - 14, w * 0.18, 28);

        // Renderização das Torres e Soldados com Glow Sombreado
        this.entities.forEach(ent => {
            ctx.save();
            ctx.shadowBlur = ent.isBase ? 12 : 5;
            ctx.shadowColor = ent.side === 'player' ? '#2563eb' : '#dc2626';
            ctx.fillStyle = ent.side === 'player' ? '#2563eb' : '#dc2626';

            ctx.beginPath(); ctx.arc(ent.x, ent.y, ent.radius, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1.5; ctx.stroke();
            
            ctx.shadowBlur = 0;
            ctx.fillStyle = "#ffffff"; ctx.font = `${ent.radius * 0.9}px Arial`;
            ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.fillText(getCardIcon(ent.id.split('_')[0]), ent.x, ent.y);

            if (ent.hp < ent.maxHp) {
                ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.fillRect(ent.x - ent.radius, ent.y - ent.radius - 7, ent.radius*2, 4);
                ctx.fillStyle = ent.side === 'player' ? '#10b981' : '#f59e0b';
                ctx.fillRect(ent.x - ent.radius, ent.y - ent.radius - 7, (ent.radius*2) * (ent.hp / ent.maxHp), 4);
            }
            ctx.restore();
        });

        // Projéteis
        this.projectiles.forEach(p => {
            ctx.fillStyle = "#fef08a"; ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill();
        });

        // Partículas Especiais ativos
        const now = Date.now();
        this.particles = this.particles.filter(p => {
            const age = now - p.startTime;
            if (age >= p.life || age >= p.duration) return false;

            ctx.save();
            if (p.type === 'spark') {
                p.x += p.vx; p.y += p.vy; ctx.globalAlpha = 1 - (age / p.life);
                ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill();
            } else if (p.type === 'spell') {
                ctx.strokeStyle = `rgba(244, 63, 94, ${1 - (age / p.duration)})`; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.arc(p.x, p.y, (age / p.duration) * p.maxRadius, 0, Math.PI * 2); ctx.stroke();
            }
            ctx.restore();
            return true;
        });

        // Interface Gráfica Flutuante do Sistema Drag & Drop (Ghost)
        if (dragTracker.isDragging && dragTracker.currentX > 0) {
            ctx.save();
            ctx.fillStyle = dragTracker.currentY > h/2 + 10 || dragTracker.card.type === 'hechizo' ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)";
            ctx.beginPath(); ctx.arc(dragTracker.currentX, dragTracker.currentY, dragTracker.card.type === 'hechizo' ? dragTracker.card.radius : 20, 0, Math.PI*2); ctx.fill();

            ctx.fillStyle = "rgba(255, 255, 255, 0.8)"; ctx.font = "22px Arial";
            ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.fillText(getCardIcon(dragTracker.card.id), dragTracker.currentX, dragTracker.currentY);
            ctx.restore();
        }
    },

    endMatch(winner) {
        this.gameOver = true;
        alert(winner === 'player' ? "VITÓRIA EXCELENTE!" : winner === 'enemy' ? "DERROTA. TENTE OUTRA ESTRATÉGIA!" : "EMPATE!");
        document.getElementById("game-screen").classList.add("hidden");
        document.getElementById("deck-menu").classList.remove("hidden");
        initDeckBuilder();
    }
};
