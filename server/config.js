import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const currentDirectory = dirname(fileURLToPath(import.meta.url))
const root = join(currentDir, '../')
const audioDirectory = join(root, 'audio')
const publicDirectory = join(root, 'public')

export default {
  port: process.env.PORT || 3000,
  dir: {
    root,
    public: publicDirectory,
    current: currentDirectory,
    audio: audioDirectory,
    songs: join(audioDirectory, 'songs'),
    fx: join(audioDirectory, 'fx'),
  },
  pages: {
    homeHTML: 'home/index.html',
    controllerHTML: 'controller/index.html',
  },
  location: {
    home: '/home',
  },
}
