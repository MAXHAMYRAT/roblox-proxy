const express = require("express");
const fetch = require("node-fetch");

const app = express();

// Главный тест (проверка что сервер жив)
app.get("/", (req, res) => {
    res.send("Proxy is working");
});

// Геймпасы по userId
app.get("/gamepasses", async (req, res) => {
    try {
        const userId = req.query.userId;

        if (!userId) {
            return res.status(400).json({ error: "userId missing" });
        }

        const gamesRes = await fetch(`https://games.roblox.com/v2/users/${userId}/games?limit=50`);
        const gamesData = await gamesRes.json();

        let allPasses = [];

        if (gamesData.data) {
            for (const game of gamesData.data) {
                const passesRes = await fetch(
                    `https://games.roblox.com/v1/games/${game.id}/game-passes?limit=100`
                );
                const passesData = await passesRes.json();

                if (passesData.data) {
                    allPasses = allPasses.concat(passesData.data);
                }
            }
        }

        res.json(allPasses);
    } catch (e) {
        res.status(500).json({ error: "fail" });
    }
});

// Render порт (ОЧЕНЬ ВАЖНО)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
