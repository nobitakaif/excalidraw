import { WebSocketServer } from "ws"
import type { WebSocket } from "ws";
import jwt from "jsonwebtoken"
import dotenv from 'dotenv';
import { client } from "@repo/db/client"
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
    try{
        const decodedToken = jwt.verify(token , JWT_SECRET)
    
        if(typeof decodedToken == 'string'){
            console.log("decodedToken ",decodedToken)
            return null;
        }
        console.log("decodedToken ",decodedToken)
        if(!decodedToken){
            return null 
        }
        return decodedToken.token;
    }catch(e){
        return null 
    }
    
}

interface User{
    socketId : WebSocket,
    rooms  : string[], // ['math', 'english'] 
    userId : string
}

const users :User[]  = []
wss.on('connection', function connection(ws , req ){
    const url = req.url
    if(!url){
        console.log("url is not present ")
        ws.close()
        return
    }
    const splitUrl = new URLSearchParams(url.split('?')[1])
    // console.log("url ",splitUrl)
    const token = splitUrl.get('token') || ""
    // console.log("token " , token)
    const isUser = checkUser(token)
    if(!isUser){
        ws.close()
        return 
    } 
    console.log(isUser)
    // pushing the user into global var User for maintain all the user
    users.push({
        userId : isUser,
        socketId : ws ,
        rooms : []
    })
    
    ws.on('message',async function (data){
        // data always be string so we need to parsed into obj
        // we will send data like ->
        // {
        //     type : "join_room" | "leave_room" | "chat",
        //     roomId : "22233" ,
        //     message : "Hii everyone"
        // }
        const parsedObj = JSON.parse(data as unknown as string )
        if(parsedObj.type == "join_room"){
            // TODO => this roomId exisit in our db or not then procce otherwise not 
            const user = users.find( u => u.socketId === ws) // check the current user in the global Users array
            user?.rooms.push(parsedObj.roomId) // storing roomid into user.room[] 
            ws.send("congratulation you're successfully joined room ", parsedObj.roomId)
        }

        if(parsedObj.type === "leave_room"){
            const user = users.find( u => u.socketId === ws)
            if(!user){
                return 
            }
            // user.rooms = user?.rooms.filter(r => r === parsedObj.roomId) 
            for(let i = 0 ; i<user.rooms.length ; i++ ){
                if(user.rooms[i] == parsedObj.roomId){
                    user.rooms[i] = ''
                    break
                }
            }
            ws.send("you're leaving this room ", parsedObj.roomId)
            // return
        }
        // TODO : => add messages into redis queue first then broadcast to everyone and the publisher will pick the ele from the queue and put into the db 


        if(parsedObj.type == "chat"){
            const roomId = parsedObj.roomId
            const message = parsedObj.message
            // sending msg to everyone who is connected to the same roomId
            await client.chat.create({
                data : {
                    message,
                    roomId : Number(roomId),
                    userId : isUser
                }
            })
            users.forEach(user =>{
                if(user.rooms.find(r => parsedObj.roomId)){
                    user.socketId.send(JSON.stringify({
                        type : "chat",
                        message : message,
                        roomId : roomId
                    }))
                }
            })
        }
    })
})

