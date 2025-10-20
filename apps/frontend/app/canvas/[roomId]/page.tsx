"use client"
import { useEffect, useRef } from "react"


export default function(){

    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(()=>{
        const canvas = canvasRef.current
        if(!canvas){
            return 
        }
        const ctx = canvas.getContext("2d")
        if(!ctx){
            return 
        }

        let clicked = false
        let startX = 0;
        let startY = 0
        canvas.addEventListener("mousedown",(e)=>{
            clicked = true
            startX=  e.clientX
            startY = e.clientY
            
        })
        canvas.addEventListener("mouseup",(e)=>{
            clicked = false
            console.log(e.clientX)
            console.log(e.clientY)
        })
        canvas.addEventListener("mousemove",(e)=>{
            if(clicked){
                const width = e.clientX - startX
                const height = e.clientY - startY
                ctx?.clearRect(0,0, canvas.width, canvas.height)
                ctx?.strokeRect(startX, startY, width , height) // border like rectangle
            }
            
        })
    },[canvasRef])
    
    
    return <div>
        <canvas ref={canvasRef} width={1000} height={800} ></canvas>
    </div>
}
