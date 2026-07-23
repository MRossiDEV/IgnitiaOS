// ============================================================================
// PAYMENT TYPES
// Types for Paxum/Paxos payment integration
// ============================================================================

export type PaymentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled"
  | "expired"

export type Currency = "USD" | "EUR" | "GBP" | "CAD" | "AUD"

export type PaymentMethod = "card" | "bank_transfer" | "crypto" | "other"

// ============================================================================
// PAYMENT SESSION
// ============================================================================

export interface PaymentSession {
  id: string
  organizationId: string
  leadId?: string
  reportId?: string
  
  // Payment details
  amount: number
  currency: Currency
  description: string
  
  // Paxos/Paxum specific
  refId: string
  paxosPaymentId?: string
  paymentUrl?: string
  
  // Status
  status: PaymentStatus
  
  // Metadata
  metadata?: Record<string, any>
  errorMessage?: string
  
  // Timestamps
  createdAt: string
  updatedAt: string
  completedAt?: string
  expiresAt: string
}

// ============================================================================
// PAYMENT TRANSACTION
// ============================================================================

export interface PaymentTransaction {
  id: string
  paymentSessionId: string
  
  // Paxos details
  paxosTransactionId: string
  paxosPaymentId: string
  
  // Transaction details
  amount: number
  currency: string
  paymentMethod?: PaymentMethod
  
  // Status
  transactionStatus: string
  
  // Paxos response
  paxosResponse?: Record<string, any>
  
  // Timestamps
  createdAt: string
  updatedAt: string
}

// ============================================================================
// WEBHOOK EVENT
// ============================================================================

export interface WebhookEvent {
  id: string
  eventType: string
  eventId?: string
  
  // Related payment
  paymentSessionId?: string
  refId?: string
  
  // Payload
  payload: Record<string, any>
  
  // Processing
  processed: boolean
  processedAt?: string
  errorMessage?: string
  
  // Timestamps
  receivedAt: string
  createdAt: string
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface CreatePaymentRequest {
  amount: number
  currency: Currency
  description: string
  reportId: string
  leadId: string
}

export interface CreatePaymentResponse {
  paymentSessionId: string
  paymentUrl: string
  refId: string
  expiresAt: string
}

export interface PaymentStatusResponse {
  paymentSessionId: string
  status: PaymentStatus
  amount: number
  currency: Currency
  description: string
  createdAt: string
  completedAt?: string
  errorMessage?: string
}

export interface WebhookPayload {
  event: string
  data: {
    ref_id: string
    payment_amount: number
    status: string
    payment_id?: string
    transaction_id?: string
    error?: string
  }
}

// ============================================================================
// PAXOS API TYPES
// ============================================================================

export interface PaxosTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

export interface PaxosPaymentRequest {
  amount: string
  currency: string
  description: string
  ref_id: string
}

export interface PaxosPaymentResponse {
  id: string
  ref_id: string
  amount: string
  currency: string
  status: string
  payment_url?: string
  created_at: string
}

export interface PaxosPaymentListResponse {
  payments: Array<{
    id: string
    ref_id: string
    payment_amount: string
    payment_status: string
    created_at: string
    updated_at: string
  }>
}

