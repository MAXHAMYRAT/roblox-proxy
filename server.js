const express = require("express");
const fetch = require("node-fetch");

const app = express();

app.get("/", (req, res) => {
    res.send("PLS Donate style proxy working");
});

// 🎯 КАК В PLS DONATE: берём ТОЛЬКО первую игру
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

        if (!gamesData.data || gamesData.data.length === 0) {
            return res.json({
                message: "User has no public games",
                gamepasses: []
            });
        }

        // 2. Берём ТОЛЬКО первую игру (как ты и сказал)
        const firstGame = gamesData.data[0];

        const passesRes = await fetch(
            `https://games.roblox.com/v1/games/${firstGame.id}/game-passes?limit=100`
        );

        const passesData = await passesRes.json();

        const gamepasses = (passesData.gamePasses || []).map(pass => ({
            id: pass.id,
            name: pass.name,
            price: pass.price,
            imageUrl: pass.imageUrl,
            gameId: firstGame.id,
            creatorId: userId
        }));

        res.json({
            sourceGame: {
                name: firstGame.name,
                id: firstGame.id
            },
            gamepasses
        });

    } catch (e) {
        res.status(500).json({
            error: "fail",
            details: e.message
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("PLS Donate proxy running on port " + PORT);
});
