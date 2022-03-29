import fs from 'fs'
import fsPromisses from 'fs/promises'
import { jest, expect, describe, test, beforeEach } from '@jest/globals'

import TestUtil from '../_util/testUtil.js'
import { Service } from '../../../server/service.js'
import config from '../../../server/config.js'

describe('#Service - test suite for service calls', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    jest.clearAllMocks()
  })

  test('createFileStream - should return a file stream', () => {
    const readableStream = TestUtil.generateReadableStream('[test]')

    jest.spyOn(fs, fs.createReadStream.name).mockReturnValue(readableStream)

    const service = new Service()
    const file = 'file.mp3'
    const result = service.createFileStream(file)

    expect(result).toStrictEqual(readableStream)
    expect(fs.createReadStream).toHaveBeenCalledWith(file)
  })

  test('getFileInfo - should return a file stream informations', async () => {
    jest.spyOn(fsPromisses, fsPromisses.access.name).mockResolvedValue()

    const currentSound = 'sound.mp3'
    const service = new Service()
    const result = await service.getFileInfo(currentSound)
    const expectedResult = {
      type: '.mp3',
      name: `${config.dir.public}/${currentSound}`,
    }

    expect(result).toStrictEqual(expectedResult)
  })

  test('getFileStream - should return a file stream object', async () => {
    const readableStream = TestUtil.generateReadableStream(['test'])
    const sound = 'sound.mp3'
    const soundFullPath = `${config.dir.public}/${sound}`
    const fileInformations = {
      type: '.mp3',
      name: soundFullPath,
    }
    const service = new Service()

    jest
      .spyOn(service, service.getFileInfo.name)
      .mockResolvedValue(fileInformations)

    jest
      .spyOn(service, service.createFileStream.name)
      .mockReturnValue(readableStream)

    const result = await service.getFileStream(sound)
    const expectedResult = {
      type: fileInformations.type,
      stream: readableStream,
    }

    expect(result).toStrictEqual(expectedResult)
    expect(service.createFileStream).toHaveBeenCalledWith(fileInformations.name)
    expect(service.getFileInfo).toHaveBeenCalledWith(sound)
  })
})
