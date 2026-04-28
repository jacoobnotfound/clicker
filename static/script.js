/**
 * Main Game Initialization and Reset Handler
 */

// Get reset button element
const resetBtn = document.getElementById('resetBtn');

/**
 * Handle game reset
 */
async function handleReset() {
    if (!confirm('Are you sure you want to reset your game? This cannot be undone!')) {
        return;
    }

    try {
        const response = await resetGame();
        
        if (response.status === 'success') {
            // Reset local game state
            gameState = {
                totalClicks: 0,
                totalEarned: 0,
                multiplier: 1,
                clicksPerSecond: 0
            };
            
            // Clear localStorage
            localStorage.removeItem('clicker_game_state');
            localStorage.removeItem('clicker_upgrades_state');
            
            // Update all displays
            updateDisplay();
            updateUpgradeButtons();
            
            // Show success message
            if (feedbackElement) {
                feedbackElement.textContent = '🔄 Game reset successfully!';
                feedbackElement.style.color = '#60a5fa';
                setTimeout(() => {
                    feedbackElement.textContent = '';
                }, 2000);
            }
            
            console.log('Game reset successfully');
        }
    } catch (error) {
        console.error('Failed to reset game:', error);
        alert('Failed to reset game. Please try again.');
    }
}

// Add reset button listener
if (resetBtn) {
    resetBtn.addEventListener('click', handleReset);
}

console.log('Game initialized! Running locally with localStorage persistence.');
