import { User } from '../../model/authModel/userModel.js';
import bcrypt from 'bcryptjs'



import { generateToken } from '../../utils/generateToken.js';
import { generateVerificationCode } from '../../utils/generateVerificationCode.js';
import { generateOtpEmail } from '../../templates/emailTemplate.js';
import { sendTicketEmail } from '../../utils/sendTicket.js';




export const register = async (req, res) => {
    try {
        const {userName , email, password , isAdmin} = req.body;
        if(!userName || !email || !password ){
            return res.status(400).json({
                message : 'all fields are required'
            })
        }

        const user = await User.findOne({email});

        if(user){
            return res.status(400).json({
                message : 'email has already used'
            })
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            userName,
            email,
            password : hashPassword,
            isAdmin
        })

        generateToken(newUser, res);

        return res.status(200).json({
            message : 'user registered successfully',
            success : true,
            newUser,

        })

    } catch (error) {
        console.log(error);
    }
}

export const login = async (req, res) => {
    try {
        const {email, password} = req.body;
        if(!email || !password){
            return res.status(400).json({
                message : 'all fields are required'
            })
        }

        const user = await User.findOne({email});

        if(!user){
            return res.status(400).json({
                message : 'invalid email'
            })
        }

        const isPassCorrect = await bcrypt.compare(password, user.password);



        if(!isPassCorrect){
            return res.status(400).json({
                message : 'password is incorrect'
            })
        }





        const token = await generateToken(user, res);

        console.log('token', token);

        return res.status(200).json({
            success : true,
            message : `welcome back ${user.userName}`,
            user,
            token
        })
    } catch (error) {
        console.log(error);
    }
}


export const adminLogin = async (req, res) => {
    try {
        const {email, password} = req.body;
        if(!email || !password){
            return res.status(400).json({
                message : 'all fields are required'
            })
        }

        const user = await User.findOne({email});

        if(!user){
            return res.status(400).json({
                message : 'invalid email'
            })
        }

        const isPassCorrect = await bcrypt.compare(password, user.password);



        if(!isPassCorrect){
            return res.status(400).json({
                message : 'password is incorrect'
            })
        }


        if(user.isAdmin === false){
            return res.status(403).json({
                message : 'Only admin can login.',
                success : false
            })
        }




        const token = generateToken(user, res);

        return res.status(200).json({
            success : true,
            message : `welcome back Admin ${user.userName}`,
            user,
            isAdmin : user.isAdmin,
            token
        })
    } catch (error) {
        console.log(error);
    }
}




export const logout = async (req, res) => {
    try {
         res.clearCookie('token').status(200).json({
                success : true,
                message : 'logout successfully'
            })
    } catch (error) {
        console.log(error);
    }
}

export const forgotPassword = async (req, res) => {
      try {
        const {email } = req.body;

        if(!email){
            throw new Error('field is required');
        }
        const user = await User.findOne({email});

        if(!user){
            return res.status(400).json({
                message : 'invalid email'
            })
        }

        const verificationToken =  generateVerificationCode();

        user.resetToken = verificationToken;
        user.resetTokenExpire =  Date.now() + 10 * 60 * 1000; // 10 mins expiry

        await user.save();

        const html = generateOtpEmail(verificationToken, user.userName);

        await sendTicketEmail({
            to: email,
            subject: 'Your OTP for IRCTC Password Reset',
            html: html,
          });





        return res.status(200).json({ message: "Reset token sent to email", token: verificationToken }); // return token for testing



      } catch (error) {
        console.log(error);
      }
}

export const verifyToken = async (req, res) => {
    try {

        const { token } = req.body;

        if( !token ){
            return res.status(400).json({
                message : ' fields required'
            })
        }

        const user = await User.findOne({resetToken : token})

        if(!user){
            return res.status(400).json({
                message : 'token not found'
            })
        }


        if( user.resetTokenExpire < Date.now()){
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        user.isTokenVerified = true;


        await user.save();
        return res.status(200).json({ message: "verification success" });





        }
     catch (error) {
        console.log(error);
    }
}

export const resetPassword = async (req, res) => {
    try {

        const {confirmPassword, newPassword} = req.body;

        if(!confirmPassword || !newPassword){
            return res.status(400).json({
                message : 'new password required'
            })
        }

        if(confirmPassword !== newPassword){
            return res.status(400).json({
                message : 'Password do not match'
            })
        }

        const user = await User.findOne({isTokenVerified : true})

        if(!user){
            return res.status(400).json({ message: "OTP/token not verified" });
        }

        const hashedNewPassword = await bcrypt.hash(confirmPassword, 10);

         user.password = hashedNewPassword;


        user.resetToken = undefined;
        user.resetTokenExpire = undefined;
        user.isTokenVerified = false;

        await user.save();


         return res.status(200).json({
            success : true,
            message : "Password reset successfully"
         })
    } catch (error) {
        console.log(error);
    }
}

export const getAllUsers = async (_, res) => {
  try {
    const allUsers = await User.find().sort({ createdAt: -1 });

    return res.status(200).json({
      allUsers
    })
  } catch (error) {
    console.log(error);
  }
}

