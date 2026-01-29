const moment = require("moment")
const jwt = require("jsonwebtoken")
const accessTokenSchema = require("../models/AccessTokens")
const userSchema = require("../models/Users")
const AuthService = require("../services/AuthService")
const crypto = require("crypto")

const authorized = async (req, res, next) => {
    const token = req?.cookies?.["accessCookie"] || req?.rawHeaders?.[21]?.split("accessCookie=")[1]
    if (!token) {
        if (req.allowGuest) {
            const guestToken = req?.cookies?.["guestAccessCookie"] || req?.rawHeaders?.[21]?.split("guestAccessCookie=")[1]
            if (guestToken) {
                req.userId = guestToken
                req.username = guestToken
            } else {
                const newGuestToken = 'guest_' + crypto.randomUUID()
                req.userId = newGuestToken
                req.username = newGuestToken
                res.cookie("guestAccessCookie", newGuestToken, {
                    httpOnly: true,
                    sameSite: "strict",
                    maxAge: 1000 * 60 * 60 * 24 * 1 // 1d
                })
            }
            req.guest = true
            next()
            return
        }
        return res && res.json ? res.json({ auth: false, message: "No token provided.", status: "error" }) : next(new Error("No token provided."))
    }
    const tokenRecord = await accessTokenSchema.findOne({ token: token })
    if (!tokenRecord) {
        res.clearCookie("accessCookie")
        return res && res.json ? res.json({ auth: false, message: "No valid token record.", status: "error" }) : next(new Error("No valid token record."))
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            return res && res.json ? res.json({ auth: false, message: "Invalid token.", status: "error" }) : next(err)
        }
        let todayDate = moment()
        const user = await userSchema.findOne({ _id: tokenRecord.userId })
        if (moment(tokenRecord.expireDate).diff(todayDate, "days") < 2 || user.role !== tokenRecord.role) {
            const newToken = await AuthService.createToken({ userId: tokenRecord.userId, username: tokenRecord.username })
            if (res && res.cookie) {
                res.cookie("accessCookie", newToken, {
                    httpOnly: true,
                    sameSite: "strict",
                    maxAge: 1000 * 60 * 60 * 24 * 7 // 7d
                })
            }
        }
        req.userId = decoded.userId
        req.username = decoded.username
        req.role = decoded.role
        req.guest = false
        next()
    })
}

module.exports = authorized