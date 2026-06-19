import { startInstance } from './start'
import { getRouter } from './router'

const router = getRouter()

export const app = startInstance({
  router,
})
