// ======================================================
// Credit Service — the ONLY file that writes to ai_credit_balance
// lib/services/CreditService.ts
// ======================================================
// Singleton balance: an admin-set initial amount minus cumulative
// AI spend. recordUsage() is called from lib/ai/provider.ts — the
// one chokepoint every Claude call in the app goes through — so
// every dollar spent anywhere (report pipeline, automation nodes)
// gets deducted the same way.

import { supabaseAdmin } from "@/lib/supabase/server";

const SINGLETON_ID = "00000000-0000-0000-0000-000000000001";

export interface CreditBalance {
  initialAmount: number;
  consumedAmount: number;
  remaining: number;
  updatedAt: string;
}

function toBalance(row: any): CreditBalance {
  const initialAmount = Number(row.initial_amount);
  const consumedAmount = Number(row.consumed_amount);
  return {
    initialAmount,
    consumedAmount,
    remaining: initialAmount - consumedAmount,
    updatedAt: row.updated_at,
  };
}

export class CreditService {
  static async getBalance(): Promise<CreditBalance> {
    const { data, error } = await supabaseAdmin
      .from("ai_credit_balance")
      .select("*")
      .eq("id", SINGLETON_ID)
      .single();

    if (error || !data) {
      // Migration seeds this row, but tolerate it missing (e.g. a fresh
      // environment) rather than hard-failing every page load.
      const { data: created, error: insertError } = await supabaseAdmin
        .from("ai_credit_balance")
        .insert({ id: SINGLETON_ID, initial_amount: 0, consumed_amount: 0 })
        .select("*")
        .single();

      if (insertError || !created) {
        throw new Error(`Failed to load credit balance: ${error?.message ?? insertError?.message}`);
      }
      return toBalance(created);
    }

    return toBalance(data);
  }

  static async setInitialAmount(amount: number, resetConsumed = false): Promise<CreditBalance> {
    const { data, error } = await supabaseAdmin
      .from("ai_credit_balance")
      .update({
        initial_amount: amount,
        ...(resetConsumed ? { consumed_amount: 0 } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq("id", SINGLETON_ID)
      .select("*")
      .single();

    if (error || !data) throw new Error(`Failed to set credit balance: ${error?.message}`);
    return toBalance(data);
  }

  /** Deducts a cost (USD-equivalent) from the balance. Never throws — a
   *  tracking failure must not break the AI call that triggered it. */
  static async recordUsage(costUsd: number): Promise<void> {
    if (!costUsd || costUsd <= 0) return;
    try {
      const { error } = await supabaseAdmin.rpc("increment_credit_consumption", {
        p_id: SINGLETON_ID,
        p_amount: costUsd,
      });
      if (error) console.error("CreditService.recordUsage failed:", error.message);
    } catch (err) {
      console.error("CreditService.recordUsage failed:", err);
    }
  }
}
