let board = [];
let gameState = {
    rows: 8,
    cols: 8,
    mines: 10,
    minesLeft: 10,
    gameOver: false,
    flagMode: false,
    startTime: null,
    timer: null
};

let currentLang = 'en';

// Translations
const translations = {
    en: {
        title: '💣 Minesweeper',
        newGame: '🎮 New Game',
        flag: '🚩 Flag',
        flagMode: '🚩 Flag ON',
        instructions: '<strong>How to play Minesweeper:</strong><br><br><strong>🎯 Goal:</strong> Clear all squares without hitting a mine!<br><br><strong>🖱️ Basic Controls:</strong><br>• <strong>Left-click:</strong> Reveal a square<br>• <strong>Right-click or Flag button:</strong> Mark/unmark suspected mines<br><br><strong>🔢 Understanding Numbers:</strong><br>• Numbers (1-8) show how many mines are in the 8 surrounding squares<br>• If you see "3", there are exactly 3 mines in adjacent squares<br>• Use this info to deduce where mines are located<br><br><strong>🧠 Strategy Tips:</strong><br>• Start by clicking corners or edges - they\'re usually safer<br>• When you find a number, count adjacent flags and revealed squares<br>• If a number equals the flags around it, other adjacent squares are safe<br>• If remaining unrevealed squares equal the number, they\'re all mines<br><br><strong>🏆 Winning:</strong> Reveal all safe squares OR flag all mines correctly<br><strong>💥 Losing:</strong> Click on a mine - game over!',
        win: '🎉 You Win!',
        lose: '💥 Game Over!',
        clickToStart: 'Click any square to start!'
    },
    es: {
        title: '💣 Buscaminas',
        newGame: '🎮 Nuevo Juego',
        flag: '🚩 Bandera',
        flagMode: '🚩 Bandera ON',
        instructions: '<strong>Cómo jugar Buscaminas:</strong><br><br><strong>🎯 Objetivo:</strong> ¡Descubre todas las casillas sin tocar una mina!<br><br><strong>🖱️ Controles Básicos:</strong><br>• <strong>Clic izquierdo:</strong> Revelar una casilla<br>• <strong>Clic derecho o botón Bandera:</strong> Marcar/desmarcar minas sospechosas<br><br><strong>🔢 Entendiendo los Números:</strong><br>• Los números (1-8) muestran cuántas minas hay en las 8 casillas circundantes<br>• Si ves un "3", hay exactamente 3 minas en casillas adyacentes<br>• Usa esta información para deducir dónde están las minas<br><br><strong>🧠 Consejos Estratégicos:</strong><br>• Comienza haciendo clic en esquinas o bordes - suelen ser más seguros<br>• Cuando encuentres un número, cuenta las banderas y casillas reveladas adyacentes<br>• Si un número es igual a las banderas que lo rodean, las otras casillas adyacentes son seguras<br>• Si las casillas no reveladas restantes igualan el número, todas son minas<br><br><strong>🏆 Ganar:</strong> Revela todas las casillas seguras O marca todas las minas correctamente<br><strong>💥 Perder:</strong> Hacer clic en una mina - ¡fin del juego!',
        win: '🎉 ¡Ganaste!',
        lose: '💥 ¡Juego Terminado!',
        clickToStart: '¡Haz clic en cualquier casilla para empezar!'
    },
    pt: {
        title: '💣 Campo Minado',
        newGame: '🎮 Novo Jogo',
        flag: '🚩 Bandeira',
        flagMode: '🚩 Bandeira ON',
        instructions: '<strong>Como jogar Campo Minado:</strong><br><br><strong>🎯 Objetivo:</strong> Limpe todos os quadrados sem acertar uma mina!<br><br><strong>🖱️ Controles Básicos:</strong><br>• <strong>Clique esquerdo:</strong> Revelar um quadrado<br>• <strong>Clique direito ou botão Bandeira:</strong> Marcar/desmarcar minas suspeitas<br><br><strong>🔢 Entendendo os Números:</strong><br>• Números (1-8) mostram quantas minas existem nos 8 quadrados ao redor<br>• Se você vê "3", há exatamente 3 minas em quadrados adjacentes<br>• Use esta informação para deduzir onde as minas estão localizadas<br><br><strong>🧠 Dicas de Estratégia:</strong><br>• Comece clicando em cantos ou bordas - geralmente são mais seguros<br>• Quando encontrar um número, conte bandeiras e quadrados revelados adjacentes<br>• Se um número é igual às bandeiras ao redor, outros quadrados adjacentes são seguros<br>• Se quadrados não revelados restantes igualam o número, todos são minas<br><br><strong>🏆 Vencer:</strong> Revele todos os quadrados seguros OU marque todas as minas corretamente<br><strong>💥 Perder:</strong> Clique em uma mina - fim de jogo!',
        win: '🎉 Você Ganhou!',
        lose: '💥 Fim de Jogo!',
        clickToStart: 'Clique em qualquer quadrado para começar!'
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
            cellEl.onclick = () => handleCellClick(r, c);
            cellEl.oncontextmenu = (e) => {
                e.preventDefault();
                handleRightClick(r, c);
            };

            // Touch support for mobile
            let touchTimer;
            cellEl.ontouchstart = () => {
                touchTimer = setTimeout(() => handleRightClick(r, c), 500);
            };
            cellEl.ontouchend = () => clearTimeout(touchTimer);

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
        // Reveal neighbors for empty cells
        for (let r = Math.max(0, row - 1); r <= Math.min(gameState.rows - 1, row + 1); r++) {
            for (let c = Math.max(0, col - 1); c <= Math.min(gameState.cols - 1, col + 1); c++) {
                if (r !== row || c !== col) {
                    setTimeout(() => revealCell(r, c), 50);
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
    clearInterval(gameState.timer);

    const t = translations[currentLang];
    const msg = document.getElementById('message');

    if (won) {
        msg.textContent = t.win;
        msg.className = 'message win';
    } else {
        msg.textContent = t.lose;
        msg.className = 'message lose';

        // Reveal all mines
        for (let r = 0; r < gameState.rows; r++) {
            for (let c = 0; c < gameState.cols; c++) {
                const cell = board[r][c];
                if (cell.isMine && !cell.isFlagged) {
                    cell.element.textContent = '💣';
                    cell.element.classList.add('mine');
                }
            }
        }
    }
}

function toggleFlag() {
    gameState.flagMode = !gameState.flagMode;
    const t = translations[currentLang];
    const btn = document.getElementById('flagBtn');
    btn.textContent = gameState.flagMode ? t.flagMode : t.flag;
}

function newGame() {
    gameState = {
        rows: 8,
        cols: 8,
        mines: 10,
        minesLeft: 10,
        gameOver: false,
        flagMode: false,
        startTime: null,
        timer: null
    };

    if (gameState.timer) clearInterval(gameState.timer);

    createBoard();
    updateDisplay();

    const t = translations[currentLang];
    document.getElementById('message').textContent = t.clickToStart;
    document.getElementById('message').className = 'message';
    document.getElementById('flagBtn').textContent = t.flag;
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

// Initialize game
newGame();
setLanguage('en');

// Add event listeners for language buttons
document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', function(evt) {
        setLanguage(btn.getAttribute('data-lang'), evt);
    });
});