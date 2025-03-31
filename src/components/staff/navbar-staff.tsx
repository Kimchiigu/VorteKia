"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, MessageCircle } from "lucide-react";
import { ModeToggle } from "../theme/mode-toggle";
import { useNavigate } from "react-router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChatInterface,
  type Customer,
} from "@/components/staff/customer-service/chat-interface";

export function NavbarStaff() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  // Mock data for chat interface
  const mockCustomers: Customer[] = [
    {
      id: "CUST-001",
      name: "John Doe",
      email: "john.doe@example.com",
      lastActive: new Date(),
      status: "online",
      unreadCount: 2,
    },
    {
      id: "CUST-002",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      lastActive: new Date(Date.now() - 15 * 60000),
      status: "away",
      unreadCount: 0,
    },
    {
      id: "CUST-003",
      name: "Robert Johnson",
      email: "robert.j@example.com",
      lastActive: new Date(Date.now() - 45 * 60000),
      status: "offline",
      unreadCount: 0,
    },
    {
      id: "CUST-004",
      name: "Emily Wilson",
      email: "emily.w@example.com",
      lastActive: new Date(Date.now() - 5 * 60000),
      status: "online",
      unreadCount: 1,
    },
    {
      id: "CUST-005",
      name: "Michael Brown",
      email: "michael.b@example.com",
      lastActive: new Date(Date.now() - 120 * 60000),
      status: "offline",
      unreadCount: 0,
    },
  ];

  const handleSendMessage = (customerId: string, message: string) => {
    console.log(`Sending message to ${customerId}: ${message}`);
    // In a real app, this would send the message to the backend
  };

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
          <Button
            variant="outline"
            size="icon"
            onClick={() => setChatOpen(true)}
            className="relative"
          >
            <MessageCircle className="h-5 w-5" />
            {mockCustomers.reduce(
              (count, customer) => count + customer.unreadCount,
              0
            ) > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {mockCustomers.reduce(
                  (count, customer) => count + customer.unreadCount,
                  0
                )}
              </span>
            )}
          </Button>
          <ModeToggle />
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

      {/* Chat Dialog */}
      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent className="max-w-5xl w-[90vw] h-[80vh] max-h-[800px]">
          <DialogHeader>
            <DialogTitle>Staff Chat</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <ChatInterface
              customers={mockCustomers}
              onSendMessage={handleSendMessage}
            />
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
