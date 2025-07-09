import { SignedIn, SignedOut, RedirectToSignIn, UserButton } from '@clerk/clerk-react'
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { useState } from "react"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <>
      <SignedIn>
        <SidebarProvider>
          <div className="min-h-screen flex w-full bg-background">
            <AppSidebar />
            <div className="flex-1 flex flex-col">
              <header className="h-16 border-b bg-card flex items-center justify-between px-6">
                <div className="flex items-center gap-4">
                  <h1 className="text-xl font-semibold text-foreground">DocConnect</h1>
                </div>
                <div className="flex items-center gap-4">
                  <UserButton afterSignOutUrl="/" />
                </div>
              </header>
              <main className="flex-1 p-6">
                {children}
              </main>
            </div>
          </div>
        </SidebarProvider>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  )
}