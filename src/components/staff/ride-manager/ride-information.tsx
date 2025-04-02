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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Edit, Users, AlertTriangle, Info } from "lucide-react";

export interface RideStaff {
  id: string;
  name: string;
  role: string;
  shift: string;
  experience: string;
  status: "On Duty" | "Off Duty" | "On Break";
}

export interface RideDetails {
  id: string;
  name: string;
  description: string;
  location: string;
  status: "Operational" | "Maintenance" | "Closed";
  capacity: number;
  hourlyCapacity: number;
  minHeight: number;
  duration: number;
  thrill: "Low" | "Moderate" | "High" | "Extreme";
  openingYear: number;
  lastMaintenance: string;
  nextMaintenance: string;
  maintenanceFrequency: string;
  operatingHours: string;
  staffRequired: number;
  currentStaffCount: number;
  image: string;
}

interface RideInformationProps {
  rides: RideDetails[];
  staff: RideStaff[];
  onAssignStaff: (rideId: string, staffId: string) => void;
  onEditRide: (ride: RideDetails) => void;
}

export function RideInformation({
  rides,
  staff,
  onAssignStaff,
  onEditRide,
}: RideInformationProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRide, setSelectedRide] = useState<RideDetails | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isStaffDialogOpen, setIsStaffDialogOpen] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [activeTab, setActiveTab] = useState("details");

  const filteredRides = rides.filter(
    (ride) =>
      ride.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ride.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (ride: RideDetails) => {
    setSelectedRide(ride);
    setIsDetailsDialogOpen(true);
  };

  const handleOpenStaffDialog = (ride: RideDetails) => {
    setSelectedRide(ride);
    setIsStaffDialogOpen(true);
  };

  const handleAssignStaff = () => {
    if (selectedRide && selectedStaffId) {
      onAssignStaff(selectedRide.id, selectedStaffId);
      setSelectedStaffId("");
      setIsStaffDialogOpen(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Operational":
        return "success";
      case "Maintenance":
        return "warning";
      case "Closed":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getThrillBadgeVariant = (thrill: string) => {
    switch (thrill) {
      case "Low":
        return "secondary";
      case "Moderate":
        return "info";
      case "High":
        return "warning";
      case "Extreme":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStaffStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "On Duty":
        return "success";
      case "Off Duty":
        return "secondary";
      case "On Break":
        return "warning";
      default:
        return "secondary";
    }
  };

  const getAvailableStaff = () => {
    return staff.filter((s) => s.status !== "Off Duty");
  };

  const getRideStaff = (rideId: string) => {
    // In a real app, this would filter staff assigned to this ride
    return staff.filter((_, index) => index % 3 === 0);
  };

  const getStaffingStatus = (current: number, required: number) => {
    const percentage = (current / required) * 100;
    if (percentage >= 100) return "Fully Staffed";
    if (percentage >= 75) return "Adequately Staffed";
    if (percentage >= 50) return "Understaffed";
    return "Critically Understaffed";
  };

  const getStaffingStatusVariant = (current: number, required: number) => {
    const percentage = (current / required) * 100;
    if (percentage >= 100) return "success";
    if (percentage >= 75) return "info";
    if (percentage >= 50) return "warning";
    return "destructive";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">
            Ride Information
          </h2>
          <p className="text-muted-foreground">
            View and manage ride details and staff assignments
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Rides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search rides by name or location..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ride Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Thrill Level</TableHead>
                    <TableHead>Staffing</TableHead>
                    <TableHead>Maintenance</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRides.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No rides found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRides.map((ride) => (
                      <TableRow key={ride.id}>
                        <TableCell className="font-medium">
                          {ride.name}
                        </TableCell>
                        <TableCell>{ride.location}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              getStatusBadgeVariant(ride.status) as
                                | "default"
                                | "secondary"
                                | "destructive"
                                | "outline"
                                | "success"
                                | "warning"
                                | "info"
                            }
                          >
                            {ride.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              getThrillBadgeVariant(ride.thrill) as
                                | "default"
                                | "secondary"
                                | "destructive"
                                | "outline"
                                | "success"
                                | "warning"
                                | "info"
                            }
                          >
                            {ride.thrill}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              getStaffingStatusVariant(
                                ride.currentStaffCount,
                                ride.staffRequired
                              ) as
                                | "default"
                                | "secondary"
                                | "destructive"
                                | "outline"
                                | "success"
                                | "warning"
                                | "info"
                            }
                          >
                            {ride.currentStaffCount}/{ride.staffRequired}
                          </Badge>
                        </TableCell>
                        <TableCell>{ride.nextMaintenance}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(ride)}
                            >
                              <Info className="h-4 w-4 mr-2" />
                              Details
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenStaffDialog(ride)}
                            >
                              <Users className="h-4 w-4 mr-2" />
                              Staff
                            </Button>
                          </div>
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

      {/* Ride Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Ride Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected ride
            </DialogDescription>
          </DialogHeader>
          {selectedRide && (
            <div className="space-y-4">
              <div className="relative h-48 w-full rounded-md bg-muted overflow-hidden">
                <img
                  src={
                    selectedRide.image ||
                    "/placeholder.svg?height=200&width=600"
                  }
                  alt={selectedRide.name}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold">{selectedRide.name}</h2>
                  <p className="text-muted-foreground">
                    {selectedRide.location}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge
                    variant={
                      getStatusBadgeVariant(selectedRide.status) as
                        | "default"
                        | "secondary"
                        | "destructive"
                        | "outline"
                        | "success"
                        | "warning"
                        | "info"
                    }
                  >
                    {selectedRide.status}
                  </Badge>
                  <Badge
                    variant={
                      getThrillBadgeVariant(selectedRide.thrill) as
                        | "default"
                        | "secondary"
                        | "destructive"
                        | "outline"
                        | "success"
                        | "warning"
                        | "info"
                    }
                  >
                    {selectedRide.thrill} Thrill
                  </Badge>
                </div>
              </div>

              <p>{selectedRide.description}</p>

              <Tabs
                defaultValue="details"
                className="w-full"
                value={activeTab}
                onValueChange={setActiveTab}
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
                  <TabsTrigger value="staffing">Staffing</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium">Capacity</h4>
                      <p>{selectedRide.capacity} riders per cycle</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Hourly Capacity</h4>
                      <p>{selectedRide.hourlyCapacity} riders per hour</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Minimum Height</h4>
                      <p>{selectedRide.minHeight} cm</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Ride Duration</h4>
                      <p>{selectedRide.duration} minutes</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Opening Year</h4>
                      <p>{selectedRide.openingYear}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Operating Hours</h4>
                      <p>{selectedRide.operatingHours}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="maintenance" className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium">Last Maintenance</h4>
                      <p>{selectedRide.lastMaintenance}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">
                        Next Scheduled Maintenance
                      </h4>
                      <p>{selectedRide.nextMaintenance}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">
                        Maintenance Frequency
                      </h4>
                      <p>{selectedRide.maintenanceFrequency}</p>
                    </div>
                  </div>

                  {selectedRide.status === "Maintenance" && (
                    <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4 mt-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-yellow-800">
                            Maintenance in Progress
                          </h4>
                          <p className="text-sm text-yellow-700">
                            This ride is currently undergoing maintenance and is
                            not operational.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="staffing" className="space-y-4 pt-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-medium">Staffing Status</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={
                            getStaffingStatusVariant(
                              selectedRide.currentStaffCount,
                              selectedRide.staffRequired
                            ) as
                              | "default"
                              | "secondary"
                              | "destructive"
                              | "outline"
                              | "success"
                              | "warning"
                              | "info"
                          }
                        >
                          {getStaffingStatus(
                            selectedRide.currentStaffCount,
                            selectedRide.staffRequired
                          )}
                        </Badge>
                        <span className="text-sm">
                          {selectedRide.currentStaffCount}/
                          {selectedRide.staffRequired} staff members
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        setIsDetailsDialogOpen(false);
                        handleOpenStaffDialog(selectedRide);
                      }}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Manage Staff
                    </Button>
                  </div>

                  <div className="rounded-md border mt-2">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Shift</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getRideStaff(selectedRide.id).length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">
                              No staff assigned to this ride.
                            </TableCell>
                          </TableRow>
                        ) : (
                          getRideStaff(selectedRide.id).map((staffMember) => (
                            <TableRow key={staffMember.id}>
                              <TableCell className="font-medium">
                                {staffMember.name}
                              </TableCell>
                              <TableCell>{staffMember.role}</TableCell>
                              <TableCell>{staffMember.shift}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    getStaffStatusBadgeVariant(
                                      staffMember.status
                                    ) as
                                      | "default"
                                      | "secondary"
                                      | "destructive"
                                      | "outline"
                                      | "success"
                                      | "warning"
                                      | "info"
                                  }
                                >
                                  {staffMember.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDetailsDialogOpen(false)}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setIsDetailsDialogOpen(false);
                if (selectedRide) {
                  onEditRide(selectedRide);
                }
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Ride
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Staff Dialog */}
      <Dialog open={isStaffDialogOpen} onOpenChange={setIsStaffDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Manage Ride Staff</DialogTitle>
            <DialogDescription>
              Assign staff members to this ride
            </DialogDescription>
          </DialogHeader>
          {selectedRide && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-md bg-muted overflow-hidden">
                  <img
                    src={
                      selectedRide.image ||
                      "/placeholder.svg?height=50&width=50"
                    }
                    alt={selectedRide.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium">{selectedRide.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedRide.location}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium">Current Staff</h4>
                  <Badge
                    variant={
                      getStaffingStatusVariant(
                        selectedRide.currentStaffCount,
                        selectedRide.staffRequired
                      ) as
                        | "default"
                        | "secondary"
                        | "destructive"
                        | "outline"
                        | "success"
                        | "warning"
                        | "info"
                    }
                  >
                    {selectedRide.currentStaffCount}/
                    {selectedRide.staffRequired}
                  </Badge>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Shift</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getRideStaff(selectedRide.id).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="h-12 text-center">
                            No staff assigned.
                          </TableCell>
                        </TableRow>
                      ) : (
                        getRideStaff(selectedRide.id).map((staffMember) => (
                          <TableRow key={staffMember.id}>
                            <TableCell className="font-medium">
                              {staffMember.name}
                            </TableCell>
                            <TableCell>{staffMember.role}</TableCell>
                            <TableCell>{staffMember.shift}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  getStaffStatusBadgeVariant(
                                    staffMember.status
                                  ) as
                                    | "default"
                                    | "secondary"
                                    | "destructive"
                                    | "outline"
                                    | "success"
                                    | "warning"
                                    | "info"
                                }
                              >
                                {staffMember.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Assign New Staff Member</h4>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                >
                  <option value="">Select a staff member</option>
                  {getAvailableStaff().map((staffMember) => (
                    <option key={staffMember.id} value={staffMember.id}>
                      {staffMember.name} - {staffMember.role} (
                      {staffMember.status})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsStaffDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAssignStaff} disabled={!selectedStaffId}>
              Assign Staff
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
