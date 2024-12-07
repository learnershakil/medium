import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Welcome to medium!')
})

app.post('/api/v1/signup', (c) => {
  return c.text('Welcome to signup page!')
})

app.post('/api/v1/signin', (c) => {
  return c.text('Welcome to signin page!')
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