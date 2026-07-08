type PayPalMode = 'sandbox' | 'live'

type PayPalLink = {
  href: string
  rel: string
  method?: string
}

type PayPalOrderResponse = {
  id: string
  status: string
  links?: PayPalLink[]
  purchase_units?: Array<{
    custom_id?: string
  }>
}

function getPayPalMode(): PayPalMode {
  return process.env.PAYPAL_MODE === 'live' ? 'live' : 'sandbox'
}

function getPayPalBaseUrl(): string {
  return getPayPalMode() === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'
}

function assertPayPalCredentials() {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('Missing PayPal credentials. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET.')
  }

  return { clientId, clientSecret }
}

export async function getPayPalAccessToken(): Promise<string> {
  const { clientId, clientSecret } = assertPayPalCredentials()
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const response = await fetch(`${getPayPalBaseUrl()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`PayPal auth failed (${response.status}): ${errorText}`)
  }

  const data = (await response.json()) as { access_token: string }

  if (!data.access_token) {
    throw new Error('PayPal auth response did not include access_token.')
  }

  return data.access_token
}

async function callPayPal<T>(
  path: string,
  init: RequestInit,
  accessToken?: string
): Promise<T> {
  const token = accessToken ?? (await getPayPalAccessToken())

  const response = await fetch(`${getPayPalBaseUrl()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
    cache: 'no-store',
  })

  const responseText = await response.text()

  if (!response.ok) {
    throw new Error(`PayPal API failed (${response.status}): ${responseText}`)
  }

  return JSON.parse(responseText) as T
}

export async function createPayPalOrder(input: {
  amount: number
  currency: string
  email: string
  paymentSessionId: string
  description: string
  returnUrl: string
  cancelUrl: string
}) {
  const currencyCode = input.currency.toUpperCase()
  const amountValue = input.amount.toFixed(2)

  const order = await callPayPal<PayPalOrderResponse>('/v2/checkout/orders', {
    method: 'POST',
    body: JSON.stringify({
      intent: 'CAPTURE',
      payer: {
        email_address: input.email,
      },
      purchase_units: [
        {
          reference_id: input.paymentSessionId,
          custom_id: input.paymentSessionId,
          description: input.description,
          amount: {
            currency_code: currencyCode,
            value: amountValue,
          },
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            user_action: 'PAY_NOW',
            shipping_preference: 'NO_SHIPPING',
            return_url: input.returnUrl,
            cancel_url: input.cancelUrl,
          },
        },
      },
    }),
  })

  const approvalUrl = order.links?.find((link) => link.rel === 'approve')?.href

  if (!approvalUrl) {
    throw new Error('PayPal order created but no approval URL was returned.')
  }

  return {
    orderId: order.id,
    status: order.status,
    approvalUrl,
  }
}

export async function capturePayPalOrder(orderId: string) {
  return callPayPal<PayPalOrderResponse>(`/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    body: JSON.stringify({}),
  })
}

export async function verifyPayPalWebhookSignature(input: {
  rawBody: string
  event: Record<string, unknown>
  transmissionId: string
  transmissionTime: string
  transmissionSig: string
  certUrl: string
  authAlgo: string
}) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID

  if (!webhookId) {
    throw new Error('Missing PAYPAL_WEBHOOK_ID for webhook verification.')
  }

  const verification = await callPayPal<{ verification_status: string }>(
    '/v1/notifications/verify-webhook-signature',
    {
      method: 'POST',
      body: JSON.stringify({
        transmission_id: input.transmissionId,
        transmission_time: input.transmissionTime,
        cert_url: input.certUrl,
        auth_algo: input.authAlgo,
        transmission_sig: input.transmissionSig,
        webhook_id: webhookId,
        webhook_event: input.event,
      }),
    }
  )

  return verification.verification_status === 'SUCCESS'
}

export function getPayPalEventType(event: unknown): string | undefined {
  if (!event || typeof event !== 'object') return undefined
  const value = (event as Record<string, unknown>).event_type
  return typeof value === 'string' ? value : undefined
}

export function getPayPalCustomIdFromEvent(event: unknown): string | undefined {
  if (!event || typeof event !== 'object') return undefined

  const resource = (event as Record<string, unknown>).resource
  if (!resource || typeof resource !== 'object') return undefined

  const customId = (resource as Record<string, unknown>).custom_id
  if (typeof customId === 'string' && customId.length > 0) return customId

  return undefined
}

export function getPayPalOrderIdFromEvent(event: unknown): string | undefined {
  if (!event || typeof event !== 'object') return undefined

  const resource = (event as Record<string, unknown>).resource
  if (!resource || typeof resource !== 'object') return undefined

  const relatedIds = ((resource as Record<string, unknown>).supplementary_data as Record<string, unknown> | undefined)
    ?.related_ids as Record<string, unknown> | undefined

  const orderId = relatedIds?.order_id
  if (typeof orderId === 'string' && orderId.length > 0) return orderId

  return undefined
}
