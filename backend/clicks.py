from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Path to store clicks data
DATA_FILE = os.path.join(os.path.dirname(__file__), 'clicks_data.json')

def load_clicks_data():
    """Load clicks data from JSON file."""
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, 'r') as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            return initialize_data()
    return initialize_data()

def initialize_data():
    """Initialize default data structure."""
    return {
        "total_clicks": 0,
        "total_earned": 0,
        "multiplier": 1,
        "clicks_per_second": 0,
        "upgrades": {
            "upgrade1": {"purchased": 0, "level": 0},
            "upgrade2": {"purchased": 0, "level": 0},
            "upgrade3": {"purchased": 0, "level": 0},
            "upgrade4": {"purchased": 0, "level": 0}
        },
        "achievements": [],
        "last_updated": datetime.now().isoformat()
    }

def save_clicks_data(data):
    """Save clicks data to JSON file."""
    data["last_updated"] = datetime.now().isoformat()
    try:
        with open(DATA_FILE, 'w') as f:
            json.dump(data, f, indent=2)
        return True
    except IOError as e:
        print(f"Error saving data: {e}")
        return False

@app.route('/api/click', methods=['POST'])
def record_click():
    """Record a click and update game data."""
    try:
        data = load_clicks_data()
        
        # Increment total clicks and earned
        data["total_clicks"] += 1
        data["total_earned"] += data["multiplier"]
        
        # Save updated data
        save_clicks_data(data)
        
        return jsonify({
            "status": "success",
            "total_clicks": data["total_clicks"],
            "total_earned": data["total_earned"],
            "multiplier": data["multiplier"]
        }), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/purchase-upgrade', methods=['POST'])
def purchase_upgrade():
    """Purchase an upgrade."""
    try:
        request_data = request.get_json()
        upgrade_id = request_data.get('upgrade_id')
        cost = request_data.get('cost', 0)
        
        data = load_clicks_data()
        
        # Check if player has enough clicks
        if data["total_earned"] < cost:
            return jsonify({
                "status": "error",
                "message": "Not enough clicks to purchase"
            }), 400
        
        # Deduct cost and update upgrade
        data["total_earned"] -= cost
        if upgrade_id in data["upgrades"]:
            data["upgrades"][upgrade_id]["purchased"] += 1
            data["upgrades"][upgrade_id]["level"] += 1
            
            # Increase multiplier based on upgrade
            if upgrade_id == "upgrade1":
                data["multiplier"] += 1
            elif upgrade_id == "upgrade2":
                data["multiplier"] += 2
            elif upgrade_id == "upgrade3":
                data["multiplier"] += 3
            elif upgrade_id == "upgrade4":
                data["multiplier"] += 5
        
        save_clicks_data(data)
        
        return jsonify({
            "status": "success",
            "total_earned": data["total_earned"],
            "multiplier": data["multiplier"],
            "upgrade": data["upgrades"].get(upgrade_id)
        }), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/unlock-achievement', methods=['POST'])
def unlock_achievement():
    """Unlock an achievement."""
    try:
        request_data = request.get_json()
        achievement_id = request_data.get('achievement_id')
        
        data = load_clicks_data()
        
        # Add achievement if not already unlocked
        if achievement_id not in data["achievements"]:
            data["achievements"].append(achievement_id)
            save_clicks_data(data)
            return jsonify({
                "status": "success",
                "message": "Achievement unlocked",
                "achievements": data["achievements"]
            }), 200
        else:
            return jsonify({
                "status": "info",
                "message": "Achievement already unlocked"
            }), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/game-state', methods=['GET'])
def get_game_state():
    """Get current game state."""
    try:
        data = load_clicks_data()
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/reset', methods=['POST'])
def reset_game():
    """Reset game to initial state."""
    try:
        initial_data = initialize_data()
        save_clicks_data(initial_data)
        return jsonify({
            "status": "success",
            "message": "Game reset successfully"
        }), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
