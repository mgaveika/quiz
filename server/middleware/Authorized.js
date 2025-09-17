const moment = require("moment")
const jwt = require("jsonwebtoken")
const accessTokenSchema = require("../models/AccessTokens")
const AuthService = require("../services/AuthService")

const authorized = async (req, res, next) => {
    const token = req?.cookies?.["accessCookie"] || req?.rawHeaders?.[21]?.split("accessCookie=")[1]
    if (!token) {
        return res.json({ auth: false, message: "No token provided.", status: "error" })
    }
    const tokenRecord = await accessTokenSchema.findOne({token: token})
    if (!tokenRecord) {
        res.clearCookie("accessCookie")
        return res.json({ auth: false, message: "No valid token record.", status: "error" })
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        let todayDate = moment()
        if (moment(tokenRecord.expireDate).diff(todayDate,"days") < 2) {
            const newToken = await AuthService.createToken({userId: tokenRecord.userId, username: tokenRecord.username})
            res.cookie("accessCookie", newToken, {
                httpOnly: true,
                sameSite: "strict",
                maxAge: 1000 * 60 * 60 * 24 * 7 // 7d
            })
        }
        req.userId = decoded.id
        req.username = decoded.username
        next()
    })
}

module.exports = authorized