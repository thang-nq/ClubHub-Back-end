// const timestamp = new Date()
// const dd = timestamp.getDay()
// const mm = timestamp.getMonth()
// const yyyy = timestamp.getFullYear()
// const today = new Date(Date.now()).toLocaleString('en-GB', { timeZone: 'Asia/Ho_Chi_Minh' }).split(",")[0]
// console.log(`${dd}/${mm}/${yyyy}`)
// console.log(typeof today)
const handler = {

    // Get the current date in Ho Chi Minh
    getCurrentTime: () => {
        const today = new Date(Date.now()).toLocaleString('en-GB', { timeZone: 'Asia/Ho_Chi_Minh' })
        return today
    }
}


module.exports = handler