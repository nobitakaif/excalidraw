import { z } from "zod"

export const signupSchema = z.object({
    email : z.email(),
    password : z.string().min(8,{message : "password should be atleast 8 character"}).max(30, {message : "password should be less than 40 character"}),
    username : z.string().min(3, { message : "your username is too short"}).max(25,{message : "your username name is too long "}),
    photo : z.url().optional(),
    githubUrl : z.url().optional(),
})  

export const signinSchema = z.object({
    email : z.string(),
    password : z.string().min(8,{message : "password should be atleast 8 character"}).max(30, {message : "password should be less than 40 character"})
})

export const creatRoomSchema = z.object({
    // admin : z.string(),
    slug : z.string().min(4, { message : "atleast 4 words"}).max(40, {message : "at max 40"})
})