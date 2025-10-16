import express from "express"

const app = express()

app.get('/',(req,res)=>{
    res.json({
        msg : "alright"
    })
})

app.listen(8000,()=>{
    console.log("server is runnin on port 8000")
})