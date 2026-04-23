const express = require("express");
const fetch = require("node-fetch");

const app = express();

app.get("/", (req, res) => {
    res.send("Proxy is working");
});

// 🔍 GAMEPASSES + INVENTORY TRY
app.get("/gamepasses", async (req, res) => {
    try {
        const userId = req.query.userId;

        if (!userId) {
            return res.status(400).json({ error: "userId missing" });
        }

        let result = {
            createdGamepasses: [],
            inventoryGamepasses: [],
        };

        // 1️⃣ Получаем игры пользователя
        const gamesRes = await fetch(
            `https://games.roblox.com/v2/users/${userId}/games?limit=50`
        );
        const gamesData = await gamesRes.json();

        if (gamesData.data) {
            for (const game of gamesData.data) {
                try {
                    const passesRes = await fetch(
                        `https://games.roblox.com/v1/games/${game.id}/game-passes?limit=100`
                    );
                    const passesData = await passesRes.json();

                    if (passesData.gamePasses) {
                        result.createdGamepasses.push(...passesData.gamePasses);
                    }
                } catch (e) {}
            }
        }

        // 2️⃣ ПЫТАЕМСЯ inventory (может быть пусто без авторизации)
        try {
            const invRes = await fetch(
                `https://inventory.roblox.com/v2/users/${userId}/assets/collectibles?limit=100`
            );
            const invData = await invRes.json();

            if (invData.data) {
                result.inventoryGamepasses = invData.data.filter(
                    item => item.assetType === "GamePass"
                );
            }
        } catch (e) {}

        // 3️⃣ если вообще пусто — объясняем
        if (
            result.createdGamepasses.length === 0 &&
            result.inventoryGamepasses.length === 0
        ) {
            return res.json({
                warning:
                    "Roblox не отдаёт gamepasses этого пользователя через публичный API",
                result,
            });
        }

        res.json(result);
    } catch (e) {
        res.status(500).json({
            error: "fail",
            details: e.message,
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
