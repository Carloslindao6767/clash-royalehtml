// --- BANCO DE DADOS DAS CARTAS EM PORTUGUÊS ---
const CARD_POOL = [
    { id: 'caballero', name: 'Cavaleiro', cost: 3, type: 'tropa', hp: 1400, dmg: 160, range: 30, speed: 1.8, attackSpeed: 1200, target: 'terrestre', desc: 'Guerreiro balanceado corpo a corpo.' },
    { id: 'arquera', name: 'Arqueiras', cost: 3, type: 'tropa', hp: 550, dmg: 90, range: 140, speed: 2.2, attackSpeed: 1000, target: 'mixto', desc: 'Duas arqueiras rápidas a distância.' },
    { id: 'barbaro', name: 'Bárbaro', cost: 5, type: 'tropa', hp: 1150, dmg: 145, range: 30, speed: 1.5, attackSpeed: 1400, target: 'terrestre', desc: 'Forte, resistente e implacável.' },
    { id: 'mini_pekka', name: 'Mini P.E.K.K.A', cost: 4, type: 'tropa', hp: 1250, dmg: 480, range: 35, speed: 2.6, attackSpeed: 1600, target: 'terrestre', desc: 'Destrói alvos pesados num piscar de olhos.' },
    { id: 'gigante', name: 'Gigante', cost: 5, type: 'tropa', hp: 3400, dmg: 220, range: 35, speed: 1.1, attackSpeed: 1500, target: 'estruturas', desc: 'Foca apenas na base inimiga.' },
    { id: 'mosquetera', name: 'Mosqueteira', cost: 4, type: 'tropa', hp: 750, dmg: 190, range: 165, speed: 1.8, attackSpeed: 1100, target: 'mixto', desc: 'Dano alto e certeiro a longa distância.' },
    { id: 'mega_cavaleiro', name: 'Mega Cavaleiro', cost: 7, type: 'tropa', hp: 3300, dmg: 250, range: 40, speed: 1.7, attackSpeed: 1700, target: 'terrestre', splash: true, desc: 'Cai com impacto devastador e causa dano em área.' },
    { id: 'pekka', name: 'P.E.K.K.A', cost: 7, type: 'tropa', hp: 3600, dmg: 680, range: 40, speed: 1.2, attackSpeed: 1800, target: 'terrestre', desc: 'Uma força imparável com armadura pesada e dano colossal.' },
    { id: 'canon', name: 'Canhão', cost: 3, type: 'estructura', hp: 880, dmg: 160, range: 135, speed: 0, attackSpeed: 800, target: 'terrestre', lifetime: 30000, desc: 'Defesa estacionária terrestre.' },
    { id: 'torre_bombardera', name: 'T. Bombardeira', cost: 4, type: 'estructura', hp: 1150, dmg: 200, range: 135, speed: 0, attackSpeed: 1600, target: 'terrestre', lifetime: 35000, splash: true, desc: 'Lança bombas explosivas em área.' },
    { id: 'bola_fuego', name: 'Bola de Fogo', cost: 4, type: 'hechizo', dmg: 580, radius: 65, desc: 'Queima inimigos em um raio médio.' },
    { id: 'flechas', name: 'Flechas', cost: 3, type: 'hechizo', dmg: 300, radius: 95, desc: 'Limpa o mapa contra alvos leves.' },
    { id: 'descarga', name: 'Zap', cost: 2, type: 'hechizo', dmg: 130, radius: 50, regulator: true, desc: 'Dano leve que paralisa por 1 segundo.' },
    { id: 'rey_esqueleto', name: 'Rei Esqueleto', cost: 4, type: 'campeon', hp: 2100, dmg: 190, range: 42, speed: 1.4, attackSpeed: 1300, target: 'terrestre', desc: 'Campeão blindado do submundo.' },
    { id: 'reina_arquera', name: 'Reina Arqueira', cost: 5, type: 'campeon', hp: 1050, dmg: 210, range: 185, speed: 1.8, attackSpeed: 900, target: 'mixto', desc: 'Disparos extremamente velozes.' }
];

const AppState = {
    selectedDeck: [],
    aiDifficulty: 'medium',
    gameRunning: false
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
        slot.innerHTML = `<span style="font-size:0.55rem; color:#4b5563;">VAZIO</span>`;
        slotsContainer.appendChild(slot);
    }

    poolContainer.innerHTML = "";
    CARD_POOL.forEach(card => {
        const cardEl = document.createElement("div");
        cardEl.className = `card-item ${card.type === 'campeon' ? 'campeon' : ''}`;
        cardEl.dataset.id = card.id;
        cardEl.innerHTML = `
            <div class="card-elixir">${card.cost}</div>
            <div style="font-size:1.2rem; margin-top: 2px;">${getCardIcon(card.id)}</div>
            <div class="card-name">${card.name}</div>
            <div class="card-type">${card.type === 'hechizo' ? 'Feitiço' : card.type === 'estructura' ? 'Estrutura' : card.type === 'campeon' ? 'Campeão' : 'Tropa'}</div>
            <div style="font-size:0.5rem; color:#9ca3af; text-align:center; margin-top:2px;">Vida:${card.hp || '-'} Dano:${card.dmg}</div>
        `;
        
        cardEl.addEventListener("click", () => toggleCardInDeck(card, cardEl));
        poolContainer.appendChild(cardEl);
    });
}

function getCardIcon(id) {
    const icons = {
        caballero: '⚔️', arquera: '🏹', barbaro: '🪓', mini_pekka: '🤖', gigante: '🛡️',
        mosquetera: '🔫', canon: '💥', torre_bombardera: '💣', bola_fuego: '🔥',
        flechas: '🏹', descarga: '⚡', rey_esqueleto: '💀', reina_arquera: '👑',
        mega_cavaleiro: '🛡️', pekka: '🤖'
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
        if (card.type === 'campeon' && AppState.selectedDeck.some(c => c.type === 'campeon')) {
            alert("Apenas um Campeão é permitido por Deck.");
            return;
        }
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
                <div class="card-item ${card.type === 'campeon' ? 'campeon' : ''}" style="width:100%; height:100%; box-shadow:none; padding:4px;">
                    <div class="card-elixir" style="width:16px; height:16px; font-size:0.6rem; top:-2px; left:-2px;">${card.cost}</div>
                    <div style="font-size:0.9rem; margin-top:2px;">${getCardIcon(card.id)}</div>
                    <div class="card-name" style="font-size:0.55rem;">${card.name}</div>
                </div>
            `;
        } else {
            slot.innerHTML = `<span style="font-size:0.55rem; color:#4b5563;">VAZIO</span>`;
        }
    });
    
    document.getElementById("start-battle-btn").disabled = (AppState.selectedDeck.length !== 8);
}

function setupMenuEvents() {
    const startBtn = document.getElementById("start-battle-btn");
    const diffSelect = document.getElementById("ai-difficulty");
    
    startBtn.addEventListener("click", () => {
        AppState.aiDifficulty = diffSelect.value;
        document.getElementById("deck-menu").classList.add("hidden");
        document.getElementById("game-screen").classList.remove("hidden");
        BattleEngine.init();
    });
}

// --- MOTOR REAL DE COMBATE (ARENA COM BASES) ---
const BattleEngine = {
    canvas: null, ctx: null, width: 0, height: 0,
    entities: [], projectiles: [], particles: [],
    lastTime: 0, matchTimer: 180, isExtraTime: false,
    elixirRegenRate: 1.0, suddenDeath: false, gameOver: false,
    
    playerElixir: 5.0, playerDeck: [], playerHand: [], playerNextCard: null, selectedHandIndex: null,
    enemyElixir: 5.0, enemyDeck: [], enemyHand: [], aiDecisionTimer: 0,

    init() {
        this.canvas = document.getElementById("battle-canvas");
        this.ctx = this.canvas.getContext("2d");
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        this.entities = []; this.projectiles = []; this.particles = [];
        this.gameOver = false; this.suddenDeath = false; this.isExtraTime = false;
        this.matchTimer = 180; this.playerElixir = 5.0; this.enemyElixir = 5.0;
        this.selectedHandIndex = null;

        this.playerDeck = [...AppState.selectedDeck].sort(() => Math.random() - 0.5);
        this.playerHand = this.playerDeck.splice(0, 4);
        this.playerNextCard = this.playerDeck.shift();

        const aiPool = CARD_POOL.filter(c => c.type !== 'campeon').sort(() => Math.random() - 0.5).slice(0, 7);
        aiPool.push(CARD_POOL.find(c => c.id === 'rey_esqueleto'));
        this.enemyDeck = [...aiPool].sort(() => Math.random() - 0.5);
        this.enemyHand = this.enemyDeck.splice(0, 4);

        this.spawnBases();
        this.setupInputEvents();
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
        const w = this.width;
        const h = this.height;

        this.entities.push({
            id: 'base_jogador', type: 'estructura', side: 'player', isBase: true,
            x: w / 2, y: h - 60, radius: 30, hp: 6000, maxHp: 6000, dmg: 120, range: 160, attackSpeed: 1100, lastAttack: 0
        });

        this.entities.push({
            id: 'base_inimiga', type: 'estructura', side: 'enemy', isBase: true,
            x: w / 2, y: 60, radius: 30, hp: 6000, maxHp: 6000, dmg: 120, range: 160, attackSpeed: 1100, lastAttack: 0
        });
    },

    setupInputEvents() {
        const slots = document.querySelectorAll(".hand-slot");
        slots.forEach(slot => {
            slot.onclick = () => {
                const idx = parseInt(slot.dataset.index);
                if (this.playerHand[idx]) {
                    if (this.selectedHandIndex === idx) {
                        this.selectedHandIndex = null;
                        slot.classList.remove("selected");
                    } else {
                        slots.forEach(s => s.classList.remove("selected"));
                        this.selectedHandIndex = idx;
                        slot.classList.add("selected");
                    }
                }
            };
        });

        this.canvas.onclick = (e) => {
            if (this.selectedHandIndex === null) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            const card = this.playerHand[this.selectedHandIndex];
            
            if (this.playerElixir >= card.cost) {
                if (this.validateDeploymentZone(clickX, clickY, card.type, 'player')) {
                    this.playerElixir -= card.cost;
                    this.deployCard(clickX, clickY, card, 'player');
                    
                    this.playerHand[this.selectedHandIndex] = this.playerNextCard;
                    this.playerDeck.push(card);
                    this.playerNextCard = this.playerDeck.shift();
                    
                    this.selectedHandIndex = null;
                    slots.forEach(s => s.classList.remove("selected"));
                    this.updateHandUI();
                } else {
                    this.triggerStatusText("ZONA INVÁLIDA");
                }
            } else {
                this.triggerStatusText("ELIXIR INSUFICIENTE");
            }
        };
    },

    validateDeploymentZone(x, y, cardType, side) {
        if (cardType === 'hechizo') return true;
        const h = this.height;
        if (side === 'player') {
            return y > h / 2 + 15 && y <= h - 20; 
        } else {
            return y < h / 2 - 15 && y >= 20;
        }
    },

    deployCard(x, y, card, side) {
        this.createExplosionParticle(x, y, side === 'player' ? '#1d4ed8' : '#b91c1c', 15);

        if (card.type === 'hechizo') {
            this.executeSpell(x, y, card, side);
            return;
        }

        if (card.type === 'estructura') {
            this.entities.push({
                ...card, id: card.id + "_" + Date.now(), side: side, x: x, y: y,
                radius: 18, maxHp: card.hp, spawnTime: Date.now(), lastAttack: 0
            });
            return;
        }

        const spawnsCount = (card.id === 'arquera') ? 2 : 1;
        for (let i = 0; i < spawnsCount; i++) {
            const offsetX = (i * 20) - (spawnsCount > 1 ? 10 : 0);
            this.entities.push({
                ...card, id: card.id + "_" + Date.now() + "_" + i, side: side,
                x: x + offsetX, y: y, radius: card.cost >= 7 ? 16 : 12, maxHp: card.hp, lastAttack: 0, vx: 0, vy: 0
            });
        }
    },

    executeSpell(x, y, spell, side) {
        this.particles.push({
            type: 'spell_cast', x: x, y: y, maxRadius: spell.radius, currentRadius: 0,
            color: spell.id === 'descarga' ? 'rgba(56, 189, 248, 0.4)' : 'rgba(249, 115, 22, 0.4)', duration: 300, startTime: Date.now()
        });

        setTimeout(() => {
            this.entities.filter(e => e.side !== side).forEach(target => {
                if (Math.hypot(target.x - x, target.y - y) <= spell.radius + target.radius) {
                    target.hp -= spell.dmg;
                    if(spell.regulator) target.stunnedUntil = Date.now() + 1000;
                }
            });
        }, 150);
    },

    updateHandUI() {
        const slots = document.querySelectorAll(".hand-slot");
        slots.forEach((slot, i) => {
            const card = this.playerHand[i];
            if (card) {
                slot.innerHTML = `
                    <div class="card-item ${card.type === 'campeon' ? 'campeon' : ''}">
                        <div class="card-elixir">${card.cost}</div>
                        <div style="font-size:1.1rem; margin-top:5px;">${getCardIcon(card.id)}</div>
                        <div class="card-name">${card.name}</div>
                    </div>
                `;
            } else {
                slot.innerHTML = "";
            }
        });

        const nextSlot = document.getElementById("next-card-slot");
        if (this.playerNextCard) {
            nextSlot.innerHTML = `
                <div class="card-item ${this.playerNextCard.type === 'campeon' ? 'campeon' : ''}" style="width:100%; height:100%; box-shadow:none;">
                    <div class="card-elixir" style="width:16px; height:16px; font-size:0.6rem; top:-3px; left:-3px;">${this.playerNextCard.cost}</div>
                    <div style="font-size:0.8rem; margin-top:2px;">${getCardIcon(this.playerNextCard.id)}</div>
                </div>
            `;
        }
    },

    triggerStatusText(msg) {
        const txtEl = document.getElementById("match-status-text");
        txtEl.textContent = msg;
        txtEl.style.opacity = 1;
        setTimeout(() => { txtEl.style.opacity = 0; }, 1800);
    },

    loop(timestamp) {
        if (!this.gameOver) {
            const dt = timestamp - this.lastTime;
            this.lastTime = timestamp;

            this.updateTimers(dt);
            this.updateElixir(dt);
            this.aiLogic(dt);
            this.updatePhysics(dt);
            this.render();

            requestAnimationFrame((t) => this.loop(t));
        }
    },

    updateTimers(dt) {
        this.matchTimer -= dt / 1000;
        
        if (this.matchTimer <= 0) {
            if (!this.isExtraTime) {
                this.isExtraTime = true;
                this.elixirRegenRate = 2.0; 
                this.matchTimer = 120;
                this.suddenDeath = true;
                this.triggerStatusText("PRORROGAÇÃO: MORTE SÚBITA!");
            } else {
                this.endMatchByScore();
            }
        }

        const display = document.getElementById("timer-display");
        const mins = Math.max(0, Math.floor(this.matchTimer / 60));
        const secs = Math.max(0, Math.floor(this.matchTimer % 60));
        display.textContent = `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
        if(this.isExtraTime) display.style.color = '#f87171';
    },

    updateElixir(dt) {
        const increment = (dt / 2500) * this.elixirRegenRate; 
        this.playerElixir = Math.min(10, this.playerElixir + increment);
        this.enemyElixir = Math.min(10, this.enemyElixir + increment);

        document.getElementById("elixir-counter").textContent = Math.floor(this.playerElixir);
        document.getElementById("elixir-bar-fill").style.width = `${(this.playerElixir / 10) * 100}%`;
    },

    aiLogic(dt) {
        this.aiDecisionTimer += dt;
        let interval = AppState.aiDifficulty === 'easy' ? 2200 : AppState.aiDifficulty === 'medium' ? 1400 : 700;

        if (this.aiDecisionTimer >= interval) {
            this.aiDecisionTimer = 0;
            const cardIdx = Math.floor(Math.random() * this.enemyHand.length);
            const card = this.enemyHand[cardIdx];

            if (card && this.enemyElixir >= card.cost) {
                let targetX = this.width / 2;
                let targetY = 140;
                let deployOk = false;

                const playerThreats = this.entities.filter(e => e.side === 'player' && !e.isBase);

                if (AppState.aiDifficulty === 'easy') {
                    targetX = this.width * (0.2 + Math.random() * 0.6);
                    targetY = this.height * (0.1 + Math.random() * 0.2);
                    deployOk = Math.random() > 0.3;
                } 
                else if (AppState.aiDifficulty === 'medium') {
                    if (playerThreats.length > 0) {
                        targetX = playerThreats[0].x;
                        targetY = Math.min(this.height/2 - 30, playerThreats[0].y - 80);
                    } else {
                        targetX = this.width * (0.3 + Math.random() * 0.4);
                        targetY = 100;
                    }
                    deployOk = true;
                } 
                else if (AppState.aiDifficulty === 'hard') {
                    if (playerThreats.length > 0) {
                        const critical = playerThreats.reduce((p, c) => (c.y < p.y ? c : p));
                        targetX = critical.x;
                        targetY = Math.max(40, critical.y - 100);
                    } else {
                        if (this.enemyElixir >= 9 && (card.id === 'pekka' || card.id === 'mega_cavaleiro')) {
                            targetX = this.width * 0.5;
                            targetY = this.height / 2 - 40;
                        } else {
                            targetX = Math.random() > 0.5 ? this.width * 0.3 : this.width * 0.7;
                            targetY = 80;
                        }
                    }
                    deployOk = (this.enemyElixir >= card.cost + 0.5 || this.enemyElixir >= 9.8);
                }

                if (deployOk && this.validateDeploymentZone(targetX, targetY, card.type, 'enemy')) {
                    this.enemyElixir -= card.cost;
                    this.deployCard(targetX, targetY, card, 'enemy');
                    
                    const oldCard = this.enemyHand[cardIdx];
                    this.enemyHand[cardIdx] = this.enemyDeck.shift();
                    this.enemyDeck.push(oldCard);
                }
            }
        }
    },

    updatePhysics(dt) {
        const w = this.width; const h = this.height;
        const bridgeLeft = { x: w * 0.28, y: h / 2 };
        const bridgeRight = { x: w * 0.72, y: h / 2 };
        const now = Date.now();

        this.entities.forEach(e => {
            if (e.lifetime && (now - e.spawnTime >= e.lifetime)) e.hp = 0;
        });

        this.entities = this.entities.filter(e => {
            if (e.hp <= 0) {
                this.createExplosionParticle(e.x, e.y, '#f3f4f6', 10);
                if (e.isBase) {
                    this.endMatch(e.side === 'player' ? 'enemy' : 'player');
                }
                return false;
            }
            return true;
        });

        this.entities.forEach(ent => {
            if (ent.hp <= 0 || ent.speed === 0) return; 
            if (ent.stunnedUntil && ent.stunnedUntil > now) return;

            let targets = this.entities.filter(t => t.side !== ent.side);
            if (ent.target === 'estructuras') targets = targets.filter(t => t.isBase || t.type === 'estructura');

            if (targets.length === 0) return;

            let targetPrincipal = null;
            let minDist = Infinity;
            
            targets.forEach(t => {
                const d = Math.hypot(t.x - ent.x, t.y - ent.y);
                if (d < minDist) { minDist = d; targetPrincipal = t; }
            });

            if (!targetPrincipal) return;

            if (minDist <= ent.range + targetPrincipal.radius) {
                if (now - ent.lastAttack >= ent.attackSpeed) {
                    ent.lastAttack = now;
                    
                    if (ent.range > 40) {
                        this.projectiles.push({ x: ent.x, y: ent.y, target: targetPrincipal, dmg: ent.dmg, speed: 5, splash: ent.splash });
                    } else {
                        if (ent.splash) {
                            this.dealSplashDamage(targetPrincipal.x, targetPrincipal.y, 60, ent.dmg, ent.side);
                        } else {
                            targetPrincipal.hp -= ent.dmg;
                        }
                        this.createExplosionParticle(targetPrincipal.x, targetPrincipal.y, '#eab308', 3);
                    }
                }
                return;
            }

            let tx = targetPrincipal.x;
            let ty = targetPrincipal.y;
            const atravessaRio = (ent.side === 'player' && ent.y > h/2 && ty < h/2) || (ent.side === 'enemy' && ent.y < h/2 && ty > h/2);

            if (atravessaRio && Math.abs(ent.y - h/2) > 15) {
                const ponteAlvo = (ent.x < w / 2) ? bridgeLeft : bridgeRight;
                tx = ponteAlvo.x;
                ty = ponteAlvo.y;
            }

            const angle = Math.atan2(ty - ent.y, tx - ent.x);
            ent.x += Math.cos(angle) * (ent.speed * (dt / 16.6));
            ent.y += Math.sin(angle) * (ent.speed * (dt / 16.6));
        });

        this.projectiles = this.projectiles.filter(p => {
            if (p.target.hp <= 0) return false;
            
            const angle = Math.atan2(p.target.y - p.y, p.target.x - p.x);
            p.x += Math.cos(angle) * p.speed;
            p.y += Math.sin(angle) * p.speed;

            if (Math.hypot(p.target.x - p.x, p.target.y - p.y) <= p.target.radius) {
                if (p.splash) {
                    this.dealSplashDamage(p.target.x, p.target.y, 60, p.dmg, p.target.side === 'player' ? 'enemy' : 'player');
                } else {
                    p.target.hp -= p.dmg;
                }
                return false;
            }
            return true;
        });
    },

    dealSplashDamage(x, y, radius, dmg, sideAtacante) {
        this.entities.forEach(e => {
            if (e.side !== sideAtacante && Math.hypot(e.x - x, e.y - y) <= radius + e.radius) {
                e.hp -= dmg;
            }
        });
        this.particles.push({ type: 'explosion', x: x, y: y, maxRadius: radius, currentRadius: 0, duration: 200, startTime: Date.now() });
    },

    createExplosionParticle(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                type: 'spark', x: x, y: y,
                vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4,
                radius: Math.random() * 3 + 1, color: color, alpha: 1,
                life: 400 + Math.random() * 200, startTime: Date.now()
            });
        }
    },

    render() {
        const ctx = this.ctx; const w = this.width; const h = this.height;

        ctx.fillStyle = "#386b42";
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = "#1d4ed8"; 
        ctx.fillRect(0, h / 2 - 12, w, 24);

        ctx.fillStyle = "#a16207"; 
        ctx.fillRect(w * 0.22, h / 2 - 16, w * 0.12, 32);
        ctx.fillRect(w * 0.66, h / 2 - 16, w * 0.12, 32);

        ctx.strokeStyle = "rgba(255,255,255,0.12)";
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, h/2); ctx.lineTo(w, h/2); ctx.stroke();

        this.entities.forEach(ent => {
            ctx.save();
            if (ent.stunnedUntil && ent.stunnedUntil > Date.now()) {
                ctx.shadowColor = "#38bdf8"; ctx.shadowBlur = 15;
            }

            ctx.fillStyle = ent.side === 'player' ? '#1d4ed8' : '#b91c1c';
            ctx.beginPath();
            ctx.arc(ent.x, ent.y, ent.radius, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.lineWidth = ent.isBase ? 4 : 2;
            ctx.strokeStyle = ent.isBase ? '#d97706' : '#ffffff';
            ctx.stroke();

            ctx.fillStyle = "#ffffff";
            ctx.font = `${ent.radius * 0.9}px Arial`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(getCardIcon(ent.id.split('_')[0]), ent.x, ent.y);

            if (ent.hp < ent.maxHp) {
                const bW = ent.radius * 2; const bH = 5;
                const bX = ent.x - ent.radius; const bY = ent.y - ent.radius - 8;
                ctx.fillStyle = "rgba(0,0,0,0.6)";
                ctx.fillRect(bX, bY, bW, bH);
                ctx.fillStyle = ent.side === 'player' ? '#10b981' : '#f59e0b';
                ctx.fillRect(bX, bY, bW * Math.max(0, ent.hp / ent.maxHp), bH);
            }
            ctx.restore();
        });

        this.projectiles.forEach(p => {
            ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2); ctx.fill();
        });

        const now = Date.now();
        this.particles = this.particles.filter(p => {
            const el = now - p.startTime;
            if (el >= p.life && p.type === 'spark') return false;
            if (el >= p.duration && (p.type === 'explosion' || p.type === 'spell_cast')) return false;

            if (p.type === 'spark') {
                p.x += p.vx; p.y += p.vy;
                ctx.save(); ctx.globalAlpha = 1 - (el / p.life);
                ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill(); ctx.restore();
            } else if (p.type === 'explosion') {
                ctx.strokeStyle = `rgba(239, 68, 68, ${1 - (el / p.duration)})`; ctx.lineWidth = 3;
                ctx.beginPath(); ctx.arc(p.x, p.y, (el / p.duration) * p.maxRadius, 0, Math.PI * 2); ctx.stroke();
            } else if (p.type === 'spell_cast') {
                ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, (el / p.duration) * p.maxRadius, 0, Math.PI * 2); ctx.fill();
            }
            return true;
        });
    },

    endMatchByScore() {
        const pBase = this.entities.find(e => e.side === 'player' && e.isBase);
        const eBase = this.entities.find(e => e.side === 'enemy' && e.isBase);
        
        if (pBase && eBase) {
            if (pBase.hp > eBase.hp) this.endMatch('player');
            else if (eBase.hp > pBase.hp) this.endMatch('enemy');
            else this.endMatch('draw');
        } else {
            this.endMatch('draw');
        }
    },

    endMatch(winner) {
        this.gameOver = true;
        let resultado = "EMPATE TÉCNICO!";
        if (winner === 'player') resultado = "¡VITÓRIA REAL! VOCÊ DESTRUIU A BASE INIMIGA!";
        if (winner === 'enemy') resultado = "DERROTA... SUA BASE FOI DESTRUÍDA!";

        alert(resultado);
        
        document.getElementById("game-screen").classList.add("hidden");
        document.getElementById("deck-menu").classList.remove("hidden");
        initDeckBuilder();
    }
};
