import jwt from 'jsonwebtoken'



export const generateToken = async (user, res) => {
    const token = jwt.sign({_id : user._id}, process.env.JWT_SECRET, {expiresIn:'1d'});
    res.cookie('token', token, {httpOnly:true, sameSite:'none', maxAge:24*60*60*1000 , secure:true } );
    return token;
}
