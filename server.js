const express = require("express");
const fetch = require("node-fetch");

const app = express();

app.get("/", (req, res) => {
    res.send("Gamepass proxy working");
});

// 🎮 ТОЛЬКО ГЕЙМПАСЫ СОЗДАННЫЕ ИГРОКОМ
app.get("/gamepasses", async (req, res) => {
    try {
        const userId = req.query.userId;

        if (!userId) {
            return res.status(400).json({ error: "userId missing" });
        }

        // 1. Получаем игры пользователя
        const gamesRes = await fetch(
            `https://games.roblox.com/v2/users/${userId}/games?limit=50`
        );

        const gamesData = await gamesRes.json();

        if (!gamesData.data) {
            return res.json([]);
        }

        let gamepasses = [];

        // 2. Для каждой игры берём gamepasses
        for (const game of gamesData.data) {
            try {
                const passesRes = await fetch(
                    `https://games.roblox.com/v1/games/${game.id}/game-passes?limit=100`
                );

                const passesData = await passesRes.json();

                if (passesData.gamePasses) {
                    // добавляем инфу кто владелец (creator)
                    const enriched = passesData.gamePasses.map(pass => ({
                        id: pass.id,
                        name: pass.name,
                        price: pass.price,
                        imageUrl: pass.imageUrl,
                        gameId: game.id,
                        creatorId: userId
                    }));

                    gamepasses.push(...enriched);
                }
            } catch (e) {}
        }

        res.json(gamepasses);
    } catch (e) {
        res.status(500).json({ error: "fail", details: e.message });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
