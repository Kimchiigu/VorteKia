"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

interface Message {
  message_id: string;
  content: string;
  sender_id: string;
  timestamp: string;
  status: "sent" | "read";
  message_type: "staff" | "maintenance";
}

interface MaintenanceChatProps {
  rideManagerId: string;
}

export function MaintenanceChat({ rideManagerId }: MaintenanceChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [staffStatus, setStaffStatus] = useState<"online" | "offline" | "away">(
    "online"
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await invoke("fetch_maintenance_chat_messages", {
          rideManagerId: rideManagerId,
        });
        setMessages(response as Message[]);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [rideManagerId]);

  useEffect(() => {
    let unlisten: (() => void) | null = null;

    const setupListener = async () => {
      try {
        const fn = await listen(
          "firestore-maintenance-chat-update",
          (event) => {
            const payload = event.payload as { type: string; message: Message };
            if (
              payload.message &&
              payload.message.sender_id !== rideManagerId
            ) {
              setUnreadCount((prev) => prev + 1);
            }
            setMessages((prev) => [...prev, payload.message]);
          }
        );

        await invoke("listen_to_maintenance_chat", {
          rideManagerId: rideManagerId,
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
  }, [rideManagerId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (unreadCount > 0) {
      setMessages((prev) =>
        prev.map((m) => ({
          ...m,
          status: "read",
        }))
      );
      setUnreadCount(0);
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;

    setMessageInput("");

    await invoke("send_maintenance_chat_message", {
      rideManagerId: rideManagerId,
      senderId: rideManagerId,
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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">
            Maintenance Chat
          </h2>
          <p className="text-muted-foreground">
            Chat with Care & Maintenance Division for Operational Assistance
          </p>
        </div>
      </div>
      <Card className="flex flex-col h-[calc(100vh-300px)] min-h-[500px]">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <div className="relative">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src="/placeholder.svg?height=32&width=32"
                  alt="Maintenance Division"
                />
                <AvatarFallback>MD</AvatarFallback>
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
            <span>Maintenance Division</span>
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
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.message_id}
              className={`flex ${
                message.sender_id === rideManagerId
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.sender_id === rideManagerId
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p>{message.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.sender_id === rideManagerId
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
        </CardContent>

        <div className="p-3 border-t mt-auto">
          <div className="flex gap-2">
            <Textarea
              placeholder="Type your message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={handleKeyPress}
              className="min-h-[60px] resize-none"
            />
            <Button onClick={handleSendMessage} disabled={!messageInput.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
