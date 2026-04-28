// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Make API requests to the backend
 */
async function apiCall(endpoint, method = 'GET', data = null) {
    try {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        const url = `${API_BASE_URL}${endpoint}`;
        console.log(`[API] ${method} ${url}`, data || '');
        
        const response = await fetch(url, options);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[API Error] ${response.status}:`, errorText);
            throw new Error(`API Error: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log(`[API Response]`, result);
        return result;
    } catch (error) {
        console.error(`[API Failed] ${endpoint}:`, error.message);
        throw error;
    }
}


/**
 * Get current game state
 */
async function getGameState() {
    return await apiCall('/game-state', 'GET');
}

/**
 * Send click to backend
 */
async function sendClick() {
    return await apiCall('/click', 'POST');
}

/**
 * Purchase upgrade
 */
async function purchaseUpgrade(upgradeId, cost) {
    return await apiCall('/purchase-upgrade', 'POST', {
        upgrade_id: upgradeId,
        cost: cost
    });
}

/**
 * Unlock achievement
 */
async function unlockAchievement(achievementId) {
    return await apiCall('/unlock-achievement', 'POST', {
        achievement_id: achievementId
    });
}

/**
 * Reset game
 */
async function resetGame() {
    return await apiCall('/reset', 'POST');
}
