const express = require('express')
const cors = require('cors');
const app = express()

//PORT
const PORT = process.env.PORT || 8080

//Allow CORS
app.use(cors());

//parse request of Content-type: Application/json
app.use(express.json())

//parse request of Content-type: Application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }))

//Homepage
app.get("/", (req, res) => {
    return res.json({ message: "Welcome to homepage" })
})



app.listen(PORT, () => {
    console.log(`Server os running on port ${PORT}.`)
})