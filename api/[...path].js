export const config = {
  api: {
    bodyParser: false,
  },
}

const HOP_BY_HOP_RESPONSE_HEADERS = new Set([
  'connection',
  'content-encoding',
  'content-length',
  'transfer-encoding',
])

function getProxyTarget(req) {
  const targetBase = process.env.API_PROXY_TARGET?.replace(/\/+$/, '')

  if (!targetBase) {
    throw new Error('API_PROXY_TARGET is not configured')
  }

  const incomingUrl = new URL(req.url, 'http://localhost')
  const apiPath = incomingUrl.pathname.replace(/^\/api/, '') || '/'

  return `${targetBase}${apiPath}${incomingUrl.search}`
}

async function readBody(req) {
  if (req.method === 'GET' || req.method === 'HEAD') {
    return undefined
  }

  const chunks = []

  for await (const chunk of req) {
    chunks.push(chunk)
  }

  return Buffer.concat(chunks)
}

function getForwardHeaders(req) {
  const headers = { ...req.headers }

  delete headers.host
  delete headers.connection
  delete headers['content-length']
  delete headers['accept-encoding']

  return headers
}

export default async function handler(req, res) {
  let targetUrl

  try {
    targetUrl = getProxyTarget(req)
  } catch (error) {
    res.status(500).json({ message: error.message })
    return
  }

  try {
    const upstreamResponse = await fetch(targetUrl, {
      method: req.method,
      headers: getForwardHeaders(req),
      body: await readBody(req),
      redirect: 'manual',
    })

    res.status(upstreamResponse.status)

    upstreamResponse.headers.forEach((value, key) => {
      if (!HOP_BY_HOP_RESPONSE_HEADERS.has(key.toLowerCase())) {
        res.setHeader(key, value)
      }
    })

    const body = Buffer.from(await upstreamResponse.arrayBuffer())
    res.send(body)
  } catch {
    res.status(502).json({ message: 'API proxy request failed' })
  }
}
