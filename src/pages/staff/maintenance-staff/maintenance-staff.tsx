import { useState } from "react";
import { Navbar } from "@/components/navbar/navbar";
import { HeroStaff } from "@/components/staff/hero-staff";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ScheduleManagement,
  type MaintenanceTask,
  type TaskStatus,
} from "@/components/staff/schedule-management";
import { format } from "date-fns";
import { Clock, MapPin, AlertTriangle, CheckCircle } from "lucide-react";

// Dummy data for the current staff member
const currentStaff = {
  id: "staff2",
  name: "Sarah Johnson",
  role: "Mechanical Specialist",
  skills: ["Hydraulics", "Pumps", "Water Systems"],
  currentlyAssigned: true,
};

// Dummy data for assigned tasks
const assignedTasks: MaintenanceTask[] = [
  {
    id: "task2",
    title: "Water Ride Pump Repair",
    description: "Fix the malfunctioning water pump on the log flume ride.",
    location: "Water World - Log Flume",
    priority: "Critical",
    status: "In Progress",
    assignedTo: currentStaff,
    scheduledDate: new Date(2025, 2, 31, 9, 0),
    scheduledTime: "09:00 AM",
    estimatedDuration: "4 hours",
    reportId: "rep2",
  },
];

// Dummy data for completed tasks history
const completedTasks: MaintenanceTask[] = [
  {
    id: "task6",
    title: "Bumper Car Electrical Repair",
    description: "Repair electrical connections on bumper car attraction.",
    location: "Kids Zone - Bumper Cars",
    priority: "High",
    status: "Completed",
    assignedTo: currentStaff,
    scheduledDate: new Date(2025, 2, 28, 10, 0),
    scheduledTime: "10:00 AM",
    estimatedDuration: "3 hours",
    reportId: "rep6",
  },
  {
    id: "task7",
    title: "Ticket Booth AC Maintenance",
    description: "Service the air conditioning unit at the main ticket booth.",
    location: "Entrance - Main Ticket Booth",
    priority: "Medium",
    status: "Approved",
    assignedTo: currentStaff,
    scheduledDate: new Date(2025, 2, 27, 13, 0),
    scheduledTime: "01:00 PM",
    estimatedDuration: "2 hours",
    reportId: "rep7",
  },
];

export default function MaintenanceStaff() {
  const [currentTasks, setCurrentTasks] =
    useState<MaintenanceTask[]>(assignedTasks);
  const [taskHistory, setTaskHistory] =
    useState<MaintenanceTask[]>(completedTasks);
  const [activeTab, setActiveTab] = useState("current");

  const handleUpdateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    // Find the task that's being updated
    const taskToUpdate = currentTasks.find((task) => task.id === taskId);

    if (!taskToUpdate) return;

    // Remove the task from current tasks
    setCurrentTasks((prevTasks) =>
      prevTasks.filter((task) => task.id !== taskId)
    );

    // Add the updated task to the history
    setTaskHistory((prevHistory) => [
      { ...taskToUpdate, status: newStatus },
      ...prevHistory,
    ]);
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case "Low":
        return "secondary";
      case "Medium":
        return "info";
      case "High":
        return "warning";
      case "Critical":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <main className="min-h-screen w-full bg-background">
        <div className="mt-12 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">
                Maintenance Staff Dashboard
              </h1>
              <p className="text-muted-foreground">
                Welcome back, {currentStaff.name}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Current Status:</span>
              <Badge
                variant={currentStaff.currentlyAssigned ? "warning" : "success"}
              >
                {currentStaff.currentlyAssigned
                  ? "Assigned to Task"
                  : "Available"}
              </Badge>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="current">Current Tasks</TabsTrigger>
              <TabsTrigger value="history">Task History</TabsTrigger>
              <TabsTrigger value="submit">Submit Report</TabsTrigger>
            </TabsList>

            <TabsContent value="current" className="mt-6">
              {currentTasks.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                      No Current Tasks
                    </h3>
                    <p className="text-muted-foreground text-center max-w-md">
                      You don't have any assigned tasks at the moment. Check
                      back later or contact your manager.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {currentTasks.map((task: any) => (
                    <Card key={task.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle>{task.title}</CardTitle>
                          <Badge
                            variant={
                              getPriorityBadgeVariant(task.priority) as
                                | "default"
                                | "secondary"
                                | "destructive"
                                | "outline"
                                | "success"
                                | "info"
                                | "warning"
                            }
                          >
                            {task.priority} Priority
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-muted-foreground">
                          {task.description}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{task.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {task.scheduledDate &&
                                format(task.scheduledDate, "MMM dd, yyyy")}{" "}
                              at {task.scheduledTime}
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <Button
                            onClick={() =>
                              handleUpdateTaskStatus(task.id, "Completed")
                            }
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark as Completed
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <ScheduleManagement
                tasks={taskHistory}
                availableStaff={[]}
                role="staff"
                onUpdateTaskStatus={() => {}}
              />
            </TabsContent>

            <TabsContent value="submit" className="mt-6">
              <h2 className="text-2xl font-bold mb-4">
                Submit Maintenance Report
              </h2>
              <p className="text-muted-foreground mb-6">
                This section would use the report-list.tsx component to submit
                maintenance reports.
              </p>

              {currentTasks.length > 0 && (
                <Card className="border-warning bg-warning/10">
                  <CardContent className="flex items-center gap-4 py-4">
                    <AlertTriangle className="h-6 w-6 text-warning" />
                    <div>
                      <h3 className="font-semibold">
                        Complete Current Task First
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        You need to complete your current task before submitting
                        a new report.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
    </main>
  );
}
