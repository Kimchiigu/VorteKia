"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, User, Users } from "lucide-react";

export interface ChatMessage {
  id: string;
  sender: string;
  senderType: "customer" | "staff";
  content: string;
  timestamp: Date;
  read: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  lastActive: Date;
  status: "online" | "offline" | "away";
  unreadCount: number;
  avatar?: string;
}

interface ChatInterfaceProps {
  customers: Customer[];
  onSendMessage: (customerId: string, message: string) => void;
}

export function ChatInterface({
  customers,
  onSendMessage,
}: ChatInterfaceProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null
  );
  const [messageInput, setMessageInput] = useState("");
  const [chatMessages, setChatMessages] = useState<
    Record<string, ChatMessage[]>
  >({});
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Dummy chat history for demo purposes
  useEffect(() => {
    const dummyChats: Record<string, ChatMessage[]> = {};

    customers.forEach((customer) => {
      const messageCount = Math.floor(Math.random() * 5) + 1;
      const messages: ChatMessage[] = [];

      for (let i = 0; i < messageCount; i++) {
        const isCustomer = Math.random() > 0.5;
        messages.push({
          id: `msg-${customer.id}-${i}`,
          sender: isCustomer ? customer.name : "Customer Service",
          senderType: isCustomer ? "customer" : "staff",
          content: isCustomer
            ? [
                "Hello, I need help with my ticket.",
                "Where is the nearest restaurant?",
                "What time does the park close?",
              ][Math.floor(Math.random() * 3)]
            : [
                "I'd be happy to help you with that.",
                "Let me check that for you.",
                "Is there anything else I can assist you with?",
              ][Math.floor(Math.random() * 3)],
          timestamp: new Date(Date.now() - Math.floor(Math.random() * 3600000)),
          read: true,
        });
      }

      dummyChats[customer.id] = messages.sort(
        (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
      );
    });

    setChatMessages(dummyChats);
  }, [customers]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedCustomerId, chatMessages]);

  const handleSendMessage = () => {
    if (!selectedCustomerId || !messageInput.trim()) return;

    onSendMessage(selectedCustomerId, messageInput);

    // Add message to chat (in a real app, this would be handled by the onSendMessage callback)
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "Customer Service",
      senderType: "staff",
      content: messageInput,
      timestamp: new Date(),
      read: true,
    };

    setChatMessages((prev) => ({
      ...prev,
      [selectedCustomerId]: [...(prev[selectedCustomerId] || []), newMessage],
    }));

    setMessageInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      case "offline":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-300px)] min-h-[500px]">
      {/* Customer List */}
      <Card className="md:col-span-1 flex flex-col">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Customers</span>
            <Badge variant="outline" className="flex items-center">
              <Users className="h-3 w-3 mr-1" />
              {customers.length}
            </Badge>
          </CardTitle>
          <div className="relative">
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-0">
          <div className="divide-y">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-muted transition-colors ${
                  selectedCustomerId === customer.id ? "bg-muted" : ""
                }`}
                onClick={() => setSelectedCustomerId(customer.id)}
              >
                <div className="relative">
                  <Avatar>
                    <AvatarImage src={customer.avatar} />
                    <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span
                    className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${getStatusColor(
                      customer.status
                    )}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="font-medium truncate">{customer.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatTime(customer.lastActive)}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    ID: {customer.id}
                  </p>
                </div>
                {customer.unreadCount > 0 && (
                  <Badge className="ml-auto">{customer.unreadCount}</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="md:col-span-2 flex flex-col">
        {selectedCustomerId ? (
          <>
            <CardHeader className="border-b">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage
                    src={
                      customers.find((c) => c.id === selectedCustomerId)?.avatar
                    }
                  />
                  <AvatarFallback>
                    {customers
                      .find((c) => c.id === selectedCustomerId)
                      ?.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>
                    {customers.find((c) => c.id === selectedCustomerId)?.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    ID: {selectedCustomerId}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={`ml-auto ${
                    customers.find((c) => c.id === selectedCustomerId)
                      ?.status === "online"
                      ? "text-green-500"
                      : customers.find((c) => c.id === selectedCustomerId)
                          ?.status === "away"
                      ? "text-yellow-500"
                      : "text-gray-500"
                  }`}
                >
                  {customers.find((c) => c.id === selectedCustomerId)?.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages[selectedCustomerId]?.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.senderType === "staff"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.senderType === "staff"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p>{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.senderType === "staff"
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
