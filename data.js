const db = require('./app/models')
const randValue = require('randexp')
const fetch = require('node-fetch')

const createUser = async (number) => {


    for (let i = 0; i < number; i++) {
        const randEmail = new randValue(/s[0-9]{7,7}@rmit\.edu\.vn/).gen()
        const randName = new randValue(/[A-Z]{1,1}[a-z]{2,3} [A-Z]{1,1}[a-z]{3,4}/).gen()
        const randUserName = new randValue(/[A-Za-z0-9]{8,16}/).gen()
        const randGender = new randValue(/Male|Female/).gen()
        const randomUser = {
            name: randName,
            email: randEmail,
            password: "Nguyen123@",
            username: randUserName,
            dob: "01/01/1999",
            gender: randGender,
            phone: "012345678"
        }

        console.log(randomUser)
        const res = await fetch("http://localhost:8080/api/auth/signup", {
            method: 'post',
            body: JSON.stringify(randomUser),
            headers: { 'Content-Type': 'application/json' }
        })
        const data = await res.json()
        console.log(data)
    }


}

createUser(20);