import express from "express";
import cors from "cors";
import fetch from "node-fetch"; // Ensure you're using import (ESM)

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// 🔹 Replace with your actual Unity Cloud project ID & token
const UNITY_PROJECT_ID = "bd8d9653-461e-4e85-bad2-d84a16cd4475";  // Replace with your Unity Project ID
const UNITY_ENV_ID = "f70bff15-cea2-4a0b-aed5-ef4e2850879e";
const UNITY_AUTH_TOKEN = "Basic MjQyMTZiMDktZWE0MS00NDg5LWE1NzQtNmQ2M2IwZTA2ODc5OmRyNl9oMkZZeEdCNW4ydTFRQlNkQnBVV2RvMzZfZEFI"; // Service Account Token

// 🔹 For Player-Specific Data (Replace PLAYER_ID)
const PLAYER_ID = "your_player_id"; 
const CLOUD_SAVE_PLAYER_URL = `https://services.api.unity.com/v1/projects/${UNITY_PROJECT_ID}/players/${PLAYER_ID}/data?keys=AssessmentDataList`;

// 🔹 For Game-Wide Data (Custom Data)
const CLOUD_SAVE_CUSTOM_URL = `https://services.api.unity.com/cloud-save/v1/data/projects/${UNITY_PROJECT_ID}/environments/${UNITY_ENV_ID}/custom/GameAssessmentData/items`;
const GET_PLAYERS = `https://services.api.unity.com/cloud-save/v1/data/projects/${UNITY_PROJECT_ID}/environments/${UNITY_ENV_ID}/players`;

// ✅ API Endpoint to Fetch Game Data
app.get("/api/cloudsave", async (req, res) => {
    try {
        const response = await fetch(CLOUD_SAVE_CUSTOM_URL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `${UNITY_AUTH_TOKEN}`
            }
        });

        const result = await response.json();

        if (!response.ok) {
            console.error("Unity Cloud Save Error:", result);
            return res.status(response.status).json(result);
        }

        console.log("Fetched Game Data:", result);
        res.json(result);
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: "Failed to fetch game data", details: error.message });
    }
});

// ✅ API Endpoint to Update Game Data
app.post("/api/cloudsave", async (req, res) => {
    try {
        const { assessmentData } = req.body;

        if (!assessmentData) {
            return res.status(400).json({ error: "No assessment data provided" });
        }

        const response = await fetch(CLOUD_SAVE_CUSTOM_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `${UNITY_AUTH_TOKEN}`
            },
            body: JSON.stringify({ 
                key: "AssessmentDataList", 
                value: JSON.stringify(assessmentData) 
            })
        });

        const result = await response.json();

        if (!response.ok) {
            console.error("Unity Cloud Save Update Error:", result);
            return res.status(response.status).json(result);
        }

        console.log("Updated Game Data:", result);
        res.json(result);
    } catch (error) {
        console.error("Error updating data:", error);
        res.status(500).json({ error: "Failed to update game data", details: error.message });
    }
});

app.get("/api/getPlayers", async (req, res) => {
    try {
        const response = await fetch(GET_PLAYERS, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `${UNITY_AUTH_TOKEN}`
            }
        });

        const result = await response.json();

        if (!response.ok) {
            console.error("Unity Cloud Save Error:", result);
            return res.status(response.status).json(result);
        }

        console.log("Fetched Players Data:", result);
        res.json(result);
    } catch (error) {
        console.error("Error fetching players data:", error);
        res.status(500).json({ error: "Failed to fetch players data", details: error.message });
    }
});

// ✅ Modified API Endpoint to Fetch Player Data by ID
app.get("/api/getPlayerData/:playerId", async (req, res) => {
    try {
        const { playerId } = req.params;
        
        if (!playerId) {
            return res.status(400).json({ error: "Player ID is required" });
        }
        
        const playerDataUrl = `https://services.api.unity.com/cloud-save/v1/data/projects/${UNITY_PROJECT_ID}/environments/${UNITY_ENV_ID}/players/${playerId}/items`;
        
        const response = await fetch(playerDataUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `${UNITY_AUTH_TOKEN}`
            }
        });

        const result = await response.json();

        if (!response.ok) {
            console.error("Unity Cloud Save Error:", result);
            return res.status(response.status).json(result);
        }

        console.log(`Fetched Player Data for ${playerId}:`, result);
        res.json(result);
    } catch (error) {
        console.error("Error fetching player data:", error);
        res.status(500).json({ error: "Failed to fetch player data", details: error.message });
    }
});

// ✅ Start Express Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});