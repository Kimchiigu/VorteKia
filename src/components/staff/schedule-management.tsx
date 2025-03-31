import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Search, CalendarIcon, Plus, Edit, CheckCircle } from "lucide-react";
import { format } from "date-fns";

export type TaskStatus = "Pending" | "In Progress" | "Completed" | "Approved";

export interface Staff {
  id: string;
  name: string;
  role: string;
  skills: string[];
  currentlyAssigned: boolean;
}

export interface MaintenanceTask {
  id: string;
  title: string;
  description: string;
  location: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  status: TaskStatus;
  assignedTo?: Staff;
  scheduledDate?: Date;
  scheduledTime?: string;
  estimatedDuration: string;
  reportId?: string;
}

interface ScheduleManagementProps {
  tasks: MaintenanceTask[];
  availableStaff: Staff[];
  role?: "manager" | "supervisor" | "staff";
  onAssignTask?: (
    taskId: string,
    staffId: string,
    date: Date,
    time: string
  ) => void;
  onUpdateTaskStatus?: (taskId: string, newStatus: TaskStatus) => void;
}

export function ScheduleManagement({
  tasks,
  availableStaff,
  role = "manager",
  onAssignTask,
  onUpdateTaskStatus,
}: ScheduleManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(
    null
  );
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.assignedTo?.name.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      );

    const matchesStatus =
      statusFilter === "all" || task.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleAssignTask = () => {
    if (
      selectedTask &&
      selectedStaff &&
      selectedDate &&
      selectedTime &&
      onAssignTask
    ) {
      onAssignTask(selectedTask.id, selectedStaff, selectedDate, selectedTime);
      setIsAssignDialogOpen(false);
      resetSelections();
    }
  };

  const handleUpdateStatus = (taskId: string, newStatus: TaskStatus) => {
    if (onUpdateTaskStatus) {
      onUpdateTaskStatus(taskId, newStatus);
    }
  };

  const resetSelections = () => {
    setSelectedStaff("");
    setSelectedDate(undefined);
    setSelectedTime("");
  };

  const getStatusBadgeVariant = (status: TaskStatus) => {
    switch (status) {
      case "Pending":
        return "secondary";
      case "In Progress":
        return "warning";
      case "Completed":
        return "info";
      case "Approved":
        return "success";
      default:
        return "secondary";
    }
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

  const canAssignTasks = role === "manager" || role === "supervisor";
  const canUpdateStatus = role === "staff" || role === "manager";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">
            Maintenance Schedule
          </h2>
          <p className="text-muted-foreground">
            Manage and assign maintenance tasks
          </p>
        </div>
        {canAssignTasks && (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add New Task
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Scheduled</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No tasks found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div>{task.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {task.estimatedDuration}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{task.location}</TableCell>
                        <TableCell>
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
                            {task.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {task.assignedTo
                            ? task.assignedTo.name
                            : "Unassigned"}
                        </TableCell>
                        <TableCell>
                          {task.scheduledDate ? (
                            <div className="text-sm">
                              <div>
                                {format(task.scheduledDate, "MMM dd, yyyy")}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {task.scheduledTime}
                              </div>
                            </div>
                          ) : (
                            "Not scheduled"
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              getStatusBadgeVariant(task.status) as
                                | "default"
                                | "secondary"
                                | "destructive"
                                | "outline"
                                | "success"
                                | "info"
                                | "warning"
                            }
                          >
                            {task.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {canAssignTasks && task.status === "Pending" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedTask(task);
                                setIsAssignDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Assign
                            </Button>
                          )}
                          {role === "staff" &&
                            task.status === "In Progress" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleUpdateStatus(task.id, "Completed")
                                }
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark Complete
                              </Button>
                            )}
                          {role === "manager" &&
                            task.status === "Completed" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleUpdateStatus(task.id, "Approved")
                                }
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </Button>
                            )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assign Task Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assign Maintenance Task</DialogTitle>
            <DialogDescription>
              Assign staff, date, and time for the selected task.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Task Details</h4>
              <p className="text-sm font-semibold">{selectedTask?.title}</p>
              <p className="text-sm text-muted-foreground">
                {selectedTask?.description}
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span>Location:</span>
                <span className="font-medium">{selectedTask?.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span>Estimated Duration:</span>
                <span className="font-medium">
                  {selectedTask?.estimatedDuration}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="staff" className="text-sm font-medium">
                Assign Staff
              </label>
              <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                <SelectTrigger id="staff">
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent>
                  {availableStaff
                    .filter((staff) => !staff.currentlyAssigned)
                    .map((staff) => (
                      <SelectItem key={staff.id} value={staff.id}>
                        {staff.name} - {staff.role}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Schedule Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label htmlFor="time" className="text-sm font-medium">
                Schedule Time
              </label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger id="time">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="08:00 AM">08:00 AM</SelectItem>
                  <SelectItem value="09:00 AM">09:00 AM</SelectItem>
                  <SelectItem value="10:00 AM">10:00 AM</SelectItem>
                  <SelectItem value="11:00 AM">11:00 AM</SelectItem>
                  <SelectItem value="12:00 PM">12:00 PM</SelectItem>
                  <SelectItem value="01:00 PM">01:00 PM</SelectItem>
                  <SelectItem value="02:00 PM">02:00 PM</SelectItem>
                  <SelectItem value="03:00 PM">03:00 PM</SelectItem>
                  <SelectItem value="04:00 PM">04:00 PM</SelectItem>
                  <SelectItem value="05:00 PM">05:00 PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAssignDialogOpen(false);
                resetSelections();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignTask}
              disabled={!selectedStaff || !selectedDate || !selectedTime}
            >
              Assign Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
