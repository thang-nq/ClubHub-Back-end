exports.allAccess = (req, res) => {
    res.status(200).send("Public content")
}

exports.userBoard = (req, res) => {
    res.status(200).send("User content")
}

exports.adminBoard = (req, res) => {
    res.status(200).send("Admin content")
}

exports.clubprezBoard = (req, res) => {
    res.status(200).send("Club President content")
}