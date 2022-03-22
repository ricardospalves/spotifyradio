import fs from 'fs'
import fsPromisses from 'fs/promises'
import { join, extname } from 'path'
import config from './config.js'

export class Service {
  createFileStream(filename) {
    return fs.createReadStream(filename)
  }

  async getFileInfo(file) {
    const filepath = join(config.dir.public, file)

    await fsPromisses.access(filepath)

    const fileType = extname(filepath)

    return {
      type: fileType,
      name: filepath,
    }
  }

  async getFileStream(file) {
    const { name, type } = await this.getFileInfo(file)

    return {
      stream: this.createFileStream(name),
      type,
    }
  }
}
