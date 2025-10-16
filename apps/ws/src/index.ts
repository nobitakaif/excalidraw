import { WebSocketServer } from "ws"
import jwt from "jsonwebtoken"
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

const wss = new WebSocketServer({ port : 8080},()=>{
    console.log("socket is running on port 8080")
})

// console.log(typeof process.env.JWT_SECRET)
function checkUser (token : string): string | null{
    const JWT_SECRET = process.env.JWT_SECRET
    if(!JWT_SECRET){
        throw new Error("JWT SECRET is not present")
    }
    // console.log(token)
    const decodedToken = jwt.verify(token , JWT_SECRET)
    if(typeof decodedToken == 'string'){
        console.log("decodedToken ",decodedToken)
        return null;
    }
    console.log("decodedToken ",decodedToken)
    if(!decodedToken){
        console.log("fuuckkkkkkkkkkkkkkkkkkkkkkkkkkkk")
        return null 
    }
    return decodedToken.token;
}

interface User{
    ws : WebSocket,
    rooms  : string[], // ['math', 'english'] 
    userId : string
}

const user :User[]  = []
wss.on('connection', function connection(ws :any, req : any){
    const url = req.url
    if(!url){
        console.log("url is not present ")
        ws.close('url is not present')
        return
    }
    const splitUrl = new URLSearchParams(url.split('?')[1])
    // console.log("url ",splitUrl)
    const token = splitUrl.get('token') || ""
    // console.log("token " , token)
    const isUser = checkUser(token)
    if(!isUser){
        ws.close('disconnected')
        return 
    } 
    // pushing the user into global var User for maintain all the user
    user.push({
        userId : isUser,
        ws ,
        rooms : []
    })
    
    ws.on('message',function (data : any){
        // data always be string so we need to parsed into obj
    })
})

