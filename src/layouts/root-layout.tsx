import { ThemeProvider } from "@/components/provider/theme-provider";
import { Outlet } from "react-router";
import { AuthProvider } from "@/components/provider/auth-provider";
import { Toaster } from "@/components/ui/sonner";

function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <div className="relative flex min-h-svh flex-col bg-background">
          <Outlet />
        </div>
        <Toaster />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default RootLayout;
