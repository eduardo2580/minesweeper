class MinesweeperPro {
    constructor() {
        this.board = [];
        this.gameState = {
            rows: 8,
            cols: 8,
            mines: 10,
            minesLeft: 10,
            tilesLeft: 54,
            gameOver: false,
            gameWon: false,
            firstClick: true,
            flagMode: false,
            startTime: null,
            endTime: null,
            score: 0
        };
        
        this.settings = {
            sound: true,
            animations: true,
            theme: 'classic'
        };

        this.difficulties = {
            beginner: { rows: 8, cols: 8, mines: 10 },
            intermediate: { rows: 12, cols: 12, mines: 20 },
            expert: { rows: 16, cols: 16, mines: 40 },
        };

        this.currentDifficulty = 'beginner';
        this.timer = null;
        this.achievements = new Set();
        this.statistics = this.loadStatistics();
        
        this.loadSettings();
        this.loadAchievements();
        this.initializeGame();
    }

    initializeGame() {
        this.resetGameState();
        this.createBoard();
        this.updateDisplay();
        this.startTimer();
    }

    resetGameState() {
        const diff = this.difficulties[this.currentDifficulty];
        this.gameState = {
            ...this.gameState,
            rows: diff.rows,
            cols: diff.cols,
            mines: diff.mines,
            minesLeft: diff.mines,
            tilesLeft: diff.rows * diff.cols - diff.mines,
            gameOver: false,
            gameWon: false,
            firstClick: true,
            startTime: null,
            endTime: null,
            score: 0
        };
        
        this.board = [];
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    createBoard() {
        const boardElement = document.getElementById('board');
        boardElement.innerHTML = '';
        boardElement.style.gridTemplateColumns = `repeat(${this.gameState.cols}, var(--tile-size))`;
        boardElement.style.gridTemplateRows = `repeat(${this.gameState.rows}, var(--tile-size))`;

        // Initialize board data structure
        for (let r = 0; r < this.gameState.rows; r++) {
            this.board[r] = [];
            for (let c = 0; c < this.gameState.cols; c++) {
                this.board[r][c] = {
                    row: r,
                    col: c,
                    isMine: false,
                    isRevealed: false,
                    isFlagged: false,
                    isQuestioned: false,
                    neighborMines: 0,
                    element: null
                };

                // Create DOM element
                const tile = document.createElement('div');
                tile.className = 'tile';
                tile.dataset.row = r;
                tile.dataset.col = c;
                
                // Touch events for mobile
                tile.addEventListener('click', (e) => this.handleTileClick(e));
                tile.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    this.handleRightClick(e);
                });
                
                // Long press for mobile flagging
                let pressTimer;
                tile.addEventListener('touchstart', (e) => {
                    pressTimer = setTimeout(() => {
                        this.handleRightClick(e);
                    }, 500); // 500ms for long press
                });
                
                tile.addEventListener('touchend', () => {
                    clearTimeout(pressTimer);
                });

                boardElement.appendChild(tile);
                this.board[r][c].element = tile;
            }
        }
    }

    placeMines(excludeRow, excludeCol) {
        const totalCells = this.gameState.rows * this.gameState.cols;
        const minePositions = new Set();
        
        while (minePositions.size < this.gameState.mines) {
            const pos = Math.floor(Math.random() * totalCells);
            const row = Math.floor(pos / this.gameState.cols);
            const col = pos % this.gameState.cols;
            
            // Don't place mine on first click or its neighbors
            if (Math.abs(row - excludeRow) <= 1 && Math.abs(col - excludeCol) <= 1) {
                continue;
            }
            
            minePositions.add(pos);
        }

        // Place mines
        minePositions.forEach(pos => {
            const row = Math.floor(pos / this.gameState.cols);
            const col = pos % this.gameState.cols;
            this.board[row][col].isMine = true;
        });

        // Calculate neighbor mine counts
        for (let r = 0; r < this.gameState.rows; r++) {
            for (let c = 0; c < this.gameState.cols; c++) {
                if (!this.board[r][c].isMine) {
                    this.board[r][c].neighborMines = this.countNeighborMines(r, c);
                }
            }
        }
    }

    countNeighborMines(row, col) {
        let count = 0;
        for (let r = Math.max(0, row - 1); r <= Math.min(this.gameState.rows - 1, row + 1); r++) {
            for (let c = Math.max(0, col - 1); c <= Math.min(this.gameState.cols - 1, col + 1); c++) {
                if (r !== row || c !== col) {
                    if (this.board[r] && this.board[r][c] && this.board[r][c].isMine) {
                        count++;
                    }
                }
            }
        }
        return count;
    }

    handleTileClick(event) {
        event.preventDefault();
        if (this.gameState.gameOver) return;

        const row = parseInt(event.target.dataset.row);
        const col = parseInt(event.target.dataset.col);
        const tile = this.board[row][col];

        if (tile.isFlagged || tile.isRevealed) return;

        if (this.gameState.firstClick) {
            this.placeMines(row, col);
            this.gameState.firstClick = false;
            this.gameState.startTime = Date.now();
        }

        if (this.gameState.flagMode) {
            this.toggleFlag(row, col);
        } else {
            this.revealTile(row, col);
        }

        this.updateDisplay();
        this.checkWinCondition();
    }

    handleRightClick(event) {
        event.preventDefault();
        if (this.gameState.gameOver) return;

        const row = parseInt(event.target.dataset.row);
        const col = parseInt(event.target.dataset.col);
        
        this.cycleTileState(row, col);
        this.updateDisplay();
    }

    cycleTileState(row, col) {
        const tile = this.board[row][col];
        if (tile.isRevealed) return;

        if (!tile.isFlagged && !tile.isQuestioned) {
            tile.isFlagged = true;
            this.gameState.minesLeft--;
            this.playSound('flag');
        } else if (tile.isFlagged) {
            tile.isFlagged = false;
            tile.isQuestioned = true;
            this.gameState.minesLeft++;
        } else if (tile.isQuestioned) {
            tile.isQuestioned = false;
        }

        this.updateTileAppearance(tile);
    }

    toggleFlag(row, col) {
        const tile = this.board[row][col];
        if (tile.isRevealed) return;

        if (tile.isFlagged) {
            tile.isFlagged = false;
            this.gameState.minesLeft++;
        } else if (!tile.isQuestioned) {
            tile.isFlagged = true;
            this.gameState.minesLeft--;
            this.playSound('flag');
        }

        this.updateTileAppearance(tile);
    }

    revealTile(row, col) {
        const tile = this.board[row][col];
        if (tile.isRevealed || tile.isFlagged) return;

        tile.isRevealed = true;
        this.gameState.tilesLeft--;
        
        if (this.settings.animations) {
            tile.element.classList.add('revealing');
            setTimeout(() => tile.element.classList.remove('revealing'), 200);
        }

        if (tile.isMine) {
            this.gameOver(false);
            return;
        }

        this.gameState.score += 10;

        if (tile.neighborMines === 0) {
            // Reveal neighbors for empty tiles
            for (let r = Math.max(0, row - 1); r <= Math.min(this.gameState.rows - 1, row + 1); r++) {
                for (let c = Math.max(0, col - 1); c <= Math.min(this.gameState.cols - 1, col + 1); c++) {
                    if (r !== row || c !== col) {
                        setTimeout(() => this.revealTile(r, c), 50);
                    }
                }
            }
        }

        this.updateTileAppearance(tile);
        this.playSound('reveal');
    }

    updateTileAppearance(tile) {
        const element = tile.element;
        element.className = 'tile';

        if (tile.isRevealed) {
            element.classList.add('revealed');
            if (tile.isMine) {
                element.classList.add('mine');
                element.textContent = '💣';
            } else if (tile.neighborMines > 0) {
                element.textContent = tile.neighborMines;
                element.classList.add(`n${tile.neighborMines}`);
            }
        } else if (tile.isFlagged) {
            element.classList.add('flagged');
            element.textContent = '🚩';
        } else if (tile.isQuestioned) {
            element.classList.add('questioned');
            element.textContent = '?';
        } else {
            element.textContent = '';
        }
    }

    checkWinCondition() {
        if (this.gameState.tilesLeft === 0) {
            this.gameOver(true);
        }
    }

    gameOver(won) {
        this.gameState.gameOver = true;
        this.gameState.gameWon = won;
        this.gameState.endTime = Date.now();
        
        if (this.timer) {
            clearInterval(this.timer);
        }

        if (won) {
            this.gameState.minesLeft = 0;
            this.gameState.score += 1000;
            this.playSound('win');
            this.checkAchievements();
            this.updateStatistics(true);
            
            if (this.settings.animations) {
                document.getElementById('board').classList.add('winning');
                setTimeout(() => {
                    document.getElementById('board').classList.remove('winning');
                }, 1500);
            }
        } else {
            this.revealAllMines();
            this.playSound('lose');
            this.updateStatistics(false);
        }

        setTimeout(() => this.showGameOverModal(), won ? 1000 : 500);
    }

    revealAllMines() {
        for (let r = 0; r < this.gameState.rows; r++) {
            for (let c = 0; c < this.gameState.cols; c++) {
                const tile = this.board[r][c];
                if (tile.isMine && !tile.isFlagged) {
                    tile.isRevealed = true;
                    this.updateTileAppearance(tile);
                } else if (!tile.isMine && tile.isFlagged) {
                    // Show incorrect flags
                    tile.element.textContent = '❌';
                    tile.element.style.background = 'linear-gradient(145deg, #ff6b6b, #ff4757)';
                }
            }
        }
    }

    showGameOverModal() {
        const modal = document.getElementById('game-modal');
        const title = document.getElementById('modal-title');
        const message = document.getElementById('modal-message');
        const stats = document.getElementById('modal-stats');

        const timeElapsed = this.gameState.endTime - this.gameState.startTime;
        const minutes = Math.floor(timeElapsed / 60000);
        const seconds = Math.floor((timeElapsed % 60000) / 1000);
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        if (this.gameState.gameWon) {
            title.textContent = '🎉 Congratulations!';
            message.textContent = 'You cleared the minefield!';
            title.style.color = '#27ae60';
        } else {
            title.textContent = '💥 Game Over!';
            message.textContent = 'You hit a mine!';
            title.style.color = '#e74c3c';
        }

        stats.innerHTML = `
            <div style="margin: 15px 0; text-align: left;">
                <p><strong>Time:</strong> ${timeString}</p>
                <p><strong>Score:</strong> ${this.gameState.score}</p>
                <p><strong>Difficulty:</strong> ${this.currentDifficulty.charAt(0).toUpperCase() + this.currentDifficulty.slice(1)}</p>
            </div>
        `;

        modal.classList.add('show');
    }

    closeModal() {
        document.getElementById('game-modal').classList.remove('show');
    }

    startTimer() {
        this.timer = setInterval(() => {
            if (!this.gameState.startTime || this.gameState.gameOver) return;
            
            const elapsed = Date.now() - this.gameState.startTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            
            document.getElementById('timer').textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    updateDisplay() {
        document.getElementById('mines-count').textContent = Math.max(0, this.gameState.minesLeft);
        document.getElementById('tiles-left').textContent = this.gameState.tilesLeft;
        document.getElementById('score').textContent = this.gameState.score;
    }

    setDifficulty(difficulty) {
        if (difficulty === 'custom') {
            // For simplicity, custom uses beginner settings
            this.difficulties.custom = this.difficulties.beginner;
        }
        
        this.currentDifficulty = difficulty;
        
        // Update button states
        document.querySelectorAll('.difficulty-buttons .btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        
        this.initializeGame();
    }

    toggleFlagMode() {
        this.gameState.flagMode = !this.gameState.flagMode;
        const btn = document.getElementById('flag-btn');
        
        if (this.gameState.flagMode) {
            btn.classList.add('active');
            btn.textContent = '🚩 Flag Mode (ON)';
        } else {
            btn.classList.remove('active');
            btn.textContent = '🚩 Flag Mode';
        }
    }

    toggleSettings() {
        const panel = document.getElementById('settings-panel');
        panel.classList.toggle('show');
    }

    toggleSound() {
        this.settings.sound = document.getElementById('sound-toggle').checked;
        this.saveSettings();
    }

    toggleAnimations() {
        this.settings.animations = document.getElementById('animation-toggle').checked;
        this.saveSettings();
    }

    setTheme(themeName) {
        this.settings.theme = themeName;
        
        // Update theme button states
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`.theme-${themeName}`).classList.add('active');
        
        // Apply theme
        const themes = {
            classic: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            ocean: 'linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)',
            sunset: 'linear-gradient(135deg, #FF9A56 0%, #FF6B6B 100%)',
            forest: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
            dark: 'linear-gradient(135deg, #2c3e50 0%, #4a6741 100%)'
        };
        
        document.body.style.background = themes[themeName];
        this.saveSettings();
    }

    playSound(type) {
        if (!this.settings.sound) return;
        
        // Create audio context for sound effects
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        switch (type) {
            case 'reveal':
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.1);
                break;
            case 'flag':
                oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.2);
                break;
            case 'win':
                // Victory fanfare
                [523, 659, 784, 1047].forEach((freq, i) => {
                    const osc = audioContext.createOscillator();
                    const gain = audioContext.createGain();
                    osc.connect(gain);
                    gain.connect(audioContext.destination);
                    osc.frequency.setValueAtTime(freq, audioContext.currentTime + i * 0.2);
                    gain.gain.setValueAtTime(0.1, audioContext.currentTime + i * 0.2);
                    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.2 + 0.3);
                    osc.start(audioContext.currentTime + i * 0.2);
                    osc.stop(audioContext.currentTime + i * 0.2 + 0.3);
                });
                break;
            case 'lose':
                oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.5);
                gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.5);
                break;
        }
    }

    checkAchievements() {
        const timeElapsed = this.gameState.endTime - this.gameState.startTime;
        
        // First Win
        if (!this.achievements.has('first-win')) {
            this.unlockAchievement('first-win');
        }
        
        // Speed Demon (win beginner in under 30 seconds)
        if (this.currentDifficulty === 'beginner' && timeElapsed < 30000) {
            this.unlockAchievement('speed-demon');
        }
        
        // Expert Cleared
        if (this.currentDifficulty === 'expert') {
            this.unlockAchievement('expert-cleared');
        }
        
        // Perfectionist (win without any wrong flags)
        let wrongFlags = 0;
        for (let r = 0; r < this.gameState.rows; r++) {
            for (let c = 0; c < this.gameState.cols; c++) {
                const tile = this.board[r][c];
                if (tile.isFlagged && !tile.isMine) wrongFlags++;
            }
        }
        if (wrongFlags === 0) {
            this.unlockAchievement('perfectionist');
        }
    }

    unlockAchievement(achievementId) {
        if (this.achievements.has(achievementId)) return;
        
        this.achievements.add(achievementId);
        const element = document.querySelector(`[data-achievement="${achievementId}"]`);
        if (element) {
            element.classList.add('unlocked');
            
            // Show achievement notification
            if (this.settings.animations) {
                element.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    element.style.transform = '';
                }, 500);
            }
        }
        
        this.saveAchievements();
    }

    updateStatistics(won) {
        if (!this.statistics[this.currentDifficulty]) {
            this.statistics[this.currentDifficulty] = {
                games: 0,
                wins: 0,
                bestTime: null,
                totalTime: 0
            };
        }
        
        const stats = this.statistics[this.currentDifficulty];
        stats.games++;
        
        if (won) {
            stats.wins++;
            const timeElapsed = this.gameState.endTime - this.gameState.startTime;
            stats.totalTime += timeElapsed;
            
            if (!stats.bestTime || timeElapsed < stats.bestTime) {
                stats.bestTime = timeElapsed;
            }
        }
        
        this.saveStatistics();
    }

    showLeaderboard() {
        const modal = document.getElementById('leaderboard-modal');
        const content = document.getElementById('leaderboard-content');
        
        let html = '';
        Object.keys(this.statistics).forEach(difficulty => {
            const stats = this.statistics[difficulty];
            if (stats.games > 0) {
                const winRate = Math.round((stats.wins / stats.games) * 100);
                const avgTime = stats.wins > 0 ? Math.round(stats.totalTime / stats.wins / 1000) : 0;
                const bestTime = stats.bestTime ? Math.round(stats.bestTime / 1000) : 'N/A';
                
                html += `
                    <h4>${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</h4>
                    <div class="leaderboard-entry">
                        <span>Games:</span>
                        <span>${stats.games}</span>
                    </div>
                    <div class="leaderboard-entry">
                        <span>Win Rate:</span>
                        <span>${winRate}%</span>
                    </div>
                    <div class="leaderboard-entry">
                        <span>Best Time:</span>
                        <span>${bestTime}s</span>
                    </div>
                    <br>
                `;
            }
        });
        
        if (html === '') {
            html = '<p>No games played yet. Start playing to see your statistics!</p>';
        }
        
        content.innerHTML = html;
        modal.classList.add('show');
    }

    closeLeaderboard() {
        document.getElementById('leaderboard-modal').classList.remove('show');
    }

    saveSettings() {
        try {
            // Use memory storage instead of localStorage
            window.gameSettings = this.settings;
        } catch (e) {
            console.warn('Could not save settings');
        }
    }

    loadSettings() {
        try {
            if (window.gameSettings) {
                this.settings = { ...this.settings, ...window.gameSettings };
            }
        } catch (e) {
            console.warn('Could not load settings');
        }
        
        // Apply loaded settings to UI
        document.getElementById('sound-toggle').checked = this.settings.sound;
        document.getElementById('animation-toggle').checked = this.settings.animations;
        this.setTheme(this.settings.theme);
    }

    saveAchievements() {
        try {
            window.gameAchievements = Array.from(this.achievements);
        } catch (e) {
            console.warn('Could not save achievements');
        }
    }

    loadAchievements() {
        try {
            if (window.gameAchievements) {
                this.achievements = new Set(window.gameAchievements);
                
                // Update UI
                this.achievements.forEach(achievementId => {
                    const element = document.querySelector(`[data-achievement="${achievementId}"]`);
                    if (element) {
                        element.classList.add('unlocked');
                    }
                });
            }
        } catch (e) {
            console.warn('Could not load achievements');
        }
    }

    saveStatistics() {
        try {
            window.gameStatistics = this.statistics;
        } catch (e) {
            console.warn('Could not save statistics');
        }
    }

    loadStatistics() {
        try {
            return window.gameStatistics || {};
        } catch (e) {
            console.warn('Could not load statistics');
            return {};
        }
    }
}

// Global game instance
let game;

// Initialize game when page loads
window.addEventListener('load', () => {
    game = new MinesweeperPro();
});

// Global functions for UI interaction
function newGame() {
    game.initializeGame();
}

function setDifficulty(difficulty) {
    game.setDifficulty(difficulty);
}

function toggleFlagMode() {
    game.toggleFlagMode();
}

function toggleSettings() {
    game.toggleSettings();
}

function showLeaderboard() {
    game.showLeaderboard();
}

function closeModal() {
    game.closeModal();
}

function closeLeaderboard() {
    game.closeLeaderboard();
}

function toggleSound() {
    game.toggleSound();
}

function toggleAnimations() {
    game.toggleAnimations();
}

function setTheme(theme) {
    game.setTheme(theme);
}

// Help functions
function showHelp() {
    document.getElementById('help-modal').classList.add('show');
}

function closeHelp() {
    document.getElementById('help-modal').classList.remove('show');
}

// Handle mobile orientation changes
window.addEventListener('resize', () => {
    if (game) {
        // Reset the board on orientation change
        game.createBoard();
    }
});