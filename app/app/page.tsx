"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Moon,
  Sun,
  Smartphone,
  CreditCard,
  Wallet,
  Settings,
  FileText,
  HelpCircle,
  User,
  ChevronRight,
  ExternalLink,
  Play,
  Pause,
  Clock,
  Award,
  Copy,
  ArrowLeft,
  Home,
  Package,
  MessageSquare,
  Send,
  Lock,
  Coins,
  Shield,
  Users,
  Activity,
  CheckCircle,
  Loader2,
  Smile,
  Paperclip,
  Pin,
  VolumeX,
  Archive,
  MoreVertical,
  Check,
  CheckCheck,
  Search,
  ImageIcon,
  File,
  Camera,
  AlertCircle,
  ArrowRight,
  Zap,
  X,
  QrCode,
  Download,
  Eye,
  EyeOff,
  Network,
  Brain,
} from "lucide-react"
import Image from "next/image"
import BuyDataPage from "./buy-data-page"

interface Invoice {
  id: string
  period: string
  usage: number
  amount: number
  status: "Pending" | "Paid" | "Disputed"
  txHash: string
}

interface SBTData {
  id: string
  postpaidEnabled: boolean
  boundDevices: number
}

interface Message {
  id: string
  from: string
  to: string
  content: string
  timestamp: string
  txHash?: string
  encrypted: boolean
  signedBy?: string
  type: "text" | "image" | "file" | "link" | "zk-proof" | "usage-screenshot" | "invoice"
  status: "sending" | "sent" | "delivered" | "read" | "failed"
  reactions?: { emoji: string; users: string[] }[]
  isOwn: boolean
  replyTo?: string
  zkProof?: {
    proofId: string
    region: string
    anchored: boolean
    txHash?: string
    userOpHash?: string
  }
  anchorStatus?: "pending" | "confirmed" | "failed"
  anchorTxHash?: string
}

interface ChatThread {
  id: string
  name: string
  avatar?: string
  lastMessage: string
  timestamp: string
  unreadCount: number
  isOnline: boolean
  lastSeen?: string
  isGroup: boolean
  participants?: string[]
  isPinned: boolean
  isMuted: boolean
  isArchived: boolean
  encrypted: boolean
}

interface DemoPreset {
  id: string
  name: string
  address: string
  ensName?: string
  sbtId?: string
  tokenBalance: number
  stakedAmount: number
  claimableRewards: number
}

interface CarrierOption {
  id: string
  name: string
  logo: string
  bandwidth: number
  dataCost: number
  latency: number
  reliability: number
  recommended: boolean
  monthlyCost: number
}

const demoPresets: DemoPreset[] = [
  {
    id: "alice",
    name: "Alice",
    address: "0x742d35Cc6634C0532925a3b8D55DeF4d1234ABCD",
    ensName: "alice.eth",
    sbtId: "SBT-12345",
    tokenBalance: 1250,
    stakedAmount: 500,
    claimableRewards: 23.45,
  },
  {
    id: "bob",
    name: "Bob",
    address: "0x8f3e2b1a9c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f",
    ensName: "bob.eth",
    sbtId: "SBT-67890",
    tokenBalance: 800,
    stakedAmount: 200,
    claimableRewards: 8.76,
  },
  {
    id: "corp-1",
    name: "Corp-1",
    address: "0x1234567890abcdef1234567890abcdef12345678",
    tokenBalance: 50000,
    stakedAmount: 10000,
    claimableRewards: 123.45,
  },
]

const mockChatThreads: ChatThread[] = [
  {
    id: "1",
    name: "Alice",
    avatar: "/avatars/alice.png",
    lastMessage: "Hey, did you see the new data plan?",
    timestamp: new Date(Date.now() - 60000).toISOString(),
    unreadCount: 2,
    isOnline: true,
    isGroup: false,
    isPinned: true,
    isMuted: false,
    isArchived: false,
    encrypted: true,
  },
  {
    id: "2",
    name: "Bob",
    avatar: "/avatars/bob.png",
    lastMessage: "Yeah, it looks pretty good!",
    timestamp: new Date(Date.now() - 120000).toISOString(),
    unreadCount: 0,
    isOnline: false,
    lastSeen: "5m ago",
    isGroup: false,
    isPinned: false,
    isMuted: false,
    isArchived: false,
    encrypted: true,
  },
  {
    id: "3",
    name: "Corp-1",
    avatar: "/avatars/corp-1.png",
    lastMessage: "Meeting at 3 PM to discuss Q3 results.",
    timestamp: new Date(Date.now() - 180000).toISOString(),
    unreadCount: 1,
    isOnline: false,
    lastSeen: "30m ago",
    isGroup: true,
    isPinned: false,
    isMuted: false,
    isArchived: false,
    encrypted: false,
  },
  {
    id: "4",
    name: "Support",
    avatar: "/avatars/support.png",
    lastMessage: "How can I help you today?",
    timestamp: new Date(Date.now() - 240000).toISOString(),
    unreadCount: 0,
    isOnline: true,
    isGroup: false,
    isPinned: false,
    isMuted: false,
    isArchived: false,
    encrypted: false,
  },
  {
    id: "5",
    name: "Marketing",
    avatar: "/avatars/marketing.png",
    lastMessage: "New campaign launching next week!",
    timestamp: new Date(Date.now() - 300000).toISOString(),
    unreadCount: 0,
    isOnline: false,
    lastSeen: "1h ago",
    isGroup: true,
    isPinned: false,
    isMuted: false,
    isArchived: false,
    encrypted: false,
  },
]

const mockMessages: Message[] = [
  {
    id: "1",
    from: "Alice",
    to: "You",
    content: "Hey, did you see the new data plan?",
    timestamp: new Date(Date.now() - 60000).toISOString(),
    encrypted: true,
    type: "text",
    status: "read",
    isOwn: false,
  },
  {
    id: "2",
    from: "You",
    to: "Alice",
    content: "Yeah, it looks pretty good!",
    timestamp: new Date(Date.now() - 120000).toISOString(),
    encrypted: true,
    type: "text",
    status: "read",
    isOwn: true,
  },
  {
    id: "3",
    from: "Alice",
    to: "You",
    content: "I think I'm going to sign up for it.",
    timestamp: new Date(Date.now() - 180000).toISOString(),
    encrypted: true,
    type: "text",
    status: "delivered",
    isOwn: false,
  },
  {
    id: "4",
    from: "You",
    to: "Alice",
    content: "Me too!",
    timestamp: new Date(Date.now() - 240000).toISOString(),
    encrypted: true,
    type: "text",
    status: "sent",
    isOwn: true,
  },
  {
    id: "5",
    from: "Alice",
    to: "You",
    content: "Great!",
    timestamp: new Date(Date.now() - 300000).toISOString(),
    encrypted: true,
    type: "text",
    status: "sent",
    isOwn: false,
  },
]

const mockInvoices: Invoice[] = [
  {
    id: "INV-2024-001",
    period: "January 2024",
    usage: 1234,
    amount: 21.56,
    status: "Paid",
    txHash: "0x1234567890abcdef1234567890abcdef12345678",
  },
  {
    id: "INV-2024-002",
    period: "February 2024",
    usage: 1567,
    amount: 28.78,
    status: "Pending",
    txHash: "",
  },
  {
    id: "INV-2024-003",
    period: "March 2024",
    usage: 890,
    amount: 16.45,
    status: "Disputed",
    txHash: "0xabcdef1234567890abcdef1234567890abcdef12",
  },
]

export default function GeSIMApp() {
  // Core state
  const [isDark, setIsDark] = useState(true)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [isSmartWallet, setIsSmartWallet] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Wallet state
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("0x1234567890abcdef1234567890abcdef12345678")
  const [ensName, setEnsName] = useState("")
  const [showFullAddress, setShowFullAddress] = useState(false)
  const [showReceiveModal, setShowReceiveModal] = useState(false)
  const [showQRFullscreen, setShowQRFullscreen] = useState(false)

  // SBT state
  const [hasSBT, setHasSBT] = useState(false)
  const [sbtData, setSbtData] = useState<SBTData | null>(null)
  const [isPostpaidEnabled, setIsPostpaidEnabled] = useState(false)

  // Demo state
  const [selectedPreset, setSelectedPreset] = useState("alice")
  const [demoUsageSpeed, setDemoUsageSpeed] = useState(50)
  const [isDemoRunning, setIsDemoRunning] = useState(false)

  // Chat state
  const [chatThreads, setChatThreads] = useState<ChatThread[]>([])
  const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [typingUser, setTypingUser] = useState<string | null>(null)
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const [showZKConsent, setShowZKConsent] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Token and staking state
  const [tokenBalance, setTokenBalance] = useState(1000)
  const [stakedAmount, setStakedAmount] = useState(0)
  const [claimableRewards, setClaimableRewards] = useState(0)
  const [walletBalances, setWalletBalances] = useState({
    usd: 2420,
    gsim: 1000,
    usdc: 150,
    eth: 0.05,
  })
  const [stakingData, setStakingData] = useState({
    gsimStaked: 250,
    usdcStaked: 100,
    totalRewards: 15.67,
    lockPeriod: 90,
    boost: 12,
  })

  // Transaction state
  const [isTransacting, setIsTransacting] = useState(false)
  const [lastTxHash, setLastTxHash] = useState("")

  // UI state
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeSection, setActiveSection] = useState<string>("dashboard")
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [walletActiveTab, setWalletActiveTab] = useState("overview")
  const [baseConnected, setBaseConnected] = useState(true)

  // Usage data
  const [usageData, setUsageData] = useState({
    used: 123,
    threshold: 1000,
    rate: 0.01,
    estimatedDue: 18,
    creditLimit: 500,
    lastPosted: "3m ago",
  })

  // Network data
  const [currentOperator, setCurrentOperator] = useState({
    name: "MNO-A",
    rssi: -72,
    status: "Online",
  })

  // Staking form state
  const [selectedLockPeriod, setSelectedLockPeriod] = useState(90)
  const [stakeAmount, setStakeAmount] = useState("")
  const [stakeToken, setStakeToken] = useState("gsim")
  const [dualStakeRatio, setDualStakeRatio] = useState(50)

  // Send form state
  const [showSendModal, setShowSendModal] = useState(false)
  const [sendToken, setSendToken] = useState("gsim")
  const [sendAmount, setSendAmount] = useState("")
  const [sendAddress, setSendAddress] = useState("")
  const [recentSenders] = useState([
    { address: "0x742d35Cc6634C0532925a3b8D55DeF4d1234ABCD", name: "alice.eth" },
    { address: "0x8f3e2b1a9c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f", name: "bob.eth" },
    { address: "0x1234567890abcdef1234567890abcdef12345678", name: "corp-1" },
  ])

  // Replace networkOptions state with carrier options
  const [carrierOptions] = useState<CarrierOption[]>([
    {
      id: "att",
      name: "AT&T",
      logo: "📶",
      bandwidth: 85,
      dataCost: 0.12,
      latency: 12,
      reliability: 99.9,
      recommended: true,
      monthlyCost: 45,
    },
    {
      id: "deutsche-telekom",
      name: "Deutsche Telekom AG",
      logo: "🇩🇪",
      bandwidth: 78,
      dataCost: 0.08,
      latency: 15,
      reliability: 99.7,
      recommended: false,
      monthlyCost: 38,
    },
    {
      id: "tmobile",
      name: "T-Mobile US Inc",
      logo: "📱",
      bandwidth: 82,
      dataCost: 0.1,
      latency: 14,
      reliability: 99.8,
      recommended: false,
      monthlyCost: 42,
    },
  ])
  const [showCarrierSwitch, setShowCarrierSwitch] = useState(false)
  const [selectedCarrier, setSelectedCarrier] = useState("att")

  // Effects
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark)
  }, [isDark])

  useEffect(() => {
    window.history.replaceState({ from: "app" }, "", "/app")

    const loadingTimer = setTimeout(() => {
      setIsLoading(false)
    }, 800)

    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.from === "landing") {
        router.push("/")
      }
    }

    window.addEventListener("popstate", handlePopState)

    return () => {
      clearTimeout(loadingTimer)
      window.removeEventListener("popstate", handlePopState)
    }
  }, [router])

  useEffect(() => {
    const preset = demoPresets.find((p) => p.id === selectedPreset)
    if (preset && isDemoMode) {
      setIsWalletConnected(true)
      setWalletAddress(preset.address)
      setEnsName(preset.ensName || "")
      setHasSBT(true)
      setSbtData({
        id: preset.sbtId || "SBT-00000",
        postpaidEnabled: true,
        boundDevices: 1,
      })
      setIsPostpaidEnabled(true)
      setTokenBalance(preset.tokenBalance)
      setStakedAmount(preset.stakedAmount)
      setClaimableRewards(preset.claimableRewards)
      setChatThreads(mockChatThreads)
      setMessages(mockMessages)
      if (!selectedThread) {
        setSelectedThread(mockChatThreads[0])
      }
    }
  }, [selectedPreset, isDemoMode, selectedThread])

  useEffect(() => {
    if (isDemoRunning && isDemoMode) {
      const interval = setInterval(() => {
        setUsageData((prev) => ({
          ...prev,
          used: Math.min(prev.used + demoUsageSpeed / 10, prev.threshold),
        }))
      }, 100)
      return () => clearInterval(interval)
    }
  }, [isDemoRunning, demoUsageSpeed, isDemoMode])

  useEffect(() => {
    if (selectedThread && isDemoMode && activeSection === "messages") {
      const typingInterval = setInterval(() => {
        if (Math.random() > 0.8) {
          setTypingUser(selectedThread.name)
          setTimeout(() => setTypingUser(null), 2000)
        }
      }, 5000)
      return () => clearInterval(typingInterval)
    }
  }, [selectedThread, isDemoMode, activeSection])

  useEffect(() => {
    const section = searchParams.get("section") || "dashboard"
    const modal = searchParams.get("modal")
    const demo = searchParams.get("demo")

    setActiveSection(section)
    if (modal) setActiveModal(modal)
    if (demo === "true") setIsDemoMode(true)

    if (section !== "dashboard") {
      setTimeout(() => {
        const element = document.getElementById(`section-${section}`)
        if (element) {
          element.scrollIntoView({ behavior: "smooth" })
        }
      }, 1000)
    }
  }, [searchParams])

  // Helper functions
  const toggleTheme = () => setIsDark(!isDark)
  const toggleDemoMode = () => setIsDemoMode(!isDemoMode)
  const toggleSmartWallet = () => setIsSmartWallet(!isSmartWallet)

  const connectWallet = () => {
    setIsWalletConnected(true)
    setWalletAddress("0x742d35Cc6634C0532925a3b8D55DeF4d1234ABCD")
  }

  const mintSBT = () => {
    setHasSBT(true)
    setSbtData({
      id: `SBT-${Math.floor(Math.random() * 100000)
        .toString()
        .padStart(5, "0")}`,
      postpaidEnabled: false,
      boundDevices: 0,
    })
  }

  const enablePostpaid = () => {
    setIsPostpaidEnabled(true)
    if (sbtData) {
      setSbtData({ ...sbtData, postpaidEnabled: true })
    }
  }

  const handleBackToLanding = () => {
    window.history.replaceState({ from: "app" }, "", "/app")
    router.push("/")
  }

  const usagePercentage = (usageData.used / usageData.threshold) * 100

  const updateURL = (section: string, modal?: string | null) => {
    const params = new URLSearchParams()
    if (section !== "dashboard") params.set("section", section)
    if (modal) params.set("modal", modal)
    if (isDemoMode) params.set("demo", "true")

    const newURL = params.toString() ? `/app?${params.toString()}` : "/app"
    window.history.replaceState({ from: "app", section, modal }, "", newURL)
    setActiveSection(section)
    if (modal !== undefined) setActiveModal(modal)
  }

  const handleTransaction = async (action: string, data?: any) => {
    setIsTransacting(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    const txHash = isDemoMode
      ? `0xDEMO${Math.random().toString(16).slice(2, 8)}`
      : `0x${Math.random().toString(16).slice(2)}`
    setLastTxHash(txHash)
    setIsTransacting(false)
    return { txHash, success: true }
  }

  const handleWalletTransaction = async (action: string, data?: any) => {
    setIsTransacting(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    const txHash = isDemoMode
      ? `0xDEMO${Math.random().toString(16).slice(2, 8)}`
      : `0x${Math.random().toString(16).slice(2)}`

    if (action === "stake") {
      const amount = Number.parseFloat(stakeAmount)
      if (data.token === "gsim") {
        setWalletBalances((prev) => ({ ...prev, gsim: prev.gsim - amount }))
        setStakingData((prev) => ({ ...prev, gsimStaked: prev.gsimStaked + amount }))
      } else if (data.token === "usdc") {
        setWalletBalances((prev) => ({ ...prev, usdc: prev.usdc - amount }))
        setStakingData((prev) => ({ ...prev, usdcStaked: prev.usdcStaked + amount }))
      }
    }

    setLastTxHash(txHash)
    setIsTransacting(false)
    return { txHash, success: true }
  }

  const handleSendTokens = async () => {
    setIsTransacting(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    const amount = Number.parseFloat(sendAmount)
    const txHash = isDemoMode
      ? `0xDEMO${Math.random().toString(16).slice(2, 8)}`
      : `0x${Math.random().toString(16).slice(2)}`

    if (sendToken === "gsim") {
      setWalletBalances((prev) => ({ ...prev, gsim: prev.gsim - amount }))
    } else if (sendToken === "usdc") {
      setWalletBalances((prev) => ({ ...prev, usdc: prev.usdc - amount }))
    }

    setLastTxHash(txHash)
    setIsTransacting(false)
    setShowSendModal(false)
    setSendAmount("")
    setSendAddress("")
    return { txHash, success: true }
  }

  const handleSendMessage = async (anchorOnChain = false) => {
    if (!newMessage.trim()) return

    const messageId = `msg-${Date.now()}`
    const newMsg: Message = {
      id: messageId,
      from: ensName || walletAddress,
      to: selectedThread?.name || "",
      content: newMessage,
      timestamp: new Date().toISOString(),
      encrypted: selectedThread?.encrypted || false,
      type: "text",
      status: "sending",
      isOwn: true,
    }

    setMessages((prev) => [...prev, newMsg])
    setNewMessage("")

    setTimeout(() => {
      setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, status: "sent" } : msg)))
    }, 500)

    if (anchorOnChain) {
      const result = await handleTransaction("sendMessage", { message: newMessage })
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, status: "delivered", anchorTxHash: result.txHash, anchorStatus: "confirmed" }
            : msg,
        ),
      )
    } else {
      setTimeout(() => {
        setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, status: "delivered" } : msg)))
      }, 1000)

      setTimeout(() => {
        setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, status: "read" } : msg)))
      }, 2000)
    }
  }

  const handleZKLocationShare = async (anchorOnChain = false) => {
    if (!selectedThread) return

    const messageId = `msg-zk-${Date.now()}`
    const zkProofData = {
      proofId: isDemoMode ? `PROOF-0xDEMO${Math.random().toString(16).slice(2, 6)}` : `PROOF-${Date.now()}`,
      region: "Asia-Pacific",
      anchored: anchorOnChain,
    }

    const newMsg: Message = {
      id: messageId,
      from: ensName || walletAddress,
      to: selectedThread.name,
      content: `Shared region proof: ${zkProofData.region}`,
      timestamp: new Date().toISOString(),
      encrypted: selectedThread.encrypted,
      type: "zk-proof",
      status: "sending",
      isOwn: true,
      zkProof: zkProofData,
    }

    setMessages((prev) => [...prev, newMsg])
    setShowZKConsent(false)
    setShowAttachMenu(false)

    setTimeout(() => {
      setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, status: "sent" } : msg)))
    }, 1000)

    if (anchorOnChain) {
      const result = await handleTransaction("zkProof", zkProofData)
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                status: "delivered",
                zkProof: { ...zkProofData, txHash: result.txHash },
                anchorStatus: "confirmed",
              }
            : msg,
        ),
      )
    } else {
      setTimeout(() => {
        setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, status: "delivered" } : msg)))
      }, 1500)
    }
  }

  const getMessageStatusIcon = (status: Message["status"]) => {
    switch (status) {
      case "sending":
        return <Clock className="w-3 h-3 text-slate-400" />
      case "sent":
        return <Check className="w-3 h-3 text-slate-400" />
      case "delivered":
        return <CheckCheck className="w-3 h-3 text-slate-400" />
      case "read":
        return <CheckCheck className="w-3 h-3 text-blue-500" />
      case "failed":
        return <AlertCircle className="w-3 h-3 text-red-500" />
      default:
        return null
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // Show toast notification
      console.log("Address copied — ready to receive")
    } catch (err) {
      console.error("Failed to copy: ", err)
    }
  }

  // Replace networkOptions state with carrier options
  const handleCarrierSwitch = async (carrierId: string) => {
    setIsTransacting(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setSelectedCarrier(carrierId)
    setShowCarrierSwitch(false)
    setIsTransacting(false)
  }

  const filteredThreads = chatThreads.filter((thread) => thread.name.toLowerCase().includes(searchQuery.toLowerCase()))

  // Main Wallet Panel Component
  const MainWalletPanel = () => {
    const [isExpanded, setIsExpanded] = useState(false)

    return (
      <Card className={`${isDark ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-200"}`}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className={`text-xl ${isDark ? "text-white" : "text-slate-900"}`}>
                Your Wallet — clear, ready, on the main stage
              </CardTitle>
              <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                Everything you need — one screen. Curious? Tap to act.
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              className={`${isDark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"}`}
            >
              <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
            </Button>
          </div>

          {/* Balance Summary */}
          <div className="text-center py-4">
            <div className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"} mb-1`}>
              ${walletBalances.usd.toLocaleString()}
            </div>
            <div className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              {walletBalances.gsim} GSIM • {walletBalances.usdc} USDC • {walletBalances.eth} ETH
            </div>
          </div>

          {/* Quick Actions Row */}
          <div className="grid grid-cols-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-col h-16 bg-transparent"
              onClick={() => setShowSendModal(true)}
            >
              <Send className="w-4 h-4 mb-1 text-purple-500" />
              <span className="text-xs">Send</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-col h-16 bg-transparent"
              onClick={() => setShowQRFullscreen(true)}
            >
              <QrCode className="w-4 h-4 mb-1 text-cyan-500" />
              <span className="text-xs">Receive</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-col h-16 bg-transparent"
              onClick={() => {
                setStakeToken("gsim")
                setActiveModal("wallet")
              }}
            >
              <Coins className="w-4 h-4 mb-1 text-purple-500" />
              <span className="text-xs">Stake GSIM</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-col h-16 bg-transparent"
              onClick={() => {
                setStakeToken("usdc")
                setActiveModal("wallet")
              }}
            >
              <Shield className="w-4 h-4 mb-1 text-cyan-500" />
              <span className="text-xs">Stake USDC</span>
            </Button>
          </div>
        </CardHeader>

        {/* Expanded Content */}
        {isExpanded && (
          <CardContent className="pt-0">
            <WalletReceiveBlock />

            {/* Current Stakes */}
            <div className="mt-6">
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
                Current Stakes
              </h3>
              <div className="space-y-3">
                <div
                  className={`p-4 rounded-xl ${isDark ? "bg-slate-800" : "bg-slate-50"} border ${isDark ? "border-slate-700" : "border-slate-200"}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                        {stakingData.gsimStaked} GSIM
                      </div>
                      <div className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                        {stakingData.lockPeriod} days • +{stakingData.boost}% boost
                      </div>
                    </div>
                    <Badge variant="outline" className="border-green-500 text-green-600">
                      Active
                    </Badge>
                  </div>
                </div>
                <div
                  className={`p-4 rounded-xl ${isDark ? "bg-slate-800" : "bg-slate-50"} border ${isDark ? "border-slate-700" : "border-slate-200"}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                        {stakingData.usdcStaked} USDC
                      </div>
                      <div className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                        30 days • +5% boost
                      </div>
                    </div>
                    <Badge variant="outline" className="border-green-500 text-green-600">
                      Active
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="mt-6">
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
                Recent Transactions
              </h3>
              <div className="space-y-3">
                <div
                  className={`p-4 rounded-xl border ${isDark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"}`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                        <Coins className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <div className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>Stake GSIM</div>
                        <div className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>2 hours ago</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>250 GSIM</div>
                      <Badge variant="outline" className="border-green-500 text-green-600 text-xs">
                        Confirmed
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    )
  }

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div
      className={`min-h-screen ${isDark ? "bg-slate-950" : "bg-gradient-to-br from-slate-50 via-white to-slate-100"}`}
    >
      <div
        className={`sticky top-0 z-50 px-6 py-4 border-b ${isDark ? "bg-slate-900/95 border-slate-800" : "bg-white/95 border-slate-200"} backdrop-blur-sm`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center space-x-3">
              <div className="relative w-8 h-8 p-1.5 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg">
                <Image src="/gesim-logo.png" alt="GeSIM" fill className="object-contain" />
              </div>
              <span className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>GeSIM</span>
            </div>
            <div className={`h-4 w-32 ${isDark ? "bg-slate-800" : "bg-slate-200"} rounded animate-pulse`}></div>
          </div>
          <div className="flex items-center gap-4">
            <div className={`h-8 w-20 ${isDark ? "bg-slate-800" : "bg-slate-200"} rounded animate-pulse`}></div>
            <div className={`h-8 w-8 ${isDark ? "bg-slate-800" : "bg-slate-200"} rounded animate-pulse`}></div>
            <div className={`h-8 w-32 ${isDark ? "bg-slate-800" : "bg-slate-200"} rounded animate-pulse`}></div>
          </div>
        </div>
      </div>
      <div className="flex">
        <div
          className={`hidden lg:block w-80 min-h-screen border-r ${isDark ? "bg-slate-900/50 border-slate-800" : "bg-slate-50 border-slate-200"} p-6`}
        >
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`h-12 w-full ${isDark ? "bg-slate-800" : "bg-slate-200"} rounded-xl animate-pulse`}
              ></div>
            ))}
          </div>
        </div>
        <div className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              <div className="xl:col-span-3 space-y-6">
                <div
                  className={`h-64 w-full ${isDark ? "bg-slate-800/50" : "bg-white"} rounded-3xl animate-pulse`}
                ></div>
              </div>
              <div className="space-y-6">
                <div
                  className={`h-48 w-full ${isDark ? "bg-slate-800/50" : "bg-white"} rounded-3xl animate-pulse`}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Wallet Receive Block Component
  const WalletReceiveBlock = () => (
    <div className={`p-4 border-t ${isDark ? "border-slate-700" : "border-slate-200"}`}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>
            Public key (Receive)
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFullAddress(!showFullAddress)}
            className="h-6 px-2 text-xs"
          >
            {showFullAddress ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <code className={`flex-1 text-sm font-mono ${isDark ? "text-slate-300" : "text-slate-700"} select-all`}>
            {showFullAddress ? walletAddress : `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}
          </code>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => copyToClipboard(walletAddress)}
            className="h-8 w-8"
            title="Copy address"
          >
            <Copy className="w-3 h-3" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowQRFullscreen(true)}
            className="flex-1 bg-transparent"
          >
            <QrCode className="w-3 h-3 mr-2" />
            QR Code
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`https://basescan.org/address/${walletAddress}`, "_blank")}
            className="flex-1 bg-transparent"
          >
            <ExternalLink className="w-3 h-3 mr-2" />
            Explorer
          </Button>
        </div>

        <div className={`text-xs ${isDark ? "text-slate-500" : "text-slate-500"} text-center`}>
          <Badge variant="outline" className="text-xs">
            Receive via blockchain transfer
          </Badge>
        </div>

        <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-500"} text-center`}>
          Double-check the address before sending. GeSIM is non-custodial for token transfers.
        </p>
      </div>
    </div>
  )

  // AI Carrier Switcher Component
  const AICarrierSwitcher = () => {
    const recommendedCarrier = carrierOptions.find((c) => c.recommended)

    return (
      <Card className={`${isDark ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-200"}`}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-500" />
            <CardTitle className={`text-lg ${isDark ? "text-white" : "text-slate-900"}`}>
              Network switch — carrier recommended for you
            </CardTitle>
          </div>
          <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            Faster when it matters. Cheaper where it counts. Chosen for you.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {carrierOptions.map((carrier) => (
              <div
                key={carrier.id}
                className={`p-3 rounded-xl border cursor-pointer transition-colors ${
                  carrier.recommended
                    ? isDark
                      ? "bg-blue-900/20 border-blue-700"
                      : "bg-blue-50 border-blue-200"
                    : isDark
                      ? "bg-slate-700/50 border-slate-600 hover:bg-slate-700"
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                }`}
                onClick={() => setShowCarrierSwitch(true)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{carrier.logo}</span>
                    <span className={`font-medium text-sm ${isDark ? "text-white" : "text-slate-900"}`}>
                      {carrier.name}
                    </span>
                  </div>
                  {carrier.recommended && <Badge className="bg-blue-500 text-white text-xs">AI Pick</Badge>}
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>Speed:</span>
                    <span className={`${isDark ? "text-white" : "text-slate-900"}`}>{carrier.bandwidth} Mbps</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>Cost:</span>
                    <span className={`${isDark ? "text-white" : "text-slate-900"}`}>${carrier.dataCost}/MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>Latency:</span>
                    <span className={`${isDark ? "text-white" : "text-slate-900"}`}>{carrier.latency}ms</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {recommendedCarrier && (
            <Button className="w-full" onClick={() => setShowCarrierSwitch(true)}>
              <Network className="w-4 h-4 mr-2" />
              Switch to {recommendedCarrier.name}
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return <LoadingSkeleton />
  }

  const renderSectionContent = () => {
    switch (activeSection) {
      case "messages":
        return (
          <Card className={`${isDark ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-200"} h-[700px]`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className={`text-2xl ${isDark ? "text-white" : "text-slate-900"}`}>Messages</CardTitle>
                  <p className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    End-to-end encrypted messaging with on-chain anchoring
                  </p>
                </div>
                {selectedThread?.encrypted && (
                  <Badge variant="outline" className="border-green-500 text-green-600">
                    <Lock className="w-3 h-3 mr-1" />
                    Encrypted
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0 h-[600px]">
              <div className="flex h-full">
                {/* Chat Threads List */}
                <div className={`w-80 border-r ${isDark ? "border-slate-700" : "border-slate-200"} flex flex-col`}>
                  <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        placeholder="Search conversations..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        aria-label="Search conversations"
                      />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto" role="list" aria-label="Chat threads">
                    {filteredThreads.map((thread) => (
                      <div
                        key={thread.id}
                        role="listitem"
                        className={`p-4 border-b cursor-pointer transition-colors ${
                          selectedThread?.id === thread.id
                            ? isDark
                              ? "bg-slate-700 border-slate-600"
                              : "bg-slate-100 border-slate-300"
                            : isDark
                              ? "border-slate-700 hover:bg-slate-800"
                              : "border-slate-200 hover:bg-slate-50"
                        }`}
                        onClick={() => setSelectedThread(thread)}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            setSelectedThread(thread)
                          }
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative">
                            <div
                              className={`w-10 h-10 rounded-full ${isDark ? "bg-slate-600" : "bg-slate-300"} flex items-center justify-center`}
                            >
                              <span className={`text-sm font-medium ${isDark ? "text-white" : "text-slate-700"}`}>
                                {thread.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            {thread.isOnline && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-800"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className={`font-medium truncate ${isDark ? "text-white" : "text-slate-900"}`}>
                                  {thread.name}
                                </span>
                                {thread.encrypted && <Lock className="w-3 h-3 text-green-500" />}
                                {thread.isPinned && <Pin className="w-3 h-3 text-blue-500" />}
                                {thread.isMuted && <VolumeX className="w-3 h-3 text-slate-400" />}
                              </div>
                              <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                {new Date(thread.timestamp).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <p
                                className={`text-sm truncate ${isDark ? "text-slate-400" : "text-slate-600"} ${thread.unreadCount > 0 ? "font-medium" : ""}`}
                              >
                                {thread.lastMessage}
                              </p>
                              {thread.unreadCount > 0 && (
                                <Badge className="bg-blue-500 text-white text-xs min-w-[20px] h-5 rounded-full flex items-center justify-center">
                                  {thread.unreadCount}
                                </Badge>
                              )}
                            </div>
                            {!thread.isOnline && thread.lastSeen && (
                              <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-500"} mt-1`}>
                                Last seen {thread.lastSeen}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chat Conversation */}
                <div className="flex-1 flex flex-col">
                  {selectedThread ? (
                    <>
                      {/* Chat Header */}
                      <div
                        className={`p-4 border-b ${isDark ? "border-slate-700" : "border-slate-200"} flex items-center justify-between`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div
                              className={`w-8 h-8 rounded-full ${isDark ? "bg-slate-600" : "bg-slate-300"} flex items-center justify-center`}
                            >
                              <span className={`text-sm font-medium ${isDark ? "text-white" : "text-slate-700"}`}>
                                {selectedThread.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            {selectedThread.isOnline && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-white dark:border-slate-800"></div>
                            )}
                          </div>
                          <div>
                            <h3 className={`font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
                              {selectedThread.name}
                            </h3>
                            <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                              {selectedThread.isOnline
                                ? "Online"
                                : selectedThread.lastSeen
                                  ? `Last seen ${selectedThread.lastSeen}`
                                  : "Offline"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Pin conversation">
                            <Pin className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Mute conversation">
                            <VolumeX className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Archive conversation">
                            <Archive className="w-4 h-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Lock className="w-4 h-4 mr-2" />
                                Anchor thread
                              </DropdownMenuItem>
                              {selectedThread.isGroup && (
                                <DropdownMenuItem>
                                  <Users className="w-4 h-4 mr-2" />
                                  Group info
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Messages Area */}
                      <div
                        className="flex-1 overflow-y-auto p-4 space-y-4"
                        role="log"
                        aria-live="polite"
                        aria-label="Chat messages"
                      >
                        {messages.map((message) => (
                          <div key={message.id} className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}>
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                                message.isOwn
                                  ? "bg-blue-500 text-white rounded-br-md"
                                  : isDark
                                    ? "bg-slate-700 text-white rounded-bl-md"
                                    : "bg-slate-200 text-slate-900 rounded-bl-md"
                              }`}
                            >
                              {message.type === "zk-proof" && message.zkProof ? (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-purple-400" />
                                    <span className="text-sm font-medium">Region proof</span>
                                  </div>
                                  <p className="text-sm">{message.zkProof.region}</p>
                                  <div className="text-xs opacity-75 space-y-1">
                                    <p>Proof ID: {message.zkProof.proofId}</p>
                                    {message.zkProof.anchored && (
                                      <p>
                                        Anchored: {message.zkProof.txHash || message.zkProof.userOpHash || "Pending..."}
                                      </p>
                                    )}
                                    {!message.zkProof.anchored && <p>(Private proof)</p>}
                                  </div>
                                </div>
                              ) : (
                                <p className="text-sm">{message.content}</p>
                              )}

                              <div className="flex items-center justify-between mt-1 gap-2">
                                <span
                                  className={`text-xs ${
                                    message.isOwn ? "text-blue-100" : isDark ? "text-slate-400" : "text-slate-500"
                                  }`}
                                >
                                  {new Date(message.timestamp).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                                <div className="flex items-center gap-1">
                                  {message.isOwn && getMessageStatusIcon(message.status)}
                                  {message.anchorStatus === "confirmed" && (
                                    <Lock className="w-3 h-3 text-green-400" title="Anchored on-chain" />
                                  )}
                                  {message.anchorStatus === "failed" && (
                                    <AlertCircle className="w-3 h-3 text-red-400" title="Anchor failed" />
                                  )}
                                </div>
                              </div>

                              {message.reactions && message.reactions.length > 0 && (
                                <div className="flex gap-1 mt-2">
                                  {message.reactions.map((reaction, idx) => (
                                    <span
                                      key={idx}
                                      className="text-xs bg-white/20 rounded-full px-2 py-1 flex items-center gap-1"
                                    >
                                      {reaction.emoji} {reaction.users.length}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {message.anchorTxHash && (
                                <div className="mt-2 pt-2 border-t border-white/20">
                                  <p className="text-xs opacity-75">Anchored on-chain</p>
                                  <code className="text-xs font-mono opacity-75">{message.anchorTxHash}</code>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        {typingUser && (
                          <div className="flex justify-start" aria-live="polite">
                            <div
                              className={`px-4 py-2 rounded-2xl rounded-bl-md ${isDark ? "bg-slate-700" : "bg-slate-200"}`}
                            >
                              <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                                {typingUser} is typing...
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Message Input */}
                      <div className={`p-4 border-t ${isDark ? "border-slate-700" : "border-slate-200"}`}>
                        <div className="flex items-end gap-2">
                          <div className="relative">
                            <DropdownMenu open={showAttachMenu} onOpenChange={setShowAttachMenu}>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 mb-1">
                                  <Paperclip className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start" className="w-56">
                                <DropdownMenuItem>
                                  <ImageIcon className="w-4 h-4 mr-2" />
                                  Photo
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Camera className="w-4 h-4 mr-2" />
                                  Camera
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <File className="w-4 h-4 mr-2" />
                                  Document
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setShowZKConsent(true)}>
                                  <Shield className="w-4 h-4 mr-2" />
                                  Share Region Proof
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Activity className="w-4 h-4 mr-2" />
                                  Share usage screenshot
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <FileText className="w-4 h-4 mr-2" />
                                  Send invoice
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <div className="flex-1">
                            <Input
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              placeholder="Message or paste address…"
                              className="resize-none"
                              onKeyPress={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault()
                                  handleSendMessage()
                                }
                              }}
                              aria-label="Message input"
                            />
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8 mb-1">
                            <Smile className="w-4 h-4" />
                          </Button>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              onClick={() => handleSendMessage()}
                              disabled={!newMessage.trim() || isTransacting}
                              className="mb-1"
                              title="Send message"
                            >
                              {isTransacting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Send className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSendMessage(true)}
                              disabled={!newMessage.trim() || isTransacting}
                              className="mb-1 bg-transparent"
                              title="Anchor to blockchain — creates verifiable proof (gas may apply)"
                            >
                              <Lock className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-500"} mt-2 text-center`}>
                          GeSIM never stores precise coordinates. ZK proofs only attest region-level info.
                        </p>
                      </div>
                    </>
                  ) : (
                    <div
                      className={`flex-1 flex items-center justify-center ${isDark ? "bg-slate-800/30" : "bg-slate-50"}`}
                    >
                      <div className="text-center">
                        <MessageSquare
                          className={`w-16 h-16 mx-auto mb-4 ${isDark ? "text-slate-600" : "text-slate-400"}`}
                        />
                        <h3 className={`text-lg font-medium mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                          No messages yet — say hi
                        </h3>
                        <p className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>
                          Choose a chat from the sidebar to start messaging
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case "data":
        return <BuyDataPage />

      case "devices":
        return (
          <Card className={`${isDark ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-200"}`}>
            <CardHeader>
              <CardTitle className={`text-2xl ${isDark ? "text-white" : "text-slate-900"}`}>
                Device Management
              </CardTitle>
              <p className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>
                Bind and manage your devices with GeSIM eSIM credentials.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-xl border ${isDark ? "bg-slate-700/50 border-slate-600" : "bg-slate-50 border-slate-200"}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>iPhone 15 Pro</h3>
                      <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>Bound • Active</p>
                    </div>
                    <Badge variant="outline" className="border-green-500 text-green-600">
                      Connected
                    </Badge>
                  </div>
                </div>
                <Button className="w-full bg-transparent" variant="outline">
                  <Smartphone className="w-4 h-4 mr-2" />
                  Bind New Device
                </Button>
              </div>
            </CardContent>
          </Card>
        )

      case "developer":
        return (
          <Card className={`${isDark ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-200"}`}>
            <CardHeader>
              <CardTitle className={`text-2xl ${isDark ? "text-white" : "text-slate-900"}`}>
                Developer Tools & API
              </CardTitle>
              <p className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>
                Integrate GeSIM into your applications with our comprehensive API.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-20 flex-col bg-transparent">
                  <Copy className="w-6 h-6 mb-2" />
                  API Documentation
                </Button>
                <Button variant="outline" className="h-20 flex-col bg-transparent">
                  <FileText className="w-6 h-6 mb-2" />
                  SDK Downloads
                </Button>
                <Button variant="outline" className="h-20 flex-col bg-transparent">
                  <Settings className="w-6 h-6 mb-2" />
                  Webhook Setup
                </Button>
                <Button variant="outline" className="h-20 flex-col bg-transparent">
                  <ExternalLink className="w-6 h-6 mb-2" />
                  Sandbox Environment
                </Button>
              </div>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <div
      className={`min-h-screen transition-all duration-700 ${isDark ? "bg-slate-950" : "bg-gradient-to-br from-slate-50 via-white to-slate-100"}`}
    >
      {/* ZK Location Consent Modal */}
      <Dialog open={showZKConsent} onOpenChange={setShowZKConsent}>
        <DialogContent className={`${isDark ? "bg-slate-900 border-slate-800" : "bg-white"} rounded-2xl max-w-md`}>
          <DialogHeader>
            <DialogTitle className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
              Share Region Proof
            </DialogTitle>
            <DialogDescription className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>
              Share region proof — proves your region without revealing exact coordinates. Anchoring is optional and
              creates an immutable hash on-chain.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div
              className={`p-4 rounded-xl ${isDark ? "bg-slate-800" : "bg-slate-50"} border ${isDark ? "border-slate-700" : "border-slate-200"}`}
            >
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>Current Region:</span>
                  <span className={`text-sm font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
                    Asia-Pacific
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>Privacy Level:</span>
                  <Badge variant="outline" className="border-purple-500 text-purple-600 text-xs">
                    <Shield className="w-3 h-3 mr-1" />
                    ZK Protected
                  </Badge>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <Button className="w-full" onClick={() => handleZKLocationShare(false)} disabled={isTransacting}>
                {isTransacting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Shield className="w-4 h-4 mr-2" />
                )}
                Share privately (no anchor)
              </Button>
              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => handleZKLocationShare(true)}
                disabled={isTransacting}
              >
                {isTransacting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Lock className="w-4 h-4 mr-2" />}
                Share & Anchor (on-chain)
              </Button>
            </div>
            <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-500"} text-center`}>
              Anchoring creates an immutable proof hash on-chain.
            </p>
            {isSmartWallet && (
              <div
                className={`p-3 rounded-lg ${isDark ? "bg-slate-800" : "bg-slate-50"} border ${isDark ? "border-slate-700" : "border-slate-200"}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-3 h-3 text-blue-500" />
                  <span className={`text-xs font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
                    Smart Wallet Mode
                  </span>
                </div>
                <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  Gasless proof anchoring via paymaster relayer
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Tokens Modal */}
      <Dialog open={showSendModal} onOpenChange={setShowSendModal}>
        <DialogContent className={`${isDark ? "bg-slate-900 border-slate-800" : "bg-white"} rounded-2xl max-w-md`}>
          <DialogHeader>
            <DialogTitle className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
              Send Tokens
            </DialogTitle>
            <DialogDescription className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>
              Send tokens to any Base address. Transaction will be processed on Base network.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {/* Recent Senders */}
            {recentSenders.length > 0 && (
              <div>
                <label className={`text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-700"} mb-2 block`}>
                  Recent Senders
                </label>
                <div className="flex gap-2">
                  {recentSenders.slice(0, 3).map((sender) => (
                    <Button
                      key={sender.address}
                      variant="outline"
                      size="sm"
                      onClick={() => setSendAddress(sender.address)}
                      className="flex-1 bg-transparent text-xs"
                    >
                      {sender.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Token Selection */}
            <div>
              <label className={`text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-700"} mb-2 block`}>
                Token
              </label>
              <div className="flex gap-2">
                <Button
                  variant={sendToken === "gsim" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSendToken("gsim")}
                  className="flex-1"
                >
                  GSIM ({walletBalances.gsim})
                </Button>
                <Button
                  variant={sendToken === "usdc" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSendToken("usdc")}
                  className="flex-1"
                >
                  USDC ({walletBalances.usdc})
                </Button>
              </div>
            </div>

            {/* Recipient Address */}
            <div>
              <label className={`text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-700"} mb-2 block`}>
                Recipient Address
              </label>
              <Input
                placeholder="0x... or ENS name"
                value={sendAddress}
                onChange={(e) => setSendAddress(e.target.value)}
                className="font-mono text-sm"
              />
            </div>

            {/* Amount */}
            <div>
              <label className={`text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-700"} mb-2 block`}>
                Amount
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={sendAmount}
                  onChange={(e) => setSendAmount(e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSendAmount(
                      sendToken === "gsim" ? walletBalances.gsim.toString() : walletBalances.usdc.toString(),
                    )
                  }
                >
                  Max
                </Button>
              </div>
            </div>

            {/* Network Recommendation */}
            <div
              className={`p-3 rounded-xl ${isDark ? "bg-slate-800" : "bg-slate-50"} border ${isDark ? "border-slate-700" : "border-slate-200"}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>Recommended Network:</span>
                <Badge className="bg-blue-500 text-white text-xs">Base</Badge>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>Est. Gas:</span>
                  <span className={`${isDark ? "text-white" : "text-slate-900"}`}>~0.0005 ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>Speed:</span>
                  <span className={`${isDark ? "text-white" : "text-slate-900"}`}>~2 seconds</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowSendModal(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleSendTokens}
                disabled={!sendAmount || !sendAddress || isTransacting}
              >
                {isTransacting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                {isTransacting ? "Sending..." : "Send"}
              </Button>
            </div>

            {isSmartWallet && (
              <div
                className={`p-3 rounded-lg ${isDark ? "bg-slate-800" : "bg-slate-50"} border ${isDark ? "border-slate-700" : "border-slate-200"}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-3 h-3 text-blue-500" />
                  <span className={`text-xs font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
                    Smart Wallet Mode
                  </span>
                </div>
                <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  Gasless transfer via paymaster relayer
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Code Fullscreen Modal */}
      <Dialog open={showQRFullscreen} onOpenChange={setShowQRFullscreen}>
        <DialogContent className={`${isDark ? "bg-slate-900 border-slate-800" : "bg-white"} rounded-2xl max-w-sm`}>
          <DialogHeader>
            <DialogTitle className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
              Receive Tokens
            </DialogTitle>
            <DialogDescription className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>
              Scan this QR code to send tokens to your address
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex justify-center">
              <div className={`p-4 rounded-xl ${isDark ? "bg-white" : "bg-slate-100"}`}>
                <div className="w-48 h-48 bg-slate-200 rounded-lg flex items-center justify-center">
                  <QrCode className="w-24 h-24 text-slate-400" />
                </div>
              </div>
            </div>

            <div className="text-center space-y-2">
              <code className={`text-sm font-mono ${isDark ? "text-slate-300" : "text-slate-700"} block`}>
                {walletAddress}
              </code>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(walletAddress)}
                  className="flex-1 bg-transparent"
                >
                  <Copy className="w-3 h-3 mr-2" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  <Download className="w-3 h-3 mr-2" />
                  Save PNG
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Carrier Switch Modal */}
      <Dialog open={showCarrierSwitch} onOpenChange={setShowCarrierSwitch}>
        <DialogContent className={`${isDark ? "bg-slate-900 border-slate-800" : "bg-white"} rounded-2xl max-w-md`}>
          <DialogHeader>
            <DialogTitle className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
              Switch Carrier
            </DialogTitle>
            <DialogDescription className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>
              Switch to {carrierOptions.find((c) => c.recommended)?.name}? Est. cost: $
              {carrierOptions.find((c) => c.recommended)?.monthlyCost} / month. Expected speed: +
              {carrierOptions.find((c) => c.recommended)?.bandwidth} Mbps.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {carrierOptions.map((carrier) => (
              <div
                key={carrier.id}
                className={`p-4 rounded-xl border cursor-pointer transition-colors ${
                  selectedCarrier === carrier.id
                    ? isDark
                      ? "bg-blue-900/20 border-blue-700"
                      : "bg-blue-50 border-blue-200"
                    : isDark
                      ? "bg-slate-800 border-slate-700 hover:bg-slate-700"
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                }`}
                onClick={() => setSelectedCarrier(carrier.id)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{carrier.logo}</span>
                    <div>
                      <h3 className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{carrier.name}</h3>
                      {carrier.recommended && (
                        <Badge className="bg-blue-500 text-white text-xs mt-1">
                          AI recommends: {carrier.name} — faster for your usage
                        </Badge>
                      )}
                    </div>
                  </div>
                  {selectedCarrier === carrier.id && <CheckCircle className="w-5 h-5 text-blue-500" />}
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>Speed:</span>
                    <span className={`ml-2 font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
                      {carrier.bandwidth} Mbps
                    </span>
                  </div>
                  <div>
                    <span className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>Cost:</span>
                    <span className={`ml-2 font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
                      ${carrier.dataCost}/MB
                    </span>
                  </div>
                  <div>
                    <span className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>Latency:</span>
                    <span className={`ml-2 font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
                      {carrier.latency}ms
                    </span>
                  </div>
                  <div>
                    <span className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>Monthly:</span>
                    <span className={`ml-2 font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
                      ${carrier.monthlyCost}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowCarrierSwitch(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={() => handleCarrierSwitch(selectedCarrier)} disabled={isTransacting}>
                {isTransacting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Network className="w-4 h-4 mr-2" />
                )}
                {isTransacting ? "Switching..." : "Switch Carrier"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Top Bar */}
      <header
        className={`sticky top-0 z-50 px-6 py-4 border-b ${isDark ? "bg-slate-900/95 border-slate-800" : "bg-white/95 border-slate-200"} backdrop-blur-sm`}
      >
        <div className="flex items-center justify-between">
          {/* Left - Logo & Breadcrumb */}
          <div className="flex items-center gap-6">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBackToLanding}
                className={`${isDark ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"} rounded-xl mr-2`}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="relative w-8 h-8 p-1.5 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg">
                <Image src="/gesim-logo.png" alt="GeSIM" fill className="object-contain" />
              </div>
              <span className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>GeSIM</span>
            </div>

            {/* Desktop Breadcrumb Navigation */}
            <nav className="hidden md:flex items-center text-sm">
              <button
                onClick={() => updateURL("dashboard")}
                className={`${activeSection === "dashboard" ? (isDark ? "text-white" : "text-slate-900") : isDark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"} font-medium transition-colors`}
              >
                Dashboard
              </button>
              <ChevronRight className={`w-4 h-4 mx-2 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
              <button
                onClick={() => updateURL("messages")}
                className={`${activeSection === "messages" ? (isDark ? "text-white" : "text-slate-900") : isDark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"} transition-colors`}
              >
                Messages
              </button>
              <ChevronRight className={`w-4 h-4 mx-2 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
              <button
                onClick={() => updateURL("data")}
                className={`${activeSection === "data" ? (isDark ? "text-white" : "text-slate-900") : isDark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"} transition-colors`}
              >
                Plans
              </button>
              <ChevronRight className={`w-4 h-4 mx-2 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
              <button
                onClick={() => updateURL("devices")}
                className={`${activeSection === "devices" ? (isDark ? "text-white" : "text-slate-900") : isDark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"} transition-colors`}
              >
                Devices
              </button>
            </nav>
          </div>

          {/* Right - Controls */}
          <div className="flex items-center gap-4">
            {/* Demo Mode Toggle */}
            <div className="flex items-center gap-2">
              <Badge
                variant={isDemoMode ? "default" : "outline"}
                className={`${
                  isDemoMode
                    ? "bg-amber-500 text-white"
                    : isDark
                      ? "border-slate-700 text-slate-300"
                      : "border-slate-300 text-slate-700"
                } cursor-pointer`}
                onClick={toggleDemoMode}
              >
                Demo Mode
              </Badge>
              {isSmartWallet && (
                <Badge
                  variant="outline"
                  className="border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400"
                >
                  <Shield className="w-3 h-3 mr-1" />
                  Smart Wallet
                </Badge>
              )}
            </div>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className={`${isDark ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"} rounded-xl`}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {/* Status Chip */}
            <Badge
              variant="outline"
              className={`${
                currentOperator.status === "Online"
                  ? "border-green-500 text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400"
                  : "border-slate-300 text-slate-600"
              }`}
            >
              {hasSBT ? `Online via ${currentOperator.name}` : "Not provisioned"}
            </Badge>

            {/* Connect Wallet */}
            {!isWalletConnected ? (
              <Button
                onClick={connectWallet}
                className={`${isDark ? "bg-slate-800 hover:bg-slate-700 text-white" : "bg-slate-900 hover:bg-slate-800 text-white"} px-4 py-2 rounded-xl font-medium`}
              >
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <span className={`text-sm ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  {ensName || `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`${isDark ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"} rounded-xl`}
                >
                  <User className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Left Sidebar - Desktop Only */}
        <aside
          className={`hidden lg:block w-80 min-h-screen border-r ${isDark ? "bg-slate-900/50 border-slate-800" : "bg-slate-50 border-slate-200"} p-6`}
        >
          <div className="space-y-6">
            <div>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      className={`w-full justify-start ${
                        activeSection === "esim"
                          ? isDark
                            ? "bg-slate-700 text-white"
                            : "bg-slate-800 text-white"
                          : isDark
                            ? "bg-slate-800 hover:bg-slate-700 text-white"
                            : "bg-slate-900 hover:bg-slate-800 text-white"
                      } rounded-xl`}
                      onClick={() => updateURL("dashboard", "esim")}
                    >
                      <Award className="w-4 h-4 mr-2" />
                      {hasSBT ? "View eSIM (SBT)" : "Mint eSIM (SBT)"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent
                    className={`${isDark ? "bg-slate-900 border-slate-800" : "bg-white"} rounded-2xl max-w-md`}
                  >
                    <DialogHeader>
                      <DialogTitle className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                        {hasSBT ? "Your GeSIM eSIM (SBT)" : "Mint your GeSIM eSIM (SBT)"}
                      </DialogTitle>
                      <DialogDescription className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>
                        {hasSBT
                          ? "Your non-transferable SBT that represents your eSIM credential."
                          : "This non-transferable SBT is your eSIM credential — it can be bound to devices and enables postpaid billing."}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                      {hasSBT && sbtData ? (
                        <div className="space-y-4">
                          <div
                            className={`p-4 rounded-xl ${isDark ? "bg-slate-800" : "bg-slate-50"} border ${isDark ? "border-slate-700" : "border-slate-200"}`}
                          >
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                                  SBT ID:
                                </span>
                                <span className={`text-sm font-mono ${isDark ? "text-white" : "text-slate-900"}`}>
                                  {sbtData.id}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                                  Postpaid:
                                </span>
                                <Badge variant={sbtData.postpaidEnabled ? "default" : "outline"} className="text-xs">
                                  {sbtData.postpaidEnabled ? "Enabled" : "Disabled"}
                                </Badge>
                              </div>
                              <div className="flex justify-between">
                                <span className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                                  Bound Devices:
                                </span>
                                <span className={`text-sm ${isDark ? "text-white" : "text-slate-900"}`}>
                                  {sbtData.boundDevices}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button className="flex-1 bg-transparent" variant="outline">
                              <Smartphone className="w-4 h-4 mr-2" />
                              Bind Device
                            </Button>
                            <Button className="flex-1 bg-transparent" variant="outline">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              View in Wallet
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex gap-2">
                            <Button onClick={mintSBT} className="flex-1">
                              <Award className="w-4 h-4 mr-2" />
                              {isDemoMode ? "Demo Mint" : "Mint (Live)"}
                            </Button>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="enable-postpaid" className="rounded" />
                            <label
                              htmlFor="enable-postpaid"
                              className={`text-sm ${isDark ? "text-slate-300" : "text-slate-700"}`}
                            >
                              Enable Postpaid
                            </label>
                            <HelpCircle className={`w-4 h-4 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
                          </div>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Messages Quick Action - Prominent */}
                <Button
                  className={`w-full justify-start ${
                    activeSection === "messages"
                      ? isDark
                        ? "bg-blue-600 text-white border-blue-500"
                        : "bg-blue-600 text-white border-blue-500"
                      : isDark
                        ? "bg-slate-800 hover:bg-slate-700 text-white"
                        : "bg-slate-900 hover:bg-slate-800 text-white"
                  } rounded-xl`}
                  onClick={() => updateURL("messages")}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Messages
                  {chatThreads.reduce((acc, thread) => acc + thread.unreadCount, 0) > 0 && (
                    <Badge className="ml-auto bg-red-500 text-white text-xs">
                      {chatThreads.reduce((acc, thread) => acc + thread.unreadCount, 0)}
                    </Badge>
                  )}
                </Button>

                {/* Sidebar Buttons */}
                <Button
                  variant="outline"
                  className={`w-full justify-start ${
                    activeSection === "data"
                      ? isDark
                        ? "bg-slate-800 text-white border-slate-600"
                        : "bg-slate-100 text-slate-900 border-slate-400"
                      : isDark
                        ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                        : "border-slate-300 text-slate-700 hover:bg-slate-100"
                  } rounded-xl`}
                  onClick={() => updateURL("data")}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Buy Data
                </Button>

                {/* Your Wallet button */}
                <Button
                  variant="outline"
                  className={`w-full justify-start ${isDark ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-300 text-slate-700 hover:bg-slate-100"} rounded-xl`}
                  onClick={() => setActiveModal("wallet")}
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Your Wallet
                </Button>

                <Button
                  variant="outline"
                  className={`w-full justify-start ${
                    activeSection === "devices"
                      ? isDark
                        ? "bg-slate-800 text-white border-slate-600"
                        : "bg-slate-100 text-slate-900 border-slate-400"
                      : isDark
                        ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                        : "border-slate-300 text-slate-700 hover:bg-slate-100"
                  } rounded-xl`}
                  onClick={() => updateURL("devices")}
                >
                  <Smartphone className="w-4 h-4 mr-2" />
                  Bind Device
                </Button>

                <Button
                  variant="outline"
                  className={`w-full justify-start ${
                    activeSection === "developer"
                      ? isDark
                        ? "bg-slate-800 text-white border-slate-600"
                        : "bg-slate-100 text-slate-900 border-slate-400"
                      : isDark
                        ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                        : "border-slate-300 text-slate-700 hover:bg-slate-100"
                  } rounded-xl`}
                  onClick={() => updateURL("developer")}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Developer / Sandbox
                </Button>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
              <Button
                variant="ghost"
                className={`w-full justify-start ${isDark ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"} rounded-xl`}
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                Help / Docs
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 pb-20 lg:pb-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              {/* Main Column */}
              <div className="xl:col-span-3 space-y-6">
                {activeSection === "dashboard" ? (
                  <>
                    {/* Welcome Card */}
                    <Card
                      id="section-dashboard"
                      className={`${isDark ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-200"}`}
                    >
                      <CardHeader>
                        <CardTitle className={`text-2xl ${isDark ? "text-white" : "text-slate-900"}`}>
                          Welcome, {ensName || (isWalletConnected ? "User" : "Guest")}
                        </CardTitle>
                        <p className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>
                          Your command center — control, clarity, choice.
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Quick KPIs */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className={`p-4 rounded-xl ${isDark ? "bg-slate-700/50" : "bg-slate-50"}`}>
                            <div className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                              Usage (this cycle)
                            </div>
                            <div className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                              {usageData.used} MB
                            </div>
                          </div>
                          <div className={`p-4 rounded-xl ${isDark ? "bg-slate-700/50" : "bg-slate-50"}`}>
                            <div className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                              Estimated due
                            </div>
                            <div className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                              ₹{usageData.estimatedDue}
                            </div>
                          </div>
                          <div className={`p-4 rounded-xl ${isDark ? "bg-slate-700/50" : "bg-slate-50"}`}>
                            <div className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                              Credit limit
                            </div>
                            <div className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                              ₹{usageData.creditLimit}
                            </div>
                          </div>
                        </div>

                        {/* CTA Row */}
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button
                            className={`${isDark ? "bg-slate-700 hover:bg-slate-600 text-white" : "bg-slate-900 hover:bg-slate-800 text-white"} rounded-xl`}
                            disabled={hasSBT}
                          >
                            <Award className="w-4 h-4 mr-2" />
                            {hasSBT ? "eSIM Minted" : "Mint eSIM"}
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                className={`${isDark ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-300 text-slate-700 hover:bg-slate-100"} rounded-xl`}
                                disabled={!hasSBT || isPostpaidEnabled}
                              >
                                <CreditCard className="w-4 h-4 mr-2" />
                                {isPostpaidEnabled ? "Postpaid Enabled" : "Enable Postpaid"}
                              </Button>
                            </DialogTrigger>
                            <DialogContent
                              className={`${isDark ? "bg-slate-900 border-slate-800" : "bg-white"} rounded-2xl max-w-md`}
                            >
                              <DialogHeader>
                                <DialogTitle
                                  className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}
                                >
                                  Enable Postpaid Billing
                                </DialogTitle>
                                <DialogDescription className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>
                                  By enabling postpaid you authorize GeSIM to record on-chain usage events and issue
                                  invoices at the stated per-MB rate.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="py-4 space-y-4">
                                <div
                                  className={`p-4 rounded-xl ${isDark ? "bg-slate-800" : "bg-slate-50"} border ${isDark ? "border-slate-700" : "border-slate-200"}`}
                                >
                                  <div className="space-y-2">
                                    <div className="flex justify-between">
                                      <span className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                                        Per-MB Rate:
                                      </span>
                                      <span
                                        className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}
                                      >
                                        ₹{usageData.rate}/MB
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                                        Billing Cycle:
                                      </span>
                                      <span className={`text-sm ${isDark ? "text-white" : "text-slate-900"}`}>
                                        1–30
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <Button onClick={enablePostpaid} className="w-full">
                                  Authorize Metering Contract
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Main Wallet Panel */}
                    <MainWalletPanel />

                    {/* Live Usage Meter */}
                    <Card
                      id="section-usage"
                      className={`${isDark ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-200"}`}
                    >
                      <CardHeader>
                        <CardTitle className={`${isDark ? "text-white" : "text-slate-900"}`}>
                          Live Usage Meter
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-center">
                          <div className="relative w-48 h-48">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                              <circle
                                cx="50"
                                cy="50"
                                r="40"
                                stroke={isDark ? "#374151" : "#e5e7eb"}
                                strokeWidth="8"
                                fill="none"
                              />
                              <circle
                                cx="50"
                                cy="50"
                                r="40"
                                stroke="#3b82f6"
                                strokeWidth="8"
                                fill="none"
                                strokeDasharray={`${usagePercentage * 2.51} 251`}
                                className="transition-all duration-300"
                              />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <div className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                                {usageData.used}
                              </div>
                              <div className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                                of {usageData.threshold} MB
                              </div>
                              <div className={`text-xs ${isDark ? "text-slate-500" : "text-slate-500"} mt-1`}>
                                {usagePercentage.toFixed(1)}% used
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="text-center space-y-2">
                          <div className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                            Per MB rate: ₹{usageData.rate}/MB · Billing cycle: 1–30
                          </div>
                          <Button
                            size="sm"
                            className={`${isDark ? "bg-slate-700 hover:bg-slate-600 text-white" : "bg-slate-900 hover:bg-slate-800 text-white"} rounded-lg`}
                          >
                            Settle Now
                          </Button>
                        </div>

                        <div
                          className={`text-center text-xs ${isDark ? "text-slate-500" : "text-slate-500"} flex items-center justify-center gap-2`}
                        >
                          <Clock className="w-3 h-3" />
                          Last metering posted: {usageData.lastPosted}
                        </div>
                      </CardContent>
                    </Card>

                    {/* AI Carrier Switcher */}
                    <AICarrierSwitcher />
                  </>
                ) : (
                  <div id={`section-${activeSection}`}>{renderSectionContent()}</div>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Demo Controls */}
                {isDemoMode && (
                  <Card className={`${isDark ? "bg-amber-900/20 border-amber-700" : "bg-amber-50 border-amber-200"}`}>
                    <CardHeader>
                      <CardTitle className={`text-lg ${isDark ? "text-amber-300" : "text-amber-800"}`}>
                        Demo Controls
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className={`text-sm ${isDark ? "text-amber-300" : "text-amber-700"} mb-2 block`}>
                          Demo Preset
                        </label>
                        <Select value={selectedPreset} onValueChange={setSelectedPreset}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {demoPresets.map((preset) => (
                              <SelectItem key={preset.id} value={preset.id}>
                                {preset.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${isDark ? "text-amber-300" : "text-amber-700"}`}>
                          SmartWallet Simulation
                        </span>
                        <Switch checked={isSmartWallet} onCheckedChange={toggleSmartWallet} />
                      </div>

                      <div>
                        <label className={`text-sm ${isDark ? "text-amber-300" : "text-amber-700"} mb-2 block`}>
                          Usage Speed: {demoUsageSpeed} KB/s
                        </label>
                        <input
                          type="range"
                          min="10"
                          max="200"
                          value={demoUsageSpeed}
                          onChange={(e) => setDemoUsageSpeed(Number(e.target.value))}
                          className="w-full"
                        />
                      </div>

                      <Button
                        onClick={() => setIsDemoRunning(!isDemoRunning)}
                        className={`w-full ${
                          isDemoRunning
                            ? "bg-red-600 hover:bg-red-700"
                            : isDark
                              ? "bg-amber-700 hover:bg-amber-600"
                              : "bg-amber-600 hover:bg-amber-700"
                        } text-white`}
                      >
                        {isDemoRunning ? (
                          <>
                            <Pause className="w-4 h-4 mr-2" />
                            Stop Demo Usage
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Start Demo Usage
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Token Balance Card */}
                <Card className={`${isDark ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-200"}`}>
                  <CardHeader>
                    <CardTitle className={`text-lg ${isDark ? "text-white" : "text-slate-900"}`}>
                      Token Balance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>GSIM Balance</span>
                      <span className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                        {tokenBalance.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                        Governance Power
                      </span>
                      <span className={`text-sm font-medium text-blue-500`}>Active</span>
                    </div>
                    <Progress value={75} className="h-2" />
                    <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-500"} text-center`}>
                      Participate in protocol governance
                    </p>
                  </CardContent>
                </Card>

                {/* Developer Sandbox */}
                <Card className={`${isDark ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-200"}`}>
                  <CardHeader>
                    <CardTitle className={`text-lg ${isDark ? "text-white" : "text-slate-900"}`}>
                      Developer Sandbox
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className={`w-full justify-start ${isDark ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-300 text-slate-700 hover:bg-slate-100"} rounded-lg`}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Get Sandbox Key
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`w-full justify-start ${isDark ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-300 text-slate-700 hover:bg-slate-100"} rounded-lg`}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Sample Webhook
                    </Button>
                    {isSmartWallet && (
                      <div className={`p-2 rounded-lg ${isDark ? "bg-slate-700" : "bg-slate-100"} text-xs`}>
                        <div className="flex items-center gap-1 mb-1">
                          <Activity className="w-3 h-3 text-blue-500" />
                          <span className={`font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
                            Bundler Logs
                          </span>
                        </div>
                        <div className={`space-y-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                          <p>UserOp submitted to bundler</p>
                          <p>Paymaster validation: ✓</p>
                          <p>Gas estimation: 21000</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* B2B Quick Links */}
                <Card className={`${isDark ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-200"}`}>
                  <CardHeader>
                    <CardTitle className={`text-lg ${isDark ? "text-white" : "text-slate-900"}`}>
                      B2B Quick Links
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className={`w-full justify-start ${isDark ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-300 text-slate-700 hover:bg-slate-100"} rounded-lg`}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      MNO Integration Docs
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`w-full justify-start ${isDark ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-300 text-slate-700 hover:bg-slate-100"} rounded-lg`}
                    >
                      <Smartphone className="w-4 h-4 mr-2" />
                      OEM Provisioning
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Your Wallet Panel */}
      {activeModal === "wallet" && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setActiveModal(null)}>
          <div
            className={`fixed right-0 top-0 h-full w-full max-w-md ${isDark ? "bg-slate-900" : "bg-white"} shadow-2xl transform transition-transform duration-300 ease-out`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Wallet Panel Header */}
            <div className={`p-6 border-b ${isDark ? "border-slate-800" : "border-slate-200"}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Your Wallet</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setActiveModal(null)}
                  className={`${isDark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"}`}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Chain Status */}
              <div className="flex items-center justify-between mb-4">
                <Badge
                  variant={baseConnected ? "default" : "outline"}
                  className={baseConnected ? "bg-blue-600 text-white" : "border-orange-500 text-orange-600"}
                >
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                  {baseConnected ? "Base • Connected" : "Connect to Base"}
                </Badge>
                <span className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  {ensName || `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}
                </span>
              </div>

              {/* Balance Summary */}
              <div className="text-center">
                <div className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"} mb-1`}>
                  ${walletBalances.usd.toLocaleString()}
                </div>
                <div className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  {walletBalances.gsim} GSIM • {walletBalances.usdc} USDC
                </div>
              </div>
            </div>

            {/* Wallet Receive Block */}
            <WalletReceiveBlock />

            {/* Wallet Tabs */}
            <div className="flex-1 overflow-hidden">
              <Tabs value={walletActiveTab} onValueChange={setWalletActiveTab} className="h-full flex flex-col">
                <TabsList className={`grid w-full grid-cols-5 ${isDark ? "bg-slate-800" : "bg-slate-100"} m-4 mb-0`}>
                  <TabsTrigger value="overview" className="text-xs">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="stake" className="text-xs">
                    Stake
                  </TabsTrigger>
                  <TabsTrigger value="ramp" className="text-xs">
                    On/Off
                  </TabsTrigger>
                  <TabsTrigger value="invoices" className="text-xs">
                    Invoices
                  </TabsTrigger>
                  <TabsTrigger value="transactions" className="text-xs">
                    History
                  </TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-y-auto p-4">
                  {/* Overview Tab */}
                  <TabsContent value="overview" className="space-y-6 mt-0">
                    <div>
                      <h3 className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
                        Quick actions — get in, get out, get things done
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          variant="outline"
                          className="h-20 flex-col bg-transparent"
                          onClick={() => setWalletActiveTab("ramp")}
                        >
                          <ArrowRight className="w-5 h-5 mb-2 text-green-500" />
                          <span className="text-xs">On-ramp</span>
                        </Button>
                        <Button
                          variant="outline"
                          className="h-20 flex-col bg-transparent"
                          onClick={() => setWalletActiveTab("ramp")}
                        >
                          <ArrowLeft className="w-5 h-5 mb-2 text-blue-500" />
                          <span className="text-xs">Off-ramp</span>
                        </Button>
                        <Button
                          variant="outline"
                          className="h-20 flex-col bg-transparent"
                          onClick={() => setShowSendModal(true)}
                        >
                          <Send className="w-5 h-5 mb-2 text-purple-500" />
                          <span className="text-xs">Send</span>
                        </Button>
                        <Button
                          variant="outline"
                          className="h-20 flex-col bg-transparent"
                          onClick={() => setShowReceiveModal(true)}
                        >
                          <QrCode className="w-5 h-5 mb-2 text-cyan-500" />
                          <span className="text-xs">Receive</span>
                        </Button>
                        <Button
                          variant="outline"
                          className="h-20 flex-col bg-transparent"
                          onClick={() => {
                            setStakeToken("gsim")
                            setWalletActiveTab("stake")
                          }}
                        >
                          <Coins className="w-5 h-5 mb-2 text-purple-500" />
                          <span className="text-xs">Stake GSIM</span>
                        </Button>
                        <Button
                          variant="outline"
                          className="h-20 flex-col bg-transparent"
                          onClick={() => {
                            setStakeToken("usdc")
                            setWalletActiveTab("stake")
                          }}
                        >
                          <Shield className="w-5 h-5 mb-2 text-cyan-500" />
                          <span className="text-xs">Stake USDC</span>
                        </Button>
                        <Button
                          variant="outline"
                          className="h-20 flex-col bg-transparent"
                          onClick={() => {
                            setStakeToken("both")
                            setWalletActiveTab("stake")
                          }}
                        >
                          <Zap className="w-5 h-5 mb-2 text-orange-500" />
                          <span className="text-xs">Stake Both</span>
                          <Badge className="text-xs bg-orange-100 text-orange-700">Boost</Badge>
                        </Button>
                        <Button
                          variant="outline"
                          className="h-20 flex-col bg-transparent"
                          onClick={() => setShowCarrierSwitch(true)}
                        >
                          <Network className="w-5 h-5 mb-2 text-indigo-500" />
                          <span className="text-xs">Network Switch</span>
                        </Button>
                        <Button
                          variant="outline"
                          className="h-20 flex-col bg-transparent"
                          onClick={() => setShowQRFullscreen(true)}
                        >
                          <QrCode className="w-5 h-5 mb-2 text-pink-500" />
                          <span className="text-xs">Scan QR</span>
                        </Button>
                        <Button
                          variant="outline"
                          className="h-20 flex-col bg-transparent"
                          onClick={() => updateURL("messages")}
                        >
                          <MessageSquare className="w-5 h-5 mb-2 text-blue-500" />
                          <span className="text-xs">Messages</span>
                        </Button>
                        <Button
                          variant="outline"
                          className="h-20 flex-col bg-transparent"
                          onClick={() => setWalletActiveTab("transactions")}
                        >
                          <Settings className="w-5 h-5 mb-2 text-gray-500" />
                          <span className="text-xs">Wallet Settings</span>
                        </Button>
                      </div>
                    </div>

                    {/* Current Stakes */}
                    <div>
                      <h3 className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
                        Current Stakes
                      </h3>
                      <div className="space-y-3">
                        <div
                          className={`p-4 rounded-xl ${isDark ? "bg-slate-800" : "bg-slate-50"} border ${isDark ? "border-slate-700" : "border-slate-200"}`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                                {stakingData.gsimStaked} GSIM
                              </div>
                              <div className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                                {stakingData.lockPeriod} days • +{stakingData.boost}% boost
                              </div>
                            </div>
                            <Badge variant="outline" className="border-green-500 text-green-600">
                              Active
                            </Badge>
                          </div>
                        </div>
                        <div
                          className={`p-4 rounded-xl ${isDark ? "bg-slate-800" : "bg-slate-50"} border ${isDark ? "border-slate-700" : "border-slate-200"}`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                                {stakingData.usdcStaked} USDC
                              </div>
                              <div className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                                30 days • +5% boost
                              </div>
                            </div>
                            <Badge variant="outline" className="border-green-500 text-green-600">
                              Active
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Stake Tab */}
                  <TabsContent value="stake" className="space-y-6 mt-0">
                    <div>
                      <h3 className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
                        Stake {stakeToken === "gsim" ? "GSIM" : stakeToken === "usdc" ? "USDC" : "Both Tokens"}
                      </h3>

                      {/* Token Selection */}
                      <div className="flex gap-2 mb-4">
                        <Button
                          variant={stakeToken === "gsim" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setStakeToken("gsim")}
                        >
                          GSIM
                        </Button>
                        <Button
                          variant={stakeToken === "usdc" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setStakeToken("usdc")}
                        >
                          USDC
                        </Button>
                        <Button
                          variant={stakeToken === "both" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setStakeToken("both")}
                        >
                          Both <Badge className="ml-1 text-xs">Boost</Badge>
                        </Button>
                      </div>

                      {/* Amount Input */}
                      <div className="space-y-4">
                        <div>
                          <label
                            className={`text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-700"} mb-2 block`}
                          >
                            Amount to Stake
                          </label>
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              placeholder="100"
                              value={stakeAmount}
                              onChange={(e) => setStakeAmount(e.target.value)}
                              className="flex-1"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setStakeAmount(
                                  stakeToken === "gsim"
                                    ? walletBalances.gsim.toString()
                                    : walletBalances.usdc.toString(),
                                )
                              }
                            >
                              Max
                            </Button>
                          </div>
                        </div>

                        {/* Lock Period Selection */}
                        <div>
                          <label
                            className={`text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-700"} mb-3 block`}
                          >
                            Lock Period
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { days: 0, boost: 0, label: "Flexible" },
                              { days: 30, boost: 5, label: "30 days" },
                              { days: 90, boost: 12, label: "90 days" },
                              { days: 180, boost: 25, label: "180 days" },
                              { days: 365, boost: 60, label: "1 year" },
                            ].map((period) => (
                              <Button
                                key={period.days}
                                variant={selectedLockPeriod === period.days ? "default" : "outline"}
                                size="sm"
                                className="flex-col h-16 bg-transparent"
                                onClick={() => setSelectedLockPeriod(period.days)}
                              >
                                <span className="text-xs font-medium">{period.label}</span>
                                <span className="text-xs text-green-500">+{period.boost}% boost</span>
                              </Button>
                            ))}
                          </div>
                        </div>

                        {/* Dual Stake Ratio */}
                        {stakeToken === "both" && (
                          <div>
                            <label
                              className={`text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-700"} mb-3 block`}
                            >
                              Token Split: {dualStakeRatio}% GSIM / {100 - dualStakeRatio}% USDC
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={dualStakeRatio}
                              onChange={(e) => setDualStakeRatio(Number(e.target.value))}
                              className="w-full"
                            />
                          </div>
                        )}

                        {/* Projected Returns */}
                        <div
                          className={`p-4 rounded-xl ${isDark ? "bg-slate-800" : "bg-slate-50"} border ${isDark ? "border-slate-700" : "border-slate-200"}`}
                        >
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                                Projected APR:
                              </span>
                              <span className={`text-sm font-semibold text-green-500`}>
                                {selectedLockPeriod === 0
                                  ? "8.5%"
                                  : selectedLockPeriod === 30
                                    ? "13.5%"
                                    : selectedLockPeriod === 90
                                      ? "20.5%"
                                      : selectedLockPeriod === 180
                                        ? "33.5%"
                                        : "68.5%"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                                Discount Boost:
                              </span>
                              <span className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                                +
                                {selectedLockPeriod === 0
                                  ? "0"
                                  : selectedLockPeriod === 30
                                    ? "5"
                                    : selectedLockPeriod === 90
                                      ? "12"
                                      : selectedLockPeriod === 180
                                        ? "25"
                                        : "60"}
                                %
                              </span>
                            </div>
                            {stakeToken === "both" && (
                              <div className="flex justify-between">
                                <span className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                                  Dual Stake Bonus:
                                </span>
                                <span className={`text-sm font-semibold text-orange-500`}>+15% extra</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <Button
                          className="w-full"
                          onClick={() =>
                            handleWalletTransaction("stake", {
                              token: stakeToken,
                              amount: stakeAmount,
                              lockPeriod: selectedLockPeriod,
                            })
                          }
                          disabled={!stakeAmount || isTransacting}
                        >
                          {isTransacting ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Lock className="w-4 h-4 mr-2" />
                          )}
                          {isTransacting
                            ? "Staking..."
                            : `Stake ${stakeToken === "both" ? "Both Tokens" : stakeToken.toUpperCase()}`}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  {/* On/Off Ramp Tab */}
                  <TabsContent value="ramp" className="space-y-6 mt-0">
                    <div>
                      <h3 className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
                        On/Off Ramp
                      </h3>
                      <div className="space-y-4">
                        <Button className="w-full h-16 flex items-center justify-between bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white">
                          <div className="flex items-center">
                            <ArrowRight className="w-5 h-5 mr-3" />
                            <div className="text-left">
                              <div className="font-semibold">Buy Crypto</div>
                              <div className="text-sm opacity-90">Card, Bank, Apple Pay</div>
                            </div>
                          </div>
                          <ExternalLink className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="outline"
                          className="w-full h-16 flex items-center justify-between bg-transparent"
                        >
                          <div className="flex items-center">
                            <ArrowLeft className="w-5 h-5 mr-3 text-blue-500" />
                            <div className="text-left">
                              <div className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                                Sell Crypto
                              </div>
                              <div className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                                Bank transfer, Card
                              </div>
                            </div>
                          </div>
                          <ExternalLink className="w-4 h-4" />
                        </Button>

                        <div
                          className={`p-4 rounded-xl ${isDark ? "bg-slate-800" : "bg-slate-50"} border ${isDark ? "border-slate-700" : "border-slate-200"}`}
                        >
                          <div className="text-center">
                            <Shield
                              className={`w-8 h-8 mx-auto mb-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}
                            />
                            <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                              Powered by trusted partners. KYC may be required for larger amounts.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Invoices Tab */}
                  <TabsContent value="invoices" className="space-y-6 mt-0">
                    <div>
                      <h3 className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
                        Invoices & Billing
                      </h3>
                      <div className="space-y-3">
                        {mockInvoices.map((invoice) => (
                          <div
                            key={invoice.id}
                            className={`p-4 rounded-xl border ${isDark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"}`}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                                  Invoice {invoice.id}
                                </h4>
                                <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                                  {invoice.period}
                                </p>
                              </div>
                              <Badge
                                variant={
                                  invoice.status === "Paid"
                                    ? "default"
                                    : invoice.status === "Pending"
                                      ? "outline"
                                      : "destructive"
                                }
                                className="text-xs"
                              >
                                {invoice.status}
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center mb-3">
                              <span className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>Amount:</span>
                              <span className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                                ₹{invoice.amount}
                              </span>
                            </div>
                            {invoice.status === "Pending" && (
                              <Button size="sm" className="w-full">
                                <CreditCard className="w-3 h-3 mr-2" />
                                Pay with Wallet
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Transactions Tab */}
                  <TabsContent value="transactions" className="space-y-6 mt-0">
                    <div>
                      <h3 className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
                        Transaction History
                      </h3>
                      <div className="space-y-3">
                        <div
                          className={`p-4 rounded-xl border ${isDark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"}`}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                                <Coins className="w-4 h-4 text-green-600" />
                              </div>
                              <div>
                                <div className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                                  Stake GSIM
                                </div>
                                <div className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                                  2 hours ago
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                                250 GSIM
                              </div>
                              <Badge variant="outline" className="border-green-500 text-green-600 text-xs">
                                Confirmed
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div
                          className={`p-4 rounded-xl border ${isDark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"}`}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                <CreditCard className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <div className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                                  Invoice Payment
                                </div>
                                <div className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                                  1 day ago
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>₹21.56</div>
                              <Badge variant="outline" className="border-green-500 text-green-600 text-xs">
                                Confirmed
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation - Updated with Your Wallet */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 safe-area-pb">
        <div className="grid grid-cols-4 h-16 relative">
          {/* Dashboard Tab */}
          <button
            onClick={() => updateURL("dashboard")}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              activeSection === "dashboard"
                ? isDark
                  ? "text-white bg-slate-800"
                  : "text-slate-900 bg-slate-100"
                : isDark
                  ? "text-slate-400 hover:text-white"
                  : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-xs font-medium">Dashboard</span>
          </button>

          {/* Messages Tab */}
          <button
            onClick={() => updateURL("messages")}
            className={`flex flex-col items-center justify-center gap-1 transition-colors relative ${
              activeSection === "messages"
                ? isDark
                  ? "text-white bg-slate-800"
                  : "text-slate-900 bg-slate-100"
                : isDark
                  ? "text-slate-400 hover:text-white"
                  : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-xs font-medium">Messages</span>
            {chatThreads.reduce((acc, thread) => acc + thread.unreadCount, 0) > 0 && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {chatThreads.reduce((acc, thread) => acc + thread.unreadCount, 0)}
              </div>
            )}
          </button>

          {/* Data Plans Tab */}
          <button
            onClick={() => updateURL("data")}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              activeSection === "data"
                ? isDark
                  ? "text-white bg-slate-800"
                  : "text-slate-900 bg-slate-100"
                : isDark
                  ? "text-slate-400 hover:text-white"
                  : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Package className="w-5 h-5" />
            <span className="text-xs font-medium">Plans</span>
          </button>

          {/* Devices Tab */}
          <button
            onClick={() => updateURL("devices")}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              activeSection === "devices"
                ? isDark
                  ? "text-white bg-slate-800"
                  : "text-slate-900 bg-slate-100"
                : isDark
                  ? "text-slate-400 hover:text-white"
                  : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Smartphone className="w-5 h-5" />
            <span className="text-xs font-medium">Devices</span>
          </button>

          {/* Your Wallet Quick Action - Bottom Right */}
          <button
            onClick={() => setActiveModal("wallet")}
            className={`absolute bottom-4 right-4 w-12 h-12 rounded-full shadow-lg transition-all ${
              isDark ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
            } flex items-center justify-center`}
            title="Your Wallet"
          >
            <Wallet className="w-5 h-5" />
          </button>
        </div>

        {/* Active Section Indicator */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50">
          <div
            className="h-full bg-blue-500 transition-all duration-300 ease-out"
            style={{
              width: "25%",
              transform: `translateX(${
                activeSection === "dashboard"
                  ? "0%"
                  : activeSection === "messages"
                    ? "100%"
                    : activeSection === "data"
                      ? "200%"
                      : "300%"
              })`,
            }}
          />
        </div>
      </div>
    </div>
  )
}
