// import express from "express"
// import passport from "../config/passport.js"
// import jwt from "jsonwebtoken"

// const router = express.Router()

// router.get(
//   "/login",
//   passport.authenticate("github", { scope: ["user:email"] })
// )

// router.get(
//   "/callback",
//   passport.authenticate("github", {
//     session: false,
//     failureRedirect: "/login",
//   }),
//   async (req, res) => {
//     try {
//       const user = req.user

//       // TODO: Save user in DB here if not exists

//       const token = jwt.sign(
//         { id: user.githubId },
//         process.env.JWT_SECRET,
//         { expiresIn: "7d" }
//       )

//       res.redirect(`http://localhost:3000/oauth-success?token=${token}`)

//     } catch (error) {
//       res.status(500).json({ message: "OAuth failed" })
//     }
//   }
// )

// export default router
