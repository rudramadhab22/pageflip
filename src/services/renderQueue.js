import { PAGE_RENDER_CONCURRENCY } from '../lib/constants'

let active = 0
const queue = []

function pump() {
  while (active < PAGE_RENDER_CONCURRENCY && queue.length) {
    const job = queue.shift()
    active += 1
    Promise.resolve()
      .then(job.task)
      .then(job.resolve, job.reject)
      .finally(() => {
        active -= 1
        pump()
      })
  }
}

/**
 * Limit concurrent PDF.js renders so large books stay responsive.
 */
export function enqueueRender(task, { priority = false } = {}) {
  return new Promise((resolve, reject) => {
    const item = { task, resolve, reject }
    if (priority) queue.unshift(item)
    else queue.push(item)
    pump()
  })
}

export function clearRenderQueue() {
  while (queue.length) {
    const item = queue.shift()
    item.reject(new Error('Render cancelled'))
  }
}
