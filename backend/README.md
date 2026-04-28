# Clicker Game Backend

Flask-based backend API for the clicker game.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the server:
```bash
python clicks.py
```

The server will start at `http://localhost:5000`

## Endpoints

### POST `/api/click`
Records a single click and updates the game state.

**Response:**
```json
{
  "status": "success",
  "total_clicks": 1,
  "total_earned": 1,
  "multiplier": 1
}
```

### POST `/api/purchase-upgrade`
Purchase an upgrade (costs clicks).

**Request:**
```json
{
  "upgrade_id": "upgrade1",
  "cost": 10
}
```

**Response:**
```json
{
  "status": "success",
  "total_earned": 90,
  "multiplier": 2,
  "upgrade": {"purchased": 1, "level": 1}
}
```

### POST `/api/unlock-achievement`
Unlock an achievement.

**Request:**
```json
{
  "achievement_id": "first_click"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Achievement unlocked",
  "achievements": ["first_click"]
}
```

### GET `/api/game-state`
Get the current game state.

**Response:**
```json
{
  "total_clicks": 10,
  "total_earned": 15,
  "multiplier": 1.5,
  "clicks_per_second": 0.5,
  "upgrades": {...},
  "achievements": [...],
  "last_updated": "2026-04-28T10:30:00.000000"
}
```

### POST `/api/reset`
Reset the game to initial state.

**Response:**
```json
{
  "status": "success",
  "message": "Game reset successfully"
}
```

## Data Storage

Game data is saved in `clicks_data.json` in the same directory.
