"use client"

import Link from "next/link"
import { creditTransactions as mockTransactions } from "@/lib/mock/creditTransactions"
import { partners as mockPartners } from "@/lib/mock/partners"
import { CREDIT_PACKAGES, CreditTransaction } from "@/lib/models/credit"

const typeStyles: Record<string, string> = {
  purchase: "bg-green-100 text-green-700",
  spend: "bg-red-100 text-red-700",
  refund: "bg-cyan-100 text-cyan-700",
  grant: "bg-purple-100 text-purple-700",
  adjustment: "bg-gray-100 text-gray-700",
}

const statusStyles: Record<string, string> = {
  completed: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  failed: "bg-red-100 text-red-700",
  reversed: "bg-zinc-200 text-zinc-600",
}

const formatCategory = (tx: CreditTransaction) => {
  if (!tx.category) return "—"
  return tx.category.replace(/_/g, " ")
}

const formatDate = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function CreditsPage() {
  const sortedTransactions = [...mockTransactions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  const completed = mockTransactions.filter(t => t.status === "completed")
  const totalPurchased = completed
    .filter(t => t.type === "purchase" || t.type === "grant")
    .reduce((acc, t) => acc + t.amount, 0)
  const totalSpent = completed
    .filter(t => t.type === "spend")
    .reduce((acc, t) => acc + Math.abs(t.amount), 0)
  const totalRefunded = completed
    .filter(t => t.type === "refund")
    .reduce((acc, t) => acc + t.amount, 0)
  const pendingCount = mockTransactions.filter(t => t.status === "pending").length

  // Compute current balance per partner (latest balanceAfter)
  const partnerBalances = mockPartners.map(partner => {
    const partnerTxs = sortedTransactions.filter(t => t.partnerId === partner.id)
    const latest = partnerTxs[0]
    const spent = partnerTxs
      .filter(t => t.type === "spend" && t.status === "completed")
      .reduce((acc, t) => acc + Math.abs(t.amount), 0)
    return {
      partner,
      balance: latest?.balanceAfter ?? 0,
      spent,
      transactions: partnerTxs.length,
    }
  })
  const totalBalance = partnerBalances.reduce((acc, p) => acc + p.balance, 0)

  return (
    <div className="space-y-6 w-full min-w-0">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-3xl font-bold">Credits</h1>
        <Link
          href="/admin/credits/grant"
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-center"
        >
          + Grant Credits
        </Link>
      </div>

      {/* STATS SECTION */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-sm text-gray-500">Total Balance</h3>
          <p className="mt-2 text-2xl font-bold">{totalBalance.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-sm text-gray-500">Purchased / Granted</h3>
          <p className="mt-2 text-2xl font-bold text-green-600">+{totalPurchased.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-sm text-gray-500">Spent</h3>
          <p className="mt-2 text-2xl font-bold text-red-600">-{totalSpent.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-sm text-gray-500">Refunded</h3>
          <p className="mt-2 text-2xl font-bold text-cyan-600">+{totalRefunded.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 col-span-2 lg:col-span-1">
          <h3 className="text-sm text-gray-500">Pending</h3>
          <p className="mt-2 text-2xl font-bold">{pendingCount}</p>
          <p className="mt-1 text-xs text-gray-400">{mockTransactions.length} total transactions</p>
        </div>
      </div>

      {/* PARTNER BALANCES + CREDIT PACKAGES */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h2 className="font-semibold">Partner Balances</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-white">
              <tr>
                <th className="text-left p-4">Partner</th>
                <th className="text-left p-4">Balance</th>
                <th className="text-left p-4">Lifetime Spent</th>
                <th className="text-left p-4">Transactions</th>
              </tr>
            </thead>
            <tbody>
              {partnerBalances.map(({ partner, balance, spent, transactions }) => (
                <tr key={partner.id} className="border-t hover:bg-purple-50">
                  <td className="p-4 font-medium">{partner.name}</td>
                  <td className="p-4 font-bold">{balance.toLocaleString()}</td>
                  <td className="p-4 text-red-600">-{spent.toLocaleString()}</td>
                  <td className="p-4">{transactions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h2 className="font-semibold">Credit Packages</h2>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CREDIT_PACKAGES.map(pkg => (
              <div
                key={pkg.id}
                className={`rounded-lg border p-4 ${pkg.popular ? "border-purple-400 bg-purple-50" : "border-gray-200"}`}
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold">{pkg.name}</h3>
                  {pkg.popular && (
                    <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">
                      Popular
                    </span>
                  )}
                </div>
                <p className="mt-2 text-2xl font-bold">${pkg.price}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {pkg.credits.toLocaleString()} credits
                  {pkg.bonusCredits > 0 && (
                    <span className="text-green-600"> +{pkg.bonusCredits.toLocaleString()} bonus</span>
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TRANSACTIONS TABLE */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h2 className="font-semibold">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white">
              <tr>
                <th className="text-left p-4">Date</th>
                <th className="text-left p-4">Partner</th>
                <th className="text-left p-4">Type</th>
                <th className="text-left p-4">Category</th>
                <th className="text-left p-4">Description</th>
                <th className="text-left p-4">Amount</th>
                <th className="text-left p-4">Balance</th>
                <th className="text-left p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedTransactions.map(tx => {
                const partner = mockPartners.find(p => p.id === tx.partnerId)
                const isNegative = tx.amount < 0
                return (
                  <tr key={tx.id} className="border-t hover:bg-purple-50">
                    <td className="p-4 text-zinc-500 whitespace-nowrap">{formatDate(tx.createdAt)}</td>
                    <td className="p-4">{partner?.name || tx.partnerId}</td>
                    <td className="p-4">
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium capitalize ${typeStyles[tx.type]}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="p-4 capitalize text-zinc-600">{formatCategory(tx)}</td>
                    <td className="p-4 max-w-xs">
                      <p>{tx.description}</p>
                      {tx.reference && (
                        <p className="text-xs text-zinc-400 mt-0.5 font-mono">{tx.reference}</p>
                      )}
                    </td>
                    <td className={`p-4 font-bold whitespace-nowrap ${isNegative ? "text-red-600" : "text-green-600"}`}>
                      {isNegative ? "" : "+"}{tx.amount.toLocaleString()}
                    </td>
                    <td className="p-4 font-mono">{tx.balanceAfter.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium capitalize ${statusStyles[tx.status] || "bg-gray-100 text-gray-700"}`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
