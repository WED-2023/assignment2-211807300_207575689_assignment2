// Spaceship.js
// הלוגיקה של משחק הפולשים מהחלל

var canvas; // אלמנט הקנבס
var context; // הקונטקסט לציור על הקנבס

// קבועים למשחק
var ENEMY_ROWS = 4; // מספר השורות של החלליות האויבות
var ENEMY_COLS = 5; // מספר החלליות בכל שורה
var ENEMY_SPACING_H = 20; // מרווח אופקי בין החלליות
var ENEMY_SPACING_V = 20; // מרווח אנכי בין החלליות
var LIVES = 3; // מספר החיים ההתחלתי
var TIME_INTERVAL = 16; // מרווח רענון המסך במילישניות (כ-60 פריימים בשנייה)
var PLAYABLE_AREA_PERCENT = 0.4; // רק 40% התחתונים של המסך ניתנים למשחק עבור השחקן

// משתנים ללולאת המשחק וסטטיסטיקות
var intervalTimer; // מחזיק את הטיימר למחזור המשחק
var accelerationTimer; // מחזיק את הטיימר להאצת האויבים
var timeLeft; // כמות הזמן שנותרה בשניות
var shotsFired; // מספר היריות שהשחקן ירה
var score; // ניקוד השחקן
var isRunning; // האם המשחק כרגע פעיל

// משתנים לחללית השחקן
var playerShip; // אובייקט המייצג את חללית השחקן
var playerShipWidth; // רוחב חללית השחקן
var playerShipHeight; // גובה חללית השחקן
var playerMissiles; // מערך של טילי השחקן על המסך
var playerMissileWidth; // רוחב טיל השחקן
var playerMissileHeight; // גובה טיל השחקן
var playerMissileSpeed; // מהירות טילי השחקן
var shootKey; // המקש המשמש לירי

// משתנים לחלליות האויבות
var enemyShips; // מערך של חלליות אויבות
var enemyShipWidth; // רוחב החלליות האויבות
var enemyShipHeight; // גובה החלליות האויבות
var enemyMissiles; // מערך של טילי אויבים על המסך
var enemyMissileWidth; // רוחב טיל האויב
var enemyMissileHeight; // גובה טיל האויב
var enemyDirection; // כיוון התנועה הנוכחי של האויבים (1 = ימינה, -1 = שמאלה)
var enemySpeed; // מהירות תנועת האויבים הנוכחית
var enemyMissileSpeed; // מהירות טילי האויבים
var accelerationCount; // מספר הפעמים שהאויבים האיצו

// משתנים למימדי הקנבס
var canvasWidth; // רוחב הקנבס
var canvasHeight; // גובה הקנבס

// משתנים לצלילים
var backgroundMusic; // מוזיקת רקע
var playerShotSound; // צליל כאשר השחקן יורה
var enemyHitSound; // צליל כאשר אויב נפגע
var playerHitSound; // צליל כאשר השחקן נפגע

// תמונות לאלמנטי המשחק
var playerShipImg; // תמונת חללית השחקן
var enemyShipImgs; // מערך של תמונות חלליות אויבות
var playerMissileImg; // תמונת טיל השחקן
var enemyMissileImg; // תמונת טיל האויב
var backgroundImg; // תמונת רקע

// נקרא כאשר האפליקציה נטענת לראשונה
function setupGame() {
    console.log("Setting up game...");
    
    // עצירת הטיימר אם אירוע שחרור המסמך מתרחש
    document.addEventListener("unload", stopTimer, false);

    // קבלת הקנבס והקונטקסט שלו
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
    
    // שמירת מימדי הקנבס
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;
    
    // טעינת תמונות
    playerShipImg = new Image();
    playerShipImg.src = "green_spaceship.jpeg"; // חללית ירוקה לשחקן
    playerShipImg.onerror = function() { console.error("Error loading player ship image:", this.src); };
    playerShipImg.onload = function() { console.log("Player ship image loaded successfully"); };
    
    enemyShipImgs = [];
    // חלליות חומות (שורה עליונה) - 20 נקודות
    var brownShipImg = new Image();
    brownShipImg.src = "brown_spaceship.jpeg"; 
    brownShipImg.onerror = function() { console.error("Error loading brown ship image:", this.src); };
    enemyShipImgs.push(brownShipImg);
    
    // חלליות אדומות (שורה שנייה) - 15 נקודות
    var redShipImg = new Image();
    redShipImg.src = "rad_spaceship.jpeg";
    redShipImg.onerror = function() { console.error("Error loading red ship image:", this.src); };
    enemyShipImgs.push(redShipImg);
    
    // חלליות כתומות (שורה שלישית) - 10 נקודות
    var orangeShipImg = new Image();
    orangeShipImg.src = "orange_spaceship.jpeg";
    orangeShipImg.onerror = function() { console.error("Error loading orange ship image:", this.src); };
    enemyShipImgs.push(orangeShipImg);
    
    // חלליות צהובות (שורה תחתונה) - 5 נקודות
    var yellowShipImg = new Image();
    yellowShipImg.src = "yellow_spaceship.jpeg";
    yellowShipImg.onerror = function() { console.error("Error loading yellow ship image:", this.src); };
    enemyShipImgs.push(yellowShipImg);
    
    // תמונות טילים
    playerMissileImg = new Image();
    playerMissileImg.src = "green_missile.jpeg"; // טיל ירוק לשחקן
    playerMissileImg.onerror = function() { console.error("Error loading player missile image:", this.src); };
    
    enemyMissileImg = new Image();
    enemyMissileImg.src = "rad_missile.jpeg"; // טיל אדום לאויבים
    enemyMissileImg.onerror = function() { console.error("Error loading enemy missile image:", this.src); };
    
    // תמונת רקע
    backgroundImg = new Image();
    backgroundImg.src = "background.jpeg"; 
    backgroundImg.onerror = function() { console.error("Error loading background image:", this.src); };
    backgroundImg.onload = function() { console.log("Background image loaded successfully"); };
    
    // טעינת צלילים
    backgroundMusic = document.getElementById("background-music");
    playerShotSound = document.getElementById("player-shot-sound");
    enemyHitSound = document.getElementById("enemy-hit-sound");
    playerHitSound = document.getElementById("player-hit-sound");
    
    // אם אלמנטי השמע לא קיימים, יצירתם באופן תכנותי
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
    
    // אתחול אובייקטי המשחק
    playerMissiles = []; // מערך ריק לטילי השחקן
    enemyMissiles = []; // מערך ריק לטילי האויבים
    
    // הגדרת מאזיני אירועים לשליטה במקלדת
    document.addEventListener("keydown", handleKeyDown, false);
    document.addEventListener("keyup", handleKeyUp, false);
    
    // הגדרת מאזין אירועים לכפתור המשחק החדש
    var newGameBtn = document.getElementById("new-game-btn");
    if (newGameBtn) {
        newGameBtn.addEventListener("click", function() {
            console.log("New game button clicked");
            newGame();
        }, false);
    } else {
        console.error("New Game button not found!");
    }
    
    // הגדרת מקש ירי ברירת מחדל ל-Space
    shootKey = "Space";
    
    console.log("Game setup completed");
}

// שמירת התוצאה הנוכחית בטבלת השיאים
function saveHighScore() {
    var currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        console.log("No user logged in, can't save score");
        return; // אם אין משתמש מחובר, לא לשמור
    }
    
    console.log("Saving score for user:", currentUser, "Score:", score);
    
    // קבלת טבלת השיאים הקיימת
    var highScores = JSON.parse(localStorage.getItem('highScores') || '{}');
    
    // אתחול מערך התוצאות של המשתמש אם צריך
    if (!highScores[currentUser]) {
        console.log("Initializing scores array for user:", currentUser);
        highScores[currentUser] = [];
    }
    
    // הוספת התוצאה הנוכחית
    highScores[currentUser].push({
        score: score,
        date: new Date().toLocaleDateString()
    });
    
    console.log("Added new score:", score, "for user:", currentUser);
    console.log("Current scores:", highScores[currentUser]);
    
    // מיון התוצאות בסדר יורד
    highScores[currentUser].sort(function(a, b) {
        return b.score - a.score;
    });
    
    // שמירה בחזרה ל-localStorage
    localStorage.setItem('highScores', JSON.stringify(highScores));
    console.log("Saved updated high scores to localStorage");
}

// הצגת טבלת השיאים
function displayHighScores() {
    var currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        console.log("No user logged in, can't display scores");
        return; // אם אין משתמש מחובר, לא להציג
    }
    
    // קבלת טבלת השיאים
    var highScores = JSON.parse(localStorage.getItem('highScores') || '{}');
    var userScores = highScores[currentUser] || [];
    
    console.log("Displaying high scores for user:", currentUser);
    console.log("User scores:", userScores);
    
    // קבלת אלמנט גוף טבלת השיאים
    var tableBody = document.getElementById("high-scores-body");
    if (!tableBody) {
        console.error("High scores table body element not found");
        return;
    }
    
    // ניקוי שורות קיימות
    tableBody.innerHTML = "";
    
    // הוספת התוצאות לטבלה
    for (var i = 0; i < userScores.length; i++) {
        var row = document.createElement("tr");
        
        var rankCell = document.createElement("td");
        rankCell.textContent = i + 1; // דירוג
        row.appendChild(rankCell);
        
        var scoreCell = document.createElement("td");
        scoreCell.textContent = userScores[i].score; // ניקוד
        row.appendChild(scoreCell);
        
        var dateCell = document.createElement("td");
        dateCell.textContent = userScores[i].date; // תאריך
        row.appendChild(dateCell);
        
        tableBody.appendChild(row);
    }
    
    // הצגת טבלת השיאים
    var highScoresTable = document.getElementById("high-scores-table");
    if (highScoresTable) {
        highScoresTable.style.display = "block";
    }
}

// הצגת טבלת השיאים
function displayHighScores() {
    var currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return; // אם אין משתמש מחובר, לא להציג
    
    // קבלת טבלת השיאים
    var highScores = JSON.parse(localStorage.getItem('highScores') || '{}');
    var userScores = highScores[currentUser] || [];
    
    // קבלת אלמנט גוף טבלת השיאים
    var tableBody = document.getElementById("high-scores-body");
    if (!tableBody) return;
    
    // ניקוי שורות קיימות
    tableBody.innerHTML = "";
    
    // הוספת התוצאות לטבלה
    for (var i = 0; i < userScores.length; i++) {
        var row = document.createElement("tr");
        
        var rankCell = document.createElement("td");
        rankCell.textContent = i + 1; // דירוג
        row.appendChild(rankCell);
        
        var scoreCell = document.createElement("td");
        scoreCell.textContent = userScores[i].score; // ניקוד
        row.appendChild(scoreCell);
        
        var dateCell = document.createElement("td");
        dateCell.textContent = userScores[i].date; // תאריך
        row.appendChild(dateCell);
        
        tableBody.appendChild(row);
    }
    
    // הצגת טבלת השיאים
    var highScoresTable = document.getElementById("high-scores-table");
    if (highScoresTable) {
        highScoresTable.style.display = "block";
    }
}

// עדכון תצוגת הניקוד
function updateScoreDisplay() {
    var scoreElement = document.getElementById("score");
    if (scoreElement) {
        scoreElement.textContent = score;
    }
}

// עדכון תצוגת החיים
function updateLivesDisplay() {
    var livesElement = document.getElementById("lives");
    if (livesElement) {
        livesElement.textContent = LIVES;
    }
}

// עדכון תצוגת הזמן
function updateTimeDisplay() {
    var timeElement = document.getElementById("time");
    if (timeElement) {
        var minutes = Math.floor(timeLeft / 60);
        var seconds = Math.floor(timeLeft % 60);
        timeElement.textContent = minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
    }
}

// ציור כל אלמנטי המשחק
function draw() {
    console.log("Drawing game elements");
    
    if (!context) {
        console.error("Context is null, cannot draw");
        return;
    }
    
    // ניקוי הקנבס
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // ציור הרקע
    if (backgroundImg.complete && backgroundImg.naturalWidth !== 0) {
        context.drawImage(backgroundImg, 0, 0, canvasWidth, canvasHeight);
    } else {
        console.warn("Background image not loaded yet");
        // Fill with black as fallback
        context.fillStyle = "black";
        context.fillRect(0, 0, canvasWidth, canvasHeight);
    }
    
    // ציור חללית השחקן
    if (playerShip && playerShipImg.complete && playerShipImg.naturalWidth !== 0) {
        context.drawImage(playerShipImg, playerShip.x, playerShip.y, playerShipWidth, playerShipHeight);
    } else {
        console.warn("Player ship not ready to draw");
    }
    
    // ציור חלליות האויבים
    for (var i = 0; i < enemyShips.length; i++) {
        var enemy = enemyShips[i];
        // בחירת התמונה בהתאם לשורה (0 = חום, 1 = אדום, 2 = כתום, 3 = צהוב)
        var enemyImg = enemyShipImgs[enemy.row];
        
        if (enemyImg && enemyImg.complete && enemyImg.naturalWidth !== 0) {
            context.drawImage(enemyImg, enemy.x, enemy.y, enemyShipWidth, enemyShipHeight);
        } else {
            // Fallback to colored rectangle
            context.fillStyle = ["brown", "red", "orange", "yellow"][enemy.row];
            context.fillRect(enemy.x, enemy.y, enemyShipWidth, enemyShipHeight);
        }
    }
    
    // ציור טילי השחקן
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
    
    // ציור טילי האויבים
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
// האצת האויבים (נקרא כל 5 שניות)
function accelerateEnemies() {
    if (!isRunning || accelerationCount >= 4) {
        return; // לא להאיץ יותר מ-4 פעמים
    }


    
    enemySpeed *= 2.0; // הגדלת מהירות האויבים
    enemyMissileSpeed *= 2.0; // הגדלת מהירות הטילים שלהם
    accelerationCount++; // הגדלת מונה ההאצות
    
    console.log("Enemies accelerated to:", enemySpeed);
}

// הגדרת טיימר להתעדכנות המשחק
function startTimer() {
    console.log("Starting game timers");

    // ודא שאין טיימר רץ — עצור אותו באופן תקני
    if (intervalTimer !== null) {
        clearInterval(intervalTimer);
        intervalTimer = null;
    }

    if (accelerationTimer !== null) {
        clearInterval(accelerationTimer);
        accelerationTimer = null;
    }

    // אתחול מחדש של הטיימרים
    intervalTimer = setInterval(updatePositions, TIME_INTERVAL);
    accelerationTimer = setInterval(accelerateEnemies, 5000);  // מפעיל האצה כל 5 שניות

    // הפעלת מוזיקה
    if (backgroundMusic) {
        backgroundMusic.loop = true;
        backgroundMusic.currentTime = 0;
        backgroundMusic.play().catch(e => console.log("Audio couldn't play automatically:", e));
    }

    isRunning = true;
}

function startTimer() {
    console.log("Starting game timers");

    // ודא שאין טיימר רץ — עצור אותו באופן תקני
    if (intervalTimer !== null) {
        clearInterval(intervalTimer);
        intervalTimer = null;
    }

    if (accelerationTimer !== null) {
        clearInterval(accelerationTimer);
        accelerationTimer = null;
    }

    // אתחול מחדש של הטיימרים
    intervalTimer = setInterval(updatePositions, TIME_INTERVAL);
    accelerationTimer = setInterval(accelerateEnemies, 5000);

    // הפעלת מוזיקה
    if (backgroundMusic) {
        backgroundMusic.loop = true;
        backgroundMusic.currentTime = 0;
        backgroundMusic.play().catch(e => console.log("Audio couldn't play automatically:", e));
    }

    isRunning = true;
}



// סיום הטיימרים
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


// האצת האויבים (נקרא כל 5 שניות)
function accelerateEnemies() {
    if (!isRunning || accelerationCount >= 4) {
        return; // לא להאיץ יותר מ-4 פעמים
    }
    
    enemySpeed += 0.5; // הגדלת מהירות האויבים
    enemyMissileSpeed += 0.5; // הגדלת מהירות הטילים שלהם
    accelerationCount++; // הגדלת מונה ההאצות
    
    console.log("Enemies accelerated to:", enemySpeed);
}

// נקרא על ידי הפונקציה newGame כדי לקבוע את גודל אלמנטי המשחק
// יחסית לגודל הקנבס לפני תחילת המשחק
function resetElements() {
    console.log("Resetting game elements");
    
    if (!canvas) {
        console.error("Canvas is null, cannot reset elements");
        return;
    }
    
    // קבלת המימדים
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;
    
    // קביעת גדלים לאלמנטי המשחק
    playerShipWidth = canvasWidth / 16; // 1/16 מרוחב הקנבס
    playerShipHeight = playerShipWidth; // צורה מרובעת
    
    enemyShipWidth = canvasWidth / 20; // 1/20 מרוחב הקנבס
    enemyShipHeight = enemyShipWidth; // צורה מרובעת
    
    playerMissileWidth = canvasWidth / 40; // טילים גדולים יותר
    playerMissileHeight = canvasHeight / 10; // טילים גדולים יותר
    
    enemyMissileWidth = canvasWidth / 40; // טילים גדולים יותר
    enemyMissileHeight = canvasHeight / 10; // טילים גדולים יותר
    
    // קביעת מהירויות
    playerMissileSpeed = canvasHeight / 2; // תנועה של חצי גובה המסך בשנייה
    enemySpeed = canvasWidth / 6; // מהירות אויבים התחלתית
    enemyMissileSpeed = canvasHeight / 3; // מהירות טילי אויבים התחלתית
    
    // יצירת חללית השחקן
    playerShip = {
        x: (canvasWidth - playerShipWidth) / 2, // מרכוז אופקי
        y: canvasHeight - playerShipHeight - 20, // מיקום קרוב לתחתית
        width: playerShipWidth, // רוחב
        height: playerShipHeight, // גובה
        speed: canvasWidth / 6, // מהירות החללית
        movingLeft: false, // האם החללית זזה שמאלה
        movingRight: false, // האם החללית זזה ימינה
        movingUp: false, // האם החללית זזה למעלה
        movingDown: false // האם החללית זזה למטה
    };
    
    // יצירת חלליות אויבות
    enemyShips = [];
    var startX = (canvasWidth - (ENEMY_COLS * (enemyShipWidth + ENEMY_SPACING_H))) / 2;
    var startY = canvasHeight / 8; // התחלה ב-1/8 מלמעלה
    
    // מעבר על שורות ועמודות כדי ליצור את מערך האויבים
    for (var row = 0; row < ENEMY_ROWS; row++) {
        for (var col = 0; col < ENEMY_COLS; col++) {
            enemyShips.push({
                x: startX + col * (enemyShipWidth + ENEMY_SPACING_H),
                y: startY + row * (enemyShipHeight + ENEMY_SPACING_V),
                width: enemyShipWidth,
                height: enemyShipHeight,
                row: row, // שמירת השורה (לצורך קביעת התמונה והניקוד)
                points: (ENEMY_ROWS - row) * 5 // ניקוד: 20, 15, 10, 5 בהתבסס על השורה
            });
        }
    }
    
    // קביעת כיוון האויבים ההתחלתי
    enemyDirection = 1; // התחל בתנועה ימינה
    
    console.log("Elements reset complete. Created", enemyShips.length, "enemy ships");
}

function newGame() {
    console.log("New Game function called");

    // ❗ עצירת טיימרים קיימים באופן מיידי
    stopTimer();

    // שליפת הגדרות המשחק
    var gameTimeMinutes = parseInt(localStorage.getItem('gameTime') || "2");

    // שליפת מקש ירי מעודכן
    shootKey = localStorage.getItem('shootKey') || "Space";
    console.log("Updated shootKey:", shootKey);

    // איפוס משתנים כלליים
    isRunning = false;
    score = 0;
    LIVES = 3;
    timeLeft = gameTimeMinutes * 60;
    shotsFired = 0;
    accelerationCount = 0;  // איפוס מונה ההאצות בתחילת משחק חדש

    // איפוס מערכים
    playerMissiles = [];
    enemyMissiles = [];

    // איפוס מצב תנועה של השחקן
    if (playerShip) {
        playerShip.movingLeft = false;
        playerShip.movingRight = false;
        playerShip.movingUp = false;
        playerShip.movingDown = false;
    }

    // ❗ אחרי שהכל אופס – רק עכשיו יוצרים את האלמנטים מחדש
    resetElements();

    // עדכון תצוגות
    updateScoreDisplay();
    updateLivesDisplay();
    updateTimeDisplay();

    // הסתרת הודעות מהמשחק הקודם
    const resultElement = document.getElementById("game-result");
    if (resultElement) resultElement.style.display = "none";

    const highScoresTable = document.getElementById("high-scores-table");
    if (highScoresTable) highScoresTable.style.display = "none";

    // התחלת המשחק מחדש
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

    // אם מקש הירי תואם לרווח או מוגדר כ"רווח"
    if ((event.key === " " && (shootKey === " " || shootKey.toLowerCase() === "space")) ||
        event.key.toUpperCase() === shootKey.toUpperCase()) {
        event.preventDefault(); // ❗ מונע מהדפדפן לבצע גלילה או פעולה אחרת
        console.log("Shoot key pressed:", event.key);
        firePlayerMissile();
    }
}

// טיפול באירועי שחרור מקשים
function handleKeyUp(event) {
    if (!isRunning) return;
    
    switch (event.key) {
        case "ArrowLeft": // חץ שמאלה
            playerShip.movingLeft = false;
            break;
        case "ArrowRight": // חץ ימינה
            playerShip.movingRight = false;
            break;
        case "ArrowUp": // חץ למעלה
            playerShip.movingUp = false;
            break;
        case "ArrowDown": // חץ למטה
            playerShip.movingDown = false;
            break;
    }
}

// ירי טיל מחללית השחקן
function firePlayerMissile() {
    // הגבלת מספר הטילים על המסך
    if (playerMissiles.length >= 3) return;
    
    // יצירת טיל חדש
    playerMissiles.push({
        x: playerShip.x + (playerShipWidth - playerMissileWidth) / 2, // מרכוז הטיל
        y: playerShip.y - playerMissileHeight, // מיקום הטיל מעל החללית
        width: playerMissileWidth,
        height: playerMissileHeight
    });
    
    // השמעת צליל הירי
    if (playerShotSound) {
        playerShotSound.currentTime = 0; // איפוס הצליל להתחלה
        playerShotSound.play().catch(e => console.log("Couldn't play sound:", e));
    }
    
    shotsFired++; // הגדלת מונה היריות
}

// ירי טיל מחללית אויבת
function fireEnemyMissile() {
    if (enemyShips.length === 0) return;
    
    // בדיקה אם טיל אויב כלשהו עבר 3/4 מגובה המסך
    var canFire = true;
    for (var i = 0; i < enemyMissiles.length; i++) {
        if (enemyMissiles[i].y < canvasHeight * 0.75) {
            canFire = false;
            break;
        }
    }
    
    if (!canFire) return;
    
    // בחירת אויב אקראי שיירה
    var randomIndex = Math.floor(Math.random() * enemyShips.length);
    var enemy = enemyShips[randomIndex];
    
    // יצירת טיל חדש
    enemyMissiles.push({
        x: enemy.x + (enemyShipWidth - enemyMissileWidth) / 2, // מרכוז הטיל
        y: enemy.y + enemyShipHeight, // מיקום הטיל מתחת לחללית
        width: enemyMissileWidth,
        height: enemyMissileHeight
    });
}

// עדכון המיקומים של כל אלמנטי המשחק
function updatePositions() {
    if (!isRunning) return;
    
    // עדכון הזמן
    timeLeft -= TIME_INTERVAL / 1000;
    if (timeLeft <= 0) {
        endGame('time');
        return;
    }
    updateTimeDisplay();
    
    // הזזת חללית השחקן בה
    // הזזת חללית השחקן בהתבסס על לחיצות המקשים
    movePlayerShip();
    
    // הזזת חלליות אויבות
    moveEnemies();
    
    // הזזת טילי השחקן
    movePlayerMissiles();
    
    // הזזת טילי אויבים
    moveEnemyMissiles();
    
    // בדיקה אם אויב יורה טיל באופן אקראי
    if (Math.random() < 0.01) { // 1% סיכוי בכל פריים
        fireEnemyMissile();
    }
    
    // בדיקת התנגשויות
    checkCollisions();
    
    // ציור כל האלמנטים
    draw();
}

// הזזת חללית השחקן בהתבסס על לחיצות מקשים
function movePlayerShip() {
    // חישוב אזור המשחק (40% התחתונים של מיכל המשחק)
    var playableAreaTop = canvasHeight * (1 - PLAYABLE_AREA_PERCENT);
    
    // תנועה שמאלה
    if (playerShip.movingLeft) {
        playerShip.x -= playerShip.speed * TIME_INTERVAL / 1000;
        if (playerShip.x < 0) {
            playerShip.x = 0; // עצירה בגבול השמאלי
        }
    }
    
    // תנועה ימינה
    if (playerShip.movingRight) {
        playerShip.x += playerShip.speed * TIME_INTERVAL / 1000;
        if (playerShip.x > canvasWidth - playerShipWidth) {
            playerShip.x = canvasWidth - playerShipWidth; // עצירה בגבול הימני
        }
    }
    
    // תנועה למעלה
    if (playerShip.movingUp) {
        playerShip.y -= playerShip.speed * TIME_INTERVAL / 1000;
        // לא לאפשר תנועה מעבר לאזור המשחק
        if (playerShip.y < playableAreaTop) {
            playerShip.y = playableAreaTop;
        }
    }
    
    // תנועה למטה
    if (playerShip.movingDown) {
        playerShip.y += playerShip.speed * TIME_INTERVAL / 1000;
        if (playerShip.y > canvasHeight - playerShipHeight - 10) {
            playerShip.y = canvasHeight - playerShipHeight - 10; // עצירה בגבול התחתון
        }
    }
}

// הזזת חלליות האויבים
function moveEnemies() {
    // בדיקה אם כל האויבים הובסו
    if (enemyShips.length === 0) {
        endGame('victory');
        return;
    }
    
    // מציאת האויבים הקיצוניים ביותר משמאל ומימין
    var leftmost = canvasWidth;
    var rightmost = 0;
    
    for (var i = 0; i < enemyShips.length; i++) {
        var enemy = enemyShips[i];
        if (enemy.x < leftmost) leftmost = enemy.x;
        if (enemy.x + enemyShipWidth > rightmost) rightmost = enemy.x + enemyShipWidth;
    }
    
    // אם האויבים מגיעים לקצה, היפוך הכיוון
    if ((rightmost >= canvasWidth && enemyDirection > 0) || 
        (leftmost <= 0 && enemyDirection < 0)) {
        enemyDirection *= -1;
    }
    
    // הזזת כל האויבים לפי המהירות הנוכחית
    for (var i = 0; i < enemyShips.length; i++) {
        enemyShips[i].x += enemyDirection * enemySpeed * TIME_INTERVAL / 1000;
    }
}


// הזזת טילי השחקן
function movePlayerMissiles() {
    for (var i = playerMissiles.length - 1; i >= 0; i--) {
        // הזזת הטיל כלפי מעלה
        playerMissiles[i].y -= playerMissileSpeed * TIME_INTERVAL / 1000;
        
        // הסרת הטיל אם הוא יוצא מהמסך
        if (playerMissiles[i].y + playerMissileHeight < 0) {
            playerMissiles.splice(i, 1);
        }
    }
}

// הזזת טילי האויבים
function moveEnemyMissiles() {
    for (var i = enemyMissiles.length - 1; i >= 0; i--) {
        // הזזת הטיל כלפי מטה במהירות הנוכחית של טילי האויב
        enemyMissiles[i].y += enemyMissileSpeed * TIME_INTERVAL / 1000;
        
        // הסרת הטיל אם הוא יוצא מהמסך
        if (enemyMissiles[i].y > canvasHeight) {
            enemyMissiles.splice(i, 1);
        }
    }
}
// בדיקת התנגשויות בין אלמנטי המשחק
function checkCollisions() {
    // בדיקת התנגשויות בין טילי השחקן וחלליות האויבים
    for (var i = playerMissiles.length - 1; i >= 0; i--) {
        var missile = playerMissiles[i];
        
        for (var j = enemyShips.length - 1; j >= 0; j--) {
            var enemy = enemyShips[j];
            
            // בדיקה אם הטיל מתנגש עם האויב
            if (missile.x < enemy.x + enemyShipWidth &&
                missile.x + playerMissileWidth > enemy.x &&
                missile.y < enemy.y + enemyShipHeight &&
                missile.y + playerMissileHeight > enemy.y) {
                
                // השמעת צליל פגיעה באויב
                if (enemyHitSound) {
                    enemyHitSound.currentTime = 0;
                    enemyHitSound.play().catch(e => console.log("Couldn't play sound:", e));
                }
                
                // הוספת ניקוד בהתבסס על שורת האויב
                score += enemy.points;
                updateScoreDisplay();
                
                // הסרת האויב והטיל
                enemyShips.splice(j, 1);
                playerMissiles.splice(i, 1);
                
                // בדיקה אם כל האויבים הובסו
                if (enemyShips.length === 0) {
                    endGame('victory');
                }
                
                break; // יציאה מהלולאה הפנימית כיוון שהטיל נעלם
            }
        }
    }
    
    // בדיקת התנגשויות בין טילי אויבים וחללית השחקן
    for (var i = enemyMissiles.length - 1; i >= 0; i--) {
        var missile = enemyMissiles[i];
        
        // בדיקה אם הטיל מתנגש עם השחקן
        if (missile.x < playerShip.x + playerShipWidth &&
            missile.x + enemyMissileWidth > playerShip.x &&
            missile.y < playerShip.y + playerShipHeight &&
            missile.y + enemyMissileHeight > playerShip.y) {
            
            // השמעת צליל פגיעה בשחקן
            if (playerHitSound) {
                playerHitSound.currentTime = 0;
                playerHitSound.play().catch(e => console.log("Couldn't play sound:", e));
            }
            
            // הפחתת חיים
            LIVES--;
            updateLivesDisplay();
            
            // הסרת הטיל
            enemyMissiles.splice(i, 1);
            
            // איפוס מיקום השחקן
            playerShip.x = (canvasWidth - playerShipWidth) / 2;
            playerShip.y = canvasHeight - playerShipHeight - 20;
            
            // בדיקה אם המשחק נגמר
            if (LIVES <= 0) {
                endGame('lives');
            }
            
            break; // יציאה מהלולאה כיוון שטיפלנו בהתנגשות
        }
    }
}

// סיום המשחק
function endGame(reason) {
    console.log("Game ending for reason:", reason);
    
    // Stop timers first
    stopTimer();
    
    // Make sure isRunning is set to false
    isRunning = false;
    
    var message = "";
    var resultElement = document.getElementById("game-result");
    
    // קביעת ההודעה בהתאם לסיבת סיום המשחק
    if (reason === 'victory') {
        message = "Champion!"; // ניצחון - כל האויבים הושמדו
    } else if (reason === 'lives') {
        message = "You Lost!"; // הפסד - כל החיים אבדו
    } else if (reason === 'time') {
        if (score < 100) {
            message = "You can do better. Score: " + score; // זמן נגמר עם פחות מ-100 נקודות
        } else {
            message = "Winner!"; // זמן נגמר עם 100 נקודות או יותר
        }
    }
    
    // הצגת הודעת התוצאה
    if (resultElement) {
        resultElement.textContent = message;
        resultElement.style.display = "block";
    } else {
        alert(message); // אם אין אלמנט תצוגה, הצג התראה
    }
    
    // שמירת התוצאה בטבלת השיאים
    saveHighScore();
    

    // הצגת טבלת השיאים
    displayHighScores();
    
    console.log("Game ended. isRunning:", isRunning);
}
// אתחול המשחק כאשר החלון נטען
window.addEventListener("load", setupGame, false);