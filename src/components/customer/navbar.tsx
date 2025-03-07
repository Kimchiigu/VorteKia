import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LoginDialog } from "./login-dialog";
import { useAuth } from "@/components/provider/auth-provider";
import { UserNav } from "./user-nav";
import { NotificationCenter } from "./notification-center";
import { Menu, X } from "lucide-react";
import { ModeToggle } from "../mode-toggle";
import { useNavigate } from "react-router";

export function Navbar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <button onClick={() => navigate("/")}>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text">
              VorteKia
            </span>
          </button>
        </div>

        <div className="flex items-center gap-4">
          <ModeToggle />
          {user ? (
            <>
              <NotificationCenter />
              <UserNav />
            </>
          ) : (
            <LoginDialog />
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && <div className="md:hidden border-t"></div>}
    </header>
  );
}
