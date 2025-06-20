const jwt = require('jsonwebtoken')

const authorized = (req, res, next) => {
    const token = req.headers['x-access-token']
    if (!token) {
        return res.json({ auth: false, msg: "No token provided.", msgType: "error" })
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.json({ auth: false, msg: "Failed to authenticate token.", msgType: "error" })
        }
        req.userId = decoded.id
        next()
    })
}

module.exports = authorized