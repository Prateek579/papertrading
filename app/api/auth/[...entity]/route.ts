import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

// POST create a NEW USER ans SIGN-IN USER
export async function POST(request: Request) {
    const url = new URL(request.url);

    const data = await request.json();
    // console.log("usre data is", data);

    //create new user
    if (url.pathname === '/api/auth/signIn') {
        try {
            const exist = await prisma.user.findUnique({ where: { email: data.email } });
            if (exist) {
                return new Response(JSON.stringify({ message: "User already exist", status: 300 }));
            }
            const user = await prisma.user.create({ data });
            const token = jwt.sign(
                { email: user.email, id: user.id },
                process.env.JWT_SECRET as string,
                { expiresIn: '1h' }
            )
            return new Response(JSON.stringify({ message: "User created successfully", status: 200, token }));
        } catch (error) {
            // console.error('Error creating user:', error);
            return new Response(JSON.stringify({ "message": 'Failed to create user', status: 500 }));
        }
    }
    //sign-up user
    else {
        try {
            const user = await prisma.user.findUnique({
                where: { email: data.email }
            });
            if (user) {
                if (user.password == data.password) {
                    const token = jwt.sign(
                        { email: user.email, id: user.id },
                        process.env.JWT_SECRET as string,
                        { expiresIn: '1h' }
                    )
                    return new Response(JSON.stringify({ message: "User signin successfully", status: 200, token }));
                } else {
                    return new Response(JSON.stringify({ message: "Password does not match", status: 404 }));
                }
            } else {
                return new Response(JSON.stringify({ message: "User does not exist", status: 404 }));
            }

        } catch (error) {
            // console.error('Error login user:', error);
            return new Response('Failed to login user', { status: 500 });
        }
    }
}



// GET all users
export async function GET() {
    const users = await prisma.user.findMany();
    return new Response(JSON.stringify(users));
}
