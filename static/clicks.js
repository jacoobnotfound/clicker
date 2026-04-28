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
 * Handle click event with animations
 */
async function handleClick(event) {
    try {
        // Animate button
        animateClickButton();
        
        // Create particle effect
        createParticleEffect(event);
        
        // Send click to backend
        const response = await sendClick();
        
        if (response.status === 'success') {
            // Update local state
            gameState.totalClicks = response.total_clicks;
            gameState.totalEarned = response.total_earned;
            gameState.multiplier = response.multiplier;
            
            // Update UI with animations
            updateDisplayWithAnimation();
            
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
 * Animate click button with scale and shadow
 */
function animateClickButton() {
    if (!clickBtn) return;
    
    clickBtn.style.transform = 'scale(0.95)';
    clickBtn.style.boxShadow = '0 0 30px rgba(59, 130, 246, 0.6)';
    
    setTimeout(() => {
        clickBtn.style.transform = 'scale(1)';
        clickBtn.style.boxShadow = '';
    }, 150);
}

/**
 * Create particle effect on click
 */
function createParticleEffect(event) {
    const rect = clickBtn.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const particleCount = 8;
    const colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981'];
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.pointerEvents = 'none';
        particle.style.left = centerX + 'px';
        particle.style.top = centerY + 'px';
        particle.style.width = '8px';
        particle.style.height = '8px';
        particle.style.borderRadius = '50%';
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.zIndex = '9999';
        
        // Random direction
        const angle = (i / particleCount) * Math.PI * 2;
        const velocity = 3 + Math.random() * 3;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        
        document.body.appendChild(particle);
        
        // Animate particle
        let x = centerX;
        let y = centerY;
        let opacity = 1;
        let frame = 0;
        const maxFrames = 40;
        
        const animateParticle = () => {
            frame++;
            x += vx;
            y += vy;
            opacity -= 1 / maxFrames;
            
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.opacity = opacity;
            
            if (frame < maxFrames) {
                requestAnimationFrame(animateParticle);
            } else {
                particle.remove();
            }
        };
        
        animateParticle();
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
        
        // Animate CPS update
        if (cpsDisplay) {
            cpsDisplay.style.transform = 'scale(1.15)';
            setTimeout(() => {
                cpsDisplay.style.transform = 'scale(1)';
                cpsDisplay.style.transition = 'transform 0.3s ease-out';
            }, 100);
        }
        
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
 * Update display with animations
 */
function updateDisplayWithAnimation() {
    // Animate score
    if (scoreDisplay) {
        scoreDisplay.style.transform = 'scale(1.2)';
        scoreDisplay.style.color = '#60a5fa';
        scoreDisplay.textContent = gameState.totalClicks.toLocaleString();
        
        setTimeout(() => {
            scoreDisplay.style.transform = 'scale(1)';
            scoreDisplay.style.transition = 'transform 0.3s ease-out, color 0.3s ease-out';
            scoreDisplay.style.color = '#60a5fa';
        }, 100);
    }
    
    // Animate earned
    if (totalEarnedDisplay) {
        totalEarnedDisplay.style.transform = 'scale(1.15)';
        totalEarnedDisplay.textContent = gameState.totalEarned.toLocaleString();
        
        setTimeout(() => {
            totalEarnedDisplay.style.transform = 'scale(1)';
            totalEarnedDisplay.style.transition = 'transform 0.3s ease-out';
        }, 100);
    }
}

/**
 * Show click feedback floating text with animation
 */
function showClickFeedback(value) {
    if (!feedbackElement) return;
    
    feedbackElement.textContent = `+${value}`;
    feedbackElement.style.opacity = '1';
    feedbackElement.style.transform = 'translateY(0) scale(1)';
    feedbackElement.style.fontSize = '1.5rem';
    feedbackElement.style.color = '#60a5fa';
    feedbackElement.style.transition = 'all 0.6s ease-out';
    
    // Animate out
    setTimeout(() => {
        feedbackElement.style.opacity = '0';
        feedbackElement.style.transform = 'translateY(-40px) scale(0.5)';
    }, 300);
    
    setTimeout(() => {
        feedbackElement.textContent = '';
        feedbackElement.style.transition = 'none';
    }, 900);
}

/**
 * Show error message with animation
 */
function showError(message) {
    if (!feedbackElement) return;
    
    feedbackElement.textContent = message;
    feedbackElement.style.color = '#ef4444';
    feedbackElement.style.opacity = '1';
    feedbackElement.style.transform = 'translateY(0) scale(1)';
    feedbackElement.style.transition = 'all 0.3s ease-out';
    
    setTimeout(() => {
        feedbackElement.style.opacity = '0';
        feedbackElement.style.transform = 'translateY(-20px)';
    }, 2000);
    
    setTimeout(() => {
        feedbackElement.textContent = '';
        feedbackElement.style.transition = 'none';
    }, 2300);
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
