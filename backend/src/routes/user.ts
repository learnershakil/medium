import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign, verify } from "hono/jwt";

export const userRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

userRouter.post("/signup", async (c) => {
  const body = await c.req.json();
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    if (
      await prisma.user.findUnique({
        where: {
          username: body.username,
        },
      })
    ) {
      return c.json({ error: "User already exists" });
    }

    const user = await prisma.user.create({
      data: {
        username: body.username,
        password: body.password,
      },
    });

    const token = await sign({ id: user.id }, c.env.JWT_SECRET);

    return c.json({ jwt: token });
  } catch (error) {
    return c.json({
      error: "Error in creating the user",
      message: (error as Error).message,
    });
  }
});

userRouter.post("/signin", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json();
  const user = await prisma.user.findFirst({
    where: {
      username: body.username,
    },
  });

  if (!user) {
    c.status(404);
    return c.json({ error: "User not found" });
  }

  if (user.password !== body.password) {
    c.status(403);
    return c.json({ error: "Invalid password" });
  }

  const token = await sign({ id: user.id }, c.env.JWT_SECRET);
  return c.json({ jwt: token });
});
