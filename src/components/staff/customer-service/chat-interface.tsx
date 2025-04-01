import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  type: "customer" | "staff" | "group";
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

export interface GroupChat {
  groupId: string;
  groupName: string;
  members: string[];
  lastMessage: string;
  unreadCount: number;
  avatar?: string;
}

interface ChatInterfaceProps {
  mode: "customer" | "group";
  customers?: Customer[];
  groups?: GroupChat[];
  onSendMessage: (id: string, message: string) => void;
  userId: string;
}

export function ChatInterface({
  mode,
  customers = [],
  groups = [],
  onSendMessage,
  userId,
}: ChatInterfaceProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [chatMessages, setChatMessages] = useState<
    Record<string, ChatMessage[]>
  >({});
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const list = mode === "customer" ? customers : groups;

  // Fungsi untuk memilih chat dan mengaktifkan listener
  const handleSelectChat = async (id: string) => {
    setSelectedId(id);
    try {
      await invoke("listen_to_group_chat", { groupId: id });
      console.log(`📡 Listening to group chat: ${id}`);

      const messages: ChatMessage[] = await invoke(
        "fetch_group_chat_messages",
        {
          groupId: id,
        }
      );

      setChatMessages((prev) => ({
        ...prev,
        [id]: messages.map((m) => ({
          message_id: m.message_id, // Standardized to `message_id`
          sender_id: m.sender_id,
          content: m.content,
          status: "read" as "sent" | "read", // Assuming fetched messages are read
          timestamp: m.timestamp,
          type: m.type as "customer" | "staff" | "group",
        })),
      }));
    } catch (error) {
      console.error(
        "❌ Failed to start group listener or fetch messages:",
        error
      );
    }
  };

  // Listener untuk update pesan dari Firestore
  useEffect(() => {
    let unlisten: (() => void) | null = null;

    const setupListener = async () => {
      const unlistenFn = await listen("firestore-message-update", (event) => {
        const payload = event.payload as { type: string; message: any };
        const { type, message } = payload;

        if (!selectedId) return;
        const chatId = selectedId;

        if (!message.timestamp) {
          console.warn("Invalid timestamp received:", message.timestamp);
          return;
        }
        if (message.message_id === undefined) {
          console.warn("Invalid message ID received:", message.message_id);
          return;
        }
        console.log("📥 New Firestore message:", message);

        const newMessage: ChatMessage = {
          message_id: message.message_id,
          sender_id: message.sender_id,
          content: message.content,
          status: message.status as "sent" | "read",
          timestamp: message.timestamp,
          type: message.type as "customer" | "staff" | "group",
        };

        setChatMessages((prev) => {
          const existingMessages = prev[chatId] || [];
          if (type === "added") {
            if (
              existingMessages.some(
                (m) => m.message_id === newMessage.message_id
              )
            ) {
              return prev;
            }
            return {
              ...prev,
              [chatId]: [...existingMessages, newMessage].sort(
                (a, b) =>
                  new Date(a.timestamp).getTime() -
                  new Date(b.timestamp).getTime()
              ),
            };
          } else if (type === "modified") {
            return {
              ...prev,
              [chatId]: existingMessages.map((m) =>
                m.message_id === newMessage.message_id ? newMessage : m
              ),
            };
          } else if (type === "removed") {
            return {
              ...prev,
              [chatId]: existingMessages.filter(
                (m) => m.message_id !== newMessage.message_id
              ),
            };
          }
          return prev;
        });
      });
      unlisten = unlistenFn;
    };

    setupListener();

    // Cleanup listener saat komponen unmount
    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, [selectedId]); // Added `selectedId` as a dependency

  // Scroll ke pesan terbaru
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedId, chatMessages]);

  const handleSendMessage = () => {
    if (!selectedId || !messageInput.trim()) return;
    onSendMessage(selectedId, messageInput);
    setMessageInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getName = (item: Customer | GroupChat) =>
    mode === "customer"
      ? (item as Customer).name
      : (item as GroupChat).groupName;

  const getId = (item: Customer | GroupChat) =>
    mode === "customer" ? (item as Customer).id : (item as GroupChat).groupId;

  const getAvatar = (item: Customer | GroupChat) =>
    mode === "customer"
      ? (item as Customer).avatar
      : (item as GroupChat).avatar;

  const getStatus = (item: Customer | GroupChat) =>
    mode === "customer" ? (item as Customer).status : null;

  const filteredList = list.filter(
    (item) =>
      getName(item).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getId(item).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-300px)] min-h-[500px]">
      {/* List */}
      <Card className="md:col-span-1 flex flex-col">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>{mode === "customer" ? "Customers" : "Groups"}</span>
            <Badge variant="outline" className="flex items-center">
              <Users className="h-3 w-3 mr-1" />
              {list.length}
            </Badge>
          </CardTitle>
          <Input
            placeholder={`Search ${
              mode === "customer" ? "customers" : "groups"
            }...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-0">
          <div className="divide-y">
            {filteredList.map((item, index) => {
              const id = getId(item) || `fallback-${index}`;
              const name = getName(item);
              const avatar = getAvatar(item);
              const unread = (item as Customer | GroupChat).unreadCount;
              const status = getStatus(item);

              return (
                <div
                  key={id}
                  className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-muted transition-colors ${
                    selectedId === id ? "bg-muted" : ""
                  }`}
                  onClick={() => handleSelectChat(id)}
                >
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={avatar} />
                      <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {mode === "customer" && (
                      <span
                        className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${getStatusColor(
                          status!
                        )}`}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="font-medium truncate">{name}</p>
                      {mode === "customer" && (
                        <p className="text-xs text-muted-foreground">
                          {formatTime(
                            (item as Customer).lastActive.toISOString()
                          )}
                        </p>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      ID: {id}
                    </p>
                  </div>
                  {unread > 0 && <Badge className="ml-auto">{unread}</Badge>}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="md:col-span-2 flex flex-col">
        {selectedId ? (
          <>
            <CardHeader className="border-b">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage
                    src={getAvatar(
                      list.find((item) => getId(item) === selectedId)!
                    )}
                  />
                  <AvatarFallback>
                    {getName(
                      list.find((item) => getId(item) === selectedId)!
                    ).charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>
                    {getName(list.find((item) => getId(item) === selectedId)!)}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    ID: {selectedId}
                  </p>
                </div>
                {mode === "customer" && (
                  <Badge
                    variant="outline"
                    className={`ml-auto ${
                      getStatus(
                        list.find((item) => getId(item) === selectedId)!
                      ) === "online"
                        ? "text-green-500"
                        : getStatus(
                            list.find((item) => getId(item) === selectedId)!
                          ) === "away"
                        ? "text-yellow-500"
                        : "text-gray-500"
                    }`}
                  >
                    {getStatus(
                      list.find((item) => getId(item) === selectedId)!
                    )}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages[selectedId]?.map((message) => (
                <div
                  key={message.message_id}
                  className={`flex ${
                    message.sender_id === userId
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.sender_id === userId
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p>{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.sender_id === userId
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
            <h3 className="text-lg font-medium">
              No {mode === "customer" ? "Customer" : "Group"} Selected
            </h3>
            <p className="text-muted-foreground">
              Select a {mode === "customer" ? "customer" : "group"} from the
              list to start chatting
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
