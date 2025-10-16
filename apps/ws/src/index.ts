import { WebSocketServer } from "ws"
import jwt from "jsonwebtoken"

const wss = new WebSocketServer({ port : 8080},()=>{
    console.log("socket is running on port 8080")
})

function checkUser (token : string): string | null{
    const decodedToken = jwt.verify(token , 'NOBITKAIF')
    if(typeof decodedToken == 'string'){
        return null;
    }
    if(!decodedToken || !decodedToken.sub){
        return null 
    }
    return decodedToken.token;
}
wss.on('connection', function connection(ws :any, req : any){
    const url = req.url
    if(!url){
        console.log("url is not present ")
        ws.close('url is not present')
        return
    }
    const splitUrl = new URLSearchParams(url.split('?')[1])
    const token = splitUrl.get('token')!
    const isUser = checkUser(token)
    if(!isUser){
        ws.close('disconnected')
        return 
    } 
    
    ws.on('message',function (data : any){
        console.log(data)
        ws.send("alright")
    })
})

