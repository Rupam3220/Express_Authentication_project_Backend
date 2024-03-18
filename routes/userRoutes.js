import express from 'express';
const router = express.Router();
import UserController from '../controllers/userController.js';
import checkUserAuth from '../middlewares/auth-middleware.js';

//to protect route we use "Route Level Middleware"
router.use('/changepassword', checkUserAuth)
router.use('/loggeduser', checkUserAuth)

// public route(Without login access pages) like "Login" page and "Register" Page or home page
router.post('/register', UserController.userRegistration)
router.post('/login', UserController.userLogin)
router.post('/send-reset-password-email', UserController.sendUserPasswordResetEmail) 
router.post('/reset-password/:id/:token', UserController.sendUserPasswordResetEmail) 

// protected/ private route(With login access pages) like reset password services user specific pages
router.post('/changepassword', UserController.changeUserPassword)
router.get('/loggeduser', UserController.loggedUser)


export default router