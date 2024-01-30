import 'dotenv/config'
import { z } from 'zod'

// Esquema Zod que define as regras para as variáveis de ambiente
const envSchema = z.object({
  NODE_ENV: z.enum(['dev', 'test', 'production']).default('dev'),
  PORT: z.coerce.number().default(3333),
  JWT_SECRET: z.string(),
})

// O método safeParse realiza tanto a conversão quanto a validação dos dados de entrada (process.env) conforme o esquema definido (envSchema)
const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  console.error('❌ Invalid environment variables', _env.error.format())

  throw new Error('Invalid environment variables.')
}

export const env = _env.data

/*
Observações:
- A biblioteca dotenv carrega as variáveis de ambiente do arquivo .env (ou .env.test) e as expõe através da variável global process.env

- O método safeParse é uma funcionalidade fornecida pela biblioteca Zod para realizar a validação de dados de acordo com um esquema, sem lançar exceções em caso 
de falha. Isso é útil quando você deseja validar dados, mas prefere tratar os casos de erro de forma explícita, em vez de depender de exceções para lidar com 
validações malsucedidas. O método safeParse retorna um objeto que contém informações sobre o resultado da validação. Esse objeto possui três propriedades 
principais:
  success: Um booleano que indica se a validação foi bem-sucedida (true) ou não (false).
  data: O valor validado. Esta propriedade só está disponível se success for true.
  error: Um objeto que contém informações detalhadas sobre o erro de validação. Esta propriedade só está disponível se success for false.
*/
