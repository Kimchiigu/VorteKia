import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, User, Users } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

export interface ChatMessage {
  message_id: string;
  sender_id: string;
  content: string;
  status: "sent" | "read";
  timestamp: string;
  type: "customer" | "staff";
}

export interface CustomerInfo {
  id: string;
}

interface OfficialChatInterfaceProps {
  userId: string;
}

export function OfficialChatInterface({ userId }: OfficialChatInterfaceProps) {
  const [customers, setCustomers] = useState<CustomerInfo[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [chatMessages, setChatMessages] = useState<
    Record<string, ChatMessage[]>
  >({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const result: CustomerInfo[] = await invoke(
          "fetch_official_chat_customers"
        );
        console.log("Fetched customers:", result);
        setCustomers(result);
      } catch (e) {
        console.error("❌ Failed to fetch chat customers:", e);
      }
    };
    fetchCustomers();
  }, []);

  const handleSelectChat = async (customerId: string) => {
    setSelectedId(customerId);

    try {
      await invoke("listen_to_official_chat", { customerId: customerId });

      const messages: ChatMessage[] = await invoke(
        "fetch_official_chat_messages",
        {
          customerId: customerId,
        }
      );

      setChatMessages((prev) => ({ ...prev, [customerId]: messages }));
    } catch (err) {
      console.error("❌ Failed to fetch or listen:", err);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedId || !messageInput.trim()) return;

    setMessageInput("");

    await invoke("send_official_chat_message", {
      customerId: selectedId,
      senderId: userId,
      content: messageInput,
    });
  };

  useEffect(() => {
    const setupListener = async () => {
      await listen("firestore-official-chat-update", (event) => {
        const payload = event.payload as { type: string; message: ChatMessage };
        const msg = payload.message;
        const chatId = msg.sender_id === userId ? selectedId! : msg.sender_id;

        setChatMessages((prev) => {
          const msgs = prev[chatId] || [];
          if (payload.type === "added") {
            if (msgs.find((m) => m.message_id === msg.message_id)) return prev;
            return {
              ...prev,
              [chatId]: [...msgs, msg].sort(
                (a, b) =>
                  new Date(a.timestamp).getTime() -
                  new Date(b.timestamp).getTime()
              ),
            };
          }
          return prev;
        });
      });
    };

    setupListener();
  }, [selectedId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, selectedId]);

  const formatTime = (timestamp: string) =>
    new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-300px)] min-h-[500px]">
      <Card className="md:col-span-1 flex flex-col">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Customer Service Chats</span>
            <Badge variant="outline" className="flex items-center">
              <Users className="h-3 w-3 mr-1" />
              {customers.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-0">
          <div className="divide-y">
            {customers.map((c) => (
              <div
                key={c.id}
                className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-muted ${
                  selectedId === c.id ? "bg-muted" : ""
                }`}
                onClick={() => handleSelectChat(c.id)}
              >
                <Avatar>
                  <AvatarFallback>{c.id.slice(-3)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">ID: {c.id}</p>
                  <p className="text-sm text-muted-foreground">Customer Chat</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 flex flex-col">
        {selectedId ? (
          <>
            <CardHeader className="border-b">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  <AvatarFallback>CS</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>Customer: {selectedId}</CardTitle>
                  <p className="text-sm text-muted-foreground">Official Chat</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages[selectedId]?.map((msg) => {
                const isStaff = msg.sender_id.startsWith("CSS");
                return (
                  <div
                    key={msg.message_id}
                    className={`flex ${
                      isStaff ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        isStaff
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isStaff
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        }`}
                      >
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </CardContent>
            <div className="p-3 border-t">
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
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <User className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No Customer Selected</h3>
            <p className="text-muted-foreground">
              Select a customer from the list to start chatting
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
