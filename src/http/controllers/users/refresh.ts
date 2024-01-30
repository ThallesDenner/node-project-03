import { FastifyReply, FastifyRequest } from 'fastify'

export async function refresh(request: FastifyRequest, response: FastifyReply) {
  // O método jwtVerify com a opção onlyCookie: true procura o refreshToken dentro dos cookies da requisição e se ele existir, verifica se o mesmo é válido.
  // Se o refreshToken não existir ou for inválido, nenhum código abaixo da chamada do método jwtVerify será executado.
  // Caso o refreshToken tenha sido verificado com sucesso, o método jwtVerify disponibiliza as informações do usuário que estão armazenadas no refreshToken a partir de request.user
  await request.jwtVerify({ onlyCookie: true })

  const { role } = request.user

  // O método jwtSign cria um token
  const token = await response.jwtSign(
    { role }, // payload (aqui, colocamos as informações não sensíveis sobre o usuário)
    {
      sign: {
        sub: request.user.sub,
      },
    },
  )

  // O método jwtSign cria um token
  const refreshToken = await response.jwtSign(
    { role }, // payload (aqui, colocamos as informações não sensíveis sobre o usuário)
    {
      sign: {
        sub: request.user.sub,
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
*/
