/**
 * Upgrades Handler - Manages upgrade purchases and effects
 */

// Upgrade configuration
const UPGRADES = {
    upgrade1: {
        name: 'Better Fingers',
        cost: 50,
        effect: 1,
        element: document.getElementById('upgrade1')
    },
    upgrade2: {
        name: 'Auto Clicker',
        cost: 200,
        effect: 2,
        element: document.getElementById('upgrade2')
    },
    upgrade3: {
        name: 'Power Surge',
        cost: 500,
        effect: 3,
        element: document.getElementById('upgrade3')
    },
    upgrade4: {
        name: 'Click Frenzy',
        cost: 1000,
        effect: 5,
        element: document.getElementById('upgrade4')
    }
};

/**
 * Initialize upgrades module
 */
function initUpgrades() {
    // Add click listeners to all upgrade buttons
    Object.keys(UPGRADES).forEach(upgradeId => {
        const button = UPGRADES[upgradeId].element;
        if (button) {
            button.addEventListener('click', () => handleUpgradePurchase(upgradeId));
        }
    });
}

/**
 * Handle upgrade purchase
 */
async function handleUpgradePurchase(upgradeId) {
    const upgrade = UPGRADES[upgradeId];
    
    // Check if player has enough earned clicks
    if (gameState.totalEarned < upgrade.cost) {
        showUpgradeError(`Not enough clicks! Need ${upgrade.cost}, have ${gameState.totalEarned}`);
        return;
    }

    try {
        // Send purchase request to backend
        const response = await purchaseUpgrade(upgradeId, upgrade.cost);
        
        if (response.status === 'success') {
            // Update game state
            gameState.totalEarned = response.total_earned;
            gameState.multiplier = response.multiplier;
            
            // Update UI
            updateDisplay();
            showUpgradeSuccess(upgrade.name);
            
            // Animate button
            animateUpgradeButton(upgrade.element);
        }
    } catch (error) {
        console.error('Failed to purchase upgrade:', error);
        showUpgradeError('Failed to purchase upgrade');
    }
}

/**
 * Show upgrade success message
 */
function showUpgradeSuccess(upgradeName) {
    if (!feedbackElement) return;
    
    feedbackElement.textContent = `🎉 ${upgradeName} purchased!`;
    feedbackElement.style.color = '#10b981';
    
    setTimeout(() => {
        feedbackElement.style.color = '#60a5fa';
        feedbackElement.textContent = '';
    }, 2000);
}

/**
 * Show upgrade error message
 */
function showUpgradeError(message) {
    if (!feedbackElement) return;
    
    feedbackElement.textContent = `❌ ${message}`;
    feedbackElement.style.color = '#ef4444';
    
    setTimeout(() => {
        feedbackElement.style.color = '#60a5fa';
        feedbackElement.textContent = '';
    }, 2000);
}

/**
 * Animate upgrade button on purchase
 */
function animateUpgradeButton(button) {
    if (!button) return;
    
    // Add pulse animation
    button.style.transform = 'scale(1.1)';
    button.style.boxShadow = '0 0 20px rgba(34, 197, 94, 0.5)';
    
    setTimeout(() => {
        button.style.transform = 'scale(1)';
        button.style.boxShadow = '';
    }, 300);
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
        } else {
            button.disabled = true;
            button.style.opacity = '0.5';
            button.style.cursor = 'not-allowed';
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
