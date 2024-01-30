import { randomUUID } from 'node:crypto'
import { execSync } from 'node:child_process'
import type { Environment } from 'vitest'
import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const prisma = new PrismaClient()

function generateDatabaseURL(schema: string) {
  if (!process.env.DATABASE_URL) {
    throw new Error('Please provide a DATABASE_URL environment variable.')
  }

  const url = new URL(process.env.DATABASE_URL)

  // Suponha que DATABASE_URL="postgresql://user:password@host:port/database?schema=public" (public é o schema principal do PostgreSQL)
  // A linha abaixo substitui o valor do parâmetro schema pelo valor passado para a função generateDatabaseURL
  url.searchParams.set('schema', schema)

  return url.toString()
}

export default <Environment>{
  name: 'prisma',
  transformMode: 'ssr',
  // setup é chamado antes dos testes com este ambiente serem executados
  async setup() {
    const schema = randomUUID()
    const databaseURL = generateDatabaseURL(schema)

    // Cada suíte de teste e2e terá um schema dentro do banco de dados, portanto, temos que modificar o valor de DATABASE_URL dinamicamente.
    process.env.DATABASE_URL = databaseURL

    // A função execSync pode executar de dentro da aplicação Node qualquer comando que seja executável no terminal.
    // O comando é executado de forma síncrona, o que significa que o Node.js aguardará até que o comando seja concluído antes de continuar a execução do programa.
    execSync('npx prisma migrate deploy') // usando deploy em vez de dev, o prisma não irá comparar o schema.prisma local com o schema do banco de dados. Assim, apenas as migrações dentro da pasta migrations serão executadas.

    return {
      // teardown é chamado depois que todos os testes com este ambiente forem executados
      async teardown() {
        // Exclui o schema e tudo associado a ele, pois estamos usando CASCADE.
        await prisma.$executeRawUnsafe(
          `DROP SCHEMA IF EXISTS "${schema}" CASCADE`,
        )

        await prisma.$disconnect() // desconecte do banco de dados
      },
    }
  },
}

/*
Observações:
- import 'dotenv/config' é necessário para acessar as variáveis de ambiente disponibilizadas em process.env

PostgreSQL:
- O PostgreSQL permite criar varios schemas isolados dentro de um banco de dados.
- O padrão de uma URL de conexão com o PostgreSQL segue o seguinte formato:
  postgres://<username>:<password>@<host>:<port>/<database>
  onde,
  postgres://: O protocolo usado para a conexão.
  <username>: Nome de usuário usado para autenticação no banco de dados.
  <password>: Senha associada ao usuário (opcional).
  <host>: O endereço do servidor onde o PostgreSQL está em execução.
  <port>: O número da porta em que o PostgreSQL está ouvindo (geralmente 5432).
  <database>: O nome do banco de dados ao qual você deseja se conectar.

Alguns métodos do Prisma:
- O método queryRaw é utilizado para executar consultas SQL de leitura (SELECT) no banco de dados. Ele retorna um objeto que representa os resultados da consulta.
O uso de queryRaw é preferível quando você espera que a consulta retorne dados. Por exemplo,
  const result = await prisma.$queryRaw`SELECT * FROM users WHERE age > 18`;
- O método executeRaw é utilizado para executar consultas SQL que não retornam dados (como INSERT, UPDATE, DELETE). Ele retorna um objeto que contém informações 
sobre a execução da consulta, como o número de linhas afetadas. Use executeRaw quando estiver realizando operações que alteram o estado do banco de dados, mas não 
necessariamente esperam resultados. Por exemplo, 
  const result = await prisma.$executeRaw`UPDATE users SET active = true WHERE last_login < NOW() - interval '30 days'`;
- O método executeRawUnsafe é semelhante ao executeRaw, mas permite a passagem de strings SQL diretamente, sem a necessidade de usar um template string marcado 
(como $executeRaw). Este método pode ser mais suscetível a ataques de injeção de SQL se você estiver incorporando dinamicamente valores não confiáveis. Portanto, 
ao usar executeRawUnsafe, é importante garantir que você esteja sanitizando e validando corretamente qualquer entrada que esteja sendo incorporada na consulta 
para evitar ataques de injeção de SQL. Exemplo:
  const result = await prisma.$executeRawUnsafe('DELETE FROM users WHERE id = $1', userId);
- Os métodos acima fornecem flexibilidade para casos em que a abstração do Prisma não é suficiente e você precisa executar consultas SQL personalizadas 
diretamente. No entanto, é importante usar esses métodos com responsabilidade e garantir que as consultas sejam seguras contra injeção de SQL.
*/
