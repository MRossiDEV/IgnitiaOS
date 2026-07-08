"use client"

import Link from "next/link"
import { marketplaceListings as mockListings } from "@/lib/mock/marketplaceListings"
import { partners as mockPartners } from "@/lib/mock/partners"

const statusStyles: Record<string, string> = {
  available: "bg-green-100 text-green-700",
  reserved: "bg-yellow-100 text-yellow-700",
  sold: "bg-blue-100 text-blue-700",
  expired: "bg-zinc-200 text-zinc-600",
}

const exclusivityStyles: Record<string, string> = {
  exclusive: "bg-purple-100 text-purple-700",
  shared: "bg-gray-100 text-gray-700",
}

const scoreColor = (score: number) => {
  if (score >= 90) return "text-green-600"
  if (score >= 75) return "text-cyan-600"
  if (score >= 60) return "text-yellow-600"
  return "text-red-600"
}

export default function MarketplacePage() {
  const totalListings = mockListings.length
  const availableListings = mockListings.filter(l => l.status === "available").length
  const soldListings = mockListings.filter(l => l.status === "sold")
  const grossVolume = soldListings.reduce((acc, l) => acc + l.price, 0)
  const avgPrice = totalListings > 0
    ? mockListings.reduce((acc, l) => acc + l.price, 0) / totalListings
    : 0
  const totalViews = mockListings.reduce((acc, l) => acc + l.views, 0)

  return (
    <div className="space-y-6 w-full min-w-0">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-3xl font-bold">Lead Marketplace</h1>
        <Link
          href="/admin/marketplace/new"
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-center"
        >
          + List Lead
        </Link>
      </div>

      {/* STATS SECTION */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-sm text-gray-500">Total Listings</h3>
          <p className="mt-2 text-2xl font-bold">{totalListings}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-sm text-gray-500">Available</h3>
          <p className="mt-2 text-2xl font-bold">{availableListings}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-sm text-gray-500">Sold</h3>
          <p className="mt-2 text-2xl font-bold">{soldListings.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-sm text-gray-500">Gross Volume</h3>
          <p className="mt-2 text-2xl font-bold">${grossVolume.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 col-span-2 lg:col-span-1">
          <h3 className="text-sm text-gray-500">Avg Price</h3>
          <p className="mt-2 text-2xl font-bold">${avgPrice.toFixed(0)}</p>
          <p className="mt-1 text-xs text-gray-400">{totalViews.toLocaleString()} total views</p>
        </div>
      </div>

      {/* LISTINGS TABLE */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4">Listing</th>
              <th className="text-left p-4">Industry</th>
              <th className="text-left p-4">Intent</th>
              <th className="text-left p-4">Exclusivity</th>
              <th className="text-left p-4">Score</th>
              <th className="text-left p-4">Est. Budget</th>
              <th className="text-left p-4">Price</th>
              <th className="text-left p-4">Views</th>
              <th className="text-left p-4">Reservations</th>
              <th className="text-left p-4">Listed By</th>
              <th className="text-left p-4">Listed</th>
              <th className="text-left p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {mockListings.map(listing => {
              const partner = mockPartners.find(p => p.id === listing.partnerId)
              return (
                <tr key={listing.id} className="border-t hover:bg-purple-50">
                  <td className="p-4 font-medium">
                    <Link href={`/admin/marketplace/${listing.id}`}>
                      {listing.alias}
                    </Link>
                    <p className="text-xs text-zinc-500">{listing.location}</p>
                  </td>
                  <td className="p-4">{listing.industry}</td>
                  <td className="p-4 capitalize">{listing.intent}</td>
                  <td className="p-4">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium capitalize ${exclusivityStyles[listing.exclusivity]}`}>
                      {listing.exclusivity}
                    </span>
                  </td>
                  <td className={`p-4 font-bold ${scoreColor(listing.leadScore)}`}>
                    {listing.leadScore}
                  </td>
                  <td className="p-4">${listing.estimatedBudget.toLocaleString()}</td>
                  <td className="p-4 font-bold">${listing.price.toLocaleString()}</td>
                  <td className="p-4">{listing.views.toLocaleString()}</td>
                  <td className="p-4">{listing.reservations}</td>
                  <td className="p-4">{partner?.name || listing.partnerId || "—"}</td>
                  <td className="p-4 text-zinc-500">{listing.listedAt}</td>
                  <td className="p-4">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium capitalize ${statusStyles[listing.status] || "bg-gray-100 text-gray-700"}`}>
                      {listing.status}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

    </div>
  )
}
