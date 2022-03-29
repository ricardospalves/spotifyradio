import { jest, expect, describe, test, beforeEach } from '@jest/globals'

import { handler } from '../../../server/routes.js'
import config from '../../../server/config.js'
import TestUtil from '../_util/testUtil.js'
import { Controller } from '../../../server/controller.js'

describe('#Routes - test site for api response', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
  })

  test('GET / - should redirect to home page', async () => {
    const { request, response } = TestUtil.defaultHandleParams()

    request.method = 'GET'
    request.url = '/'

    await handler(request, response)

    expect(response.writeHead).toBeCalledWith(302, {
      Location: config.location.home,
    })
    expect(response.end).toHaveBeenCalled()
  })

  test(`GET /home - should respond with ${config.pages.homeHTML} file stream`, async () => {
    const { request, response } = TestUtil.defaultHandleParams()
    const mockFileStream = TestUtil.generateWritableStream(['data'])

    request.method = 'GET'
    request.url = '/home'

    jest
      .spyOn(Controller.prototype, Controller.prototype.getFileStream.name)
      .mockResolvedValue({
        stream: mockFileStream,
      })

    jest.spyOn(mockFileStream, 'pipe').mockReturnValue()

    await handler(request, response)

    expect(Controller.prototype.getFileStream).toBeCalledWith(
      config.pages.homeHTML,
    )
    expect(mockFileStream.pipe).toBeCalledWith(response)
  })

  test(`GET /controller - should respond with ${config.pages.controllerHTML} file stream`, async () => {
    const { request, response } = TestUtil.defaultHandleParams()
    const mockFileStream = TestUtil.generateWritableStream(['data'])

    request.method = 'GET'
    request.url = '/controller'

    jest
      .spyOn(Controller.prototype, Controller.prototype.getFileStream.name)
      .mockResolvedValue({
        stream: mockFileStream,
      })

    jest.spyOn(mockFileStream, 'pipe').mockReturnValue()

    await handler(request, response)

    expect(Controller.prototype.getFileStream).toBeCalledWith(
      config.pages.controllerHTML,
    )
    expect(mockFileStream.pipe).toBeCalledWith(response)
  })

  test(`GET /index.html - should respond with file stream`, async () => {
    const url = '/index.html'
    const expectedType = '.html'
    const { request, response } = TestUtil.defaultHandleParams()
    const mockFileStream = TestUtil.generateWritableStream(['data'])

    request.method = 'GET'
    request.url = url

    jest
      .spyOn(Controller.prototype, Controller.prototype.getFileStream.name)
      .mockResolvedValue({
        stream: mockFileStream,
        type: expectedType,
      })

    jest.spyOn(mockFileStream, 'pipe').mockReturnValue()

    await handler(request, response)

    expect(Controller.prototype.getFileStream).toBeCalledWith(url)
    expect(mockFileStream.pipe).toBeCalledWith(response)
    expect(response.writeHead).toBeCalledWith(200, {
      'Content-Type': config.constants.CONTENT_TYPE[expectedType],
    })
  })

  test(`GET /file.ext - should respond with file stream`, async () => {
    const url = '/file.ext'
    const expectedType = '.ext'
    const { request, response } = TestUtil.defaultHandleParams()
    const mockFileStream = TestUtil.generateWritableStream(['data'])

    request.method = 'GET'
    request.url = url

    jest
      .spyOn(Controller.prototype, Controller.prototype.getFileStream.name)
      .mockResolvedValue({
        stream: mockFileStream,
        type: expectedType,
      })

    jest.spyOn(mockFileStream, 'pipe').mockReturnValue()

    await handler(request, response)

    expect(Controller.prototype.getFileStream).toBeCalledWith(url)
    expect(mockFileStream.pipe).toBeCalledWith(response)
    expect(response.writeHead).not.toHaveBeenCalled()
  })

  test('POST /unknown - given an non-existent route, it should respond with 404', async () => {
    const { request, response } = TestUtil.defaultHandleParams()

    request.method = 'POST'
    request.url = '/unknown'

    await handler(request, response)

    expect(response.writeHead).toHaveBeenCalledWith(404)
    expect(response.writeHead).toHaveBeenCalled()
  })

  describe('exceptions', () => {
    test('given an non-existent file, it should respond with 404', async () => {
      const { request, response } = TestUtil.defaultHandleParams()

      request.method = 'GET'
      request.url = '/index.png'
      jest
        .spyOn(Controller.prototype, Controller.prototype.getFileStream.name)
        .mockRejectedValue(
          new Error('Error: ENOENT: no such file or directory'),
        )

      await handler(request, response)

      expect(response.writeHead).toHaveBeenCalledWith(404)
      expect(response.writeHead).toHaveBeenCalled()
    })

    test('given an error, it should respond with 500', async () => {
      const { request, response } = TestUtil.defaultHandleParams()

      request.method = 'GET'
      request.url = '/index.png'
      jest
        .spyOn(Controller.prototype, Controller.prototype.getFileStream.name)
        .mockRejectedValue(new Error('Error'))

      await handler(request, response)

      expect(response.writeHead).toHaveBeenCalledWith(500)
      expect(response.writeHead).toHaveBeenCalled()
    })
  })
})
