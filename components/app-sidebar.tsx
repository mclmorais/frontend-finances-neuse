"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, FolderTree, Wallet, TrendingDown, TrendingUp, PiggyBank, LogOut } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { useTranslations } from "next-intl"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

export function AppSidebar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const t = useTranslations("navigation")

  const navigationItems = [
    {
      title: t("home"),
      href: "/",
      icon: Home,
    },
    {
      title: t("categories"),
      href: "/categories",
      icon: FolderTree,
    },
    {
      title: t("accounts"),
      href: "/accounts",
      icon: Wallet,
    },
    {
      title: t("expenses"),
      href: "/expenses",
      icon: TrendingDown,
    },
    {
      title: t("incomes"),
      href: "/incomes",
      icon: TrendingUp,
    },
    {
      title: t("budgets"),
      href: "/budgets",
      icon: PiggyBank,
    },
    {
      title: t("savings"),
      href: "/savings",
      icon: PiggyBank,
    },
  ]

  if (!user) {
    return null
  }

  const getUserInitials = () => {
    if (user.email) {
      return user.email.substring(0, 2).toUpperCase()
    }
    return "U"
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Wallet className="size-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Finance Neuse</span>
            <span className="text-xs text-sidebar-foreground/70">{t("personalFinance")}</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {navigationItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={isActive}>
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator />
        <div className="flex items-center gap-2 px-2 py-2">
          <Avatar className="size-8">
            <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-xs">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-col overflow-hidden">
            <span className="truncate text-sm font-medium">{user.email}</span>
            <span className="text-xs text-sidebar-foreground/70">{t("loggedIn")}</span>
          </div>
          <LanguageToggle />
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={signOut}
            className="shrink-0"
            title={useTranslations("common")("signOut")}
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
