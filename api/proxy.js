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

const TARGET_ENV_NAMES = {
  api: 'API_PROXY_TARGET',
  uploads: 'UPLOADS_PROXY_TARGET',
}

function getTargetBase(proxyTarget = 'api') {
  const envName = TARGET_ENV_NAMES[proxyTarget]

  if (!envName) {
    throw new Error('Invalid proxy target')
  }

  const targetBase = process.env[envName]?.trim().replace(/\/+$/, '')

  if (!targetBase) {
    throw new Error(`${envName} is not configured`)
  }

  return targetBase
}

function getAllowedAbsoluteTarget(proxyUrl, targetBase) {
  const targetBaseUrl = new URL(`${targetBase}/`)
  let targetUrl

  try {
    targetUrl = new URL(proxyUrl)
  } catch {
    throw new Error('Invalid proxy URL')
  }

  if (!['http:', 'https:'].includes(targetUrl.protocol)) {
    throw new Error('Invalid proxy URL protocol')
  }

  if (targetUrl.origin !== targetBaseUrl.origin) {
    throw new Error('Proxy URL is not allowed')
  }

  return targetUrl.toString()
}

function getProxyTarget(request) {
  const incomingUrl = new URL(request.url)
  const proxyTarget = incomingUrl.searchParams.get('__proxy_target') || 'api'
  const targetBase = getTargetBase(proxyTarget)
  const proxyUrl = incomingUrl.searchParams.get('__proxy_url')

  if (proxyUrl) {
    return getAllowedAbsoluteTarget(proxyUrl, targetBase)
  }

  const proxyPath = incomingUrl.searchParams.get('__proxy_path') || ''

  incomingUrl.searchParams.delete('__proxy_path')
  incomingUrl.searchParams.delete('__proxy_target')

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
