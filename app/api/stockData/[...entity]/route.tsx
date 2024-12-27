import prisma from '@/lib/prisma';
import jwt, { JwtPayload } from "jsonwebtoken";

//POST method for creating new ORDER
export async function POST(req: Request){
    const token = req.headers.get('auth-token');
    const data = await req.json();
    // console.log("order data", data)
    try{
        const decoded = jwt.verify(token!, process.env.JWT_SECRET as string) as JwtPayload ;
        
        if(!decoded){
            return new Response('User id is missing in create order', { status: 500 })    
        }
        
        // console.log("decoded data", decoded);
        const userId = decoded.id;      
        
        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            }
        })
        
        if(user!.capital >=  data.capital){
            const order = await prisma.order.create({
                data: {
                    authorId  : userId,
                    company :  data.company,
                    quantity : data.quantity,
                    capital  : data.capital,
                },
            });
            
            await prisma.user.update({
                where:{
                    id: userId,
                },
                data :{
                    capital : user!.capital - data.capital,
                }
            })

            // console.log("order placed successfully", order)
            return new Response(JSON.stringify({"message":"order created successfully", status : 200}))
        }
        else{
            // console.log("Account balance is low")
            return new Response(JSON.stringify({"message":"Account balance is low", status : 500}))
        }
    }
    catch(error){
        // console.log("creating new order error", error);
        return new Response(JSON.stringify({"message":'Failed to create order', status: 500 }));
    }
}


//GET method for returning all ORDER LIST
export async function GET(req: Request){
    const url = new URL(req.url);
    const token = req.headers.get('auth-token');
    // console.log("url is", url, "token is", token);

    const decoded = jwt.verify(token!, process.env.JWT_SECRET as string) as JwtPayload ;
    // console.log("decoded data", decoded)
    
    if(!decoded){
        return new Response('User id is missing in GET ORDER', { status: 500 })    
    } 
    
    if(url.pathname ===  '/api/stockData/history'){
        try{      
            const orders = await prisma.order.findMany({
                where : { authorId : decoded.id, isActive : false}
            })
            // console.log("orders list", orders)
            return new Response(JSON.stringify({"Orders" : orders, status : 200}))
        }catch(error){
            // console.log("order history error", error)
            return new Response('Failed to fetch order List', { status: 500 })
        } 
    }
    else{ 
        try{     
            const orders = await prisma.order.findMany({
                where : { authorId : decoded.id, isActive : true}
            })
            // console.log("orders list", orders)
            return new Response(JSON.stringify({"Orders" : orders, status : 200}))
        }catch(error){
            return new Response('Failed to fetch order List', { status: 500 })
        }
    }
}

//PUT method for closing the ORDER
export async function PUT(req: Request){
    const token = req.headers.get('auth-token');
    const {orderId, result} = await req.json();
    try{
        const decoded = jwt.verify(token!, process.env.JWT_SECRET as string) as JwtPayload ;
        
        if(!decoded && !orderId){
            return new Response('User id is missing in PUT ORDER', { status: 500 })    
        }      
        await prisma.order.update({
           where : {id : orderId, authorId : decoded.id},
           data : {
              result : result, 
              isActive : false
           } 
        })
        await prisma.user.update({
           where : {id: decoded.id},
           data : {
                capital : {
                    increment : result
                }
           }  
        })
        return new Response(JSON.stringify({"message" : "Order cancled successfully", status : 200}))
    }catch(error){
        // console.log("Failed to PUT order List", error)
        return new Response('Failed to PUT order List', { status: 500 })
    }
}