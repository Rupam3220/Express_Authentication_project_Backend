import UserModel from "../models/user.js";
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken";
import transporter from "../config/emailConfig.js";

class UserController {
    //Registration start
    static userRegistration = async (req, res) => {
        const {name, email, password, password_confirmation, tc} = req.body
        const user = await UserModel.findOne({email:email})
        //Existing user check
        if(user) {
            res.status(403).send({"status":"failed", "message": "Email already exists"})
        }
        //New user check
        else {
            if (name && email && password && password_confirmation && tc) {
                //password maching check
                 if (password === password_confirmation) {
                    try {
                        //password hashing
                        const salt = await bcrypt.genSalt(10)
                        const hashPassword = await bcrypt.hash(password, salt)
                        const doc = new UserModel ({
                            name:name,
                            email:email,
                            password:hashPassword,
                            tc:tc
                        })
                        //success message for user registration
                        await doc.save()
                        //JWT token 
                        const saved_user = await UserModel.findOne({email:email})
                        //generate JWT token
                        const token = jwt.sign({userID:saved_user._id},process.env.JWT_SECRET_KEY, {expiresIn:'5d'})
                        
                        //Register success message
                        res.status(201).send({"status":"success", "message": "Congratulations, your account has been successfully created.", "token":token})
                    } 
                    // Unable to  register due to mistake error message
                    catch (error) {
                        console.log(error)    
                        res.status(401).send({"status":"failed", "message": "Unable to register"})
                    }
                 }
                 // Password not match error message
                 else {
                    res.status(401).send({"status":"failed", "message": "Passwords do not match!"})
                 }
            }
            // missing field error message
            else {
                res.status(404).send({"status":"failed", "message": "All fields are required..."})
            }
        }
    }
    //Registration end


    //Login start
    static userLogin = async (req, res) => {
        try {
            // login with email and password
            const {email, password} = req.body
            if (email && password) {
                const user = await UserModel.findOne({email:email})
                //comparing login password with the DB password
                if(user != null){
                    const isMatch = await bcrypt.compare(password, user.password)
                    if((user.email === email) && isMatch) {

                        //generate JWT token
                        const token = jwt.sign({userID:user._id},process.env.JWT_SECRET_KEY, {expiresIn:'5d'})
                        
                        //Login success message
                        res.status(201).send({"status":"success", "message": "Congratulations, Login success!", "token":token})
                    }
                    else{
                        res.status(401).send({"status":"failed", "message": "Username or Password not valid!"}) 
                    }
                }
                // email or password not match error message
                else{
                    res.status(404).send({"status":"failed", "message": "User does not exist!"})
                }
            }
            // missing field error message
            else{
                res.status(404).send({"status":"failed", "message": "All fields are required..."})
            }
        } 
        catch (error) {
            console.log(error)
            res.status(401).send({"status":"failed", "message": "Unable to login!"})
        }
    }
    //Login end

    //Change Password start
    static changeUserPassword = async(req, res) => {
        const {password, password_confirmation} = req.body
        if (password && password_confirmation) {
            if (password !== password_confirmation){
                res.status(401).send({"status":"failed", "message": "New password and Confirm New Password doesn't match!"})
            }
            else{
                    //password hashing for change password
                    const salt = await bcrypt.genSalt(10)
                    const newHashPassword = await bcrypt.hash(password, salt)
                    await UserModel.findByIdAndUpdate(req.user._id, {$set:{password:newHashPassword}})
                    res.status(201).send({"status":"success", "message": "Congratulations, password changed successfully!"})
            }
        }
        else{
            res.status(404).send({"status":"failed", "message": "All fields are required..."})
        }
    }
    //Change Password end

    //User details showing after login start
    static loggedUser = async (req, res) => {
        res.send({"user": req.user})
    } 
    //User details showing after login end 


    // Reset password email generator start
    static sendUserPasswordResetEmail = async (req, res) => {
        const { email } = req.body
        if (email) {
          const user = await UserModel.findOne({ email: email })
          if (user) {
            const secret = user._id + process.env.JWT_SECRET_KEY
            const token = jwt.sign({ userID: user._id }, secret, { expiresIn: '15m' })
            const link = `http://127.0.0.1:3000/api/user/reset/${user._id}/${token}`
            //console.log(link)

            //send email code
            let info = await transporter.sendMail({
                from: process.env.EMAIL_FROM,
                to: user.email,
                subject: "[ACTION REQUIRED] Reset account password",
                html: `
                <p>Hello,</P>
                <br>
                <p>Forgot your password?</P>
                <p>We received a request to reset the password for your account.</P>
                <br>
                <p>To reset your password, click on the link below: </p>
                <a href=${link}>Click here to reset your account password</a>
                <br>
                <p>Thanks,</p>
                <p>Rupam Chakraborty</p>`
            })

            res.status(201).send({"status":"success", "message": "Password reset email successfully sent!", "info":info})
            }
            else {
                res.status(404).send({"status":"failed", "message": "Email does not exist!"})
            }
        }
        else {
            res.status(404).send({"status":"failed", "message": "Email field should not empty..."})
        }
    }

    static userPasswordReset = async(req, res) => {
        const {password, password_confirmation} = req.body
        const {id, token} = req.params
        const user = await UserModel.findById(id)
        const new_secret = user._id + process.env.JWT_SECRET_KEY
        try {
            jwt.verify(token, new_secret)    
            if(password && password_confirmation) {
                if (password !== password_confirmation) {
                    res.status(401).send({"status":"failed", "message": "New password and Confirm New Password doesn't match!"})
                }
                else {
                    const salt = await bcrypt.genSalt(10)
                    const newHashPassword = await bcrypt.hash(password, salt)
                    await UserModel.findByIdAndUpdate(req.user._id, {$set:{password:newHashPassword}})
                    res.status(201).send({"status":"success", "message": "Congratulations, password reset successfully!"})
                }
            }
            else {
                res.status(404).send({"status":"failed", "message": "All fields are required..."})
            }
        } 
        catch (error) {
            console.log(error)
            res.status(401).send({"status":"failed", "message": "Invalid token!"})
        }
    }
    // Reset password email generator start

}
export default UserController





