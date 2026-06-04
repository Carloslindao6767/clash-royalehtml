// --- BASE DE DATOS E INFORMACIÓN GENERAL DE LAS CARTAS ---
const CARD_POOL = [
    // TROPAS
    { id: 'caballero', name: 'Caballero', cost: 3, type: 'tropa', hp: 1350, dmg: 160, range: 30, speed: 1.8, attackSpeed: 1200, target: 'terrestre', desc: 'Tanque ligero cuerpo a cuerpo.' },
    { id: 'arquera', name: 'Arqueras', cost: 3, type: 'tropa', hp: 500, dmg: 85, range: 140, speed: 2.2, attackSpeed: 1000, target: 'mixto', desc: 'Atacan a distancia de dos en dos.' },
    { id: 'barbaro', name: 'Bárbaro', cost: 5, type: 'tropa', hp: 1100, dmg: 140, range: 30, speed: 1.5, attackSpeed: 1400, target: 'terrestre', desc: 'Guerrero feroz y resistente.' },
    { id: 'mini_pekka', name: 'Mini P.E.K.K.A', cost: 4, type: 'tropa', hp: 1200, dmg: 450, range: 35, speed: 2.6, attackSpeed: 1600, target: 'terrestre', desc: 'Gran daño por golpe, algo distraído.' },
    { id: 'gigante', name: 'Gigante', cost: 5, type: 'tropa', hp: 3200, dmg: 210, range: 35, speed: 1.1, attackSpeed: 1500, target: 'estructuras', desc: 'Ignora tropas, va directo a las torres.' },
    { id: 'mosquetera', name: 'Mosquetera', cost: 4, type: 'tropa', hp: 720, dmg: 180, range: 160, speed: 1.8, attackSpeed: 1100, target: 'mixto', desc: 'Precisión letal a larga distancia.' },
    
    // ESTRUCTURAS
    { id: 'canon', name: 'Cañón', cost: 3, type: 'estructura', hp: 850, dmg: 150, range: 130, speed: 0, attackSpeed: 800, target: 'terrestre', lifetime: 30000, desc: 'Estructura defensiva terrestre.' },
    { id: 'torre_bombardera', name: 'T. Bombardera', cost: 4, type: 'estructura', hp: 1100, dmg: 190, range: 130, speed: 0, attackSpeed: 1600, target: 'terrestre', lifetime: 35000, splash: true, desc: 'Daño de área masivo contra hordas.' },
    
    // HECHIZOS
    { id: 'bola_fuego', name: 'Bola de Fuego', cost: 4, type: 'hechizo', dmg: 550, radius: 60, desc: 'Daño alto en área en cualquier punto.' },
    { id: 'flechas', name: 'Flechas', cost: 3, type: 'hechizo', dmg: 280, radius: 90, desc: 'Gran radio, ideal para limpiar tropas débiles.' },
    { id: 'descarga', name: 'Descarga', cost: 2, type: 'hechizo', dmg: 120, radius: 45, stun: true, desc: 'Daño bajo, paraliza un instante.' },
    
    // CAMPEONES
    { id: 'rey_esqueleto', name: 'Rey Esqueleto', cost: 4, type: 'campeon', hp: 2000, dmg: 180, range: 40, speed: 1.4, attackSpeed: 1300, target: 'terrestre', desc: 'Líder supremo de los no muertos.' },
    { id: 'reina_arquera', name: 'Reina Arquera', cost: 5, type: 'campeon', hp: 1000, dmg: 200, range: 180, speed: 1.8, attackSpeed: 900, target: 'mixto', desc: 'Gran alcance y daño sostenido.' }
];

// --- SISTEMA DE GESTIÓN DE ESTADO GENERAL ---
const AppState = {
    selectedDeck: [],
    aiDifficulty: 'medium',
    gameRunning: false
};

// --- CONFIGURACIÓN DE INICIALIZACIÓN DE LA UI ---
document.addEventListener("DOMContentLoaded", () => {
    initDeckBuilder();
    setupMenuEvents();
});

function initDeckBuilder() {
    const poolContainer = document.getElementById("cards-pool");
    const slotsContainer = document.getElementById("deck-slots-container");
    
    // Generar ranuras vacías visuales del mazo activo
    slotsContainer.innerHTML = "";
    for(let i=0; i<8; i++) {
        const slot = document.createElement("div");
        slot.className = "deck-slot";
        slot.innerHTML = `<span style="font-size:0.6rem; color:#4b5563;">VACÍO</span>`;
        slotsContainer.appendChild(slot);
    }

    // Generar cartas seleccionables
    poolContainer.innerHTML = "";
    CARD_POOL.forEach(card => {
        const cardEl = document.createElement("div");
        cardEl.className = `card-item ${card.type === 'campeon' ? 'campeon' : ''}`;
        cardEl.dataset.id = card.id;
        cardEl.innerHTML = `
            <div class="card-elixir">${card.cost}</div>
            <div style="font-size:1.1rem;">${getCardIcon(card.id)}</div>
            <div class="card-name">${card.name}</div>
            <div class="card-type">${card.type}</div>
            <div style="font-size:0.5rem; color:#9ca3af; text-align:center; margin-top:2px;">HP:${card.hp || '-'} Daño:${card.dmg}</div>
        `;
        
        cardEl.addEventListener("click", () => toggleCardInDeck(card, cardEl));
        poolContainer.appendChild(cardEl);
    });
}

function getCardIcon(id) {
    const icons = {
        caballero: '⚔️', arquera: '🏹', barbaro: '🪓', mini_pekka: '🤖', gigante: '🪵',
        mosquetera: '🔫', canon: '💥', torre_bombardera: '💣', bola_fuego: '🔥',
        flechas: '🏹', descarga: '⚡', rey_esqueleto: '💀', reina_arquera: '👑'
    };
    return icons[id] || '🃏';
}

function toggleCardInDeck(card, element) {
    const index = AppState.selectedDeck.findIndex(c => c.id === card.id);
    
    if (index > -1) {
        // Remover del mazo
        AppState.selectedDeck.splice(index, 1);
        element.classList.remove("selected-in-deck");
    } else {
        // Reglas de validación para añadir
        if (AppState.selectedDeck.length >= 8) return;
        if (card.type === 'campeon' && AppState.selectedDeck.some(c => c.type === 'campeon')) {
            alert("Solo puedes tener un Campeón en tu mazo.");
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
                    <div style="font-size:0.9rem; margin-top:4px;">${getCardIcon(card.id)}</div>
                    <div class="card-name" style="font-size:0.55rem;">${card.name}</div>
                </div>
            `;
        } else {
            slot.innerHTML = `<span style="font-size:0.6rem; color:#4b5563;">VACÍO</span>`;
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
        
        // Arrancar el motor del campo de batalla real
        BattleEngine.init();
    });
}


// --- MOTOR DE BATALLA (NÚCLEO DINÁMICO DEL JUEGO) ---
const BattleEngine = {
    canvas: null,
    ctx: null,
    width: 0,
    height: 0,
    
    // Listas internas del motor de simulación
    entities: [],
    projectiles: [],
    particles: [],
    
    // Gestión del bucle y tiempos
    lastTime: 0,
    matchTimer: 180, // 3 Minutos base
    isExtraTime: false,
    elixirRegenRate: 1.0, // Factor multiplicador base
    suddenDeath: false,
    gameOver: false,
    
    // Estados específicos del jugador humano
    playerElixir: 5.0,
    playerDeck: [],
    playerHand: [],
    playerNextCard: null,
    selectedHandIndex: null,
    
    // Estados específicos del Bot Inteligente
    enemyElixir: 5.0,
    enemyDeck: [],
    enemyHand: [],
    aiDecisionTimer: 0,

    init() {
        this.canvas = document.getElementById("battle-canvas");
        this.ctx = this.canvas.getContext("2d");
        
        // Dimensionamiento responsivo controlado para relaciones de aspecto
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Limpiar estados anteriores
        this.entities = [];
        this.projectiles = [];
        this.particles = [];
        this.gameOver = false;
        this.suddenDeath = false;
        this.isExtraTime = false;
        this.matchTimer = 180;
        this.playerElixir = 5.0;
        this.enemyElixir = 5.0;
        this.selectedHandIndex = null;

        // Configuración de los mazos de juego reales en rotación continua
        this.playerDeck = [...AppState.selectedDeck].sort(() => Math.random() - 0.5);
        this.playerHand = this.playerDeck.splice(0, 4);
        this.playerNextCard = this.playerDeck.shift();

        // Generación del mazo espejo para la IA oponente
        const aiPool = CARD_POOL.filter(c => c.type !== 'campeon').sort(() => Math.random() - 0.5).slice(0, 7);
        aiPool.push(CARD_POOL.find(c => c.id === 'rey_esqueleto')); // Le asignamos un campeón fijo
        this.enemyDeck = [...aiPool].sort(() => Math.random() - 0.5);
        this.enemyHand = this.enemyDeck.splice(0, 4);

        // Despliegue arquitectónico de estructuras de las torres primarias fijas
        this.spawnTowers();
        
        // Enlazar eventos de interacción con la arena de juego
        this.setupInputEvents();
        
        // Renderizado e interacción dinámica inicial
        this.updateHandUI();
        
        // Ejecución inmediata del loop principal
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

    spawnTowers() {
        const w = this.width;
        const h = this.height;

        // --- TORRES DEL JUGADOR (BANDO AZUL - PARTE INFERIOR) ---
        this.entities.push({
            id: 'p_king', type: 'estructura', side: 'player', isTower: true, isKing: true,
            x: w / 2, y: h - 60, radius: 24, hp: 4000, maxHp: 4000, dmg: 100, range: 150, attackSpeed: 1000, lastAttack: 0
        });
        this.entities.push({
            id: 'p_left', type: 'estructura', side: 'player', isTower: true, isKing: false,
            x: w * 0.25, y: h - 120, radius: 18, hp: 2500, maxHp: 2500, dmg: 90, range: 140, attackSpeed: 800, lastAttack: 0
        });
        this.entities.push({
            id: 'p_right', type: 'estructura', side: 'player', isTower: true, isKing: false,
            x: w * 0.75, y: h - 120, radius: 18, hp: 2500, maxHp: 2500, dmg: 90, range: 140, attackSpeed: 800, lastAttack: 0
        });

        // --- TORRES DE LA IA ENEMIGA (BANDO ROJO - PARTE SUPERIOR) ---
        this.entities.push({
            id: 'e_king', type: 'estructura', side: 'enemy', isTower: true, isKing: true,
            x: w / 2, y: 60, radius: 24, hp: 4000, maxHp: 4000, dmg: 100, range: 150, attackSpeed: 1000, lastAttack: 0
        });
        this.entities.push({
            id: 'e_left', type: 'estructura', side: 'enemy', isTower: true, isKing: false,
            x: w * 0.25, y: 120, radius: 18, hp: 2500, maxHp: 2500, dmg: 90, range: 140, attackSpeed: 800, lastAttack: 0
        });
        this.entities.push({
            id: 'e_right', type: 'estructura', side: 'enemy', isTower: true, isKing: false,
            x: w * 0.75, y: 120, radius: 18, hp: 2500, maxHp: 2500, dmg: 90, range: 140, attackSpeed: 800, lastAttack: 0
        });
    },

    setupInputEvents() {
        // Selección de cartas de la ranura de mano de la UI
        const slots = document.querySelectorAll(".hand-slot");
        slots.forEach(slot => {
            slot.onclick = (e) => {
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

        // Intercepción del click de despliegue sobre el canvas de la arena
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
                    
                    // Rotación continua del mazo cíclico
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
        // Los hechizos pueden desplegarse en cualquier zona
        if (cardType === 'hechizo') return true;

        const h = this.height;
        const halfHeight = h / 2;
        
        // Verificación de los límites del río central divisor
        if (side === 'player') {
            // El jugador puede desplegar en su propio campo
            if (y < halfHeight + 15) {
                // Permitir cruzar línea si una torre princesa enemiga ha sido reducida
                const eLeftDestroyed = !this.entities.some(e => e.id === 'e_left');
                const eRightDestroyed = !this.entities.some(e => e.id === 'e_right');
                
                if (eLeftDestroyed && x < this.width / 2 && y > 120) return true;
                if (eRightDestroyed && x >= this.width / 2 && y > 120) return true;
                
                return false;
            }
            return y <= h - 20; // Margen técnico inferior
        } else {
            // Reglas homólogas para el Bot IA
            if (y > halfHeight - 15) {
                const pLeftDestroyed = !this.entities.some(e => e.id === 'p_left');
                const pRightDestroyed = !this.entities.some(e => e.id === 'p_right');
                
                if (pLeftDestroyed && x < this.width / 2 && y < h - 120) return true;
                if (pRightDestroyed && x >= this.width / 2 && y < h - 120) return true;
                
                return false;
            }
            return y >= 20;
        }
    },

    deployCard(x, y, card, side) {
        // Crear partículas del despliegue en la arena
        this.createExplosionParticle(x, y, side === 'player' ? '#2563eb' : '#dc2626', 15);

        if (card.type === 'hechizo') {
            this.executeSpell(x, y, card, side);
            return;
        }

        if (card.type === 'estructura') {
            this.entities.push({
                ...card,
                id: card.id + "_" + Date.now(),
                side: side,
                x: x,
                y: y,
                radius: 16,
                maxHp: card.hp,
                spawnTime: Date.now(),
                lastAttack: 0
            });
            return;
        }

        // Si es una tropa común o campeón
        // El mazo de arqueras despliega un dúo simétrico
        const spawnsCount = (card.id === 'arquera') ? 2 : 1;
        for (let i = 0; i < spawnsCount; i++) {
            const offsetX = (i * 20) - (spawnsCount > 1 ? 10 : 0);
            this.entities.push({
                ...card,
                id: card.id + "_" + Date.now() + "_" + i,
                side: side,
                x: x + offsetX,
                y: y,
                radius: 12,
                maxHp: card.hp,
                lastAttack: 0,
                vx: 0,
                vy: 0
            });
        }
    },

    executeSpell(x, y, spell, side) {
        this.particles.push({
            type: 'spell_cast', x: x, y: y, maxRadius: spell.radius, currentRadius: 0, color: spell.id === 'descarga' ? 'rgba(14, 165, 233, 0.4)' : 'rgba(249, 115, 22, 0.4)', duration: 300, startTime: Date.now()
        });

        // Aplicación del daño de área inmediato tras el impacto
        setTimeout(() => {
            const targets = this.entities.filter(e => e.side !== side);
            targets.forEach(target => {
                const dist = Math.hypot(target.x - x, target.y - y);
                if (dist <= spell.radius + target.radius) {
                    target.hp -= spell.dmg;
                    if(spell.stun) target.stunnedUntil = Date.now() + 1000; // Paralización por descarga
                }
            });
        }, 200);
    },

    updateHandUI() {
        const slots = document.querySelectorAll(".hand-slot");
        slots.forEach((slot, i) => {
            const card = this.playerHand[i];
            if (card) {
                slot.innerHTML = `
                    <div class="card-item ${card.type === 'campeon' ? 'campeon' : ''}">
                        <div class="card-elixir">${card.cost}</div>
                        <div style="font-size:1rem; margin-top:5px;">${getCardIcon(card.id)}</div>
                        <div class="card-name">${card.name}</div>
                    </div>
                `;
            } else {
                slot.innerHTML = "";
            }
        });

        // Siguiente previsualización de carta
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
        setTimeout(() => { txtEl.style.opacity = 0; }, 2000);
    },

    // --- BUCLE PRINCIPAL DE LA SIMULACIÓN ---
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
                // Verificar empate para forzar Prórroga
                this.isExtraTime = true;
                this.elixirRegenRate = 2.0; // Elixir x2
                this.matchTimer = 120;
                this.suddenDeath = true;
                this.triggerStatusText("¡TIEMPO EXTRA: MUERTE SÚBITA!");
            } else {
                this.endMatchByScore();
            }
        }

        // Formatear visualmente el cronómetro
        const display = document.getElementById("timer-display");
        const mins = Math.max(0, Math.floor(this.matchTimer / 60));
        const secs = Math.max(0, Math.floor(this.matchTimer % 60));
        display.textContent = `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
        if(this.isExtraTime) display.style.color = '#ef4444';
    },

    updateElixir(dt) {
        // Regeneración controlada: por defecto toma ~2.8s por unidad de elixir
        const baseIncrement = (dt / 2800) * this.elixirRegenRate;
        
        this.playerElixir = Math.min(10, this.playerElixir + baseIncrement);
        this.enemyElixir = Math.min(10, this.enemyElixir + baseIncrement);

        // Renderizar barra visual del jugador
        document.getElementById("elixir-counter").textContent = Math.floor(this.playerElixir);
        document.getElementById("elixir-bar-fill").style.width = `${(this.playerElixir / 10) * 100}%`;
    },

    // --- INTELIGENCIA ARTIFICIAL ENEMIGA ADAPTATIVA ---
    aiLogic(dt) {
        this.aiDecisionTimer += dt;
        let checkInterval = AppState.aiDifficulty === 'easy' ? 2000 : AppState.aiDifficulty === 'medium' ? 1200 : 600;

        if (this.aiDecisionTimer >= checkInterval) {
            this.aiDecisionTimer = 0;
            
            // Tomar una carta aleatoria de la mano de la IA
            const cardIdx = Math.floor(Math.random() * this.enemyHand.length);
            const card = this.enemyHand[cardIdx];

            if (card && this.enemyElixir >= card.cost) {
                let targetX = this.width / 2;
                let targetY = 150;
                let shouldDeploy = false;

                const alivePlayerUnits = this.entities.filter(e => e.side === 'player' && !e.isTower);

                if (AppState.aiDifficulty === 'easy') {
                    // Despliegue caótico desorganizado
                    targetX = this.width * (0.2 + Math.random() * 0.6);
                    targetY = this.height * (0.1 + Math.random() * 0.25);
                    shouldDeploy = (Math.random() > 0.4); 
                } 
                else if (AppState.aiDifficulty === 'medium') {
                    // Reacción simple si existen amenazas directas detectadas
                    if (alivePlayerUnits.length > 0) {
                        const threat = alivePlayerUnits[0];
                        targetX = threat.x + (Math.random() * 30 - 15);
                        targetY = Math.min(this.height / 2 - 30, threat.y - 100);
                    } else {
                        targetX = Math.random() > 0.5 ? this.width * 0.25 : this.width * 0.75;
                        targetY = 120;
                    }
                    shouldDeploy = true;
                } 
                else if (AppState.aiDifficulty === 'hard') {
                    // Gestión óptima y contraataques agresivos
                    if (alivePlayerUnits.length > 0) {
                        // Buscar el enemigo más cercano a sus torres para defender activamente
                        const threat = alivePlayerUnits.reduce((prev, curr) => (curr.y < prev.y ? curr : prev));
                        targetX = threat.x;
                        targetY = Math.max(60, threat.y - 120);
                        
                        // Uso inteligente de hechizos contra acumulación de tropas
                        if (card.type === 'hechizo' && alivePlayerUnits.length >= 2) {
                            targetX = threat.x;
                            targetY = threat.y;
                        }
                    } else {
                        // Si el jugador humano tiene poco elixir, la IA presiona con un Gigante o Mini P.E.K.K.A en el puente
                        if (this.playerElixir < 4 && (card.id === 'gigante' || card.id === 'mini_pekka')) {
                            targetX = Math.random() > 0.5 ? this.width * 0.28 : this.width * 0.72; // Justo en los puentes
                            targetY = this.height / 2 - 20;
                        } else {
                            // Despliegue estratégico desde atrás para acumular unidades
                            targetX = Math.random() > 0.5 ? this.width * 0.25 : this.width * 0.75;
                            targetY = 70;
                        }
                    }
                    // La IA en nivel difícil no desperdicia elixir a menos que esté cerca del tope máximo
                    shouldDeploy = (this.enemyElixir >= card.cost + 1 || this.enemyElixir >= 9.5);
                }

                if (shouldDeploy && this.validateDeploymentZone(targetX, targetY, card.type, 'enemy')) {
                    this.enemyElixir -= card.cost;
                    this.deployCard(targetX, targetY, card, 'enemy');
                    
                    // Rotación cíclica para la mano de la IA
                    const usedCard = this.enemyHand[cardIdx];
                    this.enemyHand[cardIdx] = this.enemyDeck.shift();
                    this.enemyDeck.push(usedCard);
                }
            }
        }
    },

    // --- FÍSICAS, IA DE COMBATE Y ENRUTAMIENTO DE LAS UNIDADES ---
    updatePhysics(dt) {
        const w = this.width;
        const h = this.height;
        const bridgeLeft = { x: w * 0.28, y: h / 2 };
        const bridgeRight = { x: w * 0.72, y: h / 2 };

        // Verificar el ciclo de vida de las estructuras defensivas
        const now = Date.now();
        this.entities.forEach(e => {
            if (e.lifetime && (now - e.spawnTime >= e.lifetime)) {
                e.hp = 0; // Forzar destrucción por tiempo caducado
            }
        });

        // Eliminar entidades destruidas en el frame anterior
        this.entities = this.entities.filter(e => {
            if (e.hp <= 0) {
                this.createExplosionParticle(e.x, e.y, '#e5e7eb', 8);
                // Si cae la torre del rey, finaliza la partida inmediatamente
                if (e.isTower && e.isKing) {
                    this.endMatch(e.side === 'player' ? 'enemy' : 'player');
                }
                // Si es muerte súbita, cualquier torre destruida termina la partida
                if (e.isTower && this.suddenDeath) {
                    this.endMatch(e.side === 'player' ? 'enemy' : 'player');
                }
                return false;
            }
            return true;
        });

        // Procesar lógica de combate de cada entidad viva
        this.entities.forEach(ent => {
            if (ent.hp <= 0 || ent.speed === 0) return; // Torres o estructuras inmóviles
            if (ent.stunnedUntil && ent.stunnedUntil > now) return; // Estado paralizado por descarga

            // Encontrar objetivo óptimo según su prioridad
            let targets = this.entities.filter(t => t.side !== ent.side);
            if (ent.target === 'estructuras') {
                targets = targets.filter(t => t.type === 'estructura');
            }

            if (targets.length === 0) return;

            // Buscar el objetivo más cercano en la arena
            let closestTarget = null;
            let minDist = Infinity;
            
            targets.forEach(t => {
                const d = Math.hypot(t.x - ent.x, t.y - ent.y);
                if (d < minDist) {
                    minDist = d;
                    closestTarget = t;
                }
            });

            if (!closestTarget) return;

            // Verificar rango de ataque
            if (minDist <= ent.range + closestTarget.radius) {
                // Detenerse y ejecutar ataque periódico sostenido
                if (now - ent.lastAttack >= ent.attackSpeed) {
                    ent.lastAttack = now;
                    
                    if (ent.range > 40) {
                        // Generar proyectil visible guiado por vectores
                        this.projectiles.push({
                            x: ent.x, y: ent.y, target: closestTarget, dmg: ent.dmg, speed: 5, splash: ent.splash
                        });
                    } else {
                        // Daño directo cuerpo a cuerpo instantáneo
                        if (ent.splash) {
                            this.dealSplashDamage(closestTarget.x, closestTarget.y, 50, ent.dmg, ent.side);
                        } else {
                            closestTarget.hp -= ent.dmg;
                        }
                        this.createExplosionParticle(closestTarget.x, closestTarget.y, '#f59e0b', 3);
                    }
                }
                return; // Evita que se mueva mientras ataca
            }

            // --- INTELIGENCIA DE ENRUTAMIENTO (CRUZAR PUENTES RESPECTIVOS) ---
            let targetX = closestTarget.x;
            let targetY = closestTarget.y;
            
            // Si la unidad es terrestre y hay un río de por medio, debe buscar el puente más cercano
            const crossesRiver = (ent.side === 'player' && ent.y > h/2 && targetY < h/2) || 
                                 (ent.side === 'enemy' && ent.y < h/2 && targetY > h/2);

            if (crossesRiver && Math.abs(ent.y - h/2) > 15) {
                // Dirigirse al puente que esté alineado en su propia mitad vertical
                const chosenBridge = (ent.x < w / 2) ? bridgeLeft : bridgeRight;
                targetX = chosenBridge.x;
                targetY = chosenBridge.y;
            }

            // Calcular vector normalizado de movimiento según velocidad de la carta
            const angle = Math.atan2(targetY - ent.y, targetX - ent.x);
            ent.x += Math.cos(angle) * (ent.speed * (dt / 16.66));
            ent.y += Math.sin(angle) * (ent.speed * (dt / 16.66));
        });

        // Actualizar trayectoria física de proyectiles balísticos activos
        this.projectiles = this.projectiles.filter(p => {
            if (p.target.hp <= 0) return false; // El objetivo desapareció
            
            const angle = Math.atan2(p.target.y - p.y, p.target.x - p.x);
            p.x += Math.cos(angle) * p.speed;
            p.y += Math.sin(angle) * p.speed;

            const dist = Math.hypot(p.target.x - p.x, p.target.y - p.y);
            if (dist <= p.target.radius) {
                // Impacto consolidado con éxito
                if (p.splash) {
                    this.dealSplashDamage(p.target.x, p.target.y, 50, p.dmg, p.target.side === 'player' ? 'enemy' : 'player');
                } else {
                    p.target.hp -= p.dmg;
                }
                return false;
            }
            return true;
        });
    },

    dealSplashDamage(x, y, radius, dmg, attackerSide) {
        this.entities.forEach(e => {
            if (e.side !== attackerSide) {
                if (Math.hypot(e.x - x, e.y - y) <= radius + e.radius) {
                    e.hp -= dmg;
                }
            }
        });
        this.particles.push({
            type: 'explosion', x: x, y: y, maxRadius: radius, currentRadius: 0, duration: 200, startTime: Date.now()
        });
    },

    createExplosionParticle(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                type: 'spark',
                x: x, y: y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                radius: Math.random() * 3 + 1,
                color: color,
                alpha: 1,
                life: 400 + Math.random() * 300,
                startTime: Date.now()
            });
        }
    },

    // --- RENDERIZADO VISUAL EN CANVAS 2D ---
    render() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;

        // 1. Dibujar el césped de la arena básica
        ctx.fillStyle = "#43a047";
        ctx.fillRect(0, 0, w, h);

        // 2. Dibujar zonas de desierto/río central divisor
        ctx.fillStyle = "#1565c0"; // Agua del río
        ctx.fillRect(0, h / 2 - 12, w, 24);

        // Puentes estables de paso
        ctx.fillStyle = "#8d6e63";
        ctx.fillRect(w * 0.22, h / 2 - 16, w * 0.12, 32);
        ctx.fillRect(w * 0.66, h / 2 - 16, w * 0.12, 32);

        // Líneas divisorias de campos tácticos
        ctx.strokeStyle = "rgba(255,255,255,0.15)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, h/2); ctx.lineTo(w, h/2);
        ctx.stroke();

        // 3. Dibujar las entidades del mapa (Torres y Tropas)
        this.entities.forEach(ent => {
            ctx.save();
            
            // Efecto visual de parpadeo si está bajo estado de congelación/aturdimiento
            if (ent.stunnedUntil && ent.stunnedUntil > Date.now()) {
                ctx.shadowColor = "#0ea5e9";
                ctx.shadowBlur = 15;
            }

            // Color del bando correspondiente
            ctx.fillStyle = ent.side === 'player' ? '#2563eb' : '#dc2626';
            ctx.beginPath();
            ctx.arc(ent.x, ent.y, ent.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.lineWidth = 3;
            ctx.strokeStyle = ent.isTower ? '#f59e0b' : '#ffffff';
            ctx.stroke();

            // Iconografía textual superior identificativa de la carta
            ctx.fillStyle = "#ffffff";
            ctx.font = `${ent.radius * 0.9}px Arial`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(getCardIcon(ent.id.split('_')[0]), ent.x, ent.y);

            // Barras de salud dinámicas proporcionales
            if (ent.hp < ent.maxHp) {
                const barW = ent.radius * 2;
                const barH = 5;
                const barX = ent.x - ent.radius;
                const barY = ent.y - ent.radius - 10;

                ctx.fillStyle = "rgba(0,0,0,0.5)";
                ctx.fillRect(barX, barY, barW, barH);

                const hpPct = Math.max(0, ent.hp / ent.maxHp);
                ctx.fillStyle = ent.side === 'player' ? '#10b981' : '#f59e0b';
                ctx.fillRect(barX, barY, barW * hpPct, barH);
            }

            ctx.restore();
        });

        // 4. Dibujar trayectorias de los proyectiles
        this.projectiles.forEach(p => {
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
            ctx.fill();
        });

        // 5. Procesar y dibujar efectos de partículas y explosiones de hechizos
        const now = Date.now();
        this.particles = this.particles.filter(p => {
            const elapsed = now - p.startTime;
            if (elapsed >= p.life && p.type === 'spark') return false;
            if (elapsed >= p.duration && (p.type === 'explosion' || p.type === 'spell_cast')) return false;

            if (p.type === 'spark') {
                p.x += p.vx;
                p.y += p.vy;
                p.alpha = 1 - (elapsed / p.life);
                ctx.save();
                ctx.globalAlpha = p.alpha;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            } 
            else if (p.type === 'explosion') {
                p.currentRadius = (elapsed / p.duration) * p.maxRadius;
                ctx.strokeStyle = `rgba(239, 68, 68, ${1 - (elapsed / p.duration)})`;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.currentRadius, 0, Math.PI * 2);
                ctx.stroke();
            }
            else if (p.type === 'spell_cast') {
                p.currentRadius = (elapsed / p.duration) * p.maxRadius;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.currentRadius, 0, Math.PI * 2);
                ctx.fill();
            }
            return true;
        });
    },

    // --- RESOLUCIÓN FINAL DE LA PARTIDA ---
    endMatchByScore() {
        const pTowers = this.entities.filter(e => e.side === 'player' && e.isTower).length;
        const eTowers = this.entities.filter(e => e.side === 'enemy' && e.isTower).length;
        
        if (pTowers > eTowers) this.endMatch('player');
        else if (eTowers > pTowers) this.endMatch('enemy');
        else this.endMatch('draw');
    },

    endMatch(winner) {
        this.gameOver = true;
        let msg = "¡EMPATE!";
        if (winner === 'player') msg = "¡VICTORIA REAL!";
        if (winner === 'enemy') msg = "DERROTA... INTÉNTALO DE NUEVO";

        alert(msg);
        
        // Volver al panel de configuración inicial
        document.getElementById("game-screen").classList.add("hidden");
        document.getElementById("deck-menu").classList.remove("hidden");
        initDeckBuilder();
    }
};