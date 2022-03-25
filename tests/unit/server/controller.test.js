import { jest, expect, describe, test, beforeEach } from '@jest/globals'

import TestUtil from '../_util/testUtil'
import { Service } from '../../../server/service'
import { Controller } from '../../../server/controller'

describe('#Controller - test suit for API control', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    jest.clearAllMocks()
  })

  test('getFileStream - should return a file stream', async () => {
    const mockStream = TestUtil.generateReadableStream(['test'])
    const mockType = '.html'
    const mockFilename = 'test.html'

    jest
      .spyOn(Service.prototype, Service.prototype.getFileStream.name)
      .mockResolvedValue({
        stream: mockStream,
        type: mockType,
      })

    const controller = new Controller()
    const { stream, type } = await controller.getFileStream()

    expect(stream).toStrictEqual(mockStream)
    expect(type).toStrictEqual(mockType)
  })
})
