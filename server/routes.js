import { logger } from './utils.js'
import config from './config.js'
import { Controller } from './controller.js'

const controller = new Controller()

const routes = async (request, response) => {
  const { method, url } = request

  if (method === 'GET' && url === '/') {
    response.writeHead(302, {
      Location: config.location.home,
    })
    return response.end()
  }

  if (method === 'GET' && url === '/home') {
    const { stream } = await controller.getFileStream(config.pages.homeHTML)

    // O padrão do response é text/html
    //
    // response.writeHead({
    //   'Content-Type': 'text/html'
    // })

    return stream.pipe(response)
  }

  if (method === 'GET' && url === '/controller') {
    const { stream } = await controller.getFileStream(
      config.pages.controllerHTML,
    )

    return stream.pipe(response)
  }

  if (method === 'GET' && url.includes('/stream')) {
    const { onClose, stream } = controller.createClintStream()

    request.once('close', onClose)

    response.writeHead(200, {
      'Content-Type': 'audio/mpeg',
      'Accept-Rages': 'bytes',
    })

    return stream.pipe(response)
  }

  // files
  if (method === 'GET') {
    const { stream, type } = await controller.getFileStream(url)
    const contentType = config.constants.CONTENT_TYPE[type]

    if (contentType) {
      response.writeHead(200, {
        'Content-Type': contentType,
      })
    }

    return stream.pipe(response)
  }

  response.writeHead(404)
  return response.end('hello')
}

const handleError = (error, response) => {
  if (error.message.includes('ENOENT')) {
    logger.warn(`asset not found ${error.stack}`)

    response.writeHead(404)
    return response.end()
  }

  logger.error(`caught errro on API ${error.stack}`)
  response.writeHead(500)
  return response.end()
}

export const handler = (request, response) => {
  return routes(request, response).catch((error) => {
    handleError(error, response)
  })
}
