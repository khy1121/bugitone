// 더미 데이터 모드
// VITE_USE_MOCK=true 일 때만 동작하며, 기존 API 코드(src/api/*)는 그대로 둔 채
// axiosInstance의 adapter만 교체해 백엔드 없이 가짜 응답을 돌려줍니다.
// 끄려면 환경변수를 지우거나 false로 두면 됩니다.
import { AxiosError } from 'axios'
import axiosInstance from '../api/axiosInstance'
import { matchRoute, MockError } from './handlers'

export const IS_MOCK_MODE = import.meta.env.VITE_USE_MOCK === 'true'

// 실제 네트워크가 없으므로 인위적인 지연을 두지 않음 (예전 250ms는 매 요청마다 화면 표시를 늦췄음)
const NETWORK_DELAY_MS = 0

function parseBody(data) {
  if (typeof data !== 'string') return data
  try {
    return JSON.parse(data)
  } catch {
    return data
  }
}

function toPath(url = '') {
  const path = url.replace(/^https?:\/\/[^/]+/i, '').split('?')[0]
  return path.replace(/^\/api(?=\/)/, '')
}

function toQuery(config) {
  const query = { ...(config.params ?? {}) }
  const search = `${config.url ?? ''}`.split('?')[1]
  if (search) new URLSearchParams(search).forEach((value, key) => (query[key] = value))
  return query
}

async function mockAdapter(config) {
  const method = (config.method ?? 'get').toLowerCase()
  const path = toPath(config.url)
  const matched = matchRoute(method, path)

  await new Promise((resolve) => setTimeout(resolve, NETWORK_DELAY_MS))

  const respond = (status, body) => ({
    data: body,
    status,
    statusText: status < 400 ? 'OK' : 'ERROR',
    headers: { 'content-type': 'application/json' },
    config,
    request: {},
  })

  const reject = (status, message) => {
    const response = respond(status, {
      isSuccess: false,
      code: `MOCK_${status}`,
      httpStatus: status,
      message,
      data: null,
    })
    throw new AxiosError(message, AxiosError.ERR_BAD_REQUEST, config, {}, response)
  }

  if (!matched) {
    console.warn(`[mock] 정의되지 않은 API: ${method.toUpperCase()} ${path}`)
    return reject(404, '데모 모드에서 지원하지 않는 기능이에요.')
  }

  try {
    const data = await matched.handler({
      params: matched.params,
      query: toQuery(config),
      body: parseBody(config.data),
    })
    const status = method === 'post' ? 201 : 200
    return respond(status, { isSuccess: true, code: 'MOCK_OK', httpStatus: status, message: 'success', data })
  } catch (error) {
    if (error instanceof MockError) return reject(error.status, error.message)
    console.error('[mock] handler error', error)
    return reject(500, '데모 서버에서 오류가 발생했어요.')
  }
}

if (IS_MOCK_MODE) {
  axiosInstance.defaults.adapter = mockAdapter
  console.info('[mock] 더미 데이터 모드로 실행 중입니다. (백엔드 호출 없음)')
}
