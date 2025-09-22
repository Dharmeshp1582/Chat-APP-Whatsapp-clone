import jwt from 'jsonwebtoken'

export const generateJwtToken = (userId) => {
  return jwt.sign({userId},process.env.JWT_SECRET_KEY,{expiresIn:'1y'});}

