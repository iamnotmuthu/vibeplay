import { API_BASE } from './constants'

export async function fetchDatasets() {
  const res = await fetch(`${API_BASE}/datasets`)
  if (!res.ok) throw new Error('Failed to fetch datasets')
  return res.json()
}

export async function fetchDatasetPreview(datasetId: string) {
  const res = await fetch(`${API_BASE}/datasets/${datasetId}/preview`)
  if (!res.ok) throw new Error('Failed to fetch preview')
  return res.json()
}

export async function createSession(datasetId: string) {
  const res = await fetch(`${API_BASE}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dataset_id: datasetId }),
  })
  if (!res.ok) throw new Error('Failed to create session')
  return res.json()
}

export function streamSSE(
  url: string,
  onMessage: (data: unknown) => void,
  onComplete?: () => void,
  onError?: (err: Error) => void
): () => void {
  const eventSource = new EventSource(url)

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      onMessage(data)
    } catch {
      onMessage(event.data)
    }
  }

  eventSource.addEventListener('complete', () => {
    eventSource.close()
    onComplete?.()
  })

  eventSource.onerror = (event) => {
    eventSource.close()
    onError?.(new Error(`SSE error: ${event}`))
  }

  return () => eventSource.close()
}

export function connectTrainingWS(
  sessionId: string,
  onMessage: (data: unknown) => void,
  onClose?: () => void
): WebSocket {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const ws = new WebSocket(`${protocol}//${window.location.host}/ws/sessions/${sessionId}/training`)

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      onMessage(data)
    } catch {
      onMessage(event.data)
    }
  }

  ws.onclose = () => onClose?.()

  return ws
}
