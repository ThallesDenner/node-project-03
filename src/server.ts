import { app } from './app'
import { env } from './env'

app
  .listen({
    host: '0.0.0.0', // isto evita problemas ao conectar o backend com algum frontend
    port: env.PORT,
  })
  .then(() => {
    console.log('🚀 HTTP Server Running!')
  })
