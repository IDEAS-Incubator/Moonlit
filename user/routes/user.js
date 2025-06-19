import { Router } from 'express';
import { signupApp,sendEmailCode,ResetPasswordApp, getProfile,updateProfile,Login,newUser,completeUser,logout, ForgotRequest, ResetPassword, getUser} from '../controllers/user.js';

import { verifyTokenMiddleware } from '../middleware/auth.js';
const router = Router();

router.post('/login', Login);
router.get('/',verifyTokenMiddleware,getUser);
router.post('/signup',newUser);
router.post('/signupApp', signupApp);
router.post('/signup/verification',completeUser);
router.post('/forgot', ForgotRequest )
router.put('/forgot-finish', ResetPassword)
router.get('/logout',logout )
router.get("/profile", getProfile);  
router.put("/profile", updateProfile);  

router.post('/send-email-code', sendEmailCode)
router.post('/reset-passwordApp', ResetPasswordApp)
// router.post("/addEnterpriseUser", addEnterpriseUser);
export default router;
