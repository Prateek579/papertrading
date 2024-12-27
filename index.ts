import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.order.create({
    data: {
      company: "AAPL",
      quantity: 20,
      capital: 1000,
      authorId: 1,
    },
  })
  const allUser = await prisma.user.findMany();
  console.dir(allUser)
  // await prisma.user.create({
  //   data: {
  //     name: "Prateek",
  //     email: "prateek@gamil.com",
  //     password: "prateek123"
  //   },
  // })
  // const allUser = await prisma.user.findMany();
  // console.dir(allUser)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })