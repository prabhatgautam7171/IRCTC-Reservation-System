import { JWT, OAuth2Client } from "google-auth-library";
import { User } from "../../model/authModel/userModel.js";


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleAuth = async (req, res) => {
   console.log('Google Auth Controller hit ✅');
  try {
    const { token } = req.body;

    // 1️⃣ Verify token with Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const { email, name, picture, email_verified } = payload;

    if (!email_verified) {
      return res.status(400).json({ message: "Email not verified" });
    }

    // 2️⃣ Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        name,
        profilePic: picture,
        authProvider: "google",
      });
    }

    // 3️⃣ Generate YOUR OWN JWT
    const appToken = JWT.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      token: appToken,
      user,
    });

  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Google authentication failed" });
  }
};
