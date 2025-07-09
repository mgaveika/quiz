const jwt = require("jsonwebtoken")
const accessTokenSchema = require("../models/AccessTokens")

const authorized = async (req, res, next) => {
    const token = req.cookies["accessCookie"]
    if (!token) {
        return res.json({ auth: false, message: "No token provided.", status: "error" })
    }
    const tokenRecord = await accessTokenSchema.findOne({token: token})
    if (!tokenRecord) {
        res.clearCookie("accessCookie")
        return res.json({ auth: false, message: "No valid token record.", status: "error" })
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