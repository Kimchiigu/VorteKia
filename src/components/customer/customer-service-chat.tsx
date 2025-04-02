import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

interface Message {
  message_id: string;
  content: string;
  sender_id: string;
  timestamp: string;
  status: "sent" | "read";
  message_type: "staff" | "customer";
}

interface CustomerServiceChatProps {
  customerId: string;
}

export function CustomerServiceChat({ customerId }: CustomerServiceChatProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [staffStatus, setStaffStatus] = useState<"online" | "offline" | "away">(
    "online"
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages from `official_chat_customer_service/{customer_id}/messages`
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await invoke("fetch_official_chat_messages", {
          customerId: customerId,
        });
        setMessages(response as Message[]);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [customerId]);

  // Set up listener to subcollection `messages` under customer doc
  useEffect(() => {
    let unlisten: (() => void) | null = null;

    const setupListener = async () => {
      try {
        const fn = await listen("firestore-official-chat-update", (event) => {
          const payload = event.payload as { type: string; message: Message };
          if (payload.message && payload.message.sender_id !== customerId) {
            setUnreadCount((prev) => prev + 1);
          }
          setMessages((prev) => [...prev, payload.message]);
        });

        await invoke("listen_to_official_chat", {
          customerId: customerId,
        });

        unlisten = fn;
      } catch (error) {
        console.error("Failed to set up listener:", error);
      }
    };

    setupListener();

    return () => {
      if (unlisten) unlisten();
    };
  }, [customerId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  useEffect(() => {
    if (open && unreadCount > 0) {
      setMessages((prev) =>
        prev.map((m) => ({
          ...m,
          status: "read",
        }))
      );
      setUnreadCount(0);
    }
  }, [open, unreadCount]);

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;

    setMessageInput("");

    await invoke("send_official_chat_message", {
      customerId: customerId,
      senderId: customerId,
      content: messageInput,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setOpen(true)}
      >
        <MessageCircle className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md h-[80vh] flex flex-col p-0">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="flex items-center gap-2">
              <div className="relative">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src="/placeholder.svg?height=32&width=32"
                    alt="Customer Service"
                  />
                  <AvatarFallback>CS</AvatarFallback>
                </Avatar>
                <span
                  className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background ${
                    staffStatus === "online"
                      ? "bg-green-500"
                      : staffStatus === "away"
                      ? "bg-yellow-500"
                      : "bg-gray-500"
                  }`}
                />
              </div>
              <span>Customer Service</span>
              <Badge
                variant="outline"
                className={
                  staffStatus === "online"
                    ? "text-green-500"
                    : staffStatus === "away"
                    ? "text-yellow-500"
                    : "text-gray-500"
                }
              >
                {staffStatus}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.message_id}
                className={`flex ${
                  message.sender_id === customerId
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender_id === customerId
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p>{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.sender_id === customerId
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t mt-auto">
            <div className="flex gap-2">
              <Textarea
                placeholder="Type your message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={handleKeyPress}
                className="min-h-[60px] resize-none"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!messageInput.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
