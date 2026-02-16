const express = require("express")
const app = express()

app.use(express.json())

app.get("/", (req, res) => {
    res.send("Сервер работает!")
})

app.listen(5000, () => {
    console.log("Backend запущен: http://localhost:5000")
})
