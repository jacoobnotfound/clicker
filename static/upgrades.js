/**
 * Upgrades Handler - Manages upgrade purchases and effects
 */

// LocalStorage key
const UPGRADES_STORAGE_KEY = 'clicker_upgrades_state';

// Upgrade configuration
const UPGRADES = {
    upgrade1: {
        name: 'Better Fingers',
        cost: 50,
        effect: 1,
        element: document.getElementById('upgrade1'),
        purchased: 0
    },
    upgrade2: {
        name: 'Auto Clicker',
        cost: 200,
        effect: 2,
        element: document.getElementById('upgrade2'),
        purchased: 0
    },
    upgrade3: {
        name: 'Power Surge',
        cost: 500,
        effect: 3,
        element: document.getElementById('upgrade3'),
        purchased: 0
    },
    upgrade4: {
        name: 'Click Frenzy',
        cost: 1000,
        effect: 5,
        element: document.getElementById('upgrade4'),
        purchased: 0
    }
};

/**
 * Load upgrades from localStorage
 */
function loadUpgradesState() {
    try {
        const saved = localStorage.getItem(UPGRADES_STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            Object.keys(UPGRADES).forEach(id => {
                if (parsed[id]) {
                    UPGRADES[id].purchased = parsed[id].purchased || 0;
                }
            });
            return true;
        }
    } catch (error) {
        console.error('Failed to load upgrades state:', error);
    }
    return false;
}

/**
 * Save upgrades to localStorage
 */
function saveUpgradesState() {
    try {
        const state = {};
        Object.keys(UPGRADES).forEach(id => {
            state[id] = { purchased: UPGRADES[id].purchased };
        });
        localStorage.setItem(UPGRADES_STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
        console.error('Failed to save upgrades state:', error);
    }
}

/**
 * Initialize upgrades module
 */
function initUpgrades() {
    // Load saved upgrades state
    loadUpgradesState();
    
    // Add click listeners to all upgrade buttons
    Object.keys(UPGRADES).forEach(upgradeId => {
        const button = UPGRADES[upgradeId].element;
        if (button) {
            button.addEventListener('click', () => handleUpgradePurchase(upgradeId));
            button.addEventListener('mouseenter', () => hoverUpgradeButton(button));
            button.addEventListener('mouseleave', () => unhoverUpgradeButton(button));
        }
    });
}

/**
 * Hover animation for upgrade button
 */
function hoverUpgradeButton(button) {
    if (!button.disabled) {
        button.style.transform = 'scale(1.05)';
        button.style.transition = 'transform 0.3s ease-out';
    }
}

/**
 * Unhover animation for upgrade button
 */
function unhoverUpgradeButton(button) {
    button.style.transform = 'scale(1)';
}

/**
 * Handle upgrade purchase with animation
 */
async function handleUpgradePurchase(upgradeId) {
    const upgrade = UPGRADES[upgradeId];
    const button = upgrade.element;
    
    // Check if player has enough earned clicks
    if (gameState.totalEarned < upgrade.cost) {
        showUpgradeError(`Not enough clicks! Need ${upgrade.cost}, have ${gameState.totalEarned}`);
        shakeButton(button);
        return;
    }

    try {
        // Disable button during purchase
        button.disabled = true;
        button.style.opacity = '0.7';
        
        // Send purchase request to backend
        const response = await purchaseUpgrade(upgradeId, upgrade.cost);
        
        if (response.status === 'success') {
            // Update game state
            gameState.totalEarned = response.total_earned;
            gameState.multiplier = response.multiplier;
            
            // Track upgrade purchase
            UPGRADES[upgradeId].purchased++;
            saveUpgradesState();
            
            // Update UI
            updateDisplay();
            showUpgradeSuccess(upgrade.name);
            
            // Animate button and card
            animateUpgradeButton(button);
            animateUpgradeCard(button);
            
            // Re-enable button
            setTimeout(() => {
                button.disabled = false;
                button.style.opacity = '1';
            }, 300);
        }
    } catch (error) {
        console.error('Failed to purchase upgrade:', error);
        showUpgradeError('Failed to purchase upgrade');
        button.disabled = false;
        button.style.opacity = '1';
    }
}

/**
 * Show upgrade success message with animation
 */
function showUpgradeSuccess(upgradeName) {
    if (!feedbackElement) return;
    
    feedbackElement.textContent = `🎉 ${upgradeName} purchased!`;
    feedbackElement.style.color = '#10b981';
    feedbackElement.style.opacity = '1';
    feedbackElement.style.transform = 'translateY(0) scale(1)';
    feedbackElement.style.fontSize = '1.2rem';
    feedbackElement.style.transition = 'all 0.4s ease-out';
    
    // Confetti effect
    createConfetti();
    
    setTimeout(() => {
        feedbackElement.style.opacity = '0';
        feedbackElement.style.transform = 'translateY(-30px) scale(0.8)';
    }, 1500);
    
    setTimeout(() => {
        feedbackElement.style.color = '#60a5fa';
        feedbackElement.textContent = '';
        feedbackElement.style.transition = 'none';
    }, 2000);
}

/**
 * Show upgrade error message with animation
 */
function showUpgradeError(message) {
    if (!feedbackElement) return;
    
    feedbackElement.textContent = `❌ ${message}`;
    feedbackElement.style.color = '#ef4444';
    feedbackElement.style.opacity = '1';
    feedbackElement.style.transform = 'translateY(0) scale(1)';
    feedbackElement.style.transition = 'all 0.3s ease-out';
    
    setTimeout(() => {
        feedbackElement.style.opacity = '0';
        feedbackElement.style.transform = 'translateY(-20px)';
    }, 2000);
    
    setTimeout(() => {
        feedbackElement.style.color = '#60a5fa';
        feedbackElement.textContent = '';
        feedbackElement.style.transition = 'none';
    }, 2300);
}

/**
 * Shake button animation for invalid action
 */
function shakeButton(button) {
    if (!button) return;
    
    const originalX = 0;
    const shakeAmount = 10;
    
    for (let i = 0; i < 6; i++) {
        setTimeout(() => {
            button.style.transform = i % 2 === 0 ? `translateX(${shakeAmount}px)` : `translateX(-${shakeAmount}px)`;
        }, i * 50);
    }
    
    setTimeout(() => {
        button.style.transform = 'translateX(0)';
    }, 300);
}

/**
 * Animate upgrade button on purchase
 */
function animateUpgradeButton(button) {
    if (!button) return;
    
    // Pulse animation
    button.style.transform = 'scale(1.15)';
    button.style.boxShadow = '0 0 30px rgba(34, 197, 94, 0.7)';
    button.style.transition = 'all 0.3s ease-out';
    
    setTimeout(() => {
        button.style.transform = 'scale(1)';
        button.style.boxShadow = '';
    }, 300);
}

/**
 * Animate upgrade card container
 */
function animateUpgradeCard(button) {
    const card = button.closest('article');
    if (!card) return;
    
    card.style.transform = 'scale(1.05) rotateZ(1deg)';
    card.style.transition = 'transform 0.3s ease-out';
    
    setTimeout(() => {
        card.style.transform = 'scale(1) rotateZ(0deg)';
    }, 300);
}

/**
 * Create confetti effect on successful purchase
 */
function createConfetti() {
    const confettiPieces = 20;
    const colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
    
    for (let i = 0; i < confettiPieces; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.pointerEvents = 'none';
        confetti.style.left = Math.random() * window.innerWidth + 'px';
        confetti.style.top = '0px';
        confetti.style.width = '8px';
        confetti.style.height = '8px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.borderRadius = '50%';
        confetti.style.zIndex = '10000';
        
        document.body.appendChild(confetti);
        
        const vx = (Math.random() - 0.5) * 6;
        const vy = Math.random() * 3 + 2;
        const gravity = 0.1;
        let x = parseFloat(confetti.style.left);
        let y = 0;
        let velocityY = vy;
        
        const animateConfetti = () => {
            x += vx;
            y += velocityY;
            velocityY += gravity;
            
            confetti.style.left = x + 'px';
            confetti.style.top = y + 'px';
            confetti.style.opacity = Math.max(0, 1 - y / window.innerHeight);
            
            if (y < window.innerHeight) {
                requestAnimationFrame(animateConfetti);
            } else {
                confetti.remove();
            }
        };
        
        animateConfetti();
    }
}

/**
 * Update upgrade button states based on current balance
 */
function updateUpgradeButtons() {
    Object.keys(UPGRADES).forEach(upgradeId => {
        const upgrade = UPGRADES[upgradeId];
        const button = upgrade.element;
        
        if (!button) return;
        
        if (gameState.totalEarned >= upgrade.cost) {
            button.disabled = false;
            button.style.opacity = '1';
            button.style.cursor = 'pointer';
            button.style.filter = 'none';
        } else {
            button.disabled = true;
            button.style.opacity = '0.5';
            button.style.cursor = 'not-allowed';
            button.style.filter = 'grayscale(50%)';
        }
    });
}

/**
 * Override updateDisplay to also update upgrade buttons
 */
const originalUpdateDisplay = updateDisplay;
updateDisplay = function() {
    originalUpdateDisplay();
    updateUpgradeButtons();
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUpgrades);
} else {
    initUpgrades();
}

/**
 * Hover animation for upgrade button
 */
function hoverUpgradeButton(button) {
    if (!button.disabled) {
        button.style.transform = 'scale(1.05)';
        button.style.transition = 'transform 0.3s ease-out';
    }
}

/**
 * Unhover animation for upgrade button
 */
function unhoverUpgradeButton(button) {
    button.style.transform = 'scale(1)';
}

/**
 * Handle upgrade purchase with animation
 */
async function handleUpgradePurchase(upgradeId) {
    const upgrade = UPGRADES[upgradeId];
    const button = upgrade.element;
    
    // Check if player has enough earned clicks
    if (gameState.totalEarned < upgrade.cost) {
        showUpgradeError(`Not enough clicks! Need ${upgrade.cost}, have ${gameState.totalEarned}`);
        shakeButton(button);
        return;
    }

    try {
        // Disable button during purchase
        button.disabled = true;
        button.style.opacity = '0.7';
        
        // Send purchase request to backend
        const response = await purchaseUpgrade(upgradeId, upgrade.cost);
        
        if (response.status === 'success') {
            // Update game state
            gameState.totalEarned = response.total_earned;
            gameState.multiplier = response.multiplier;
            
            // Update UI
            updateDisplay();
            showUpgradeSuccess(upgrade.name);
            
            // Animate button and card
            animateUpgradeButton(button);
            animateUpgradeCard(button);
            
            // Re-enable button
            setTimeout(() => {
                button.disabled = false;
                button.style.opacity = '1';
            }, 300);
        }
    } catch (error) {
        console.error('Failed to purchase upgrade:', error);
        showUpgradeError('Failed to purchase upgrade');
        button.disabled = false;
        button.style.opacity = '1';
    }
}

/**
 * Show upgrade success message with animation
 */
function showUpgradeSuccess(upgradeName) {
    if (!feedbackElement) return;
    
    feedbackElement.textContent = `🎉 ${upgradeName} purchased!`;
    feedbackElement.style.color = '#10b981';
    feedbackElement.style.opacity = '1';
    feedbackElement.style.transform = 'translateY(0) scale(1)';
    feedbackElement.style.fontSize = '1.2rem';
    feedbackElement.style.transition = 'all 0.4s ease-out';
    
    // Confetti effect
    createConfetti();
    
    setTimeout(() => {
        feedbackElement.style.opacity = '0';
        feedbackElement.style.transform = 'translateY(-30px) scale(0.8)';
    }, 1500);
    
    setTimeout(() => {
        feedbackElement.style.color = '#60a5fa';
        feedbackElement.textContent = '';
        feedbackElement.style.transition = 'none';
    }, 2000);
}

/**
 * Show upgrade error message with animation
 */
function showUpgradeError(message) {
    if (!feedbackElement) return;
    
    feedbackElement.textContent = `❌ ${message}`;
    feedbackElement.style.color = '#ef4444';
    feedbackElement.style.opacity = '1';
    feedbackElement.style.transform = 'translateY(0) scale(1)';
    feedbackElement.style.transition = 'all 0.3s ease-out';
    
    setTimeout(() => {
        feedbackElement.style.opacity = '0';
        feedbackElement.style.transform = 'translateY(-20px)';
    }, 2000);
    
    setTimeout(() => {
        feedbackElement.style.color = '#60a5fa';
        feedbackElement.textContent = '';
        feedbackElement.style.transition = 'none';
    }, 2300);
}

/**
 * Shake button animation for invalid action
 */
function shakeButton(button) {
    if (!button) return;
    
    const originalX = 0;
    const shakeAmount = 10;
    
    for (let i = 0; i < 6; i++) {
        setTimeout(() => {
            button.style.transform = i % 2 === 0 ? `translateX(${shakeAmount}px)` : `translateX(-${shakeAmount}px)`;
        }, i * 50);
    }
    
    setTimeout(() => {
        button.style.transform = 'translateX(0)';
    }, 300);
}

/**
 * Animate upgrade button on purchase
 */
function animateUpgradeButton(button) {
    if (!button) return;
    
    // Pulse animation
    button.style.transform = 'scale(1.15)';
    button.style.boxShadow = '0 0 30px rgba(34, 197, 94, 0.7)';
    button.style.transition = 'all 0.3s ease-out';
    
    setTimeout(() => {
        button.style.transform = 'scale(1)';
        button.style.boxShadow = '';
    }, 300);
}

/**
 * Animate upgrade card container
 */
function animateUpgradeCard(button) {
    const card = button.closest('article');
    if (!card) return;
    
    card.style.transform = 'scale(1.05) rotateZ(1deg)';
    card.style.transition = 'transform 0.3s ease-out';
    
    setTimeout(() => {
        card.style.transform = 'scale(1) rotateZ(0deg)';
    }, 300);
}

/**
 * Create confetti effect on successful purchase
 */
function createConfetti() {
    const confettiPieces = 20;
    const colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
    
    for (let i = 0; i < confettiPieces; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.pointerEvents = 'none';
        confetti.style.left = Math.random() * window.innerWidth + 'px';
        confetti.style.top = '0px';
        confetti.style.width = '8px';
        confetti.style.height = '8px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.borderRadius = '50%';
        confetti.style.zIndex = '10000';
        
        document.body.appendChild(confetti);
        
        const vx = (Math.random() - 0.5) * 6;
        const vy = Math.random() * 3 + 2;
        const gravity = 0.1;
        let x = parseFloat(confetti.style.left);
        let y = 0;
        let velocityY = vy;
        
        const animateConfetti = () => {
            x += vx;
            y += velocityY;
            velocityY += gravity;
            
            confetti.style.left = x + 'px';
            confetti.style.top = y + 'px';
            confetti.style.opacity = Math.max(0, 1 - y / window.innerHeight);
            
            if (y < window.innerHeight) {
                requestAnimationFrame(animateConfetti);
            } else {
                confetti.remove();
            }
        };
        
        animateConfetti();
    }
}

/**
 * Update upgrade button states based on current balance
 */
function updateUpgradeButtons() {
    Object.keys(UPGRADES).forEach(upgradeId => {
        const upgrade = UPGRADES[upgradeId];
        const button = upgrade.element;
        
        if (!button) return;
        
        if (gameState.totalEarned >= upgrade.cost) {
            button.disabled = false;
            button.style.opacity = '1';
            button.style.cursor = 'pointer';
            button.style.filter = 'none';
        } else {
            button.disabled = true;
            button.style.opacity = '0.5';
            button.style.cursor = 'not-allowed';
            button.style.filter = 'grayscale(50%)';
        }
    });
}

/**
 * Override updateDisplay to also update upgrade buttons
 */
const originalUpdateDisplay = updateDisplay;
updateDisplay = function() {
    originalUpdateDisplay();
    updateUpgradeButtons();
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUpgrades);
} else {
    initUpgrades();
}
