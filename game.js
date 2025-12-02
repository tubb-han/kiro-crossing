const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const TILE_SIZE = 50;
const COLS = canvas.width / TILE_SIZE;
const ROWS = canvas.height / TILE_SIZE;

// Game state
let gameState = {
    lives: 3,
    score: 0,
    gameOver: false,
    won: false
};

// Player (Ghost)
const player = {
    x: 5,
    y: 13,
    size: TILE_SIZE - 10,
    color: '#ffffff'
};

// Obstacles (moving entities)
const obstacles = [];

// Goal zones at the top
const goals = [
    { x: 1, y: 0, reached: false },
    { x: 4, y: 0, reached: false },
    { x: 7, y: 0, reached: false },
    { x: 10, y: 0, reached: false }
];

// Initialize obstacles
function initObstacles() {
    obstacles.length = 0;
    
    // Row 2: Floating candles (moving right)
    for (let i = 0; i < 3; i++) {
        obstacles.push({
            x: i * 4,
            y: 2,
            width: 2,
            speed: 0.02,
            direction: 1,
            color: '#ff6b35',
            type: 'candle'
        });
    }
    
    // Row 3: Shadow creatures (moving left)
    for (let i = 0; i < 4; i++) {
        obstacles.push({
            x: i * 3,
            y: 3,
            width: 1.5,
            speed: 0.025,
            direction: -1,
            color: '#2d1b69',
            type: 'shadow'
        });
    }
    
    // Row 5: Possessed furniture (moving right)
    for (let i = 0; i < 2; i++) {
        obstacles.push({
            x: i * 6,
            y: 5,
            width: 2.5,
            speed: 0.015,
            direction: 1,
            color: '#8b4513',
            type: 'furniture'
        });
    }
    
    // Row 7: Flying books (moving left)
    for (let i = 0; i < 5; i++) {
        obstacles.push({
            x: i * 2.5,
            y: 7,
            width: 1,
            speed: 0.03,
            direction: -1,
            color: '#4a4a4a',
            type: 'book'
        });
    }
    
    // Row 9: Ghosts (moving right)
    for (let i = 0; i < 3; i++) {
        obstacles.push({
            x: i * 4.5,
            y: 9,
            width: 1.8,
            speed: 0.022,
            direction: 1,
            color: '#00ff88',
            type: 'ghost'
        });
    }
    
    // Row 11: Bats (moving left)
    for (let i = 0; i < 4; i++) {
        obstacles.push({
            x: i * 3.5,
            y: 11,
            width: 1.2,
            speed: 0.035,
            direction: -1,
            color: '#5c4033',
            type: 'bat'
        });
    }
}

// Input handling
const keys = {};
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    handleInput();
});

function handleInput() {
    if (gameState.gameOver || gameState.won) return;
    
    const oldX = player.x;
    const oldY = player.y;
    
    if (keys['ArrowUp'] || keys['w'] || keys['W']) {
        player.y = Math.max(0, player.y - 1);
        keys['ArrowUp'] = keys['w'] = keys['W'] = false;
    }
    if (keys['ArrowDown'] || keys['s'] || keys['S']) {
        player.y = Math.min(ROWS - 1, player.y + 1);
        keys['ArrowDown'] = keys['s'] = keys['S'] = false;
    }
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        player.x = Math.max(0, player.x - 1);
        keys['ArrowLeft'] = keys['a'] = keys['A'] = false;
    }
    if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        player.x = Math.min(COLS - 1, player.x + 1);
        keys['ArrowRight'] = keys['d'] = keys['D'] = false;
    }
    
    // Check if reached goal
    if (player.y === 0) {
        checkGoalReached();
    }
}

function checkGoalReached() {
    for (let goal of goals) {
        if (Math.abs(player.x - goal.x) < 1 && !goal.reached) {
            goal.reached = true;
            gameState.score += 100;
            resetPlayerPosition();
            
            // Check if all goals reached
            if (goals.every(g => g.reached)) {
                gameState.won = true;
            }
            return;
        }
    }
    // Hit top but not in goal zone
    resetPlayerPosition();
    gameState.lives--;
    if (gameState.lives <= 0) {
        gameState.gameOver = true;
    }
}

function resetPlayerPosition() {
    player.x = 5;
    player.y = 13;
}

// Update game state
function update() {
    if (gameState.gameOver || gameState.won) return;
    
    // Update obstacles
    obstacles.forEach(obs => {
        obs.x += obs.speed * obs.direction;
        
        // Wrap around
        if (obs.direction > 0 && obs.x > COLS) {
            obs.x = -obs.width;
        } else if (obs.direction < 0 && obs.x < -obs.width) {
            obs.x = COLS;
        }
    });
    
    // Check collisions
    checkCollisions();
}

function checkCollisions() {
    for (let obs of obstacles) {
        if (Math.abs(player.y - obs.y) < 0.5) {
            const playerLeft = player.x;
            const playerRight = player.x + 1;
            const obsLeft = obs.x;
            const obsRight = obs.x + obs.width;
            
            if (playerRight > obsLeft && playerLeft < obsRight) {
                // Collision detected
                gameState.lives--;
                resetPlayerPosition();
                if (gameState.lives <= 0) {
                    gameState.gameOver = true;
                }
                return;
            }
        }
    }
}

// Draw functions
function draw() {
    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw safe zones
    ctx.fillStyle = '#0f3d0f';
    ctx.fillRect(0, 0, canvas.width, TILE_SIZE);
    ctx.fillRect(0, (ROWS - 1) * TILE_SIZE, canvas.width, TILE_SIZE);
    
    // Draw goal zones
    goals.forEach(goal => {
        ctx.fillStyle = goal.reached ? '#00ff00' : '#004400';
        ctx.fillRect(goal.x * TILE_SIZE + 5, goal.y * TILE_SIZE + 5, TILE_SIZE - 10, TILE_SIZE - 10);
    });
    
    // Draw obstacles
    obstacles.forEach(obs => {
        ctx.fillStyle = obs.color;
        ctx.fillRect(
            obs.x * TILE_SIZE,
            obs.y * TILE_SIZE + 10,
            obs.width * TILE_SIZE,
            TILE_SIZE - 20
        );
    });
    
    // Draw player (ghost)
    ctx.fillStyle = player.color;
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ffffff';
    ctx.beginPath();
    ctx.arc(
        player.x * TILE_SIZE + TILE_SIZE / 2,
        player.y * TILE_SIZE + TILE_SIZE / 2,
        player.size / 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Draw eyes
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(player.x * TILE_SIZE + TILE_SIZE / 2 - 8, player.y * TILE_SIZE + TILE_SIZE / 2 - 5, 3, 0, Math.PI * 2);
    ctx.arc(player.x * TILE_SIZE + TILE_SIZE / 2 + 8, player.y * TILE_SIZE + TILE_SIZE / 2 - 5, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw game over or win message
    if (gameState.gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, canvas.height / 2 - 50, canvas.width, 100);
        ctx.fillStyle = '#ff0000';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 + 15);
    } else if (gameState.won) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, canvas.height / 2 - 50, canvas.width, 100);
        ctx.fillStyle = '#00ff00';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('YOU WIN!', canvas.width / 2, canvas.height / 2 + 15);
    }
    
    // Update UI
    document.getElementById('lives').textContent = gameState.lives;
    document.getElementById('score').textContent = gameState.score;
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Restart game
document.getElementById('restartBtn').addEventListener('click', () => {
    gameState = {
        lives: 3,
        score: 0,
        gameOver: false,
        won: false
    };
    goals.forEach(g => g.reached = false);
    resetPlayerPosition();
    initObstacles();
});

// Initialize and start
initObstacles();
gameLoop();
