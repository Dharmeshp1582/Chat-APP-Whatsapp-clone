import jwt from 'jsonwebtoken'
import { response } from '../utils/responseHandler.js';


export const authMiddleware =  (req, res, next) => {

  const authToken = req.cookies?.auth_token;

  if (!authToken) {
    return response(res, 401, 'Unauthorized user! access denied');
  }

  try {
    const decode = jwt.verify(authToken, process.env.JWT_SECRET_KEY);
    req.user = decode;
    // console.log('req.user',req.user);
    next();
  } catch (error) {
    console.log(error);
    return response(res, 500, 'Invalid or expired user');
  }

}