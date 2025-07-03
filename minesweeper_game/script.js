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

let currentLang = 'en';

// Difficulty settings - same board size, different mine counts
const difficulties = {
    easy: { rows: 8, cols: 8, mines: 10 },
    medium: { rows: 8, cols: 8, mines: 20 },
    hard: { rows: 8, cols: 8, mines: 35 }
};

// Global audio context for better performance
let audioContext = null;
let soundEnabled = true;

// Initialize audio context on first user interaction
function initAudioContext() {
    if (!audioContext && soundEnabled) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            audioContext = null;
            soundEnabled = false;
        }
    }
}

// Simple sound effects for compatibility
function playSound(soundName) {
    // Skip if sound is disabled
    if (!soundEnabled) return;
    
    // Initialize audio context if not already done
    if (!audioContext) {
        initAudioContext();
    }
    
    if (!audioContext) return;
    
    try {
        // Resume audio context if suspended
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        
        // Special explosion sound with multiple tones
        if (soundName === 'explode') {
            const oscillator1 = audioContext.createOscillator();
            const oscillator2 = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator1.connect(gainNode);
            oscillator2.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Low rumbling explosion sound
            oscillator1.frequency.value = 80;
            oscillator1.type = 'sawtooth';
            
            // Higher frequency for the blast
            oscillator2.frequency.value = 200;
            oscillator2.type = 'square';
            
            // Make it louder and longer
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator1.start(audioContext.currentTime);
            oscillator2.start(audioContext.currentTime);
            oscillator1.stop(audioContext.currentTime + 0.3);
            oscillator2.stop(audioContext.currentTime + 0.3);
            
            return;
        }
        
        // Regular sounds
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Different frequencies for different sounds
        const frequencies = {
            click: 800,
            flag: 600,
            win: 1000,
            reveal: 400
        };
        
        oscillator.frequency.value = frequencies[soundName] || 400;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
        // Disable sound if there's an error
        soundEnabled = false;
        console.log('Sound disabled due to error:', e);
    }
}

// Translations
/**
 * Translation object containing localized strings for the Minesweeper game.
 * Supports multiple languages with complete UI text translations.
 * 
 * @typedef {Object} Translation
 * @property {string} title - Game title with emoji
 * @property {string} newGame - New game button text
 * @property {string} flag - Flag button text
 * @property {string} flagMode - Flag mode indicator text
 * @property {string} resetData - Reset data button text
 * @property {string} easy - Easy difficulty label
 * @property {string} medium - Medium difficulty label
 * @property {string} hard - Hard difficulty label
 * @property {string} winLoss - Win/Loss statistics label
 * @property {string} instructions - Complete game instructions with HTML formatting
 * @property {string} win - Victory message
 * @property {string} lose - Game over message
 * @property {string} clickToStart - Initial game instruction text
 * @property {string} resetConfirm - Confirmation message for data reset
 * 
 * @type {Object.<string, Translation>}
 * @description Multilingual translation dictionary for Minesweeper game interface.
 * Contains translations for English (en), Spanish (es), and Portuguese (pt).
 * Each language object includes all UI strings, game messages, instructions,
 * and difficulty labels with appropriate emoji indicators.
 */
const translations = {
    en: {
        title: '💣 Minesweeper',
        newGame: '🎮 New Game',
        flag: '🚩 Flag',
        flagMode: '🚩 Flag ON',
        resetData: '🔄 Reset Data',
        easy: '🟢 Easy',
        medium: '🟡 Medium',
        hard: '🔴 Hard',
        winLoss: 'Win/Loss',
        instructions: '<strong>How to play Minesweeper:</strong><br><br><strong>🎯 Goal:</strong> Clear all squares without hitting a mine!<br><br><strong>🖱️ Basic Controls:</strong><br>• <strong>Left-click:</strong> Reveal a square<br>• <strong>Right-click or Flag button:</strong> Mark/unmark suspected mines<br><br><strong>🔢 Understanding Numbers:</strong><br>• Numbers (1-8) show how many mines are in the 8 surrounding squares<br>• If you see "3", there are exactly 3 mines in adjacent squares<br>• Use this info to deduce where mines are located<br><br><strong>🧠 Strategy Tips:</strong><br>• Start by clicking corners or edges - they\'re usually safer<br>• When you find a number, count adjacent flags and revealed squares<br>• If a number equals the flags around it, other adjacent squares are safe<br>• If remaining unrevealed squares equal the number, they\'re all mines<br><br><strong>🏆 Winning:</strong> Reveal all safe squares OR flag all mines correctly<br><strong>💥 Losing:</strong> Click on a mine - game over!',
        win: '🎉 You Win!',
        lose: '💥 Game Over!',
        clickToStart: 'Click "New Game" to start. Use the "Flag" button to mark mines and avoid exploding!',
        resetConfirm: 'Are you sure you want to reset all data? This will clear your stats and best times.'
    },
    es: {
        title: '💣 Buscaminas',
        newGame: '🎮 Nuevo Juego',
        flag: '🚩 Bandera',
        flagMode: '🚩 Bandera ON',
        resetData: '🔄 Resetear Datos',
        easy: '🟢 Fácil',
        medium: '🟡 Medio',
        hard: '🔴 Difícil',
        winLoss: 'Ganar/Perder',
        instructions: '<strong>Cómo jugar Buscaminas:</strong><br><br><strong>🎯 Objetivo:</strong> ¡Descubre todas las casillas sin tocar una mina!<br><br><strong>🖱️ Controles Básicos:</strong><br>• <strong>Clic izquierdo:</strong> Revelar una casilla<br>• <strong>Clic derecho o botón Bandera:</strong> Marcar/desmarcar minas sospechosas<br><br><strong>🔢 Entendiendo los Números:</strong><br>• Los números (1-8) muestran cuántas minas hay en las 8 casillas circundantes<br>• Si ves un "3", hay exactamente 3 minas en casillas adyacentes<br>• Usa esta información para deducir dónde están las minas<br><br><strong>🧠 Consejos Estratégicos:</strong><br>• Comienza haciendo clic en esquinas o bordes - suelen ser más seguros<br>• Cuando encuentres un número, cuenta las banderas y casillas reveladas adyacentes<br>• Si un número es igual a las banderas que lo rodean, las otras casillas adyacentes son seguras<br>• Si las casillas no reveladas restantes igualan el número, todas son minas<br><br><strong>🏆 Ganar:</strong> Revela todas las casillas seguras O marca todas las minas correctamente<br><strong>💥 Perder:</strong> Hacer clic en una mina - ¡fin del juego!',
        win: '🎉 ¡Ganaste!',
        lose: '💥 ¡Juego Terminado!',
        clickToStart: 'Haz clic en "Nuevo Juego" para comenzar. ¡Usa el botón "Bandera" para marcar minas y evitar explotar!',
        resetConfirm: '¿Estás seguro de que quieres resetear todos los datos? Esto eliminará tus estadísticas y mejores tiempos.'
    },
    pt: {
        title: '💣 Campo Minado',
        newGame: '🎮 Novo Jogo',
        flag: '🚩 Bandeira',
        flagMode: '🚩 Bandeira ON',
        resetData: '🔄 Resetar Dados',
        easy: '🟢 Fácil',
        medium: '🟡 Médio',
        hard: '🔴 Difícil',
        winLoss: 'Vitória/Derrota',
        instructions: '<strong>Como jogar Campo Minado:</strong><br><br><strong>🎯 Objetivo:</strong> Limpe todos os quadrados sem acertar uma mina!<br><br><strong>🖱️ Controles Básicos:</strong><br>• <strong>Clique esquerdo:</strong> Revelar um quadrado<br>• <strong>Clique direito ou botão Bandeira:</strong> Marcar/desmarcar minas suspeitas<br><br><strong>🔢 Entendendo os Números:</strong><br>• Números (1-8) mostram quantas minas existem nos 8 quadrados ao redor<br>• Se você vê "3", há exatamente 3 minas em quadrados adjacentes<br>• Use esta informação para deduzir onde as minas estão localizadas<br><br><strong>🧠 Dicas de Estratégia:</strong><br>• Comece clicando em cantos ou bordas - geralmente são mais seguros<br>• Quando encontrar um número, conte bandeiras e quadrados revelados adjacentes<br>• Se um número é igual às bandeiras ao redor, outros quadrados adjacentes são seguros<br>• Se quadrados não revelados restantes igualam o número, todos são minas<br><br><strong>🏆 Vencer:</strong> Revele todos os quadrados seguros OU marque todas as minas corretamente<br><strong>💥 Perder:</strong> Clique em uma mina - fim de jogo!',
        win: '🎉 Você Ganhou!',
        lose: '💥 Fim de Jogo!',
        clickToStart: 'Clique em "Novo Jogo" para iniciar. Use o botão "Bandeira" para marcar as minas e evite explodir!',
        resetConfirm: 'Tem certeza de que deseja resetar todos os dados? Isso apagará suas estatísticas e melhores tempos.'
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
    document.getElementById('resetBtn').textContent = t.resetData;
    document.getElementById('winLossLabel').textContent = `📊 ${t.winLoss}:`;
    document.getElementById('instructions').innerHTML = t.instructions;
    
    // Update difficulty buttons
    document.getElementById('easyBtn').textContent = t.easy;
    document.getElementById('mediumBtn').textContent = t.medium;
    document.getElementById('hardBtn').textContent = t.hard;

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
}

// Set game difficulty
function setDifficulty(difficulty) {
    // Initialize audio on first user interaction
    initAudioContext();
    
    gameState.difficulty = difficulty;
    gameState.rows = difficulties[difficulty].rows;
    gameState.cols = difficulties[difficulty].cols;
    gameState.mines = difficulties[difficulty].mines;
    gameState.minesLeft = gameState.mines;
    
    // Update active difficulty button
    document.querySelectorAll('.diff-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(difficulty + 'Btn').classList.add('active');
    
    // Update displays to show stats for new difficulty
    updateAllDisplays();
    
    // Play sound feedback
    playSound('click');
    
    console.log(`Difficulty changed to: ${difficulty}`);
}

// Reset all game data with confirmation
function resetData() {
    const t = translations[currentLang];
    if (confirm(t.resetConfirm)) {
        // Clear localStorage
        localStorage.removeItem('minesweeper_data');
        
        // Reset game state
        gameState.wins = 0;
        gameState.losses = 0;
        gameState.score = 0;
        
        // Update display
        updateAllDisplays();
        
        // Stop current game timer if running
        if (gameState.timer) {
            clearInterval(gameState.timer);
            gameState.timer = null;
        }
        
        // Reset game
        gameState.gameOver = false;
        gameState.startTime = null;
        gameState.flagMode = false;
        
        // Hide board and show initial message
        document.getElementById('board').style.display = 'none';
        document.getElementById('message').textContent = t.clickToStart;
        document.getElementById('message').className = 'message';
        
        // Reset flag button text
        document.getElementById('flagBtn').textContent = t.flag;
        document.getElementById('flagBtn').classList.remove('flag-active');
        
        playSound('click');
    }
}

function createBoard() {
    const boardEl = document.getElementById('board');
    boardEl.innerHTML = '';
    boardEl.style.gridTemplateColumns = `repeat(${gameState.cols}, 1fr)`;
    boardEl.style.display = 'inline-grid'; // Show the board
    
    // Simple spawn animation
    boardEl.classList.add('spawning');
    setTimeout(() => {
        boardEl.classList.remove('spawning');
    }, 400);

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
            
            // Mouse events
            cellEl.addEventListener('click', () => handleCellClick(r, c), { passive: false });
            cellEl.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                handleRightClick(r, c);
            }, { passive: false });

            // Optimized touch support for mobile
            let touchTimer;
            let touchStarted = false;
            
            cellEl.addEventListener('touchstart', (e) => {
                e.preventDefault();
                touchStarted = true;
                touchTimer = setTimeout(() => {
                    if (touchStarted) {
                        handleRightClick(r, c);
                        touchStarted = false;
                    }
                }, 400); // Reduced from 500ms for better responsiveness
            }, { passive: false });
            
            cellEl.addEventListener('touchend', (e) => {
                e.preventDefault();
                if (touchStarted) {
                    clearTimeout(touchTimer);
                    handleCellClick(r, c);
                    touchStarted = false;
                }
            }, { passive: false });
            
            cellEl.addEventListener('touchmove', (e) => {
                if (touchStarted) {
                    clearTimeout(touchTimer);
                    touchStarted = false;
                }
            }, { passive: true }); // Passive for better scroll performance
            
            cellEl.addEventListener('touchcancel', (e) => {
                clearTimeout(touchTimer);
                touchStarted = false;
            }, { passive: true });

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
    // Initialize audio on first user interaction
    initAudioContext();
    
    if (gameState.gameOver) return;

    const cell = board[row][col];
    if (cell.isRevealed) return;

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
        if (cell.isFlagged) return; // Can't reveal flagged cells
        revealCell(row, col);
    }

    checkWin();
}

function handleRightClick(row, col) {
    // Initialize audio on first user interaction
    initAudioContext();
    
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
        playSound('click');
    } else {
        cell.isFlagged = true;
        cell.element.textContent = '🚩';
        cell.element.classList.add('flagged');
        gameState.minesLeft--;
        playSound('flag');
    }

    updateAllDisplays();
}

function revealCell(row, col) {
    const cell = board[row][col];
    if (cell.isRevealed || cell.isFlagged) return;

    cell.isRevealed = true;
    cell.element.classList.add('revealed');
    
    playSound('reveal');

    if (cell.isMine) {
        cell.element.textContent = '💣';
        cell.element.classList.add('mine');
        playSound('explode');
        gameOver(false);
        return;
    }

    if (cell.neighborMines > 0) {
        cell.element.textContent = cell.neighborMines;
        cell.element.classList.add(`n${cell.neighborMines}`);
        playSound('click');
    } else {
        // Reveal neighbors for empty cells
        for (let r = Math.max(0, row - 1); r <= Math.min(gameState.rows - 1, row + 1); r++) {
            for (let c = Math.max(0, col - 1); c <= Math.min(gameState.cols - 1, col + 1); c++) {
                if (r !== row || c !== col) {
                    setTimeout(() => revealCell(r, c), 30);
                }
            }
        }
    }
}

function checkWin() {
    let unrevealedSafeCells = 0;
    for (let r = 0; r < gameState.rows; r++) {
        for (let c = 0; c < gameState.cols; c++) {
            const cell = board[r][c];
            if (!cell.isMine && !cell.isRevealed) {
                unrevealedSafeCells++;
            }
        }
    }

    if (unrevealedSafeCells === 0) {
        gameOver(true);
    }
}

function gameOver(won) {
    gameState.gameOver = true;
    
    // Stop the timer
    if (gameState.timer) {
        clearInterval(gameState.timer);
        gameState.timer = null;
    }

    const t = translations[currentLang];
    const msg = document.getElementById('message');

    if (won) {
        gameState.wins++;
        msg.textContent = t.win;
        msg.className = 'message win';

        // Calculate and update score
        gameState.score = calculateScore();
        
        playSound('win');
        
    } else {
        gameState.losses++;
        msg.textContent = t.lose;
        msg.className = 'message lose';

        // Reveal all mines with simple animation
        for (let r = 0; r < gameState.rows; r++) {
            for (let c = 0; c < gameState.cols; c++) {
                const cell = board[r][c];
                if (cell.isMine && !cell.isFlagged) {
                    setTimeout(() => {
                        cell.element.textContent = '💣';
                        cell.element.classList.add('mine');
                    }, (r + c) * 30); // Simple staggered reveal
                }
            }
        }
        
        playSound('explode');
    }
    
    // Update displays and save data
    updateAllDisplays();
    saveGameData();
}

function toggleFlag() {
    // Initialize audio on first user interaction
    initAudioContext();
    
    gameState.flagMode = !gameState.flagMode;
    const t = translations[currentLang];
    const btn = document.getElementById('flagBtn');
    btn.textContent = gameState.flagMode ? t.flagMode : t.flag;
    
    // Add visual feedback for active flag mode
    if (gameState.flagMode) {
        btn.classList.add('flag-active');
    } else {
        btn.classList.remove('flag-active');
    }
    
    playSound('flag');
}

function newGame() {
    // Initialize audio on first user interaction
    initAudioContext();
    
    // Preserve difficulty and stats
    const currentDifficulty = gameState.difficulty;
    const currentWins = gameState.wins;
    const currentLosses = gameState.losses;
    
    const diff = difficulties[currentDifficulty];
    
    gameState = {
        rows: diff.rows,
        cols: diff.cols,
        mines: diff.mines,
        minesLeft: diff.mines,
        gameOver: false,
        flagMode: false,
        startTime: null,
        timer: null,
        difficulty: currentDifficulty,
        score: 0,
        wins: currentWins,
        losses: currentLosses
    };

    if (gameState.timer) clearInterval(gameState.timer);

    createBoard();
    updateAllDisplays();

    const t = translations[currentLang];
    document.getElementById('message').textContent = t.clickToStart;
    document.getElementById('message').className = 'message';
    document.getElementById('flagBtn').textContent = t.flag;
    document.getElementById('flagBtn').classList.remove('flag-active');
}

function startTimer() {
    if (gameState.timer) clearInterval(gameState.timer);
    gameState.timer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
        document.getElementById('time').textContent = elapsed;
    }, 1000);
}

// Calculate score based on time and difficulty
function calculateScore() {
    if (!gameState.startTime) return 0;
    
    const timeElapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
    const maxTime = 999; // Maximum time for scoring
    const timeScore = Math.max(0, maxTime - timeElapsed);
    
    // Difficulty multipliers
    const multipliers = { easy: 1, medium: 2, hard: 3 };
    const difficultyMultiplier = multipliers[gameState.difficulty];
    
    // Base score calculation
    const baseScore = timeScore * difficultyMultiplier;
    
    // Bonus for perfect play (no wrong flags)
    const perfectBonus = gameState.minesLeft === 0 ? 100 : 0;
    
    return Math.floor(baseScore + perfectBonus);
}

// Add explosion animation
// Update all displays
function updateAllDisplays() {
    document.getElementById('mines').textContent = Math.max(0, gameState.minesLeft);
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('winLoss').textContent = `${gameState.wins}/${gameState.losses}`;
}

// Initialize game
loadGameData();
updateAllDisplays(); // Update displays without creating board
setLanguage('en');

// Hide board initially
document.getElementById('board').style.display = 'none';

// Set initial message
const t = translations['en'];
document.getElementById('message').textContent = t.clickToStart;

// Add event listeners for language buttons when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Fix language buttons to use onclick attribute or add proper event listeners
    document.querySelector('.lang-btn[onclick*="en"]').onclick = () => setLanguage('en');
    document.querySelector('.lang-btn[onclick*="es"]').onclick = () => setLanguage('es');
    document.querySelector('.lang-btn[onclick*="pt"]').onclick = () => setLanguage('pt');
});