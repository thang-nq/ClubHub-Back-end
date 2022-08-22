const express = require('express')
const cors = require('cors');
const dbConnect = require('./app/connection/dbConnect')
const app = express()

//PORT
const PORT = process.env.PORT || 8080

//Allow CORS
app.use(cors());

//parse request of Content-type: Application/json
app.use(express.json())

//parse request of Content-type: Application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }))

//Connect database
dbConnect.connect()

//Routes
require('./app/routes/auth.routes')(app)
require('./app/routes/user.routes')(app)

// mongo nhap mon
// tuan ne 


app.listen(PORT, () => {
    console.log('Hello')
    console.log(`Server is running on port ${PORT}.`)
})