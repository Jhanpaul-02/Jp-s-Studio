import express from 'express'
import systemRouter from './routes/system'
import projectsRouter from './routes/projects'
const app = express()
const port = Number(process.env.PORT ?? 5000)

app.use(express.json())
app.use('/api/projects', projectsRouter)
app.use('/api', systemRouter)

app.listen(port, () => {
  console.log(`API server listening on port ${port}`)
})