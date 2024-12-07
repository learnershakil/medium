import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign, verify } from 'hono/jwt'

const app = new Hono()

app.use('/api/v1/blog/*', async (c,next) => {
  const header = c.req.header('Authorization') || '';
  const token = header.split(' ')[1];

  //@ts-ignore
  const response = await verify(token, c.env.JWT_SECRET)
  if (response.id) {
    next()  
  } else {
    return c.json({ error: 'Unauthorized' })
  }
})

app.get('/', (c) => {
  return c.text('Welcome to medium!')
})

app.post('/api/v1/signup', async (c) => {
  const prisma = new PrismaClient({
    //@ts-ignore
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  
  
  try {
    const body = await c.req.json();

    if(await prisma.user.findUnique({
      where: {
        email: body.email
      }
    })) {
      return c.json({ error: 'User already exists' })
    }

    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: body.password,
      }
    });
  
    //@ts-ignore
    const token = await sign({ id: user.id }, c.env.JWT_SECRET)
  
    return c.json({ jwt: token })
  } catch (error) {
    console.log((error as Error).message)
    return c.json({ error: 'Error in creating the user', message: (error as Error).message })
  }
});

app.post('/api/v1/signin', async (c) => {
  const prisma = new PrismaClient({
    //@ts-ignore
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  
  const body = await c.req.json();
  const user = await prisma.user.findUnique({
    where: {
      email: body.email
    }
  })

  if (!user) {
    c.status(404);
    return c.json({ error: 'User not found' });
  }

  if (user.password !== body.password) {
    return c.json({ error: 'Invalid password' })
  }

  //@ts-ignore
  const token = await sign({ id: user.id }, c.env.JWT_SECRET);
  return c.json({ jwt: token })

})

app.post('/api/v1/blog', (c) => {
  return c.text('Welcome to post blog page!')
})

app.put('/api/v1/blog', (c) => {
  return c.text('Welcome to blog update page!')
})

app.get('/api/v1/blog:id', (c) => {
  return c.text('Welcome to blog page!')
})

export default app