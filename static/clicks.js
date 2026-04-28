/**
 * Clicks Handler - Manages click events and score updates
 */

// Game state
let gameState = {
    totalClicks: 0,
    totalEarned: 0,
    multiplier: 1,
    clicksPerSecond: 0
};

// DOM Elements
const clickBtn = document.getElementById('clickBtn');
const scoreDisplay = document.getElementById('score');
const cpsDisplay = document.getElementById('cps');
const feedbackElement = document.getElementById('feedback');
const totalEarnedDisplay = document.getElementById('totalEarned');
const multiplierDisplay = document.getElementById('multiplier');

// Track last click time for CPS calculation
let lastClickTime = Date.now();
let clickCount = 0;

/**
 * Initialize clicks module
 */
async function initClicks() {
    // Load initial game state from backend
    try {
        const state = await getGameState();
        updateGameState(state);
    } catch (error) {
        console.error('Failed to load initial game state:', error);
    }

    // Setup click event listener
    clickBtn.addEventListener('click', handleClick);

    // Calculate CPS every second
    setInterval(calculateCPS, 1000);
}

/**
 * Handle click event
 */
async function handleClick() {
    try {
        // Send click to backend
        const response = await sendClick();
        
        if (response.status === 'success') {
            // Update local state
            gameState.totalClicks = response.total_clicks;
            gameState.totalEarned = response.total_earned;
            gameState.multiplier = response.multiplier;
            
            // Update UI
            updateDisplay();
            
            // Track for CPS
            clickCount++;
            
            // Show feedback
            showClickFeedback(response.multiplier);
            
            // Check for achievements
            checkAchievements(response.total_clicks);
        }
    } catch (error) {
        console.error('Failed to record click:', error);
        showError('Failed to record click');
    }
}

/**
 * Calculate clicks per second
 */
function calculateCPS() {
    const currentTime = Date.now();
    const timeDiff = (currentTime - lastClickTime) / 1000; // Convert to seconds
    
    if (timeDiff > 0) {
        gameState.clicksPerSecond = (clickCount / timeDiff).toFixed(2);
        updateDisplay();
        clickCount = 0;
        lastClickTime = currentTime;
    }
}

/**
 * Update game state from backend
 */
function updateGameState(state) {
    gameState.totalClicks = state.total_clicks || 0;
    gameState.totalEarned = state.total_earned || 0;
    gameState.multiplier = state.multiplier || 1;
    gameState.clicksPerSecond = state.clicks_per_second || 0;
    updateDisplay();
}

/**
 * Update all display elements
 */
function updateDisplay() {
    if (scoreDisplay) {
        scoreDisplay.textContent = gameState.totalClicks.toLocaleString();
    }
    if (cpsDisplay) {
        cpsDisplay.textContent = gameState.clicksPerSecond.toFixed(2);
    }
    if (totalEarnedDisplay) {
        totalEarnedDisplay.textContent = gameState.totalEarned.toLocaleString();
    }
    if (multiplierDisplay) {
        multiplierDisplay.textContent = gameState.multiplier.toFixed(1) + 'x';
    }
}

/**
 * Show click feedback floating text
 */
function showClickFeedback(value) {
    if (!feedbackElement) return;
    
    feedbackElement.textContent = `+${value}`;
    feedbackElement.style.opacity = '1';
    feedbackElement.style.transform = 'translateY(0)';
    
    // Animate out
    setTimeout(() => {
        feedbackElement.style.opacity = '0';
        feedbackElement.style.transform = 'translateY(-20px)';
    }, 500);
}

/**
 * Show error message
 */
function showError(message) {
    if (!feedbackElement) return;
    
    feedbackElement.textContent = message;
    feedbackElement.style.color = '#ef4444';
    
    setTimeout(() => {
        feedbackElement.style.color = '#60a5fa';
    }, 2000);
}

/**
 * Check for achievement unlocks
 */
async function checkAchievements(clicks) {
    const achievements = [
        { id: 'first_click', threshold: 1 },
        { id: '10_clicks', threshold: 10 },
        { id: '100_clicks', threshold: 100 },
        { id: '1000_clicks', threshold: 1000 },
        { id: '10000_clicks', threshold: 10000 }
    ];

    for (const achievement of achievements) {
        if (clicks >= achievement.threshold) {
            try {
                await unlockAchievement(achievement.id);
            } catch (error) {
                console.log('Achievement may already be unlocked:', achievement.id);
            }
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initClicks);
} else {
    initClicks();
}
