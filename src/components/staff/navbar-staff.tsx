import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
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
  type GroupChat,
} from "@/components/staff/customer-service/chat-interface";

interface NavbarStaffProps {
  userId: string;
  role: string;
}

export function NavbarStaff({ userId, role }: NavbarStaffProps) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [groups, setGroups] = useState<GroupChat[]>([]);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const groupIdsByRole: Record<string, string[]> = {
          "Customer Service": ["GRP-CSS"],
          "Lost And Found Staff": ["GRP-LFS"],
          "Ride Manager": ["GRP-OPS"],
          "Ride Staff": ["GRP-OPS"],
          "F&B Supervisor": ["GRP-CSM"],
          Chef: ["GRP-CSM"],
          Waiter: ["GRP-CSM"],
          "Maintenance Manager": ["GRP-CMD"],
          "Maintenance Staff": ["GRP-CMD"],
          "Retail Manager": ["GRP-MKT"],
          "Sales Associate": ["GRP-MKT"],
          CEO: ["GRP-EXC"],
          CFO: ["GRP-EXC"],
          COO: ["GRP-EXC"],
        };

        const baseGroups = groupIdsByRole[role] ?? [];
        const allowedGroups = [...new Set([...baseGroups, "GRP-STAFF"])];

        const results: GroupChat[] = [];
        for (const id of allowedGroups) {
          const group = await invoke<any>("fetch_group_info", {
            groupId: id,
          });
          results.push({
            groupId: id,
            groupName: group.name,
            members: group.members,
            lastMessage: "",
            unreadCount: 0,
          });
        }

        setGroups(results);
      } catch (err) {
        console.error("Failed to fetch groups:", err);
      }
    };

    fetchGroups();
  }, [role]);

  const handleSendMessage = async (groupId: string, message: string) => {
    try {
      await invoke("send_group_message", {
        groupId: groupId,
        senderId: userId,
        content: message,
      });
      console.log(`✅ Message sent to ${groupId}`);
    } catch (error) {
      console.error("❌ Failed to send message:", error);
    }
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
            {groups.reduce((count, group) => count + group.unreadCount, 0) >
              0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {groups.reduce((count, group) => count + group.unreadCount, 0)}
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

      {mobileMenuOpen && <div className="md:hidden border-t"></div>}

      {/* Group Chat Dialog */}
      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent className="max-w-5xl w-[90vw] h-[80vh] max-h-[800px]">
          <DialogHeader>
            <DialogTitle>Staff Group Chat - {role}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <ChatInterface
              mode="group"
              groups={groups}
              onSendMessage={handleSendMessage}
              userId={userId}
            />
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
