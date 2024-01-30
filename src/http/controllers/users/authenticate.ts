import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { InvalidCredentialsError } from '@/use-cases/errors/invalid-credentials-error'
import { makeAuthenticateUseCase } from '@/use-cases/factories/make-authenticate-use-case'

export async function authenticate(
  request: FastifyRequest,
  response: FastifyReply,
) {
  // Esquema Zod que define as regras para o corpo da requisição de autenticação de usuário
  const authenticateBodySchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  })

  // A função parse realiza tanto a conversão quanto a validação dos dados de entrada (request.body) conforme o esquema definido (authenticateBodySchema)
  const { email, password } = authenticateBodySchema.parse(request.body)

  try {
    const authenticateUseCase = makeAuthenticateUseCase()

    const { user } = await authenticateUseCase.execute({
      email,
      password,
    })

    // O método jwtSign cria um token
    const token = await response.jwtSign(
      {
        role: user.role,
      }, // payload (aqui, colocamos as informações não sensíveis sobre o usuário)
      {
        sign: {
          sub: user.id,
        },
      },
    )

    // O método jwtSign cria um token
    const refreshToken = await response.jwtSign(
      {
        role: user.role,
      }, // payload (aqui, colocamos as informações não sensíveis sobre o usuário)
      {
        sign: {
          sub: user.id,
          expiresIn: '7d', // o token de atualização tem uma duração de 7 dias, portanto, ele irá expirar caso o usuário não entre no sistema durante esse período
        },
      },
    )

    return response
      .setCookie('refreshToken', refreshToken, {
        path: '/', // os cookies podem ser categorizados de acordo com as rotas da aplicação. No caso, qualquer rota da aplicação poderá acessar esse cookie
        secure: true, // o cookie só deve ser enviado em conexões seguras (HTTPS)
        sameSite: true, // o cookie só será enviado se a solicitação estiver no mesmo site que a página
        httpOnly: true, // o cookie só deve ser acessível pelo servidor e não por scripts no navegador. Isso ajuda a proteger contra ataques de XSS (Cross-Site Scripting)
      })
      .status(200)
      .send({
        token,
      }) // O status HTTP 200 indica que a requisição foi bem sucedida
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      return response.status(400).send({ message: error.message }) // o status HTTP 400 indica que o servidor não pode ou não irá processar a requisição devido a alguma coisa que foi entendida como um erro do cliente
    }

    throw error
  }
}

/*
Ao utilizar o método setCookie do Fastify para configurar cookies com a biblioteca @fastify/cookie, você pode passar opções adicionais como um terceiro argumento. 
Essas opções permitem personalizar o comportamento do cookie. Aqui estão algumas das opções comumente utilizadas:
- path: Especifica o caminho no servidor no qual o cookie estará disponível. Por padrão, o cookie estará disponível para todas as rotas. Ao definir um caminho, 
você limita a disponibilidade do cookie a um subconjunto específico do seu aplicativo.
- secure: Um booleano que indica se o cookie só deve ser enviado em conexões seguras (HTTPS). Se configurado como true, o cookie só será enviado em conexões 
seguras, proporcionando uma camada adicional de segurança.
- sameSite: Controla como o cookie é enviado em solicitações cross-site (de outro domínio). Pode ter os valores:
  true: O cookie só será enviado se a solicitação estiver no mesmo site que a página.
  false: Desativa a política same-site.
  'lax': Permite que o cookie seja enviado durante navegação normal (não durante solicitações POST cross-site, por exemplo).
  'strict': O cookie só será enviado em solicitações do mesmo site.
- httpOnly: Um booleano que, se configurado como true, indica que o cookie só deve ser acessível pelo servidor e não por scripts no navegador. Isso ajuda a 
proteger contra ataques de XSS (Cross-Site Scripting).

Vale ressaltar que o comportamento atual é tal que se o usuário fizer login a cada 7 dias, receberá um novo token de atualização válido por mais 7 dias. Isso 
permitirá que o token de acesso seja atualizado a cada 10 minutos indefinidamente, desde que o usuário faça login dentro do prazo de 7 dias.
*/
