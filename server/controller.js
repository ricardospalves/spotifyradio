import { Service } from './service.js'
import { logger } from './utils.js'

export class Controller {
  constructor() {
    this.service = new Service()
  }

  async getFileStream(filename) {
    return this.service.getFileStream(filename)
  }

  createClintStream() {
    const { clientStream, id } = this.service.createClintStream()

    const onClose = () => {
      logger.info(`closing connection of ${id}`)
      this.service.deleteClientStream(id)
    }

    return {
      onClose,
      stream: clientStream,
    }
  }
}
