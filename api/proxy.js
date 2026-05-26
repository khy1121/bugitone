const HOP_BY_HOP_REQUEST_HEADERS = new Set([
  'connection',
  'content-length',
  'host',
  'accept-encoding',
])

const HOP_BY_HOP_RESPONSE_HEADERS = new Set([
  'connection',
  'content-encoding',
  'content-length',
  'transfer-encoding',
])

function getTargetBase() {
  const targetBase = process.env.API_PROXY_TARGET?.trim().replace(/\/+$/, '')

  if (!targetBase) {
    throw new Error('API_PROXY_TARGET is not configured')
  }

  return targetBase
}

function getProxyTarget(request) {
  const targetBase = getTargetBase()
  const incomingUrl = new URL(request.url)
  const proxyPath = incomingUrl.searchParams.get('__proxy_path') || ''

  incomingUrl.searchParams.delete('__proxy_path')

  const targetUrl = new URL(`${targetBase}/`)
  const basePath = targetUrl.pathname.replace(/\/+$/, '')
  const normalizedProxyPath = proxyPath.replace(/^\/+/, '')

  targetUrl.pathname = `${basePath}/${normalizedProxyPath}`.replace(/\/+/g, '/')
  targetUrl.search = incomingUrl.searchParams.toString()

  return targetUrl.toString()
}

function getForwardHeaders(headers) {
  return Object.fromEntries(
    Array.from(headers.entries()).filter(
      ([key]) => !HOP_BY_HOP_REQUEST_HEADERS.has(key.toLowerCase())
    )
  )
}

function getResponseHeaders(headers) {
  return Object.fromEntries(
    Array.from(headers.entries()).filter(
      ([key]) => !HOP_BY_HOP_RESPONSE_HEADERS.has(key.toLowerCase())
    )
  )
}

async function getRequestBody(request) {
  if (request.method === 'GET' || request.method === 'HEAD') {
    return undefined
  }

  return request.arrayBuffer()
}

export default {
  async fetch(request) {
    let targetUrl

    try {
      targetUrl = getProxyTarget(request)
    } catch (error) {
      return Response.json({ message: error.message }, { status: 500 })
    }

    try {
      const upstreamResponse = await fetch(targetUrl, {
        method: request.method,
        headers: getForwardHeaders(request.headers),
        body: await getRequestBody(request),
        redirect: 'manual',
      })

      return new Response(await upstreamResponse.arrayBuffer(), {
        status: upstreamResponse.status,
        statusText: upstreamResponse.statusText,
        headers: getResponseHeaders(upstreamResponse.headers),
      })
    } catch {
      return Response.json({ message: 'API proxy request failed' }, { status: 502 })
    }
  },
}
