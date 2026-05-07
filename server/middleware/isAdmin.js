import {User} from "../model/authModel/userModel.js"

export const adminOnly = async (req, res, next) => {
  try {
    console.log(req.id)
    const user = await User.findById(req.id);  // req.id should come from your auth middleware

    if (user && user.isAdmin) {
      return next();
    }

    return res.status(403).json({ 
      success: false,
      message: "Access denied: Admins only" 
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
