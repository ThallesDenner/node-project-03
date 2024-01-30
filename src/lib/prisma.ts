import { env } from '@/env'
import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient({
  log: env.NODE_ENV === 'dev' ? ['query'] : [], // em ambiente de desenvolvimento, será exibido no terminal as consultas executadas no banco de dados (isto é últil para realizar depuração)
})

// Observação: Não precisamos colocar informações de conexão com o banco de dados aqui. O Prisma buscará automaticamente essas informações a partir da variável DATABASE_URL no arquivo .env
