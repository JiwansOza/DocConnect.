import { SignedIn, SignedOut, RedirectToSignIn, UserButton } from '@clerk/clerk-react'
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { Button } from "@/components/ui/button"
import { Menu, ArrowLeft } from "lucide-react"
import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const isDashboard = location.pathname === "/";
  return (
    <>
      <SignedIn>
        <SidebarProvider>
          <div className="min-h-screen w-full bg-background flex flex-col md:flex-row">
            <AppSidebar />
            <div className="flex-1 flex flex-col">
              <header className="h-16 border-b bg-card flex items-center justify-between px-2 sm:px-4 md:px-6">
                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                  <div className="md:hidden flex-shrink-0">
                    <SidebarTrigger />
                  </div>
                  {!isDashboard && (
                    <button
                      onClick={() => navigate(-1)}
                      className="p-2 rounded hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary flex-shrink-0"
                      aria-label="Go back"
                      style={{ minWidth: 40, minHeight: 40 }}
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                  )}
                  <h1 className="text-lg sm:text-xl font-semibold text-foreground truncate">DocConnect</h1>
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                  <UserButton afterSignOutUrl="/" />
                </div>
              </header>
              <main className="flex-1 p-2 sm:p-6 w-full min-w-0 overflow-x-auto">
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