const express = require("express");
const fetch = require("node-fetch");

const app = express();

app.get("/user-passes/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;

        const gamesRes = await fetch(`https://games.roblox.com/v2/users/${userId}/games?limit=50`);
        const gamesData = await gamesRes.json();

        let allPasses = [];

        for (const game of gamesData.data) {
            const passesRes = await fetch(`https://games.roblox.com/v1/games/${game.id}/game-passes?limit=100`);
            const passesData = await passesRes.json();

            if (passesData.data) {
                allPasses = allPasses.concat(passesData.data);
            }
        }

        res.json(allPasses);
    } catch {
        res.status(500).json({ error: "fail" });
    }
});

app.listen(3000);
