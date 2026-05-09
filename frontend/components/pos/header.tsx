"use client"

import { Bell, Search, User, Clock } from "lucide-react"
import { useState, useEffect } from "react"

export function Header() {
  const [currentTime, setCurrentTime] = useState<string>("")
  const [currentDate, setCurrentDate] = useState<string>("")

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date()
      setCurrentTime(
        now.toLocaleTimeString("es-MX", {
          hour: "2-digit",
          minute: "2-digit",
        })
      )
      setCurrentDate(
        now.toLocaleDateString("es-MX", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      )
    }
    updateDateTime()
    const interval = setInterval(updateDateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar cliente, producto..."
            className="w-80 h-10 pl-10 pr-4 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-6">
        {/* Time */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">{currentTime}</p>
            <p className="text-xs capitalize">{currentDate}</p>
          </div>
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />
        </button>

        {/* User */}
        <div className="flex items-center gap-3 pl-4 border-l border-border">
          <div className="text-right">
            <p className="text-sm font-medium">Carlos Martinez</p>
            <p className="text-xs text-muted-foreground">Cajero</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
            <User className="h-5 w-5 text-primary-foreground" />
          </div>
        </div>
      </div>
    </header>
  )
}
