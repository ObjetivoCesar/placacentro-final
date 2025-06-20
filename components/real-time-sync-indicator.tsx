"use client"

import { useState, useEffect } from "react"
import { Wifi, WifiOff, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"

/**
 * COMPONENTE: Indicador de Sincronización en Tiempo Real
 *
 * Muestra el estado de conexión y sincronización en la UI
 */
export default function RealTimeSyncIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Listen for inventory updates
    const handleInventoryUpdate = () => {
      setLastSync(new Date())
      setIsSyncing(false)
    }

    const handleSyncStart = () => setIsSyncing(true)

    window.addEventListener("inventory-updated", handleInventoryUpdate)
    window.addEventListener("sync-started", handleSyncStart)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      window.removeEventListener("inventory-updated", handleInventoryUpdate)
      window.removeEventListener("sync-started", handleSyncStart)
    }
  }, [])

  const getStatusColor = () => {
    if (!isOnline) return "bg-red-100 text-red-800"
    if (isSyncing) return "bg-blue-100 text-blue-800"
    return "bg-green-100 text-green-800"
  }

  const getStatusText = () => {
    if (!isOnline) return "Sin conexión"
    if (isSyncing) return "Sincronizando..."
    return "Sincronizado"
  }

  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff className="h-3 w-3" />
    if (isSyncing) return <RefreshCw className="h-3 w-3 animate-spin" />
    return <Wifi className="h-3 w-3" />
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <Badge className={getStatusColor()}>
        {getStatusIcon()}
        <span className="ml-1">{getStatusText()}</span>
      </Badge>
      {lastSync && <div className="text-xs text-gray-500 mt-1 text-right">{lastSync.toLocaleTimeString()}</div>}
    </div>
  )
}
