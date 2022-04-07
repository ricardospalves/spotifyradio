import { randomUUID } from 'crypto'
import fs from 'fs'
import fsPromisses from 'fs/promises'
import { join, extname } from 'path'
import { PassThrough, Writable } from 'stream'
import config from './config.js'
import Throttle from 'throttle'
import { ChildProcess } from 'child_process'
import { logger } from './utils.js'
import streamsPromises from 'stream/promises'
import { once } from 'events'

export class Service {
  constructor() {
    this.clientStreams = new Map()
    this.currentSong = config.constants.englishConversation
    this.currentBitRate = 0
    this.throttleTransform = {}
    this.currentReadable = {}

    this.startStreaming()
  }

  broadCast() {
    return new Writable({
      write: (chunk, encoding, callback) => {
        for (const [id, stream] of this.clientStreams) {
          if (stream.writableEnded) {
            this.clientStreams.delete(id)
            continue
          }

          stream.write(chunk)
        }

        callback()
      },
    })
  }

  async startStreaming() {
    logger.info(`starting with ${this.currentSong}`)

    const bitRate = (this.currentBitRate =
      (await this.getBitRate(config.constants.englishConversation)) /
      config.constants.bitRateDivisor)
    const throttleTransform = (this.throttleTransform = new Throttle(bitRate))
    const songReadable = (this.currentReadable = this.createFileStream(
      this.currentSong,
    ))

    streamsPromises.pipeline(songReadable, throttleTransform, this.broadCast())
  }

  _executeSoxCommand(args) {
    return ChildProcess.spawn('sox', args)
  }

  async getBitRate(song) {
    try {
      const args = [
        '--i', // info
        '-B', // bitrate
        song,
      ]

      const {
        stderr, // erro
        stdout, // log
        // stdin, // enviar dados como stream
      } = this._executeSoxCommand(args)

      await Promise.all([once(stderr, 'readable'), once(stdout, 'readable')])

      const [success, error] = [stdout, stderr].map((stream) => stream.read())

      if (error) {
        return await Promise.reject(error)
      }

      return success.toString().trim().replace(/k/, '000')
    } catch (error) {
      logger.info(`Bitrate error: ${error}`)
      return config.constants.fallbackBitRate
    }
  }

  createClintStream() {
    const id = randomUUID()
    const clientStream = new PassThrough()

    this.clientStreams.set(id, clientStream)

    return {
      id,
      clientStream,
    }
  }

  deleteClientStream(id) {
    this.clientStreams.delete(id)
  }

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
