"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import {
  Search,
  Globe,
  Zap,
  CheckCircle,
  ExternalLink,
  ArrowRight,
  Download,
  Copy,
  Loader2,
  SortAsc,
  MapPin,
  Signal,
  DollarSign,
  Lock,
  QrCode,
} from "lucide-react"
import { Wallet } from "lucide-react" // Import Wallet icon

// Types
interface Plan {
  id: string
  name: string
  gb: number
  mb: number
  validityDays: number
  price_usdc: number
  price_per_mb_usdc: number
  features: string[]
  activation: "instant" | "manual"
  refund: "prorated" | "none"
  compatibility: string[]
}

interface Provider {
  id: string
  name: string
  logo: string
  reliability: number
  latency: number
}

interface Country {
  countryCode: string
  countryName: string
  flag: string
  region: string
  providers: Provider[]
  plans: Plan[]
  startingPrice: number
  bestFor: string[]
  popularity: number
}

interface PayOnUsageCalculation {
  days: number
  mbPerDay: number
  totalMb: number
  pricePerMb: number
  rawCost: number
  requiredDeposit: number
  bufferAmount: number
}

// Sample data
const regions = [
  { id: "global", name: "Global", icon: "🌍" },
  { id: "europe", name: "Europe", icon: "🇪🇺" },
  { id: "asia", name: "Asia", icon: "🌏" },
  { id: "latam", name: "LATAM", icon: "🌎" },
  { id: "mena", name: "MENA", icon: "🕌" },
  { id: "africa", name: "Africa", icon: "🌍" },
  { id: "north-america", name: "North America", icon: "🇺🇸" },
  { id: "oceania", name: "Oceania", icon: "🇦🇺" },
]

const sampleCountries: Country[] = [
  {
    countryCode: "US",
    countryName: "United States",
    flag: "🇺🇸",
    region: "north-america",
    providers: [
      { id: "att", name: "AT&T", logo: "📶", reliability: 99.9, latency: 12 },
      { id: "verizon", name: "Verizon", logo: "📡", reliability: 99.8, latency: 14 },
    ],
    plans: [
      {
        id: "us-travel-1gb",
        name: "7-day Traveler — 1GB",
        gb: 1,
        mb: 1024,
        validityDays: 7,
        price_usdc: 8.5,
        price_per_mb_usdc: 0.0083,
        features: ["Instant activation", "Prorated refund", "5G ready"],
        activation: "instant",
        refund: "prorated",
        compatibility: ["iOS", "Android"],
      },
      {
        id: "us-business-5gb",
        name: "30-day Business — 5GB",
        gb: 5,
        mb: 5120,
        validityDays: 30,
        price_usdc: 24.99,
        price_per_mb_usdc: 0.0049,
        features: ["Priority network", "Hotspot enabled", "24/7 support"],
        activation: "instant",
        refund: "prorated",
        compatibility: ["iOS", "Android"],
      },
    ],
    startingPrice: 8.5,
    bestFor: ["travel", "business"],
    popularity: 95,
  },
  {
    countryCode: "GB",
    countryName: "United Kingdom",
    flag: "🇬🇧",
    region: "europe",
    providers: [
      { id: "ee", name: "EE", logo: "📶", reliability: 99.7, latency: 15 },
      { id: "vodafone", name: "Vodafone", logo: "📡", reliability: 99.5, latency: 18 },
    ],
    plans: [
      {
        id: "uk-tourist-2gb",
        name: "14-day Tourist — 2GB",
        gb: 2,
        mb: 2048,
        validityDays: 14,
        price_usdc: 12.0,
        price_per_mb_usdc: 0.0059,
        features: ["EU roaming", "Instant activation", "Unlimited calls"],
        activation: "instant",
        refund: "prorated",
        compatibility: ["iOS", "Android"],
      },
    ],
    startingPrice: 12.0,
    bestFor: ["travel", "roaming"],
    popularity: 88,
  },
  {
    countryCode: "JP",
    countryName: "Japan",
    flag: "🇯🇵",
    region: "asia",
    providers: [
      { id: "docomo", name: "NTT Docomo", logo: "📶", reliability: 99.9, latency: 10 },
      { id: "softbank", name: "SoftBank", logo: "📡", reliability: 99.6, latency: 12 },
    ],
    plans: [
      {
        id: "jp-unlimited-7d",
        name: "7-day Unlimited",
        gb: 999,
        mb: 999999,
        validityDays: 7,
        price_usdc: 18.5,
        price_per_mb_usdc: 0.0001,
        features: ["Truly unlimited", "5G speeds", "No throttling"],
        activation: "instant",
        refund: "none",
        compatibility: ["iOS", "Android"],
      },
    ],
    startingPrice: 18.5,
    bestFor: ["travel", "unlimited"],
    popularity: 92,
  },
  {
    countryCode: "DE",
    countryName: "Germany",
    flag: "🇩🇪",
    region: "europe",
    providers: [
      { id: "telekom", name: "Deutsche Telekom", logo: "📶", reliability: 99.8, latency: 13 },
      { id: "vodafone-de", name: "Vodafone DE", logo: "📡", reliability: 99.4, latency: 16 },
    ],
    plans: [
      {
        id: "de-europe-3gb",
        name: "21-day Europe — 3GB",
        gb: 3,
        mb: 3072,
        validityDays: 21,
        price_usdc: 15.75,
        price_per_mb_usdc: 0.0051,
        features: ["EU roaming", "5G ready", "Hotspot enabled"],
        activation: "instant",
        refund: "prorated",
        compatibility: ["iOS", "Android"],
      },
    ],
    startingPrice: 15.75,
    bestFor: ["travel", "business", "roaming"],
    popularity: 85,
  },
  {
    countryCode: "BR",
    countryName: "Brazil",
    flag: "🇧🇷",
    region: "latam",
    providers: [
      { id: "vivo", name: "Vivo", logo: "📶", reliability: 98.9, latency: 22 },
      { id: "tim", name: "TIM", logo: "📡", reliability: 98.5, latency: 25 },
    ],
    plans: [
      {
        id: "br-carnival-4gb",
        name: "30-day Carnival — 4GB",
        gb: 4,
        mb: 4096,
        validityDays: 30,
        price_usdc: 16.99,
        price_per_mb_usdc: 0.0041,
        features: ["Festival optimized", "Social media free", "Music streaming"],
        activation: "instant",
        refund: "prorated",
        compatibility: ["iOS", "Android"],
      },
    ],
    startingPrice: 16.99,
    bestFor: ["travel", "social"],
    popularity: 78,
  },
  {
    countryCode: "AE",
    countryName: "United Arab Emirates",
    flag: "🇦🇪",
    region: "mena",
    providers: [
      { id: "etisalat", name: "Etisalat", logo: "📶", reliability: 99.6, latency: 18 },
      { id: "du", name: "du", logo: "📡", reliability: 99.3, latency: 20 },
    ],
    plans: [
      {
        id: "ae-business-6gb",
        name: "14-day Business — 6GB",
        gb: 6,
        mb: 6144,
        validityDays: 14,
        price_usdc: 22.5,
        price_per_mb_usdc: 0.0037,
        features: ["Premium speeds", "Business priority", "VPN friendly"],
        activation: "instant",
        refund: "prorated",
        compatibility: ["iOS", "Android"],
      },
    ],
    startingPrice: 22.5,
    bestFor: ["business", "premium"],
    popularity: 82,
  },
]

export default function BuyDataPage() {
  // State
  const [isDark, setIsDark] = useState(true)
  const [selectedRegion, setSelectedRegion] = useState("global")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [purchaseMode, setPurchaseMode] = useState<"prepaid" | "pay-on-usage">("prepaid")
  const [sortBy, setSortBy] = useState<"price" | "popularity" | "name">("popularity")

  // Pay-on-usage state
  const [payOnUsageDays, setPayOnUsageDays] = useState(14)
  const [mbPerDay, setMbPerDay] = useState(50)

  // Wallet state
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [walletBalance, setWalletBalance] = useState(150.75)
  const [isTransacting, setIsTransacting] = useState(false)
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [transactionHash, setTransactionHash] = useState("")

  // Effects
  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark")
    setIsDark(isDarkMode)
  }, [])

  // Filtered and sorted countries
  const filteredCountries = useMemo(() => {
    const filtered = sampleCountries.filter((country) => {
      const matchesRegion = selectedRegion === "global" || country.region === selectedRegion
      const matchesSearch =
        searchQuery === "" ||
        country.countryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        country.providers.some((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchesRegion && matchesSearch
    })

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price":
          return a.startingPrice - b.startingPrice
        case "name":
          return a.countryName.localeCompare(b.countryName)
        case "popularity":
        default:
          return b.popularity - a.popularity
      }
    })

    return filtered
  }, [selectedRegion, searchQuery, sortBy])

  // Pay-on-usage calculation
  const payOnUsageCalculation = useMemo((): PayOnUsageCalculation => {
    if (!selectedPlan) {
      return {
        days: payOnUsageDays,
        mbPerDay: mbPerDay,
        totalMb: payOnUsageDays * mbPerDay,
        pricePerMb: 0,
        rawCost: 0,
        requiredDeposit: 0,
        bufferAmount: 0,
      }
    }

    const totalMb = payOnUsageDays * mbPerDay
    const pricePerMb = selectedPlan.price_per_mb_usdc
    const rawCost = totalMb * pricePerMb
    const requiredDeposit = rawCost / 0.85 // 85% consumption rule
    const bufferAmount = requiredDeposit - rawCost

    return {
      days: payOnUsageDays,
      mbPerDay: mbPerDay,
      totalMb,
      pricePerMb,
      rawCost,
      requiredDeposit,
      bufferAmount,
    }
  }, [selectedPlan, payOnUsageDays, mbPerDay])

  // Handlers
  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country)
    setSelectedPlan(null)
  }

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan)
    // Set reasonable defaults for pay-on-usage based on plan
    const suggestedMbPerDay = Math.max(10, Math.min(200, plan.mb / plan.validityDays))
    setMbPerDay(Math.round(suggestedMbPerDay))
  }

  const handleConnectWallet = () => {
    setIsWalletConnected(true)
  }

  const handlePurchase = async () => {
    setIsTransacting(true)
    setShowTransactionModal(true)

    // Simulate transaction
    await new Promise((resolve) => setTimeout(resolve, 3000))

    const txHash = `0x${Math.random().toString(16).slice(2, 42)}`
    setTransactionHash(txHash)
    setIsTransacting(false)
    setShowTransactionModal(false)
    setShowReceiptModal(true)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div
      className={`min-h-screen ${isDark ? "bg-slate-950" : "bg-gradient-to-br from-slate-50 via-white to-slate-100"}`}
    >
      {/* Header */}
      <div
        className={`border-b ${isDark ? "border-slate-800" : "border-slate-200"} bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-40`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm">
            <span className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>Home</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
            <span className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>App</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
            <span className={`font-medium ${isDark ? "text-white" : "text-slate-900"}`}>Buy Data</span>
          </div>
          <h1 className={`text-3xl font-bold mt-2 ${isDark ? "text-white" : "text-slate-900"}`}>
            Buy Data — Simple. Predictable. Global.
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          {/* Left Column - Region/Country Browser (60%) */}
          <div className="xl:col-span-3 space-y-6">
            {/* Region Chips */}
            <div className="flex flex-wrap gap-2">
              {regions.map((region) => (
                <Button
                  key={region.id}
                  variant={selectedRegion === region.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedRegion(region.id)}
                  className={`${
                    selectedRegion === region.id
                      ? "bg-blue-600 text-white"
                      : isDark
                        ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                        : "border-slate-300 text-slate-700 hover:bg-slate-100"
                  } rounded-full`}
                >
                  <span className="mr-2">{region.icon}</span>
                  {region.name}
                </Button>
              ))}
            </div>

            {/* Search and Sort */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Find country or carrier"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortBy(sortBy === "price" ? "popularity" : "price")}
                  className={`${isDark ? "border-slate-700 text-slate-300" : "border-slate-300 text-slate-700"}`}
                >
                  <SortAsc className="w-4 h-4 mr-2" />
                  {sortBy === "price" ? "Price" : "Popular"}
                </Button>
              </div>
            </div>

            {/* Country Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCountries.map((country) => (
                <Card
                  key={country.countryCode}
                  className={`cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${
                    selectedCountry?.countryCode === country.countryCode
                      ? isDark
                        ? "bg-blue-900/20 border-blue-700"
                        : "bg-blue-50 border-blue-200"
                      : isDark
                        ? "bg-slate-800/50 border-slate-700 hover:bg-slate-800"
                        : "bg-white border-slate-200 hover:bg-slate-50"
                  }`}
                  onClick={() => handleCountrySelect(country)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{country.flag}</span>
                        <div>
                          <h3 className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                            {country.countryName}
                          </h3>
                          <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                            From {country.startingPrice} USDC / 1 GB
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {country.popularity}% popular
                      </Badge>
                    </div>

                    {/* Provider Icons */}
                    <div className="flex items-center gap-2 mb-3">
                      {country.providers.slice(0, 3).map((provider) => (
                        <div
                          key={provider.id}
                          className={`w-6 h-6 rounded-full ${isDark ? "bg-slate-700" : "bg-slate-100"} flex items-center justify-center text-xs`}
                          title={provider.name}
                        >
                          {provider.logo}
                        </div>
                      ))}
                      {country.providers.length > 3 && (
                        <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                          +{country.providers.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Quick Stats */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Signal className="w-3 h-3 text-green-500" />
                          <span className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>
                            {Math.max(...country.providers.map((p) => p.reliability))}%
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Zap className="w-3 h-3 text-blue-500" />
                          <span className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>
                            {Math.min(...country.providers.map((p) => p.latency))}ms
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {country.bestFor.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      className="w-full mt-3"
                      variant={selectedCountry?.countryCode === country.countryCode ? "default" : "outline"}
                    >
                      View Plans
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredCountries.length === 0 && (
              <div className="text-center py-12">
                <Globe className={`w-12 h-12 mx-auto mb-4 ${isDark ? "text-slate-600" : "text-slate-400"}`} />
                <h3 className={`text-lg font-medium mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                  No countries found
                </h3>
                <p className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  Try adjusting your search or region filter
                </p>
              </div>
            )}

            <p className={`text-sm ${isDark ? "text-slate-500" : "text-slate-500"} text-center`}>
              Tap a country to explore plans. Select region to compare.
            </p>
          </div>

          {/* Right Column - Purchase Panel (40%) */}
          <div className="xl:col-span-2">
            <div className="sticky top-24">
              {!selectedCountry ? (
                <Card className={`${isDark ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-200"}`}>
                  <CardContent className="p-8 text-center">
                    <MapPin className={`w-12 h-12 mx-auto mb-4 ${isDark ? "text-slate-600" : "text-slate-400"}`} />
                    <h3 className={`text-lg font-medium mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                      Select a country
                    </h3>
                    <p className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>
                      Choose a country from the left to view available plans
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Card className={`${isDark ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-200"}`}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{selectedCountry.flag}</span>
                      <div>
                        <CardTitle className={`${isDark ? "text-white" : "text-slate-900"}`}>
                          {selectedCountry.countryName}
                        </CardTitle>
                        <div className="flex gap-2 mt-1">
                          {selectedCountry.providers.map((provider) => (
                            <Badge key={provider.id} variant="outline" className="text-xs">
                              {provider.logo} {provider.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Plan List */}
                    <div className="space-y-3">
                      {selectedCountry.plans.map((plan) => (
                        <div
                          key={plan.id}
                          className={`p-4 rounded-xl border cursor-pointer transition-colors ${
                            selectedPlan?.id === plan.id
                              ? isDark
                                ? "bg-blue-900/20 border-blue-700"
                                : "bg-blue-50 border-blue-200"
                              : isDark
                                ? "bg-slate-700/50 border-slate-600 hover:bg-slate-700"
                                : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                          }`}
                          onClick={() => handlePlanSelect(plan)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{plan.name}</h4>
                            <div className="text-right">
                              <div className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                                {plan.price_usdc} USDC
                              </div>
                              <div className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                                {plan.validityDays} days
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1 text-xs">
                            {plan.features.slice(0, 3).map((feature, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                <span className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>{feature}</span>
                              </div>
                            ))}
                          </div>

                          <Button
                            size="sm"
                            className="w-full mt-3"
                            variant={selectedPlan?.id === plan.id ? "default" : "outline"}
                          >
                            Choose
                          </Button>
                        </div>
                      ))}
                    </div>

                    {/* Purchase Options */}
                    {selectedPlan && (
                      <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <Tabs
                          value={purchaseMode}
                          onValueChange={(value) => setPurchaseMode(value as "prepaid" | "pay-on-usage")}
                        >
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="prepaid">Prepaid</TabsTrigger>
                            <TabsTrigger value="pay-on-usage">Pay-on-Usage</TabsTrigger>
                          </TabsList>

                          <TabsContent value="prepaid" className="space-y-4">
                            <div className="text-center py-4">
                              <h3 className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                                Prepaid. One payment. Zero surprises.
                              </h3>
                              <div className={`text-2xl font-bold mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>
                                {selectedPlan.price_usdc} USDC
                              </div>
                              <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                                {selectedPlan.gb}GB • {selectedPlan.validityDays} days • Instant activation
                              </p>
                            </div>

                            {!isWalletConnected ? (
                              <Button onClick={handleConnectWallet} className="w-full">
                                <Wallet className="w-4 h-4 mr-2" />
                                Connect Wallet
                              </Button>
                            ) : (
                              <div className="space-y-3">
                                <div className={`p-3 rounded-lg ${isDark ? "bg-slate-700" : "bg-slate-100"}`}>
                                  <div className="flex justify-between text-sm">
                                    <span className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>
                                      Wallet Balance:
                                    </span>
                                    <span className={`font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
                                      {walletBalance} USDC
                                    </span>
                                  </div>
                                </div>
                                <Button
                                  onClick={handlePurchase}
                                  className="w-full"
                                  disabled={walletBalance < selectedPlan.price_usdc}
                                >
                                  <DollarSign className="w-4 h-4 mr-2" />
                                  Buy Prepaid (USDC)
                                </Button>
                                {walletBalance < selectedPlan.price_usdc && (
                                  <p className="text-sm text-red-500 text-center">
                                    Insufficient balance. Need {(selectedPlan.price_usdc - walletBalance).toFixed(2)}{" "}
                                    more USDC
                                  </p>
                                )}
                              </div>
                            )}
                          </TabsContent>

                          <TabsContent value="pay-on-usage" className="space-y-4">
                            <div className="text-center py-2">
                              <h3 className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                                Pay only for what you use. With a safety buffer.
                              </h3>
                            </div>

                            {/* Usage Calculator */}
                            <div className="space-y-4">
                              <div>
                                <label
                                  className={`text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-700"} mb-2 block`}
                                >
                                  Days active
                                </label>
                                <div className="space-y-2">
                                  <input
                                    type="range"
                                    min="1"
                                    max="90"
                                    value={payOnUsageDays}
                                    onChange={(e) => setPayOnUsageDays(Number(e.target.value))}
                                    className="w-full"
                                  />
                                  <div className="flex justify-between text-xs text-slate-500">
                                    <span>1 day</span>
                                    <span className={`font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
                                      {payOnUsageDays} days
                                    </span>
                                    <span>90 days</span>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <label
                                  className={`text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-700"} mb-2 block`}
                                >
                                  Est. MB / day
                                </label>
                                <Input
                                  type="number"
                                  value={mbPerDay}
                                  onChange={(e) => setMbPerDay(Number(e.target.value) || 0)}
                                  min="1"
                                  max="1000"
                                  className="text-center"
                                />
                              </div>

                              {/* Calculation Breakdown */}
                              <div className={`p-4 rounded-xl ${isDark ? "bg-slate-700" : "bg-slate-100"} space-y-2`}>
                                <h4 className={`font-semibold ${isDark ? "text-white" : "text-slate-900"} mb-3`}>
                                  Deposit required
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>Days:</span>
                                    <span className={`${isDark ? "text-white" : "text-slate-900"}`}>
                                      {payOnUsageCalculation.days}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>
                                      Expected usage:
                                    </span>
                                    <span className={`${isDark ? "text-white" : "text-slate-900"}`}>
                                      {payOnUsageCalculation.mbPerDay} MB/day → {payOnUsageCalculation.totalMb} MB total
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>
                                      Price per MB:
                                    </span>
                                    <span className={`${isDark ? "text-white" : "text-slate-900"}`}>
                                      {payOnUsageCalculation.pricePerMb.toFixed(4)} USDC
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>Raw cost:</span>
                                    <span className={`${isDark ? "text-white" : "text-slate-900"}`}>
                                      {payOnUsageCalculation.rawCost.toFixed(2)} USDC
                                    </span>
                                  </div>
                                  <div className="border-t border-slate-300 dark:border-slate-600 pt-2">
                                    <div className="flex justify-between font-semibold">
                                      <span className={`${isDark ? "text-white" : "text-slate-900"}`}>
                                        Required deposit (85% consumption buffer):
                                      </span>
                                      <span className={`text-blue-600 dark:text-blue-400`}>
                                        {payOnUsageCalculation.requiredDeposit.toFixed(2)} USDC
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-500"} mt-3`}>
                                  We require a 15% buffer. Only 85% of your deposit will be used for billing. Unused
                                  funds are refunded on-chain after the billing cycle.
                                </p>
                              </div>

                              {!isWalletConnected ? (
                                <Button onClick={handleConnectWallet} className="w-full">
                                  <Wallet className="w-4 h-4 mr-2" />
                                  Connect Wallet
                                </Button>
                              ) : (
                                <div className="space-y-3">
                                  <div className={`p-3 rounded-lg ${isDark ? "bg-slate-700" : "bg-slate-100"}`}>
                                    <div className="flex justify-between text-sm">
                                      <span className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>
                                        Wallet Balance:
                                      </span>
                                      <span className={`font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
                                        {walletBalance} USDC
                                      </span>
                                    </div>
                                  </div>
                                  <Button
                                    onClick={handlePurchase}
                                    className="w-full"
                                    disabled={walletBalance < payOnUsageCalculation.requiredDeposit}
                                  >
                                    <Lock className="w-4 h-4 mr-2" />
                                    Deposit & Activate
                                  </Button>
                                  {walletBalance < payOnUsageCalculation.requiredDeposit && (
                                    <p className="text-sm text-red-500 text-center">
                                      Insufficient balance. Need{" "}
                                      {(payOnUsageCalculation.requiredDeposit - walletBalance).toFixed(2)} more USDC
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Modal */}
      <Dialog open={showTransactionModal} onOpenChange={setShowTransactionModal}>
        <DialogContent className={`${isDark ? "bg-slate-900 border-slate-800" : "bg-white"} rounded-2xl max-w-md`}>
          <DialogHeader>
            <DialogTitle className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
              Authorize capped withdrawal
            </DialogTitle>
            <DialogDescription className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>
              You approve a capped withdrawal for postpaid usage. Withdrawals only occur after invoice confirmation and
              dispute window.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div
              className={`p-4 rounded-xl ${isDark ? "bg-slate-800" : "bg-slate-50"} border ${isDark ? "border-slate-700" : "border-slate-200"}`}
            >
              <div className="flex items-center justify-center mb-4">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
              <div className="text-center">
                <p className={`font-medium ${isDark ? "text-white" : "text-slate-900"}`}>Processing transaction...</p>
                <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"} mt-1`}>
                  Please confirm in your wallet
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipt Modal */}
      <Dialog open={showReceiptModal} onOpenChange={setShowReceiptModal}>
        <DialogContent className={`${isDark ? "bg-slate-900 border-slate-800" : "bg-white"} rounded-2xl max-w-md`}>
          <DialogHeader>
            <DialogTitle className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
              Purchase Complete
            </DialogTitle>
            <DialogDescription className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>
              Your eSIM plan has been activated successfully
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
              <h3 className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                Activation Successful
              </h3>
            </div>

            <div
              className={`p-4 rounded-xl ${isDark ? "bg-slate-800" : "bg-slate-50"} border ${isDark ? "border-slate-700" : "border-slate-200"}`}
            >
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>Plan:</span>
                  <span className={`${isDark ? "text-white" : "text-slate-900"}`}>{selectedPlan?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>Country:</span>
                  <span className={`${isDark ? "text-white" : "text-slate-900"}`}>{selectedCountry?.countryName}</span>
                </div>
                <div className="flex justify-between">
                  <span className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>Amount:</span>
                  <span className={`${isDark ? "text-white" : "text-slate-900"}`}>
                    {purchaseMode === "prepaid"
                      ? `${selectedPlan?.price_usdc} USDC`
                      : `${payOnUsageCalculation.requiredDeposit.toFixed(2)} USDC`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>Transaction:</span>
                  <div className="flex items-center gap-2">
                    <code className={`text-xs ${isDark ? "text-white" : "text-slate-900"}`}>
                      {transactionHash.slice(0, 10)}...{transactionHash.slice(-8)}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(transactionHash)}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 bg-transparent">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent">
                <ExternalLink className="w-4 h-4 mr-2" />
                View on Explorer
              </Button>
            </div>

            <div className="text-center">
              <QrCode className={`w-12 h-12 mx-auto mb-2 ${isDark ? "text-slate-400" : "text-slate-500"}`} />
              <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                Scan QR code to activate on your device
              </p>
            </div>

            <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-500"} text-center`}>
              By depositing, you authorize capped on-chain withdrawal for billed usage. Dispute window: 24–48 hrs.
              Unused funds returned.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
