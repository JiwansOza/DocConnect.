import { SignedIn, SignedOut, RedirectToSignIn, UserButton } from '@clerk/clerk-react'
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { Button } from "@/components/ui/button"
import { Menu, ArrowLeft, Sun, Moon, Settings } from "lucide-react"
import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { AppBreadcrumb } from "@/components/ui/breadcrumb"
import { useTheme } from "next-themes"
import { Switch } from "@/components/ui/switch"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const isDashboard = location.pathname === "/";
  const { theme, setTheme } = useTheme();

  // Theme color state
  const [primaryColor, setPrimaryColor] = useState(() => {
    return localStorage.getItem("primaryColor") || "#22c55e"; // Tailwind green-500
  });

  // Logo uploader state
  const [logo, setLogo] = useState(() => {
    return localStorage.getItem("clinicLogo") || "";
  });

  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--primary",
      hexToHSL(primaryColor)
    );
    localStorage.setItem("primaryColor", primaryColor);
  }, [primaryColor]);

  function hexToHSL(hex: string) {
    // Convert hex to HSL string for CSS variable
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex[1] + hex[2], 16);
      g = parseInt(hex[3] + hex[4], 16);
      b = parseInt(hex[5] + hex[6], 16);
    }
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);
    return `${h} ${s}% ${l}%`;
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setLogo(dataUrl);
      localStorage.setItem("clinicLogo", dataUrl);
    };
    reader.readAsDataURL(file);
  }

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
                  {/* Logo uploader and display */}
                  <label htmlFor="logo-upload" className="flex items-center cursor-pointer mr-2" title="Upload clinic logo">
                    {logo ? (
                      <img src={logo} alt="Clinic Logo" className="h-8 w-8 rounded object-contain bg-white border border-border" style={{marginRight: 8}} />
                    ) : (
                      <span className="inline-block h-8 w-8 rounded bg-muted border border-border flex items-center justify-center text-xs text-muted-foreground mr-2">Logo</span>
                    )}
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      style={{ display: "none" }}
                      aria-label="Upload clinic logo"
                    />
                  </label>
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
                  {/* Settings popover for theme and logo */}
                  <Popover open={settingsOpen} onOpenChange={setSettingsOpen}>
                    <PopoverTrigger asChild>
                      <button
                        className="p-2 rounded hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary flex-shrink-0"
                        aria-label="Open settings"
                      >
                        <Settings className="h-5 w-5" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-56">
                      <div className="flex flex-col gap-4">
                        <div>
                          <label className="block text-xs font-medium mb-1">Primary Color</label>
                          <input
                            type="color"
                            value={primaryColor}
                            onChange={e => setPrimaryColor(e.target.value)}
                            aria-label="Pick primary theme color"
                            className="w-8 h-8 p-0 border-none bg-transparent cursor-pointer"
                            style={{ borderRadius: 4 }}
                          />
                        </div>
                        <div>
                          <label htmlFor="logo-upload" className="block text-xs font-medium mb-1 cursor-pointer">Clinic Logo</label>
                          <div className="flex items-center gap-2">
                            {logo ? (
                              <img src={logo} alt="Clinic Logo" className="h-8 w-8 rounded object-contain bg-white border border-border" />
                            ) : (
                              <span className="inline-block h-8 w-8 rounded bg-muted border border-border flex items-center justify-center text-xs text-muted-foreground">Logo</span>
                            )}
                            <input
                              id="logo-upload"
                              type="file"
                              accept="image/*"
                              onChange={handleLogoUpload}
                              style={{ display: "none" }}
                              aria-label="Upload clinic logo"
                            />
                            <label htmlFor="logo-upload" className="text-xs underline cursor-pointer">Change</label>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Theme Mode</label>
                          <Switch
                            checked={theme === "dark"}
                            onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                            aria-label="Toggle dark mode"
                          >
                            {theme === "dark" ? (
                              <Moon className="h-4 w-4 text-yellow-400 mx-auto" aria-label="Dark mode" />
                            ) : (
                              <Sun className="h-4 w-4 text-yellow-400 mx-auto" aria-label="Light mode" />
                            )}
                          </Switch>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <UserButton afterSignOutUrl="/" />
                </div>
              </header>
              <main className="flex-1 p-2 sm:p-6 w-full min-w-0 overflow-x-auto">
                <AppBreadcrumb />
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