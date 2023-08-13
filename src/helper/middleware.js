const crypto = require("crypto");
const jwt = require('jsonwebtoken');
const { get, merge } = require("lodash");
const { getUserByEmail } = require("../db/userSchema");

const CRYPTO_SECRET = "ASSIGNMENT";

const isAdmin = (req,res,next)=>{
    if(!(req.decoded.isAdmin)){
        res.status(403).send("Only Admin can perform this action!");
    }
    else{
        next();
    }
}

const isAuthenticated = async(req,res,next)=>{
    try{
        const token = req.headers.authorization;
        
        if(!token){
            res.status(403).send("Unauthorized user!");
        }
        else{
            const payload = verifyAndGetJWTPayload(token);
            const userEmail = (get(payload,"email")||"").toString();
            const existingUser = await getUserByEmail(userEmail).select('+authentication.sessionToken');

            if(!existingUser){
                res.status(403).send("Unauthorized user!");
            }
            else if(!!!(existingUser.authentication.sessionToken) || (existingUser.authentication.sessionToken!==token)){
                
                res.status(403).send("Session Revoked!");
            }
            else{
                merge(req,{decoded:payload});
                next();
            }
        }
    }catch(err){
        res.status(400).send("Something went wrong!");
    }
}

const generateHashPassword = (salt, password) => {
    return crypto.createHmac("sha256", [salt, password].join("/")).update(CRYPTO_SECRET).digest("hex");
}

const generateJWTToken = (payload) => jwt.sign(payload, CRYPTO_SECRET);

const verifyAndGetJWTPayload = (token) => jwt.verify(token, CRYPTO_SECRET);

module.exports = {
    isAdmin,
    isAuthenticated,
    generateHashPassword,
    generateJWTToken
}