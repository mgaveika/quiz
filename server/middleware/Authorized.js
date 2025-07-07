const jwt = require('jsonwebtoken')

const authorized = (req, res, next) => {
    const token = req.cookies["jwt-auth"]
    if (!token) {
        return res.json({ auth: false, message: "No token provided.", status: "error" })
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.json({ auth: false, message: "Failed to authenticate token.", status: "error" })
        }
        req.userId = decoded.id
        next()
    })
}

module.exports = authorized