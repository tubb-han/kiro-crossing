const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const TILE_SIZE = 50;
const COLS = canvas.width / TILE_SIZE;
const ROWS = canvas.height / TILE_SIZE;

// High score (persisted in localStorage)
let highScore = parseInt(localStorage.getItem('ghostCrossingHighScore')) || 0;

// Game paused until start button clicked
let gamePaused = true;

// Game state
let gameState = {
    lives: 3,
    score: 0,
    gameOver: false,
    won: false,
    showingDeath: false,
    deathTimer: 0,
    furthestRow: 13,
    deathAnimationProgress: 0,
    gameOverFadeProgress: 0,
    showingGameOverAnimation: false
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
    
    // Row 1: Witches (moving left)
    for (let i = 0; i < 4; i++) {
        obstacles.push({
            x: i * 3,
            y: 1,
            width: 1.3,
            speed: 0.028,
            direction: -1,
            color: '#9b59b6',
            type: 'witch'
        });
    }
    
    // Row 2: Green ghosts (moving right)
    for (let i = 0; i < 3; i++) {
        obstacles.push({
            x: i * 4,
            y: 2,
            width: 1.5,
            speed: 0.02,
            direction: 1,
            color: '#00ff88',
            type: 'greenGhost'
        });
    }
    
    // Row 3: Crystal balls (moving left)
    for (let i = 0; i < 4; i++) {
        obstacles.push({
            x: i * 3,
            y: 3,
            width: 1.5,
            speed: 0.025,
            direction: -1,
            color: '#9370db',
            type: 'crystalBall'
        });
    }
    
    // Row 5: Broomsticks (moving right)
    for (let i = 0; i < 2; i++) {
        obstacles.push({
            x: i * 6,
            y: 5,
            width: 2.5,
            speed: 0.015,
            direction: 1,
            color: '#8b4513',
            type: 'broomstick'
        });
    }
    
    // Row 7: Spiders (moving left)
    for (let i = 0; i < 5; i++) {
        obstacles.push({
            x: i * 2.5,
            y: 7,
            width: 1,
            speed: 0.03,
            direction: -1,
            color: '#4a4a4a',
            type: 'spider'
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
    if (gameState.gameOver || gameState.won || gameState.showingDeath) return;
    
    const oldX = player.x;
    const oldY = player.y;
    
    if (keys['ArrowUp'] || keys['w'] || keys['W']) {
        player.y = Math.max(0, player.y - 1);
        keys['ArrowUp'] = keys['w'] = keys['W'] = false;
        
        // Award points for moving forward
        if (player.y < gameState.furthestRow) {
            gameState.score += 5;
            gameState.furthestRow = player.y;
        }
    }
    if (keys['ArrowDown'] || keys['s'] || keys['S']) {
        player.y = Math.min(ROWS - 1, player.y + 1);
        keys['ArrowDown'] = keys['s'] = keys['S'] = false;
    }
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        player.x = player.x - 1;
        if (player.x < 0) player.x = COLS - 1;
        keys['ArrowLeft'] = keys['a'] = keys['A'] = false;
    }
    if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        player.x = player.x + 1;
        if (player.x >= COLS) player.x = 0;
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
    playDeathSound();
    gameState.lives--;
    gameState.showingDeath = true;
    gameState.deathTimer = 30; // Show animation for ~0.5 seconds at 60fps
    if (gameState.lives <= 0) {
        // Don't set gameOver immediately, let animation play
        gameState.deathTimer = 60; // Longer animation for final death
        gameState.showingGameOverAnimation = true;
    }
}

function resetPlayerPosition() {
    player.x = 5;
    player.y = 13;
    gameState.furthestRow = 13;
}

// Update game state
function update() {
    if (gameState.gameOver || gameState.won) return;
    
    // Handle game over animation (final death)
    if (gameState.showingGameOverAnimation) {
        gameState.deathTimer--;
        gameState.deathAnimationProgress++;
        
        // Start fading in game over screen after ghost floats for a bit
        if (gameState.deathTimer < 30) {
            gameState.gameOverFadeProgress++;
        }
        
        if (gameState.deathTimer <= 0) {
            gameState.gameOver = true;
            gameState.showingDeath = false;
            gameState.showingGameOverAnimation = false;
        }
        return;
    }
    
    // Handle death animation (not final death)
    if (gameState.showingDeath) {
        gameState.deathTimer--;
        gameState.deathAnimationProgress++;
        if (gameState.deathTimer <= 0) {
            gameState.showingDeath = false;
            gameState.deathAnimationProgress = 0;
            resetPlayerPosition();
        }
        return;
    }
    
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
            // Add padding to make collision less sensitive
            const padding = 0.2;
            const playerLeft = player.x + padding;
            const playerRight = player.x + 1 - padding;
            const obsLeft = obs.x + padding;
            const obsRight = obs.x + obs.width - padding;
            
            if (playerRight > obsLeft && playerLeft < obsRight) {
                // Collision detected
                playDeathSound();
                gameState.lives--;
                gameState.showingDeath = true;
                gameState.deathTimer = 30; // Show animation for ~0.5 seconds at 60fps
                if (gameState.lives <= 0) {
                    // Don't set gameOver immediately, let animation play
                    gameState.deathTimer = 60; // Longer animation for final death
                    gameState.showingGameOverAnimation = true;
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
    
    // Draw gravestones in non-goal areas at top row
    for (let col = 0; col < COLS; col++) {
        const isGoalZone = goals.some(goal => Math.abs(goal.x - col) < 0.5);
        if (!isGoalZone) {
            const x = col * TILE_SIZE + TILE_SIZE / 2;
            const y = TILE_SIZE / 2;
            
            // Gravestone
            ctx.fillStyle = '#666';
            ctx.fillRect(x - 15, y - 5, 30, 35);
            
            // Rounded top
            ctx.beginPath();
            ctx.arc(x, y - 5, 15, Math.PI, 0, false);
            ctx.fill();
            
            // RIP text
            ctx.fillStyle = '#333';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('RIP', x, y + 10);
        }
    }
    
    // Draw goal zones
    goals.forEach(goal => {
        ctx.fillStyle = goal.reached ? '#00ff00' : '#004400';
        ctx.fillRect(goal.x * TILE_SIZE + 5, goal.y * TILE_SIZE + 5, TILE_SIZE - 10, TILE_SIZE - 10);
    });
    
    // Draw obstacles
    obstacles.forEach(obs => {
        if (obs.type === 'witch') {
            // Draw witch
            const centerX = obs.x * TILE_SIZE + (obs.width * TILE_SIZE) / 2;
            const centerY = obs.y * TILE_SIZE + TILE_SIZE / 2;
            
            // Witch body (triangle dress)
            ctx.fillStyle = obs.color;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY - 10);
            ctx.lineTo(centerX - 15, centerY + 15);
            ctx.lineTo(centerX + 15, centerY + 15);
            ctx.closePath();
            ctx.fill();
            
            // Witch head
            ctx.fillStyle = '#90ee90';
            ctx.beginPath();
            ctx.arc(centerX, centerY - 12, 8, 0, Math.PI * 2);
            ctx.fill();
            
            // Witch hat
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.moveTo(centerX, centerY - 25);
            ctx.lineTo(centerX - 10, centerY - 12);
            ctx.lineTo(centerX + 10, centerY - 12);
            ctx.closePath();
            ctx.fill();
            
            // Hat brim
            ctx.fillRect(centerX - 12, centerY - 12, 24, 3);
        } else if (obs.type === 'bat') {
            // Draw bat
            const centerX = obs.x * TILE_SIZE + (obs.width * TILE_SIZE) / 2;
            const centerY = obs.y * TILE_SIZE + TILE_SIZE / 2;
            
            // Bat body
            ctx.fillStyle = obs.color;
            ctx.beginPath();
            ctx.ellipse(centerX, centerY, 8, 6, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Bat wings (left wing)
            ctx.beginPath();
            ctx.moveTo(centerX - 8, centerY);
            ctx.quadraticCurveTo(centerX - 18, centerY - 10, centerX - 22, centerY);
            ctx.quadraticCurveTo(centerX - 18, centerY + 5, centerX - 8, centerY + 3);
            ctx.closePath();
            ctx.fill();
            
            // Bat wings (right wing)
            ctx.beginPath();
            ctx.moveTo(centerX + 8, centerY);
            ctx.quadraticCurveTo(centerX + 18, centerY - 10, centerX + 22, centerY);
            ctx.quadraticCurveTo(centerX + 18, centerY + 5, centerX + 8, centerY + 3);
            ctx.closePath();
            ctx.fill();
            
            // Bat ears
            ctx.beginPath();
            ctx.moveTo(centerX - 4, centerY - 6);
            ctx.lineTo(centerX - 6, centerY - 10);
            ctx.lineTo(centerX - 2, centerY - 6);
            ctx.fill();
            
            ctx.beginPath();
            ctx.moveTo(centerX + 4, centerY - 6);
            ctx.lineTo(centerX + 6, centerY - 10);
            ctx.lineTo(centerX + 2, centerY - 6);
            ctx.fill();
        } else if (obs.type === 'spider') {
            // Draw spider
            const centerX = obs.x * TILE_SIZE + (obs.width * TILE_SIZE) / 2;
            const centerY = obs.y * TILE_SIZE + TILE_SIZE / 2;
            
            // Spider body
            ctx.fillStyle = obs.color;
            ctx.beginPath();
            ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
            ctx.fill();
            
            // Spider head
            ctx.beginPath();
            ctx.arc(centerX, centerY - 6, 5, 0, Math.PI * 2);
            ctx.fill();
            
            // Spider legs (8 legs)
            ctx.strokeStyle = obs.color;
            ctx.lineWidth = 2;
            
            // Left legs
            for (let i = 0; i < 4; i++) {
                const angle = Math.PI / 2 + (i * Math.PI / 6);
                ctx.beginPath();
                ctx.moveTo(centerX - 8, centerY);
                ctx.lineTo(centerX - 8 - Math.cos(angle) * 12, centerY + Math.sin(angle) * 12);
                ctx.stroke();
            }
            
            // Right legs
            for (let i = 0; i < 4; i++) {
                const angle = Math.PI / 2 + (i * Math.PI / 6);
                ctx.beginPath();
                ctx.moveTo(centerX + 8, centerY);
                ctx.lineTo(centerX + 8 + Math.cos(angle) * 12, centerY + Math.sin(angle) * 12);
                ctx.stroke();
            }
            
            // Spider eyes
            ctx.fillStyle = '#ff0000';
            ctx.beginPath();
            ctx.arc(centerX - 2, centerY - 7, 1.5, 0, Math.PI * 2);
            ctx.arc(centerX + 2, centerY - 7, 1.5, 0, Math.PI * 2);
            ctx.fill();
        } else if (obs.type === 'greenGhost' || obs.type === 'ghost') {
            // Draw as ghost shape
            ctx.fillStyle = obs.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = obs.color;
            ctx.beginPath();
            ctx.arc(
                obs.x * TILE_SIZE + (obs.width * TILE_SIZE) / 2,
                obs.y * TILE_SIZE + TILE_SIZE / 2,
                (obs.width * TILE_SIZE) / 2.5,
                0,
                Math.PI * 2
            );
            ctx.fill();
            ctx.shadowBlur = 0;
            
            // Draw eyes
            ctx.fillStyle = '#000';
            const eyeOffset = (obs.width * TILE_SIZE) / 6;
            ctx.beginPath();
            ctx.arc(obs.x * TILE_SIZE + (obs.width * TILE_SIZE) / 2 - eyeOffset, obs.y * TILE_SIZE + TILE_SIZE / 2 - 3, 2, 0, Math.PI * 2);
            ctx.arc(obs.x * TILE_SIZE + (obs.width * TILE_SIZE) / 2 + eyeOffset, obs.y * TILE_SIZE + TILE_SIZE / 2 - 3, 2, 0, Math.PI * 2);
            ctx.fill();
        } else if (obs.type === 'crystalBall') {
            // Draw crystal ball
            const centerX = obs.x * TILE_SIZE + (obs.width * TILE_SIZE) / 2;
            const centerY = obs.y * TILE_SIZE + TILE_SIZE / 2;
            
            // Outer glow
            ctx.shadowBlur = 15;
            ctx.shadowColor = obs.color;
            
            // Crystal ball sphere
            const gradient = ctx.createRadialGradient(centerX - 5, centerY - 5, 5, centerX, centerY, 18);
            gradient.addColorStop(0, '#e0b0ff');
            gradient.addColorStop(0.5, obs.color);
            gradient.addColorStop(1, '#4b0082');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(centerX, centerY, 18, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            
            // Highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.beginPath();
            ctx.arc(centerX - 6, centerY - 6, 6, 0, Math.PI * 2);
            ctx.fill();
            
            // Base stand
            ctx.fillStyle = '#4b0082';
            ctx.beginPath();
            ctx.moveTo(centerX - 10, centerY + 18);
            ctx.lineTo(centerX - 15, centerY + 25);
            ctx.lineTo(centerX + 15, centerY + 25);
            ctx.lineTo(centerX + 10, centerY + 18);
            ctx.closePath();
            ctx.fill();
        } else if (obs.type === 'broomstick') {
            // Draw broomstick
            const startX = obs.x * TILE_SIZE;
            const centerY = obs.y * TILE_SIZE + TILE_SIZE / 2;
            const length = obs.width * TILE_SIZE;
            
            // Broomstick handle
            ctx.strokeStyle = '#8b4513';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(startX + 10, centerY);
            ctx.lineTo(startX + length - 15, centerY);
            ctx.stroke();
            
            // Bristles
            ctx.strokeStyle = '#daa520';
            ctx.lineWidth = 2;
            for (let i = 0; i < 8; i++) {
                ctx.beginPath();
                ctx.moveTo(startX + length - 15, centerY);
                ctx.lineTo(startX + length - 5 + Math.random() * 5, centerY - 10 + i * 2.5);
                ctx.stroke();
            }
            
            // Binding
            ctx.strokeStyle = '#654321';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(startX + length - 18, centerY - 2);
            ctx.lineTo(startX + length - 18, centerY + 2);
            ctx.stroke();
        } else {
            // Draw as block
            ctx.fillStyle = obs.color;
            ctx.fillRect(
                obs.x * TILE_SIZE,
                obs.y * TILE_SIZE + 10,
                obs.width * TILE_SIZE,
                TILE_SIZE - 20
            );
        }
    });
    
    // Draw player (ghost floating away if dead, normal ghost otherwise)
    if (gameState.showingDeath || gameState.showingGameOverAnimation) {
        // Floating away animation
        const maxFrames = gameState.showingGameOverAnimation ? 60 : 30;
        const progress = Math.min(gameState.deathAnimationProgress / maxFrames, 1); // 0 to 1
        const centerX = player.x * TILE_SIZE + TILE_SIZE / 2;
        const centerY = player.y * TILE_SIZE + TILE_SIZE / 2;
        
        // Float upward (more for final death)
        const maxFloat = gameState.showingGameOverAnimation ? 150 : 60;
        const floatOffset = progress * maxFloat;
        const currentY = centerY - floatOffset;
        
        // Fade out (opacity from 1 to 0) - slower fade for game over
        const opacity = gameState.showingGameOverAnimation ? 
            Math.max(1 - (progress * 0.7), 0.3) : // Keep more visible during game over
            1 - progress;
        
        // Slight wave motion as it floats
        const waveOffset = Math.sin(progress * Math.PI * 3) * 5;
        
        // Draw fading ghost with glow
        ctx.save();
        ctx.globalAlpha = opacity;
        
        // Ethereal glow effect
        ctx.shadowBlur = 25 * opacity;
        ctx.shadowColor = '#ffffff';
        
        // Ghost body
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(
            centerX + waveOffset,
            currentY,
            player.size / 2,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        // Draw X eyes (dead)
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        
        // Left X eye
        ctx.beginPath();
        ctx.moveTo(centerX + waveOffset - 12, currentY - 8);
        ctx.lineTo(centerX + waveOffset - 4, currentY - 2);
        ctx.moveTo(centerX + waveOffset - 12, currentY - 2);
        ctx.lineTo(centerX + waveOffset - 4, currentY - 8);
        ctx.stroke();
        
        // Right X eye
        ctx.beginPath();
        ctx.moveTo(centerX + waveOffset + 4, currentY - 8);
        ctx.lineTo(centerX + waveOffset + 12, currentY - 2);
        ctx.moveTo(centerX + waveOffset + 4, currentY - 2);
        ctx.lineTo(centerX + waveOffset + 12, currentY - 8);
        ctx.stroke();
        
        // Wavy tail effect (ghost trail)
        ctx.fillStyle = 'rgba(255, 255, 255, ' + (opacity * 0.5) + ')';
        ctx.beginPath();
        for (let i = 0; i < 3; i++) {
            const waveY = currentY + 15 + i * 8;
            const waveX = centerX + waveOffset + Math.sin(progress * Math.PI * 4 + i) * 8;
            const waveSize = 8 - i * 2;
            ctx.arc(waveX, waveY, waveSize, 0, Math.PI * 2);
        }
        ctx.fill();
        
        ctx.restore();
    } else {
        // Draw ghost
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
    }
    
    // Draw game over or win message
    if (gameState.gameOver || gameState.showingGameOverAnimation) {
        // Calculate fade progress (0 to 1)
        const fadeProgress = Math.min(gameState.gameOverFadeProgress / 30, 1);
        
        // Only draw if there's some fade progress
        if (fadeProgress > 0) {
            ctx.save();
            ctx.globalAlpha = fadeProgress;
            
            // Dark overlay
            ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
            ctx.fillRect(0, canvas.height / 2 - 120, canvas.width, 240);
        
        // Draw large skull
        const skullX = canvas.width / 2;
        const skullY = canvas.height / 2 - 40;
        const skullSize = 50;
        
        // Skull head with glow
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ff0000';
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(skullX, skullY, skullSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Skull jaw
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(skullX, skullY + 25, 35, 20, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Eye sockets with red glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ff0000';
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(skullX - 20, skullY - 10, 12, 0, Math.PI * 2);
        ctx.arc(skullX + 20, skullY - 10, 12, 0, Math.PI * 2);
        ctx.fill();
        
        // Red glowing eyes
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(skullX - 20, skullY - 10, 6, 0, Math.PI * 2);
        ctx.arc(skullX + 20, skullY - 10, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Nose hole
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.moveTo(skullX, skullY + 5);
        ctx.lineTo(skullX - 8, skullY + 15);
        ctx.lineTo(skullX + 8, skullY + 15);
        ctx.closePath();
        ctx.fill();
        
        // Teeth
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        for (let i = -3; i <= 3; i++) {
            ctx.beginPath();
            ctx.moveTo(skullX + i * 10, skullY + 25);
            ctx.lineTo(skullX + i * 10, skullY + 35);
            ctx.stroke();
        }
        
        // GAME OVER text with red glow
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ff0000';
        ctx.fillStyle = '#ff0000';
        ctx.font = 'bold 56px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 + 80);
        ctx.shadowBlur = 0;
        
        // Subtitle
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px Arial';
        ctx.fillText('Press Restart to try again', canvas.width / 2, canvas.height / 2 + 110);
        
            ctx.restore();
        }
    } else if (gameState.won) {
        // Dark overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(0, canvas.height / 2 - 120, canvas.width, 240);
        
        // Draw trophy/star
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2 - 40;
        
        // Glowing star
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#00ff00';
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
            const x = centerX + Math.cos(angle) * 40;
            const y = centerY + Math.sin(angle) * 40;
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
            const innerAngle = angle + (2 * Math.PI) / 10;
            const innerX = centerX + Math.cos(innerAngle) * 18;
            const innerY = centerY + Math.sin(innerAngle) * 18;
            ctx.lineTo(innerX, innerY);
        }
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // YOU WIN text with green glow
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#00ff00';
        ctx.fillStyle = '#00ff00';
        ctx.font = 'bold 56px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('YOU WIN!', canvas.width / 2, canvas.height / 2 + 80);
        ctx.shadowBlur = 0;
        
        // Subtitle
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px Arial';
        ctx.fillText('All goals reached!', canvas.width / 2, canvas.height / 2 + 110);
    }
    
    // Update UI
    document.getElementById('lives').textContent = gameState.lives;
    document.getElementById('score').textContent = gameState.score;
    
    // Update high score
    if (gameState.score > highScore) {
        highScore = gameState.score;
        localStorage.setItem('ghostCrossingHighScore', highScore);
    }
    document.getElementById('highScore').textContent = highScore;
}

// Game loop
function gameLoop() {
    if (!gamePaused) {
        update();
    }
    draw();
    requestAnimationFrame(gameLoop);
}

// Restart game
document.getElementById('restartBtn').addEventListener('click', () => {
    gameState = {
        lives: 3,
        score: 0,
        gameOver: false,
        won: false,
        showingDeath: false,
        deathTimer: 0,
        furthestRow: 13,
        deathAnimationProgress: 0,
        gameOverFadeProgress: 0,
        showingGameOverAnimation: false
    };
    goals.forEach(g => g.reached = false);
    resetPlayerPosition();
    initObstacles();
});

// Music control
const musicBtn = document.getElementById('musicBtn');
let musicPlaying = false;
let audioContext = null;
let melodyInterval = null;
let currentNoteIndex = 0;

// Ominous whistling melody - like wind through a haunted house
const melody = [
    { note: 440.00, duration: 0.8 },  // A4 (long, eerie)
    { note: 466.16, duration: 0.4 },  // A#4
    { note: 523.25, duration: 1.2 },  // C5 (very long whistle)
    { note: 0, duration: 0.4 },       // Rest
    { note: 493.88, duration: 0.8 },  // B4
    { note: 440.00, duration: 0.6 },  // A4
    { note: 392.00, duration: 1.0 },  // G4 (long, low)
    { note: 0, duration: 0.6 },       // Rest
    { note: 349.23, duration: 0.8 },  // F4 (lower, darker)
    { note: 392.00, duration: 0.4 },  // G4
    { note: 440.00, duration: 1.4 },  // A4 (very long, haunting)
    { note: 0, duration: 0.8 }        // Long rest
];

function playNote(frequency, duration) {
    if (!audioContext || frequency === 0) return; // Skip rests
    
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    
    // Create whistling sound with sine wave
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, audioContext.currentTime);
    
    // Add slight vibrato for more realistic whistle
    const vibrato = audioContext.createOscillator();
    const vibratoGain = audioContext.createGain();
    vibrato.frequency.setValueAtTime(5, audioContext.currentTime); // 5Hz vibrato
    vibratoGain.gain.setValueAtTime(8, audioContext.currentTime); // Subtle pitch variation
    
    vibrato.connect(vibratoGain);
    vibratoGain.connect(osc.frequency);
    
    // Low-pass filter for softer, more distant whistle sound
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, audioContext.currentTime);
    filter.Q.setValueAtTime(1, audioContext.currentTime);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioContext.destination);
    
    // Slow attack and release for wind-like whistle
    gain.gain.setValueAtTime(0, audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.1);
    gain.gain.linearRampToValueAtTime(0.12, audioContext.currentTime + duration - 0.2);
    gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration);
    
    vibrato.start(audioContext.currentTime);
    osc.start(audioContext.currentTime);
    
    vibrato.stop(audioContext.currentTime + duration);
    osc.stop(audioContext.currentTime + duration);
}

function playMelody() {
    if (!musicPlaying) return;
    
    const currentNote = melody[currentNoteIndex];
    playNote(currentNote.note, currentNote.duration);
    
    currentNoteIndex = (currentNoteIndex + 1) % melody.length;
    
    // Schedule next note
    melodyInterval = setTimeout(() => {
        playMelody();
    }, currentNote.duration * 1000);
}

function startMusic() {
    // Create audio context on user interaction
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    // Resume context if suspended (required by browsers)
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    
    currentNoteIndex = 0;
    playMelody();
}

function stopMusic() {
    if (melodyInterval) {
        clearTimeout(melodyInterval);
        melodyInterval = null;
    }
}

musicBtn.addEventListener('click', () => {
    musicPlaying = !musicPlaying;
    
    if (musicPlaying) {
        startMusic();
        musicBtn.textContent = '🔇 Music Off';
        musicBtn.style.background = '#ff6b6b';
    } else {
        stopMusic();
        musicBtn.textContent = '🔊 Music On';
        musicBtn.style.background = '#8a2be2';
    }
});

// Death sound effect
function playDeathSound() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    
    // Create a descending "whoosh" sound
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(audioContext.destination);
    
    osc.type = 'sawtooth';
    
    // Descending pitch for "death" effect
    const now = audioContext.currentTime;
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.3);
    
    // Quick fade out
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    osc.start(now);
    osc.stop(now + 0.3);
}

// Start popup
const startPopup = document.getElementById('startPopup');
const startBtn = document.getElementById('startBtn');

startBtn.addEventListener('click', () => {
    startPopup.classList.add('hidden');
    gamePaused = false;
});

// Initialize and start
initObstacles();
gameLoop();
