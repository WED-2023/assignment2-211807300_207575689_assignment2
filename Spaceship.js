// Spaceship.js
// Space Invaders Game Logic

var canvas; // Canvas element
var context; // Canvas context for drawing

// Game constants
var ENEMY_ROWS = 4; // Number of enemy ship rows
var ENEMY_COLS = 5; // Number of enemy ships per row
var ENEMY_SPACING_H = 20; // Horizontal spacing between enemies
var ENEMY_SPACING_V = 20; // Vertical spacing between enemies
var LIVES = 3; // Initial number of lives
var TIME_INTERVAL = 16; // Screen refresh interval in ms (about 60 fps)
var PLAYABLE_AREA_PERCENT = 0.4; // Only bottom 40% of screen is playable for player

// Game loop and statistics variables
var intervalTimer; // Holds the game cycle timer
var accelerationTimer; // Holds the enemy acceleration timer
var timeLeft; // Time remaining in seconds
var shotsFired; // Number of shots fired by player
var score; // Player's score
var isRunning; // Whether the game is currently active

// Player ship variables
var playerShip; // Object representing player's ship
var playerShipWidth; // Player ship width
var playerShipHeight; // Player ship height
var playerMissiles; // Array of player missiles on screen
var playerMissileWidth; // Player missile width
var playerMissileHeight; // Player missile height
var playerMissileSpeed; // Player missile speed
var shootKey; // Key used for shooting

// Enemy ship variables
var enemyShips; // Array of enemy ships
var enemyShipWidth; // Enemy ship width
var enemyShipHeight; // Enemy ship height
var enemyMissiles; // Array of enemy missiles on screen
var enemyMissileWidth; // Enemy missile width
var enemyMissileHeight; // Enemy missile height
var enemyDirection; // Current enemy movement direction (1 = right, -1 = left)
var enemySpeed; // Current enemy movement speed
var enemyMissileSpeed; // Enemy missile speed
var accelerationCount; // Number of times enemies have accelerated

// Canvas dimension variables
var canvasWidth; // Canvas width
var canvasHeight; // Canvas height

// Sound variables
var backgroundMusic; // Background music
var playerShotSound; // Sound when player shoots
var enemyHitSound; // Sound when enemy is hit
var playerHitSound; // Sound when player is hit

// Game element images
var playerShipImg; // Player ship image
var enemyShipImgs; // Array of enemy ship images
var playerMissileImg; // Player missile image
var enemyMissileImg; // Enemy missile image
var backgroundImg; // Background image

// Called when the application first loads
function setupGame() {
    console.log("Setting up game...");
    
    // Stop timer if document unload event occurs
    document.addEventListener("unload", stopTimer, false);

    // Get canvas and its context
    canvas = document.getElementById("game-container");
    if (!canvas) {
        console.error("Canvas element not found!");
        return;
    }
    
    context = canvas.getContext("2d");
    if (!context) {
        console.error("Could not get canvas context!");
        return;
    }
    
    console.log("Canvas found, size:", canvas.width, "x", canvas.height);
    
    // Store canvas dimensions
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;
    
    // Load images
    playerShipImg = new Image();
    playerShipImg.src = "green_spaceship.jpeg"; // Green ship for player
    playerShipImg.onerror = function() { console.error("Error loading player ship image:", this.src); };
    playerShipImg.onload = function() { console.log("Player ship image loaded successfully"); };
    
    enemyShipImgs = [];
    // Brown ships (top row) - 20 points
    var brownShipImg = new Image();
    brownShipImg.src = "brown_spaceship.jpeg"; 
    brownShipImg.onerror = function() { console.error("Error loading brown ship image:", this.src); };
    enemyShipImgs.push(brownShipImg);
    
    // Red ships (second row) - 15 points
    var redShipImg = new Image();
    redShipImg.src = "rad_spaceship.jpeg";
    redShipImg.onerror = function() { console.error("Error loading red ship image:", this.src); };
    enemyShipImgs.push(redShipImg);
    
    // Orange ships (third row) - 10 points
    var orangeShipImg = new Image();
    orangeShipImg.src = "orange_spaceship.jpeg";
    orangeShipImg.onerror = function() { console.error("Error loading orange ship image:", this.src); };
    enemyShipImgs.push(orangeShipImg);
    
    // Yellow ships (bottom row) - 5 points
    var yellowShipImg = new Image();
    yellowShipImg.src = "yellow_spaceship.jpeg";
    yellowShipImg.onerror = function() { console.error("Error loading yellow ship image:", this.src); };
    enemyShipImgs.push(yellowShipImg);
    
    // Missile images
    playerMissileImg = new Image();
    playerMissileImg.src = "green_missile.jpeg"; // Green missile for player
    playerMissileImg.onerror = function() { console.error("Error loading player missile image:", this.src); };
    
    enemyMissileImg = new Image();
    enemyMissileImg.src = "rad_missile.jpeg"; // Red missile for enemies
    enemyMissileImg.onerror = function() { console.error("Error loading enemy missile image:", this.src); };
    
    // Background image
    backgroundImg = new Image();
    backgroundImg.src = "background.jpeg"; 
    backgroundImg.onerror = function() { console.error("Error loading background image:", this.src); };
    backgroundImg.onload = function() { console.log("Background image loaded successfully"); };
    
    // Load sounds
    backgroundMusic = document.getElementById("background-music");
    playerShotSound = document.getElementById("player-shot-sound");
    enemyHitSound = document.getElementById("enemy-hit-sound");
    playerHitSound = document.getElementById("player-hit-sound");
    
    // If audio elements don't exist, create them programmatically
    if (!backgroundMusic) {
        console.warn("Background music element not found, creating one");
        backgroundMusic = new Audio();
        backgroundMusic.src = "Komiku - Space MTV.mp3";
        backgroundMusic.loop = true;
    }
    
    if (!playerShotSound) {
        console.warn("Player shot sound element not found, creating one");
        playerShotSound = new Audio();
        playerShotSound.src = "cannon_fire.ogg";
    }
    
    if (!enemyHitSound) {
        console.warn("Enemy hit sound element not found, creating one");
        enemyHitSound = new Audio();
        enemyHitSound.src = "blocker_hit.mp3";
    }
    
    if (!playerHitSound) {
        console.warn("Player hit sound element not found, creating one");
        playerHitSound = new Audio();
        playerHitSound.src = "target_hit.ogg";
    }
    
    // Initialize game objects
    playerMissiles = []; // Empty array for player missiles
    enemyMissiles = []; // Empty array for enemy missiles
    
    // Set keyboard event listeners
    document.addEventListener("keydown", handleKeyDown, false);
    document.addEventListener("keyup", handleKeyUp, false);
    
    // Set event listener for new game button
    var newGameBtn = document.getElementById("new-game-btn");
    if (newGameBtn) {
        newGameBtn.addEventListener("click", function() {
            console.log("New game button clicked");
            newGame();
        }, false);
    } else {
        console.error("New Game button not found!");
    }
    
    // Set default shoot key to Spacebar
    shootKey = "Space";
    
    console.log("Game setup completed");
}

// Save current score to high scores table
function saveHighScore() {
    var currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        console.log("No user logged in, can't save score");
        return; // If no user is logged in, don't save
    }
    
    console.log("Saving score for user:", currentUser, "Score:", score);
    
    // Get existing high scores table
    var highScores = JSON.parse(localStorage.getItem('highScores') || '{}');
    
    // Initialize user's scores array if needed
    if (!highScores[currentUser]) {
        console.log("Initializing scores array for user:", currentUser);
        highScores[currentUser] = [];
    }
    
    // Add current score
    highScores[currentUser].push({
        score: score,
        date: new Date().toLocaleDateString()
    });
    
    console.log("Added new score:", score, "for user:", currentUser);
    
    // Sort scores in descending order
    highScores[currentUser].sort(function(a, b) {
        return b.score - a.score;
    });
    
    // Save back to localStorage
    localStorage.setItem('highScores', JSON.stringify(highScores));
    console.log("Saved updated high scores to localStorage");
}

// Display high scores table
function displayHighScores() {
    var currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return; // If no user is logged in, don't display
    
    // Get high scores table
    var highScores = JSON.parse(localStorage.getItem('highScores') || '{}');
    var userScores = highScores[currentUser] || [];
    
    // Get high scores table body element
    var tableBody = document.getElementById("high-scores-body");
    if (!tableBody) return;
    
    // Clear existing rows
    tableBody.innerHTML = "";
    
    // Add scores to table
    for (var i = 0; i < userScores.length; i++) {
        var row = document.createElement("tr");
        
        var rankCell = document.createElement("td");
        rankCell.textContent = i + 1; // Rank
        row.appendChild(rankCell);
        
        var scoreCell = document.createElement("td");
        scoreCell.textContent = userScores[i].score; // Score
        row.appendChild(scoreCell);
        
        var dateCell = document.createElement("td");
        dateCell.textContent = userScores[i].date; // Date
        row.appendChild(dateCell);
        
        tableBody.appendChild(row);
    }
    
    // Display high scores table
    var highScoresTable = document.getElementById("high-scores-table");
    if (highScoresTable) {
        highScoresTable.style.display = "block";
    }
}

// Update score display
function updateScoreDisplay() {
    var scoreElement = document.getElementById("score");
    if (scoreElement) {
        scoreElement.textContent = score;
    }
}

// Update lives display
function updateLivesDisplay() {
    var livesElement = document.getElementById("lives");
    if (livesElement) {
        livesElement.textContent = LIVES;
    }
}

// Update time display
function updateTimeDisplay() {
    var timeElement = document.getElementById("time");
    if (timeElement) {
        var minutes = Math.floor(timeLeft / 60);
        var seconds = Math.floor(timeLeft % 60);
        timeElement.textContent = minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
    }
}

// Draw all game elements
function draw() {
    if (!context) {
        console.error("Context is null, cannot draw");
        return;
    }
    
    // Clear canvas
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Draw background
    if (backgroundImg.complete && backgroundImg.naturalWidth !== 0) {
        context.drawImage(backgroundImg, 0, 0, canvasWidth, canvasHeight);
    } else {
        // Fill with black as fallback
        context.fillStyle = "black";
        context.fillRect(0, 0, canvasWidth, canvasHeight);
    }
    
    // Draw player ship
    if (playerShip && playerShipImg.complete && playerShipImg.naturalWidth !== 0) {
        context.drawImage(playerShipImg, playerShip.x, playerShip.y, playerShipWidth, playerShipHeight);
    } else {
        console.warn("Player ship not ready to draw");
    }
    
    // Draw enemy ships
    for (var i = 0; i < enemyShips.length; i++) {
        var enemy = enemyShips[i];
        // Select image based on row (0=brown, 1=red, 2=orange, 3=yellow)
        var enemyImg = enemyShipImgs[enemy.row];
        
        if (enemyImg && enemyImg.complete && enemyImg.naturalWidth !== 0) {
            context.drawImage(enemyImg, enemy.x, enemy.y, enemyShipWidth, enemyShipHeight);
        } else {
            // Fallback to colored rectangle
            context.fillStyle = ["brown", "red", "orange", "yellow"][enemy.row];
            context.fillRect(enemy.x, enemy.y, enemyShipWidth, enemyShipHeight);
        }
    }
    
    // Draw player missiles
    for (var i = 0; i < playerMissiles.length; i++) {
        var missile = playerMissiles[i];
        if (playerMissileImg.complete && playerMissileImg.naturalWidth !== 0) {
            context.drawImage(playerMissileImg, missile.x, missile.y, playerMissileWidth, playerMissileHeight);
        } else {
            // Fallback to green rectangle
            context.fillStyle = "green";
            context.fillRect(missile.x, missile.y, playerMissileWidth, playerMissileHeight);
        }
    }
    
    // Draw enemy missiles
    for (var i = 0; i < enemyMissiles.length; i++) {
        var missile = enemyMissiles[i];
        if (enemyMissileImg.complete && enemyMissileImg.naturalWidth !== 0) {
            context.drawImage(enemyMissileImg, missile.x, missile.y, enemyMissileWidth, enemyMissileHeight);
        } else {
            // Fallback to red rectangle
            context.fillStyle = "red";
            context.fillRect(missile.x, missile.y, enemyMissileWidth, enemyMissileHeight);
        }
    }
}

// Accelerate enemies (called every 5 seconds)
function accelerateEnemies() {
    if (!isRunning || accelerationCount >= 4) {
        return; // Don't accelerate more than 4 times
    }
    
    enemySpeed *= 1.2; // Increase enemy speed
    enemyMissileSpeed *= 1.2; // Increase enemy missile speed
    accelerationCount++; // Increment acceleration counter
    
    console.log("Enemies accelerated to:", enemySpeed);
}

// Set timer for game update
function startTimer() {
    console.log("Starting game timers");

    // Make sure no timer is running - stop it properly
    if (intervalTimer !== null) {
        clearInterval(intervalTimer);
        intervalTimer = null;
    }

    if (accelerationTimer !== null) {
        clearInterval(accelerationTimer);
        accelerationTimer = null;
    }

    // Initialize new timers
    intervalTimer = setInterval(updatePositions, TIME_INTERVAL);
    accelerationTimer = setInterval(accelerateEnemies, 5000);  // Accelerate every 5 seconds

    // Start music
    if (backgroundMusic) {
        backgroundMusic.loop = true;
        backgroundMusic.currentTime = 0;
        backgroundMusic.play().catch(e => console.log("Audio couldn't play automatically:", e));
    }

    isRunning = true;
}

// Stop timers
function stopTimer() {
    console.log("Stopping game timers");

    if (intervalTimer) {
        clearInterval(intervalTimer);
        intervalTimer = null;
    }

    if (accelerationTimer) {
        clearInterval(accelerationTimer);
        accelerationTimer = null;
    }

    if (backgroundMusic) {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
    }

    isRunning = false;
}

// Called by newGame to set game element sizes
// relative to canvas size before starting the game
function resetElements() {
    console.log("Resetting game elements");
    
    if (!canvas) {
        console.error("Canvas is null, cannot reset elements");
        return;
    }
    
    // Get dimensions
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;
    
    // Set sizes for game elements
    playerShipWidth = canvasWidth / 16; // 1/16 of canvas width
    playerShipHeight = playerShipWidth; // Square shape
    
    enemyShipWidth = canvasWidth / 20; // 1/20 of canvas width
    enemyShipHeight = enemyShipWidth; // Square shape
    
    playerMissileWidth = canvasWidth / 40; // Larger missiles
    playerMissileHeight = canvasHeight / 10; // Larger missiles
    
    enemyMissileWidth = canvasWidth / 40; // Larger missiles
    enemyMissileHeight = canvasHeight / 10; // Larger missiles
    
    // Set speeds
    playerMissileSpeed = canvasHeight / 2; // Travel half screen height per second
    enemySpeed = canvasWidth / 6; // Initial enemy speed
    enemyMissileSpeed = canvasHeight / 3; // Initial enemy missile speed
    
    // Create player ship
    playerShip = {
        x: (canvasWidth - playerShipWidth) / 2, // Horizontal center
        y: canvasHeight - playerShipHeight - 20, // Near bottom
        width: playerShipWidth,
        height: playerShipHeight,
        speed: canvasWidth / 6, // Ship speed
        movingLeft: false,
        movingRight: false,
        movingUp: false,
        movingDown: false
    };
    
    // Create enemy ships
    enemyShips = [];
    var startX = (canvasWidth - (ENEMY_COLS * (enemyShipWidth + ENEMY_SPACING_H))) / 2;
    var startY = canvasHeight / 8; // Start at 1/8 from top
    
    // Loop through rows and columns to create enemy array
    for (var row = 0; row < ENEMY_ROWS; row++) {
        for (var col = 0; col < ENEMY_COLS; col++) {
            enemyShips.push({
                x: startX + col * (enemyShipWidth + ENEMY_SPACING_H),
                y: startY + row * (enemyShipHeight + ENEMY_SPACING_V),
                width: enemyShipWidth,
                height: enemyShipHeight,
                row: row, // Save row (for image and score)
                points: (ENEMY_ROWS - row) * 5 // Score: 20, 15, 10, 5 based on row
            });
        }
    }
    
    // Set initial enemy direction
    enemyDirection = 1; // Start moving right
    
    console.log("Elements reset complete. Created", enemyShips.length, "enemy ships");
}

// Reset all screen elements and start a new game
function newGame() {
    console.log("New Game function called");

    // Stop existing timers immediately
    stopTimer();

    // Get game settings
    var gameTimeMinutes = parseInt(localStorage.getItem('gameTime') || "2");

    // Get updated shoot key
    shootKey = localStorage.getItem('shootKey') || "Space";
    console.log("Updated shootKey:", shootKey);

    // Reset general variables
    isRunning = false;
    score = 0;
    LIVES = 3;
    timeLeft = gameTimeMinutes * 60;
    shotsFired = 0;
    accelerationCount = 0;  // Reset acceleration counter for new game

    // Reset arrays
    playerMissiles = [];
    enemyMissiles = [];

    // Reset player movement state
    if (playerShip) {
        playerShip.movingLeft = false;
        playerShip.movingRight = false;
        playerShip.movingUp = false;
        playerShip.movingDown = false;
    }

    // After everything is reset, create elements again
    resetElements();

    // Update displays
    updateScoreDisplay();
    updateLivesDisplay();
    updateTimeDisplay();

    // Hide messages from previous game
    const resultElement = document.getElementById("game-result");
    if (resultElement) resultElement.style.display = "none";

    const highScoresTable = document.getElementById("high-scores-table");
    if (highScoresTable) highScoresTable.style.display = "none";

    // Start game
    isRunning = true;
    startTimer();
    draw();

    console.log("Game initialized with:", {
        timeLeft,
        LIVES,
        enemyShips: enemyShips.length,
        shootKey: shootKey,
        isRunning: isRunning
    });
}

// Handle key press events
function handleKeyDown(event) {
    if (!isRunning) return;

    // For debugging: Log the key pressed and current shoot key
    console.log("Key pressed:", event.key, "Current shootKey:", shootKey);

    switch (event.key) {
        case "ArrowLeft":
            playerShip.movingLeft = true;
            break;
        case "ArrowRight":
            playerShip.movingRight = true;
            break;
        case "ArrowUp":
            playerShip.movingUp = true;
            break;
        case "ArrowDown":
            playerShip.movingDown = true;
            break;
    }

    // If shooting key matches space or is defined as "space"
    if ((event.key === " " && (shootKey === " " || shootKey.toLowerCase() === "space")) ||
        event.key.toUpperCase() === shootKey.toUpperCase()) {
        event.preventDefault(); // Prevent browser from scrolling or other action
        console.log("Shoot key pressed:", event.key);
        firePlayerMissile();
    }
}

// Handle key release events
function handleKeyUp(event) {
    if (!isRunning) return;
    
    switch (event.key) {
        case "ArrowLeft": // Left arrow
            playerShip.movingLeft = false;
            break;
        case "ArrowRight": // Right arrow
            playerShip.movingRight = false;
            break;
        case "ArrowUp": // Up arrow
            playerShip.movingUp = false;
            break;
        case "ArrowDown": // Down arrow
            playerShip.movingDown = false;
            break;
    }
}

// Fire missile from player ship
function firePlayerMissile() {
    // Limit number of missiles on screen
    if (playerMissiles.length >= 3) return;
    
    // Create new missile
    playerMissiles.push({
        x: playerShip.x + (playerShipWidth - playerMissileWidth) / 2, // Center missile
        y: playerShip.y - playerMissileHeight, // Position missile above ship
        width: playerMissileWidth,
        height: playerMissileHeight
    });
    
    // Play firing sound
    if (playerShotSound) {
        playerShotSound.currentTime = 0; // Reset sound to beginning
        playerShotSound.play().catch(e => console.log("Couldn't play sound:", e));
    }
    
    shotsFired++; // Increment shot counter
}

// Fire missile from enemy ship
function fireEnemyMissile() {
    if (enemyShips.length === 0) return;
    
    // Check if any enemy missile has passed 3/4 of screen height
    var canFire = true;
    for (var i = 0; i < enemyMissiles.length; i++) {
        if (enemyMissiles[i].y < canvasHeight * 0.75) {
            canFire = false;
            break;
        }
    }
    
    if (!canFire) return;
    
    // Select random enemy to fire
    var randomIndex = Math.floor(Math.random() * enemyShips.length);
    var enemy = enemyShips[randomIndex];
    
    // Create new missile
    enemyMissiles.push({
        x: enemy.x + (enemyShipWidth - enemyMissileWidth) / 2, // Center missile
        y: enemy.y + enemyShipHeight, // Position missile below ship
        width: enemyMissileWidth,
        height: enemyMissileHeight
    });
}

// Update positions of all game elements
function updatePositions() {
    if (!isRunning) return;
    
    // Update time
    timeLeft -= TIME_INTERVAL / 1000;
    if (timeLeft <= 0) {
        endGame('time');
        return;
    }
    updateTimeDisplay();
    
    // Move player ship based on key presses
    movePlayerShip();
    
    // Move enemy ships
    moveEnemies();
    
    // Move player missiles
    movePlayerMissiles();
    
    // Move enemy missiles
    moveEnemyMissiles();
    
    // Check if enemy fires missile randomly
    if (Math.random() < 0.01) { // 1% chance per frame
        fireEnemyMissile();
    }
    
    // Check collisions
    checkCollisions();
    
    // Draw all elements
    draw();
}

// Move player ship based on key presses
function movePlayerShip() {
    // Calculate playable area (bottom 40% of game container)
    var playableAreaTop = canvasHeight * (1 - PLAYABLE_AREA_PERCENT);
    
    // Move left
    if (playerShip.movingLeft) {
        playerShip.x -= playerShip.speed * TIME_INTERVAL / 1000;
        if (playerShip.x < 0) {
            playerShip.x = 0; // Stop at left boundary
        }
    }
    
    // Move right
    if (playerShip.movingRight) {
        playerShip.x += playerShip.speed * TIME_INTERVAL / 1000;
        if (playerShip.x > canvasWidth - playerShipWidth) {
            playerShip.x = canvasWidth - playerShipWidth; // Stop at right boundary
        }
    }
    
    // Move up
    if (playerShip.movingUp) {
        playerShip.y -= playerShip.speed * TIME_INTERVAL / 1000;
        // Don't allow movement beyond playable area
        if (playerShip.y < playableAreaTop) {
            playerShip.y = playableAreaTop;
        }
    }
    
    // Move down
    if (playerShip.movingDown) {
        playerShip.y += playerShip.speed * TIME_INTERVAL / 1000;
        if (playerShip.y > canvasHeight - playerShipHeight - 10) {
            playerShip.y = canvasHeight - playerShipHeight - 10; // Stop at bottom boundary
        }
    }
}

// Move enemy ships
function moveEnemies() {
    // Check if all enemies are defeated
    if (enemyShips.length === 0) {
        endGame('victory');
        return;
    }
    
    // Find leftmost and rightmost enemies
    var leftmost = canvasWidth;
    var rightmost = 0;
    
    for (var i = 0; i < enemyShips.length; i++) {
        var enemy = enemyShips[i];
        if (enemy.x < leftmost) leftmost = enemy.x;
        if (enemy.x + enemyShipWidth > rightmost) rightmost = enemy.x + enemyShipWidth;
    }
    
    // If enemies reach the edge, reverse direction
    if ((rightmost >= canvasWidth && enemyDirection > 0) || 
        (leftmost <= 0 && enemyDirection < 0)) {
        enemyDirection *= -1;
    }
    
    // Move all enemies according to current speed
    for (var i = 0; i < enemyShips.length; i++) {
        enemyShips[i].x += enemyDirection * enemySpeed * TIME_INTERVAL / 1000;
    }
}

// Move player missiles
function movePlayerMissiles() {
    for (var i = playerMissiles.length - 1; i >= 0; i--) {
        // Move missile upward
        playerMissiles[i].y -= playerMissileSpeed * TIME_INTERVAL / 1000;
        
        // Remove missile if it leaves the screen
        if (playerMissiles[i].y + playerMissileHeight < 0) {
            playerMissiles.splice(i, 1);
        }
    }
}

// Move enemy missiles
function moveEnemyMissiles() {
    for (var i = enemyMissiles.length - 1; i >= 0; i--) {
        // Move missile downward at current enemy missile speed
        enemyMissiles[i].y += enemyMissileSpeed * TIME_INTERVAL / 1000;
        
        // Remove missile if it leaves the screen
        if (enemyMissiles[i].y > canvasHeight) {
            enemyMissiles.splice(i, 1);
        }
    }
}

// Check collisions between game elements
function checkCollisions() {
    // Check collisions between player missiles and enemy ships
    for (var i = playerMissiles.length - 1; i >= 0; i--) {
        var missile = playerMissiles[i];
        
        for (var j = enemyShips.length - 1; j >= 0; j--) {
            var enemy = enemyShips[j];
            
            // Check if missile collides with enemy
            if (missile.x < enemy.x + enemyShipWidth &&
                missile.x + playerMissileWidth > enemy.x &&
                missile.y < enemy.y + enemyShipHeight &&
                missile.y + playerMissileHeight > enemy.y) {
                
                // Play enemy hit sound
                if (enemyHitSound) {
                    enemyHitSound.currentTime = 0;
                    enemyHitSound.play().catch(e => console.log("Couldn't play sound:", e));
                }
                
                // Add score based on enemy row
                score += enemy.points;
                updateScoreDisplay();
                
                // Remove enemy and missile
                enemyShips.splice(j, 1);
                playerMissiles.splice(i, 1);
                
                // Check if all enemies are defeated
                if (enemyShips.length === 0) {
                    endGame('victory');
                }
                
                break; // Exit inner loop since missile is gone
            }
        }
    }
    
    // Check collisions between enemy missiles and player ship
    for (var i = enemyMissiles.length - 1; i >= 0; i--) {
        var missile = enemyMissiles[i];
        
        // Check if missile collides with player
        if (missile.x < playerShip.x + playerShipWidth &&
            missile.x + enemyMissileWidth > playerShip.x &&
            missile.y < playerShip.y + playerShipHeight &&
            missile.y + enemyMissileHeight > playerShip.y) {
            
            // Play player hit sound
            if (playerHitSound) {
                playerHitSound.currentTime = 0;
                playerHitSound.play().catch(e => console.log("Couldn't play sound:", e));
            }
            
            // Reduce lives
            LIVES--;
            updateLivesDisplay();
            
            // Remove missile
            enemyMissiles.splice(i, 1);
            
            // Reset player position
            playerShip.x = (canvasWidth - playerShipWidth) / 2;
            playerShip.y = canvasHeight - playerShipHeight - 20;
            
            // Check if game over
            if (LIVES <= 0) {
                endGame('lives');
            }
            
            break; // Exit loop since we've handled the collision
        }
    }
}

// End the game
function endGame(reason) {
    console.log("Game ending for reason:", reason);
    
    // Stop timers first
    stopTimer();
    
    // Make sure isRunning is set to false
    isRunning = false;
    
    var message = "";
    var resultElement = document.getElementById("game-result");
    
    // Set message based on game end reason
    if (reason === 'victory') {
        message = "Champion!"; // Victory - all enemies destroyed
    } else if (reason === 'lives') {
        message = "You Lost!"; // Loss - all lives lost
    } else if (reason === 'time') {
        if (score < 100) {
            message = "You can do better. Score: " + score; // Time up with less than 100 points
        } else {
            message = "Winner!"; // Time up with 100 points or more
        }
    }
    
    // Display result message
    if (resultElement) {
        resultElement.textContent = message;
        resultElement.style.display = "block";
    } else {
        alert(message); // If no display element, show alert
    }
    
    // Save score to high scores table
    saveHighScore();
    
    // Display high scores table
    displayHighScores();
    
    console.log("Game ended. isRunning:", isRunning);
}

// Initialize game when window loads
window.addEventListener("load", setupGame, false);