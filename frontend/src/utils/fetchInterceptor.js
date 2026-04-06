import API_URL from '../config/apiConfig'

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

export const setupFetchInterceptor = () => {
  const originalFetch = window.fetch

  window.fetch = async (...args) => {
    let [resource, config] = args

    let response = await originalFetch(resource, config)

    if (response.status === 401 && !resource.toString().includes('/api/auth/refresh-token')) {
      const refreshToken = localStorage.getItem('refreshToken')

      if (!refreshToken) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/'
        return response
      }

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            if (config && config.headers) {
              config.headers = {
                ...config.headers,
                Authorization: `Bearer ${token}`,
              }
            } else if (!config) {
              config = { headers: { Authorization: `Bearer ${token}` } }
            }
            return originalFetch(resource, config)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      isRefreshing = true

      try {
        const refreshResponse = await originalFetch(`${API_URL}/api/auth/refresh-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        })

        const data = await refreshResponse.json()

        if (refreshResponse.ok && data.success && data.token) {
          localStorage.setItem('token', data.token)

          if (config && config.headers) {
            const newHeaders = new Headers(config.headers)
            newHeaders.set('Authorization', `Bearer ${data.token}`)
            config.headers = newHeaders
          } else if (!config) {
            config = { headers: { Authorization: `Bearer ${data.token}` } }
          }

          processQueue(null, data.token)

          return await originalFetch(resource, config)
        } else {
          throw new Error('Refresh token invalid')
        }
      } catch (err) {
        processQueue(err, null)
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        window.location.href = '/'
        return response
      } finally {
        isRefreshing = false
      }
    }

    return response
  }
}
