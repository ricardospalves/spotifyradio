import { Service } from './service.js'
import { logger } from './utils.js'

export class Controller {
  constructor() {
    this.service = new Service()
  }

  async getFileStream(filename) {
    return this.service.getFileStream(filename)
  }

  async handleCommand({ command }) {
    logger.info(`command  received: ${command}`)

    const cmd = command.toLowerCase()
    const result = {
      result: 'ok',
    }

    if (cmd.includes('start')) {
      await this.service.startStreaming()

      return result
    }

    if (cmd.includes('stop')) {
      this.service.stopStreaming()

      return result
    }
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
