import prisma from "@/lib/prisma";
import jwt, { JwtPayload } from "jsonwebtoken"

//POST method to fetch user data
export async function POST(req: Request) {
    const token = req.headers.get("auth-token");

    const decoded = jwt.verify(token!, process.env.JWT_SECRET as string) as JwtPayload;
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: decoded.id,
            },
            select: {
                name: true,
                capital: true,
            }
        })
        // console.log("user data is", user)
        return new Response(JSON.stringify({ user, status: 200 }));
    } catch (error) {
        return new Response(JSON.stringify({ message: "getting user details error", statu: 400 }));
    }
}