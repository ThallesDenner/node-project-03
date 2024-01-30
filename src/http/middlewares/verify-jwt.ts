import { FastifyReply, FastifyRequest } from 'fastify'

export async function verifyJwt(
  request: FastifyRequest,
  response: FastifyReply,
) {
  try {
    // Quando um cookie é configurado com um caminho (path) que é válido para todo o domínio (ou um caminho raiz, como '/'), ele será enviado automaticamente pelo cliente em todas as requisições para qualquer rota dentro desse domínio.
    // Portanto, o token de atualização é enviado automaticamente pelo cliente como um cookie chamado 'refreshToken'.
    // Assim, ao fazer uma requisição usando o Postman/Insomnia para uma rota autenticada, ela poderá ser acessada normalmente, mesmo que o token de acesso não tenha sido enviado no cabeçalho da requisição (Authorization).
    // Isto ocorre porque o jwtVerify está pegando o refreshToken dos cookies (que foi criado quando realizamos a autenticação).
    // Com a condicional abaixo, ocorrerá um erro se o token de acesso não for enviado no cabeçalho da requisição (Authorization).
    if (!request.headers.authorization) {
      throw new Error()
    }

    // O método jwtVerify procura o token dentro do cabeçalho da requisição (Authorization) e verifica se o mesmo foi gerado pela nossa aplicação (usando a palavra secreta JWT_SECRET).
    // Se o token não existir ou for inválido, nenhum código abaixo da chamada do método jwtVerify será executado.
    // Caso o token tenha sido verificado com sucesso, o método jwtVerify disponibiliza as informações do usuário que estão armazenadas no token a partir de request.user
    await request.jwtVerify()
    // console.log(request.user.sub)
  } catch (error) {
    return response.status(401).send({ message: 'Unauthorized.' }) // o status HTTP 401 indica que a solicitação não foi aceita porque não possui credenciais de autenticação válidas para o recurso
  }
}

/*
Observações:
- request.jwtVerify() também procura o token na propriedade cookies da solicitação decorada. Você deve especificar cookieName. Para mais informações, veja o 
seguinte link: https://github.com/fastify/fastify-jwt
*/
