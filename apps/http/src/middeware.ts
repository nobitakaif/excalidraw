import type {Request, NextFunction, Response } from "express";
import jwt from "jsonwebtoken"
export async function middleware(req: Request, res: Response, next : NextFunction){
    console.log("first",req.headers['authorization'])
    const token = req.headers['authorization'] as string
    console.log("second",token)
    if(token){
        jwt.verify(token, process.env.JWT_SECRET!, ( err, decoded : any  )=>{
            if(err){
                res.status(403).json({
                    msg : "invaid token!"
                })
                return 
            }
            console.log(decoded.token)
            req.userId= decoded.token 
            
        })
        next()
        return 
    }
   
    res.status(411).json({
        msg : "token is not present in the headers"
    })
    return 

}