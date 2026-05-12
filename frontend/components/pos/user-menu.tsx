"use client"

import Link from "next/link"
import { LogOut, User, UserCircle2 } from "lucide-react"
import { toast } from "sonner"

import { useAuth } from "@/components/auth/auth-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function getInitials(name?: string, lastName?: string): string {
  const first = name?.trim()?.[0] ?? ""
  const last = lastName?.trim()?.[0] ?? ""
  return (first + last).toUpperCase() || "??"
}

export function UserMenu() {
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
      toast.success("Sesión cerrada")
    } catch {
      toast.error("No pudimos cerrar tu sesión")
    }
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <UserCircle2 className="h-5 w-5" />
        Iniciar sesión
      </Link>
    )
  }

  const initials = getInitials(user.name, user.last_name)
  const fullName = `${user.name} ${user.last_name}`.trim()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-3 pl-4 border-l border-border hover:opacity-90 transition-opacity outline-none">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium leading-tight">{fullName}</p>
            <p className="text-xs text-muted-foreground leading-tight truncate max-w-[180px]">
              {user.email}
            </p>
          </div>
          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
            {initials}
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{fullName}</span>
            <span className="text-xs text-muted-foreground truncate">
              {user.email}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/panel/cuenta" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            Mi cuenta
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
