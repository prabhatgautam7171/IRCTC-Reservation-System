// import passport from "passport"
// import { Strategy as GitHubStrategy } from "passport-github2"

// passport.use(
//   new GitHubStrategy(
//     {
//       clientID: process.env.GITHUB_CLIENT_ID,
//       clientSecret: process.env.GITHUB_CLIENT_SECRET,
//       callbackURL: "http://localhost:8000/api/v1/github/callback",
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         const user = {
//           githubId: profile.id,
//           email: profile.emails?.[0]?.value,
//           name: profile.displayName,
//         }

//         return done(null, user)
//       } catch (error) {
//         return done(error, null)
//       }
//     }
//   )
// )

// export default passport
