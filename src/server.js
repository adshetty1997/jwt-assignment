const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require("body-parser")
const { isAdmin, isAuthenticated, generateHashPassword, generateJWTToken } = require('./helper/middleware')
const { getUserByEmail, updateSessionToken } = require('./db/userSchema')
const app = express()

const PORT = 3000
const MONGO_USERNAME = "Demo"
const MONGO_PASSWORD = "VvJox9eH16PlkI72"
const MONGO_URL = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@cluster0.njhrx.mongodb.net/assignment?retryWrites=true&w=majority`


app.use(bodyParser.json())
app.post('/login', async(req, res) => {
  try{
    const {email, password} = req.body;
    
    if(!email || !password){
        res.status(400).send("Missing credentials!");
    }
    else{
        const existingUser = await getUserByEmail(email).select('+authentication.salt +authentication.password');

        if(!existingUser){
            res.status(400).send("User does not exist!");
        }
        else{
            let hash = generateHashPassword(existingUser?.authentication?.salt || "",password);

            if(!(existingUser?.authentication?.password) || hash !== existingUser?.authentication?.password){
                res.status(403).send("Incorrect Password!");
            }
            else{
                const token = generateJWTToken({id:existingUser._id, name:existingUser.name, email:existingUser.email, isAdmin:existingUser.isAdmin||false});

                existingUser.set("authentication.sessionToken",token);
                existingUser.save();

                res.status(200).send({message:"Logged In",token})
            }
        }
    }
    
  }catch(err){
      res.status(400).send("Something went wrong!");
  }
})

app.use(isAuthenticated);

app.get('/check-token', (req, res) => {
  try{
    res.status(200).send("Token Validity confirmed");
  }catch(err){
      res.status(400).send("Something went wrong!");
  }
})

app.post('/revoke-token', isAdmin, async(req, res) => {
  try{
    const {email} = req.body;
    
    if(!email){
        res.status(400).send("Email not provided!");
    }
    else{
        const existingUser = await getUserByEmail(email);

        if(!existingUser){
            res.status(400).send("User does not exist!");
        }
        else{
            await updateSessionToken(email);
            res.status(200).send({message:"Token Revoked"})
            }
        }
    }catch(err){
        res.status(400).send("Something went wrong!");
    }
})

app.listen(PORT, async() => {
  await mongoose.connect(MONGO_URL)
  mongoose.connection.on('error',(error)=>console.log(error))
  mongoose.connection.once("open", function () {
    console.log("DB Connected successfully");
  });
  console.log(`Server up on PORT ${PORT}`)
})