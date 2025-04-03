"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, CheckCircle } from "lucide-react";

export interface MaintenanceMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

interface MaintenanceChatProps {
  staffId: string;
  staffName: string;
}

export function MaintenanceChat({ staffId, staffName }: MaintenanceChatProps) {
  const [messages, setMessages] = useState<MaintenanceMessage[]>([
    {
      id: "msg1",
      senderId: "maint-001",
      senderName: "John Maintenance",
      senderRole: "Maintenance Manager",
      content: "Hello! How can the Care & Maintenance Division help you today?",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      isRead: true,
    },
    {
      id: "msg2",
      senderId: staffId,
      senderName: staffName,
      senderRole: "Ride Manager",
      content:
        "I have a question about the maintenance schedule for the Thunderbolt Roller Coaster.",
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      isRead: true,
    },
    {
      id: "msg3",
      senderId: "maint-001",
      senderName: "John Maintenance",
      senderRole: "Maintenance Manager",
      content:
        "Of course! The Thunderbolt is scheduled for routine maintenance next Tuesday from 8 AM to 12 PM. Is there a specific concern you'd like to address?",
      timestamp: new Date(Date.now() - 900000).toISOString(),
      isRead: true,
    },
  ]);

  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    const userMessage: MaintenanceMessage = {
      id: `msg-${Date.now()}`,
      senderId: staffId,
      senderName: staffName,
      senderRole: "Ride Manager",
      content: newMessage,
      timestamp: new Date().toISOString(),
      isRead: true,
    };

    setMessages([...messages, userMessage]);
    setNewMessage("");

    // Simulate maintenance staff typing
    setIsTyping(true);

    // Simulate response after delay
    setTimeout(() => {
      setIsTyping(false);

      const responseMessage: MaintenanceMessage = {
        id: `msg-${Date.now() + 1}`,
        senderId: "maint-001",
        senderName: "John Maintenance",
        senderRole: "Maintenance Manager",
        content: getAutomaticResponse(newMessage),
        timestamp: new Date().toISOString(),
        isRead: true,
      };

      setMessages((prev) => [...prev, responseMessage]);
    }, 2000);
  };

  const getAutomaticResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();

    if (
      lowerMessage.includes("schedule") ||
      lowerMessage.includes("maintenance")
    ) {
      return "Our maintenance team works 24/7. For specific ride maintenance schedules, please check the maintenance calendar in your dashboard or submit a formal inquiry through the maintenance request tab.";
    } else if (
      lowerMessage.includes("emergency") ||
      lowerMessage.includes("urgent")
    ) {
      return "For emergencies, please call our emergency hotline at 555-MAINT immediately. Safety is our top priority.";
    } else if (
      lowerMessage.includes("part") ||
      lowerMessage.includes("replacement")
    ) {
      return "For parts replacement, please submit a detailed maintenance request with the specific part information. Our team will assess and respond within 24 hours.";
    } else {
      return "Thank you for your message. Our maintenance team will review your inquiry and get back to you shortly. For urgent matters, please use the emergency hotline.";
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
            Chat with the Care & Maintenance Division for assistance
          </p>
        </div>
      </div>

      <Card className="h-[600px] flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src="/placeholder.svg?height=40&width=40" />
                <AvatarFallback>CM</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>Care & Maintenance Division</CardTitle>
                <p className="text-sm text-muted-foreground">
                  <Badge variant="success" className="mr-2">
                    Online
                  </Badge>
                  Available 24/7 for maintenance support
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.senderId === staffId
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.senderId === staffId
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {message.senderId !== staffId && (
                      <div className="font-medium text-sm mb-1">
                        {message.senderName}
                      </div>
                    )}
                    <p>{message.content}</p>
                    <div
                      className={`text-xs mt-1 flex items-center justify-end gap-1 ${
                        message.senderId === staffId
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      }`}
                    >
                      {formatTime(message.timestamp)}
                      {message.senderId === staffId && (
                        <CheckCircle className="h-3 w-3" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg p-3 bg-muted">
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-foreground/70 animate-bounce"></div>
                      <div
                        className="h-2 w-2 rounded-full bg-foreground/70 animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="h-2 w-2 rounded-full bg-foreground/70 animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Textarea
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="min-h-[60px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button onClick={handleSendMessage} className="shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
