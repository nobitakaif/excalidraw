import express from "express"
import { client } from "@repo/db/client"
import { creatRoomSchema, signinSchema, signupSchema } from "@repo/commons/types"
import bcrypt from "bcrypt"
import bodyParser from "body-parser"
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

import jwt from "jsonwebtoken"
import { middleware } from "./middeware"

const app = express()
// app.use(express.json())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended : true}))
console.log(process.env.JWT_SECRET)
app.get('/',(req,res)=>{
    console.log("alright")
    res.json({
        msg : "alrigh"
    })
})
app.post('/signup',async (req,res)=>{
    console.log(req.body.username)
    const parsedData = signupSchema.safeParse(req.body)
    if(!parsedData.success){
        res.status(401).json({
            msg : "failed input valid data"
        })
        return 
    }
    try{
        const hashedPassword = await bcrypt.hash(parsedData.data.password, 8)
        await client.user.create({
            data:{
                email : parsedData.data.email,
                password : hashedPassword, 
                username : parsedData.data.username,
                photo : parsedData.data.photo,
                githubUrl : parsedData.data.githubUrl
            }
        })

        res.status(200).json({
            msg : "you're logged-in successfully"
        })
        return 
    }catch(e){
        console.log(e)
        
        res.json({
            error : e,
            msg : "this email is already taken! & username should be unique"
        })
    }
    res.json({
        msg : "alright"
    })
})

app.post("/signin", async(req,res)=>{
    const parsedData = signinSchema.safeParse(req.body)
    if(!parsedData.success){
        res.status(401).json({
            msg : "failed input vaildation"
        })
        return 
    }

    try {
        const isUser = await client.user.findFirst({
            where:{
                email : parsedData.data.email 
            }
        })
        if(!isUser?.id){
            res.status(401).json({
                msg : "Incorrect email pls signup first"
            })
            return 
        }
        const checkPassword = bcrypt.compare(parsedData.data.password, isUser.password)
        if(!checkPassword){
            res.status(403).json({
                msg : "incorrect password"
            })
            return 
        }

        const token = jwt.sign({
            token : isUser.id
        },process.env.JWT_SECRET!)

        req.headers['Authorization'] = token
        res.status(200).json({
            token : token,
            msg : "you're successfully signed-in"
        })
        return 
    }catch(e){
        res.status(500).json({
            msg : "something went wrong here pls try after sometimes"
        })
        return 
    }
})

app.post("/room",  middleware,async(req,res)=>{
    const parsedData = creatRoomSchema.safeParse(req.body)

    if(!parsedData.success){
        res.status(411).json({
            error : parsedData.error.message,
            msg : "failed input validation"
        })
        return 
    }
    try{
        const room = await client.room.create({
            data:{
                slug : parsedData.data?.slug,
                admin : req.userId!
            }
        })
        
        res.json({
            id : req.userId,
            admin : room.admin,
            slug : room.slug,
            msg : "alright"
        })
        return 
    }catch(e){
        res.status(411).json({
            id : req.userId,
            msg : "try again with differenet slug"
        })
    }
    
})
app.listen(8000,()=>{
    console.log("server is running on port 8000")
})