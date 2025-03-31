import { useState } from "react";
import { Navbar } from "@/components/navbar/navbar";
import { HeroStaff } from "@/components/staff/hero-staff";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ScheduleManagement,
  type MaintenanceTask,
  type Staff,
  type TaskStatus,
} from "@/components/staff/schedule-management";

// Dummy data for maintenance tasks
const maintenanceTasks: MaintenanceTask[] = [
  {
    id: "task1",
    title: "Roller Coaster Inspection",
    description:
      "Perform routine safety inspection on the main roller coaster.",
    location: "Thrill Zone - Roller Coaster A",
    priority: "High",
    status: "Pending",
    estimatedDuration: "3 hours",
    reportId: "rep1",
  },
  {
    id: "task2",
    title: "Water Ride Pump Repair",
    description: "Fix the malfunctioning water pump on the log flume ride.",
    location: "Water World - Log Flume",
    priority: "Critical",
    status: "In Progress",
    assignedTo: {
      id: "staff2",
      name: "Sarah Johnson",
      role: "Mechanical Specialist",
      skills: ["Hydraulics", "Pumps", "Water Systems"],
      currentlyAssigned: true,
    },
    scheduledDate: new Date(2025, 2, 31, 9, 0),
    scheduledTime: "09:00 AM",
    estimatedDuration: "4 hours",
    reportId: "rep2",
  },
  {
    id: "task3",
    title: "Carousel Light Replacement",
    description: "Replace burned out lights on the main carousel.",
    location: "Kids Zone - Carousel",
    priority: "Medium",
    status: "Completed",
    assignedTo: {
      id: "staff3",
      name: "Mike Wilson",
      role: "Electrical Technician",
      skills: ["Electrical", "Lighting", "General Maintenance"],
      currentlyAssigned: false,
    },
    scheduledDate: new Date(2025, 2, 30, 14, 0),
    scheduledTime: "02:00 PM",
    estimatedDuration: "2 hours",
    reportId: "rep3",
  },
  {
    id: "task4",
    title: "Ferris Wheel Motor Inspection",
    description: "Inspect the main drive motor on the ferris wheel.",
    location: "Central Plaza - Ferris Wheel",
    priority: "High",
    status: "Approved",
    assignedTo: {
      id: "staff1",
      name: "John Smith",
      role: "Senior Technician",
      skills: ["Mechanical", "Electrical", "Structural"],
      currentlyAssigned: false,
    },
    scheduledDate: new Date(2025, 2, 29, 8, 0),
    scheduledTime: "08:00 AM",
    estimatedDuration: "3 hours",
    reportId: "rep4",
  },
  {
    id: "task5",
    title: "Food Court Refrigeration Maintenance",
    description:
      "Perform routine maintenance on the food court refrigeration units.",
    location: "Main Food Court",
    priority: "Low",
    status: "Pending",
    estimatedDuration: "2 hours",
    reportId: "rep5",
  },
];

// Dummy data for maintenance staff
const maintenanceStaff: Staff[] = [
  {
    id: "staff1",
    name: "John Smith",
    role: "Senior Technician",
    skills: ["Mechanical", "Electrical", "Structural"],
    currentlyAssigned: false,
  },
  {
    id: "staff2",
    name: "Sarah Johnson",
    role: "Mechanical Specialist",
    skills: ["Hydraulics", "Pumps", "Water Systems"],
    currentlyAssigned: true,
  },
  {
    id: "staff3",
    name: "Mike Wilson",
    role: "Electrical Technician",
    skills: ["Electrical", "Lighting", "General Maintenance"],
    currentlyAssigned: false,
  },
  {
    id: "staff4",
    name: "Lisa Chen",
    role: "Safety Inspector",
    skills: ["Safety Systems", "Compliance", "Documentation"],
    currentlyAssigned: false,
  },
  {
    id: "staff5",
    name: "Robert Davis",
    role: "General Maintenance",
    skills: ["Carpentry", "Plumbing", "General Repairs"],
    currentlyAssigned: false,
  },
];

export default function MaintenanceManager() {
  const [tasks, setTasks] = useState<MaintenanceTask[]>(maintenanceTasks);
  const [staff, setStaff] = useState<Staff[]>(maintenanceStaff);
  const [activeTab, setActiveTab] = useState("schedule");

  const handleAssignTask = (
    taskId: string,
    staffId: string,
    date: Date,
    time: string
  ) => {
    // Find the selected staff member
    const selectedStaff = staff.find((s) => s.id === staffId);

    if (!selectedStaff) return;

    // Update the task with the assigned staff and schedule
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              assignedTo: selectedStaff,
              scheduledDate: date,
              scheduledTime: time,
              status: "In Progress",
            }
          : task
      )
    );

    // Update the staff's assignment status
    setStaff((prevStaff) =>
      prevStaff.map((s) =>
        s.id === staffId ? { ...s, currentlyAssigned: true } : s
      )
    );
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === taskId) {
          // If task is being marked as approved, free up the assigned staff
          if (newStatus === "Approved" && task.assignedTo) {
            setStaff((prevStaff) =>
              prevStaff.map((s) =>
                s.id === task.assignedTo?.id
                  ? { ...s, currentlyAssigned: false }
                  : s
              )
            );
          }
          return { ...task, status: newStatus };
        }
        return task;
      })
    );
  };

  return (
    <main className="min-h-screen w-full bg-background">
        <div className="mt-12 space-y-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="schedule">Schedule Management</TabsTrigger>
              <TabsTrigger value="reports">Maintenance Reports</TabsTrigger>
            </TabsList>
            <TabsContent value="schedule" className="mt-6">
              <ScheduleManagement
                tasks={tasks}
                availableStaff={staff}
                role="manager"
                onAssignTask={handleAssignTask}
                onUpdateTaskStatus={handleUpdateTaskStatus}
              />
            </TabsContent>
            <TabsContent value="reports" className="mt-6">
              <h2 className="text-2xl font-bold mb-4">Maintenance Reports</h2>
              <p className="text-muted-foreground">
                This section would use the report-list.tsx component to display
                and manage maintenance reports.
              </p>
            </TabsContent>
          </Tabs>
        </div>
    </main>
  );
}
