let board = [];
let gameState = {
    rows: 8,
    cols: 8,
    mines: 10,
    minesLeft: 10,
    gameOver: false,
    flagMode: false,
    startTime: null,
    timer: null,
    difficulty: 'easy',
    score: 0,
    wins: 0,
    losses: 0
};

let currentLang = 'en';

// Translations
const translations = {
    en: {
        title: '💣 Minesweeper',
        newGame: '🎮 New Game',
        flag: '🚩 Flag',
        flagMode: '🚩 Flag ACTIVE',
        instructions: '<strong>How to play Minesweeper:</strong><br><br><strong>🎯 Goal:</strong> Clear all squares without hitting a mine!<br><br><strong>🖱️ Basic Controls:</strong><br>• <strong>Left-click:</strong> Reveal a square<br>• <strong>Right-click or Flag button:</strong> Mark/unmark suspected mines<br><br><strong>🔢 Understanding Numbers:</strong><br>• Numbers (1-8) show how many mines are in the 8 surrounding squares<br>• If you see "3", there are exactly 3 mines in adjacent squares<br>• Use this info to deduce where mines are located<br><br><strong>🧠 Strategy Tips:</strong><br>• Start by clicking corners or edges - they\'re usually safer<br>• When you find a number, count adjacent flags and revealed squares<br>• If a number equals the flags around it, other adjacent squares are safe<br>• If remaining unrevealed squares equal the number, they\'re all mines<br><br><strong>🏆 Winning:</strong> Reveal all safe squares OR flag all mines correctly<br><strong>💥 Losing:</strong> Click on a mine - game over!',
        win: '🎉 You Win!',
        lose: '💥 Game Over!',
        clickToStart: 'Click New Game to start. Use the "Flag" button to mark mines and avoid explosions.',
        easy: 'Easy',
        medium: 'Medium',
        hard: 'Hard',
        winLoss: 'Win/Loss',
        resetConfirm: '🔄 Reset Data'
    },
    es: {
        title: '💣 Buscaminas',
        newGame: '🎮 Nuevo Juego',
        flag: '🚩 Bandera',
        flagMode: '🚩 Bandera ACTIVA',
        instructions: '<strong>Cómo jugar Buscaminas:</strong><br><br><strong>🎯 Objetivo:</strong> ¡Descubre todas las casillas sin tocar una mina!<br><br><strong>🖱️ Controles Básicos:</strong><br>• <strong>Clic izquierdo:</strong> Revelar una casilla<br>• <strong>Clic derecho o botón Bandera:</strong> Marcar/desmarcar minas sospechosas<br><br><strong>🔢 Entendiendo los Números:</strong><br>• Los números (1-8) muestran cuántas minas hay en las 8 casillas circundantes<br>• Si ves un "3", hay exactamente 3 minas en casillas adyacentes<br>• Usa esta información para deducir dónde están las minas<br><br><strong>🧠 Consejos Estratégicos:</strong><br>• Comienza haciendo clic en esquinas o bordes - suelen ser más seguros<br>• Cuando encuentres un número, cuenta las banderas y casillas reveladas adyacentes<br>• Si un número es igual a las banderas que lo rodean, las otras casillas adyacentes son seguras<br>• Si las casillas no reveladas restantes igualan el número, todas son minas<br><br><strong>🏆 Ganar:</strong> Revela todas las casillas seguras O marca todas las minas correctamente<br><strong>💥 Perder:</strong> Hacer clic en una mina - ¡fin del juego!',
        win: '🎉 ¡Ganaste!',
        lose: '💥 ¡Juego Terminado!',
        clickToStart: 'Haz clic en Nuevo Juego para iniciar. Use el botón "Bandera" para marcar las minas y evita explosiones.',
        easy: 'Fácil',
        medium: 'Media',
        hard: 'Difícil',
        winLoss: 'Ganadas/Perdidas',
        resetConfirm: '🔄 Restablecer datos'
    },
    pt: {
        title: '💣 Campo Minado',
        newGame: '🎮 Novo Jogo',
        flag: '🚩 Bandeira',
        flagMode: '🚩 Bandeira ATIVA',
        instructions: '<strong>Como jogar Campo Minado:</strong><br><br><strong>🎯 Objetivo:</strong> Limpe todos os quadrados sem acertar uma mina!<br><br><strong>🖱️ Controles Básicos:</strong><br>• <strong>Clique esquerdo:</strong> Revelar um quadrado<br>• <strong>Clique direito ou botão Bandeira:</strong> Marcar/desmarcar minas suspeitas<br><br><strong>🔢 Entendendo os Números:</strong><br>• Números (1-8) mostram quantas minas existem nos 8 quadrados ao redor<br>• Se você vê "3", há exatamente 3 minas em quadrados adjacentes<br>• Use esta informação para deduzir onde as minas estão localizadas<br><br><strong>🧠 Dicas de Estratégia:</strong><br>• Comece clicando em cantos ou bordas - geralmente são mais seguros<br>• Quando encontrar um número, conte bandeiras e quadrados revelados adjacentes<br>• Se um número é igual às bandeiras ao redor, outros quadrados adjacentes são seguros<br>• Se quadrados não revelados restantes igualam o número, todos são minas<br><br><strong>🏆 Vencer:</strong> Revele todos os quadrados seguros OU marque todas as minas corretamente<br><strong>💥 Perder:</strong> Clique em uma mina - fim de jogo!',
        win: '🎉 Você Ganhou!',
        lose: '💥 Fim de Jogo!',
        clickToStart: 'Clique em Novo Jogo para iniciar. Use o botão "Bandeira" para marcar as minas e evite explodir.',
        easy: 'Fácil',
        medium: 'Médio',
        hard: 'Difícil',
        winLoss: 'Vitórias/Derrotas',
        resetConfirm: '🔄 Redefinir Dados'
    }
};

function setLanguage(lang, evt) {
    currentLang = lang;

    // Update active language button
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    if (evt && evt.target) {
        evt.target.classList.add('active');
    }

    // Update text content
    const t = translations[lang];
    document.getElementById('title').textContent = t.title;
    document.getElementById('newGameBtn').textContent = t.newGame;
    document.getElementById('flagBtn').textContent = gameState.flagMode ? t.flagMode : t.flag;
    document.getElementById('instructions').innerHTML = t.instructions;
    document.getElementById('resetBtn').textContent = t.resetConfirm;

    // Update message if game is over
    const msg = document.getElementById('message');
    if (gameState.gameOver) {
        if (msg.classList.contains('win')) {
            msg.textContent = t.win;
        } else if (msg.classList.contains('lose')) {
            msg.textContent = t.lose;
        }
    } else if (!gameState.startTime) {
        msg.textContent = t.clickToStart;
    }

    updateAllDisplays();
}

function createBoard() {
    const boardEl = document.getElementById('board');
    boardEl.innerHTML = '';
    boardEl.style.gridTemplateColumns = `repeat(${gameState.cols}, 1fr)`;

    board = [];
    for (let r = 0; r < gameState.rows; r++) {
        board[r] = [];
        for (let c = 0; c < gameState.cols; c++) {
            const cell = {
                row: r,
                col: c,
                isMine: false,
                isRevealed: false,
                isFlagged: false,
                neighborMines: 0
            };

            const cellEl = document.createElement('div');
            cellEl.className = 'cell';
            cellEl.dataset.pos = `${r},${c}`; // For event delegation

            // Touch support for mobile
            let touchTimer;
            cellEl.addEventListener('touchstart', () => {
                touchTimer = setTimeout(() => handleRightClick(r, c), 500);
            });
            cellEl.addEventListener('touchend', () => clearTimeout(touchTimer));

            boardEl.appendChild(cellEl);
            board[r][c] = cell;
            board[r][c].element = cellEl;
        }
    }
}

function placeMines(excludeRow, excludeCol) {
    let minesPlaced = 0;
    while (minesPlaced < gameState.mines) {
        const r = Math.floor(Math.random() * gameState.rows);
        const c = Math.floor(Math.random() * gameState.cols);

        if (!board[r][c].isMine && (r !== excludeRow || c !== excludeCol)) {
            board[r][c].isMine = true;
            minesPlaced++;
        }
    }

    // Calculate neighbor mine counts
    for (let r = 0; r < gameState.rows; r++) {
        for (let c = 0; c < gameState.cols; c++) {
            if (!board[r][c].isMine) {
                board[r][c].neighborMines = countNeighborMines(r, c);
            }
        }
    }
}

function countNeighborMines(row, col) {
    let count = 0;
    for (let r = Math.max(0, row - 1); r <= Math.min(gameState.rows - 1, row + 1); r++) {
        for (let c = Math.max(0, col - 1); c <= Math.min(gameState.cols - 1, col + 1); c++) {
            if (r !== row || c !== col) {
                if (board[r][c].isMine) count++;
            }
        }
    }
    return count;
}

function handleCellClick(row, col) {
    if (gameState.gameOver) return;

    const cell = board[row][col];
    if (cell.isRevealed || cell.isFlagged) return;

    // First click - place mines
    if (!gameState.startTime) {
        placeMines(row, col);
        gameState.startTime = Date.now();
        startTimer();
        document.getElementById('message').textContent = '';
    }

    if (gameState.flagMode) {
        toggleCellFlag(row, col);
    } else {
        revealCell(row, col);
    }

    checkWin();
}

function handleRightClick(row, col) {
    if (gameState.gameOver) return;
    toggleCellFlag(row, col);
}

function toggleCellFlag(row, col) {
    const cell = board[row][col];
    if (cell.isRevealed) return;

    if (cell.isFlagged) {
        cell.isFlagged = false;
        cell.element.textContent = '';
        cell.element.classList.remove('flagged');
        gameState.minesLeft++;
    } else {
        cell.isFlagged = true;
        cell.element.textContent = '🚩';
        cell.element.classList.add('flagged');
        gameState.minesLeft--;
    }

    updateDisplay();
}

// Enhanced cell reveal with smooth animations
function revealCell(row, col) {
    const cell = board[row][col];
    if (cell.isRevealed || cell.isFlagged) return;

    cell.isRevealed = true;
    cell.element.classList.add('revealed');

    if (cell.isMine) {
        cell.element.textContent = '💣';
        cell.element.classList.add('mine');
        gameOver(false);
        return;
    }

    if (cell.neighborMines > 0) {
        cell.element.textContent = cell.neighborMines;
        cell.element.classList.add(`n${cell.neighborMines}`);
    } else {
        // Reveal neighbors with cascade animation
        const neighbors = [];
        for (let r = Math.max(0, row - 1); r <= Math.min(gameState.rows - 1, row + 1); r++) {
            for (let c = Math.max(0, col - 1); c <= Math.min(gameState.cols - 1, col + 1); c++) {
                if (r !== row || c !== col) {
                    neighbors.push([r, c]);
                }
            }
        }
        
        // Staggered reveal for smooth animation
        neighbors.forEach(([r, c], index) => {
            setTimeout(() => revealCell(r, c), index * 20);
        });
    }
}

// Enhanced toggle flag with animation
function toggleCellFlag(row, col) {
    const cell = board[row][col];
    if (cell.isRevealed) return;

    if (cell.isFlagged) {
        cell.isFlagged = false;
        cell.element.textContent = '';
        cell.element.classList.remove('flagged');
        gameState.minesLeft++;
    } else {
        cell.isFlagged = true;
        cell.element.textContent = '🚩';
        cell.element.classList.add('flagged');
        gameState.minesLeft--;
    }

    updateDisplay();
}

// Optimized win check function
function checkWin() {
    let unrevealedSafeCells = 0;
    for (let r = 0; r < gameState.rows; r++) {
        for (let c = 0; c < gameState.cols; c++) {
            const cell = board[r][c];
            if (!cell.isMine && !cell.isRevealed) {
                unrevealedSafeCells++;
                if (unrevealedSafeCells > 1) break; // Early exit optimization
            }
        }
        if (unrevealedSafeCells > 1) break; // Early exit optimization
    }

    if (unrevealedSafeCells === 0) {
        gameOver(true);
    }
}

// Enhanced flag toggle with better UX and visual feedback
function toggleFlag() {
    gameState.flagMode = !gameState.flagMode;
    const t = translations[currentLang];
    const btn = document.getElementById('flagBtn');
    
    btn.textContent = gameState.flagMode ? t.flagMode : t.flag;
    
    // Enhanced visual feedback
    if (gameState.flagMode) {
        btn.classList.add('flag-active');
        btn.style.background = 'linear-gradient(135deg, var(--accent-color), #f1c40f)';
        btn.style.borderColor = 'var(--accent-color)';
        btn.style.boxShadow = '0 0 20px rgba(255, 217, 61, 0.6)';
        btn.style.transform = 'scale(1.05)';
    } else {
        btn.classList.remove('flag-active');
        btn.style.background = '';
        btn.style.borderColor = '';
        btn.style.boxShadow = '';
        btn.style.transform = 'scale(1)';
    }
    
    // Quick animation feedback
    btn.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
}

// Enhanced game over with celebratory animations
function gameOver(won) {
    gameState.gameOver = true;
    clearInterval(gameState.timer);

    const t = translations[currentLang];
    const msg = document.getElementById('message');

    if (won) {
        msg.textContent = t.win;
        msg.className = 'message win';
        gameState.wins++;
        gameState.score += calculateScore();
        
        // Enhanced confetti effect for win
        setTimeout(() => {
            createParticles();
            // Add explosion sound effect simulation
            document.body.style.animation = 'winCelebration 1s ease-out';
            setTimeout(() => document.body.style.animation = '', 1000);
        }, 100);
    } else {
        msg.textContent = t.lose;
        msg.className = 'message lose';
        gameState.losses++;
        
        // Enhanced explosion visual effect
        msg.style.animation = 'explosionShake 0.6s ease-out';
        setTimeout(() => msg.style.animation = '', 600);

        // Reveal all mines with enhanced staggered animation
        const mines = [];
        for (let r = 0; r < gameState.rows; r++) {
            for (let c = 0; c < gameState.cols; c++) {
                const cell = board[r][c];
                if (cell.isMine && !cell.isFlagged) {
                    mines.push(cell);
                }
            }
        }
        
        mines.forEach((cell, index) => {
            setTimeout(() => {
                cell.element.textContent = '💣';
                cell.element.classList.add('mine');
                // Add individual explosion effect
                cell.element.style.animation = 'mineExplode 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            }, index * 40);
        });
    }

    saveGameData();
    updateAllDisplays();
}

// Enhanced new game function
function newGame() {
    // Preserve stats
    const { wins, losses } = gameState;
    
    // Reset game state
    Object.assign(gameState, {
        rows: difficulties[gameState.difficulty].rows,
        cols: difficulties[gameState.difficulty].cols,
        mines: difficulties[gameState.difficulty].mines,
        minesLeft: difficulties[gameState.difficulty].mines,
        gameOver: false,
        flagMode: false,
        startTime: null,
        timer: null,
        score: 0,
        wins,
        losses
    });

    clearInterval(gameState.timer);
    createBoard();
    updateAllDisplays();

    // Reset flag button if it was active
    const flagBtn = document.getElementById('flagBtn');
    flagBtn.classList.remove('flag-active');
    flagBtn.style.background = '';
    flagBtn.style.borderColor = '';
    flagBtn.style.boxShadow = '';
    flagBtn.style.transform = '';

    const t = translations[currentLang];
    const msgEl = document.getElementById('message');
    msgEl.textContent = t.clickToStart;
    msgEl.className = 'message';
    flagBtn.textContent = t.flag;
    
    // Smooth board reveal
    const boardEl = document.getElementById('board');
    boardEl.style.display = 'inline-grid';
    boardEl.style.opacity = '0';
    boardEl.style.transform = 'scale(0.8)';
    
    requestAnimationFrame(() => {
        boardEl.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        boardEl.style.opacity = '1';
        boardEl.style.transform = 'scale(1)';
    });
}

// More efficient calculate score function
function calculateScore() {
    const timeBonus = Math.max(0, 300 - Math.floor((Date.now() - gameState.startTime) / 1000));
    const difficultyMultiplier = { easy: 1, medium: 2, hard: 3 }[gameState.difficulty];
    return Math.floor((gameState.mines * 10 + timeBonus) * difficultyMultiplier);
}

function startTimer() {
    gameState.timer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
        document.getElementById('time').textContent = elapsed;
    }, 1000);
}

function updateDisplay() {
    document.getElementById('mines').textContent = Math.max(0, gameState.minesLeft);
}

// Display updates
function updateAllDisplays() {
    document.getElementById('mines').textContent = Math.max(0, gameState.minesLeft);
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('winLoss').textContent = `${gameState.wins}/${gameState.losses}`;

    // Update difficulty button labels
    const t = translations[currentLang];
    document.getElementById('easyBtn').textContent = '🟢 ' + (t.easy || 'Easy');
    document.getElementById('mediumBtn').textContent = '🟡 ' + (t.medium || 'Medium');
    document.getElementById('hardBtn').textContent = '🔴 ' + (t.hard || 'Hard');
    document.getElementById('winLossLabel').textContent = '📊 ' + (t.winLoss || 'Win/Loss') + ':';
}

// Set game difficulty
function setDifficulty(difficulty) {
    gameState.difficulty = difficulty;
    gameState.rows = difficulties[difficulty].rows;
    gameState.cols = difficulties[difficulty].cols;
    gameState.mines = difficulties[difficulty].mines;
    gameState.minesLeft = gameState.mines;

    // Update active difficulty button
    document.querySelectorAll('.diff-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(difficulty + 'Btn').classList.add('active');

    updateAllDisplays();
    console.log(`Difficulty changed to: ${difficulty}`);
}

// Difficulty settings
const difficulties = {
    easy: { rows: 8, cols: 8, mines: 10 },
    medium: { rows: 8, cols: 8, mines: 20 },
    hard: { rows: 8, cols: 8, mines: 35 }
};

// Load saved data
function loadGameData() {
    const saved = localStorage.getItem('minesweeper_data');
    if (saved) {
        const data = JSON.parse(saved);
        gameState.wins = data.wins || 0;
        gameState.losses = data.losses || 0;
    }
}

// Save game data
function saveGameData() {
    const data = {
        wins: gameState.wins,
        losses: gameState.losses
    };
    localStorage.setItem('minesweeper_data', JSON.stringify(data));
}

// Reset all game data with confirmation
function resetData() {
    const t = translations[currentLang];
    const confirmMsg = t.resetConfirm;
        
    if (confirm(confirmMsg)) {
        gameState.wins = 0;
        gameState.losses = 0;
        localStorage.removeItem('minesweeper_data');
        updateAllDisplays();
    }
}

// Initialize game properly
document.addEventListener('DOMContentLoaded', function() {
    // Load saved data and initialize
    loadGameData();
    setLanguage('en');
    updateAllDisplays();

    // Hide board initially
    document.getElementById('board').style.display = 'none';

    // Set initial message
    const t = translations['en'];
    document.getElementById('message').textContent = t.clickToStart;

    // Add event listeners for language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', function(evt) {
            setLanguage(btn.getAttribute('data-lang'), evt);
        });
    });

    // Add event listeners for difficulty buttons
    document.querySelectorAll('.diff-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            setDifficulty(btn.getAttribute('data-diff'));
        });
    });

    // Add event listeners for game control buttons
    document.getElementById('newGameBtn').addEventListener('click', newGame);
    document.getElementById('flagBtn').addEventListener('click', toggleFlag);
    document.getElementById('resetBtn').addEventListener('click', resetData);

    // Add optimized event delegation for board clicks
    document.getElementById('board').addEventListener('click', function(e) {
        if (e.target.classList.contains('cell')) {
            const [row, col] = e.target.dataset.pos.split(',').map(Number);
            handleCellClick(row, col);
        }
    });

    document.getElementById('board').addEventListener('contextmenu', function(e) {
        e.preventDefault();
        if (e.target.classList.contains('cell')) {
            const [row, col] = e.target.dataset.pos.split(',').map(Number);
            handleRightClick(row, col);
        }
    });
});

// Particle system for win celebration
function createParticles() {
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + 'vw';
            particle.style.background = `hsl(${Math.random() * 360}, 70%, 60%)`;
            particle.style.animationDelay = Math.random() * 2 + 's';
            document.body.appendChild(particle);
            
            // Remove particle after animation
            setTimeout(() => document.body.removeChild(particle), 3000);
        }, i * 100);
    }
}