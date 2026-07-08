/**
 * Transform functions to convert between database schema and frontend models
 */

import { Lead as DBLead } from './types'
import { Lead as FrontendLead } from '../models/lead'

/**
 * Transform a database lead to frontend lead format
 */
export function transformLeadFromDB(dbLead: DBLead): FrontendLead {
  return {
    id: dbLead.id,
    partnerId: dbLead.partner_id,
    dealId: dbLead.deal_id,
    name: dbLead.name,
    email: dbLead.email,
    phone: dbLead.phone,
    company: dbLead.company,
    website: dbLead.website,
    industry: dbLead.industry,
    message: dbLead.message,
    status: dbLead.status,
    source: dbLead.source,
    priority: dbLead.priority,
    estimatedValue: dbLead.estimated_value,
    actualValue: dbLead.actual_value,
    notes: dbLead.notes,
    createdAt: dbLead.created_at,
    updatedAt: dbLead.updated_at,
    convertedAt: dbLead.converted_at,
    lastContactedAt: dbLead.last_contacted_at,
    nextFollowUpAt: dbLead.next_follow_up_at,
  }
}

/**
 * Transform multiple database leads to frontend format
 */
export function transformLeadsFromDB(dbLeads: DBLead[]): FrontendLead[] {
  return dbLeads.map(transformLeadFromDB)
}

/**
 * Transform a frontend lead to database format (for inserts/updates)
 */
export function transformLeadToDB(frontendLead: Partial<FrontendLead>): Partial<DBLead> {
  const dbLead: Partial<DBLead> = {}
  
  if (frontendLead.id) dbLead.id = frontendLead.id
  if (frontendLead.partnerId) dbLead.partner_id = frontendLead.partnerId
  if (frontendLead.dealId) dbLead.deal_id = frontendLead.dealId
  if (frontendLead.name) dbLead.name = frontendLead.name
  if (frontendLead.email) dbLead.email = frontendLead.email
  if (frontendLead.phone) dbLead.phone = frontendLead.phone
  if (frontendLead.company) dbLead.company = frontendLead.company
  if (frontendLead.website) dbLead.website = frontendLead.website
  if (frontendLead.industry) dbLead.industry = frontendLead.industry
  if (frontendLead.message) dbLead.message = frontendLead.message
  if (frontendLead.status) dbLead.status = frontendLead.status
  if (frontendLead.source) dbLead.source = frontendLead.source
  if (frontendLead.priority) dbLead.priority = frontendLead.priority
  if (frontendLead.estimatedValue !== undefined) dbLead.estimated_value = frontendLead.estimatedValue
  if (frontendLead.actualValue !== undefined) dbLead.actual_value = frontendLead.actualValue
  if (frontendLead.notes) dbLead.notes = frontendLead.notes
  if (frontendLead.createdAt) dbLead.created_at = frontendLead.createdAt
  if (frontendLead.updatedAt) dbLead.updated_at = frontendLead.updatedAt
  if (frontendLead.convertedAt) dbLead.converted_at = frontendLead.convertedAt
  if (frontendLead.lastContactedAt) dbLead.last_contacted_at = frontendLead.lastContactedAt
  if (frontendLead.nextFollowUpAt) dbLead.next_follow_up_at = frontendLead.nextFollowUpAt
  
  return dbLead
}

