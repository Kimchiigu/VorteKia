"use client";

import type React from "react";

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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import {
  Search,
  Plus,
  FileText,
  Upload,
  Camera,
  DollarSign,
  Clock,
  Users,
} from "lucide-react";

export type ProposalStatus = "Draft" | "Pending" | "Approved" | "Rejected";

export interface RideProposal {
  id: string;
  name: string;
  description: string;
  image: string;
  location: string;
  thrill: "Low" | "Moderate" | "High" | "Extreme";
  capacity: number;
  estimatedDuration: number;
  minHeight: number;
  estimatedCost: number;
  estimatedConstructionTime: string;
  staffRequired: number;
  status: ProposalStatus;
  submittedDate: string;
  feedback?: string;
  designDocuments?: string[];
}

interface RideProposalProps {
  proposals: RideProposal[];
  onSubmitProposal: (
    proposal: Omit<RideProposal, "id" | "status" | "submittedDate" | "feedback">
  ) => void;
  onDeleteProposal: (proposalId: string) => void;
}

export function RideProposal({
  proposals,
  onSubmitProposal,
  onDeleteProposal,
}: RideProposalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<RideProposal | null>(
    null
  );
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("details");

  // Form state for new proposal
  const [formData, setFormData] = useState<
    Omit<RideProposal, "id" | "status" | "submittedDate" | "feedback">
  >({
    name: "",
    description: "",
    image: "/placeholder.svg?height=200&width=400",
    location: "",
    thrill: "Moderate",
    capacity: 0,
    estimatedDuration: 0,
    minHeight: 0,
    estimatedCost: 0,
    estimatedConstructionTime: "",
    staffRequired: 0,
    designDocuments: [],
  });

  const filteredProposals = proposals.filter(
    (proposal) =>
      proposal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (
      name === "capacity" ||
      name === "estimatedDuration" ||
      name === "minHeight" ||
      name === "estimatedCost" ||
      name === "staffRequired"
    ) {
      setFormData((prev) => ({
        ...prev,
        [name]: Number.parseFloat(value) || 0,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setImagePreview(imageUrl);
        setFormData((prev) => ({ ...prev, image: imageUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitProposal = () => {
    onSubmitProposal(formData);
    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleViewProposal = (proposal: RideProposal) => {
    setSelectedProposal(proposal);
    setIsViewDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      image: "/placeholder.svg?height=200&width=400",
      location: "",
      thrill: "Moderate",
      capacity: 0,
      estimatedDuration: 0,
      minHeight: 0,
      estimatedCost: 0,
      estimatedConstructionTime: "",
      staffRequired: 0,
      designDocuments: [],
    });
    setImagePreview(null);
  };

  const getStatusBadgeVariant = (status: ProposalStatus) => {
    switch (status) {
      case "Draft":
        return "secondary";
      case "Pending":
        return "warning";
      case "Approved":
        return "success";
      case "Rejected":
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

  const isFormValid = () => {
    return (
      formData.name.trim() !== "" &&
      formData.description.trim() !== "" &&
      formData.location.trim() !== "" &&
      formData.capacity > 0 &&
      formData.estimatedDuration > 0 &&
      formData.minHeight > 0 &&
      formData.estimatedCost > 0 &&
      formData.estimatedConstructionTime.trim() !== "" &&
      formData.staffRequired > 0
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Ride Proposals</h2>
          <p className="text-muted-foreground">
            Submit new ride proposals for COO approval
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Ride Proposal
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Proposals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search proposals..."
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
                    <TableHead>Thrill Level</TableHead>
                    <TableHead>Estimated Cost</TableHead>
                    <TableHead>Submitted Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProposals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No proposals found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProposals.map((proposal) => (
                      <TableRow key={proposal.id}>
                        <TableCell className="font-medium">
                          {proposal.name}
                        </TableCell>
                        <TableCell>{proposal.location}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              getThrillBadgeVariant(proposal.thrill) as
                                | "default"
                                | "secondary"
                                | "destructive"
                                | "outline"
                                | "success"
                                | "warning"
                                | "info"
                            }
                          >
                            {proposal.thrill}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          ${proposal.estimatedCost.toLocaleString()}
                        </TableCell>
                        <TableCell>{proposal.submittedDate}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              getStatusBadgeVariant(proposal.status) as
                                | "default"
                                | "secondary"
                                | "destructive"
                                | "outline"
                                | "success"
                                | "warning"
                                | "info"
                            }
                          >
                            {proposal.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewProposal(proposal)}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Details
                          </Button>
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

      {/* Add Proposal Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>New Ride Proposal</DialogTitle>
            <DialogDescription>
              Submit a new ride proposal for COO approval
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Ride Details</TabsTrigger>
                <TabsTrigger value="specifications">Specifications</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="image">Ride Concept Image</Label>
                  <div className="flex items-center gap-4">
                    <div className="relative h-32 w-32 rounded-md border border-input bg-muted flex items-center justify-center overflow-hidden">
                      {imagePreview ? (
                        <img
                          src={imagePreview || "/placeholder.svg"}
                          alt="Ride concept preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Camera className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          document.getElementById("image")?.click()
                        }
                        className="w-full"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Image
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="name">Ride Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="thrill">Thrill Level</Label>
                    <select
                      id="thrill"
                      name="thrill"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.thrill}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="Low">Low</option>
                      <option value="Moderate">Moderate</option>
                      <option value="High">High</option>
                      <option value="Extreme">Extreme</option>
                    </select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="specifications" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="capacity">
                      Capacity (riders per cycle)
                    </Label>
                    <Input
                      id="capacity"
                      name="capacity"
                      type="number"
                      min="1"
                      value={formData.capacity || ""}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estimatedDuration">
                      Estimated Duration (minutes)
                    </Label>
                    <Input
                      id="estimatedDuration"
                      name="estimatedDuration"
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={formData.estimatedDuration || ""}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minHeight">Minimum Height (cm)</Label>
                    <Input
                      id="minHeight"
                      name="minHeight"
                      type="number"
                      min="0"
                      value={formData.minHeight || ""}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="staffRequired">Staff Required</Label>
                    <Input
                      id="staffRequired"
                      name="staffRequired"
                      type="number"
                      min="1"
                      value={formData.staffRequired || ""}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estimatedCost">Estimated Cost ($)</Label>
                    <Input
                      id="estimatedCost"
                      name="estimatedCost"
                      type="number"
                      min="0"
                      step="1000"
                      value={formData.estimatedCost || ""}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estimatedConstructionTime">
                      Estimated Construction Time
                    </Label>
                    <Input
                      id="estimatedConstructionTime"
                      name="estimatedConstructionTime"
                      placeholder="e.g., 6 months"
                      value={formData.estimatedConstructionTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                resetForm();
                setIsAddDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitProposal} disabled={!isFormValid()}>
              Submit Proposal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Proposal Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Proposal Details</DialogTitle>
            <DialogDescription>
              Detailed information about the ride proposal
            </DialogDescription>
          </DialogHeader>
          {selectedProposal && (
            <div className="space-y-4">
              <div className="relative h-48 w-full rounded-md bg-muted overflow-hidden">
                <img
                  src={
                    selectedProposal.image ||
                    "/placeholder.svg?height=200&width=600"
                  }
                  alt={selectedProposal.name}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold">{selectedProposal.name}</h2>
                  <p className="text-muted-foreground">
                    {selectedProposal.location}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge
                    variant={
                      getStatusBadgeVariant(selectedProposal.status) as
                        | "default"
                        | "secondary"
                        | "destructive"
                        | "outline"
                        | "success"
                        | "warning"
                        | "info"
                    }
                  >
                    {selectedProposal.status}
                  </Badge>
                  <Badge
                    variant={
                      getThrillBadgeVariant(selectedProposal.thrill) as
                        | "default"
                        | "secondary"
                        | "destructive"
                        | "outline"
                        | "success"
                        | "warning"
                        | "info"
                    }
                  >
                    {selectedProposal.thrill} Thrill
                  </Badge>
                </div>
              </div>

              <p>{selectedProposal.description}</p>

              <Tabs
                defaultValue="details"
                className="w-full"
                value={activeTab}
                onValueChange={setActiveTab}
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="specifications">
                    Specifications
                  </TabsTrigger>
                  <TabsTrigger value="feedback">Feedback</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium">Submitted Date</h4>
                      <p>{selectedProposal.submittedDate}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Status</h4>
                      <p>{selectedProposal.status}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Location</h4>
                      <p>{selectedProposal.location}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Thrill Level</h4>
                      <p>{selectedProposal.thrill}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="specifications" className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start gap-2">
                      <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium">Capacity</h4>
                        <p>{selectedProposal.capacity} riders per cycle</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium">Duration</h4>
                        <p>{selectedProposal.estimatedDuration} minutes</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium">Minimum Height</h4>
                        <p>{selectedProposal.minHeight} cm</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium">Staff Required</h4>
                        <p>{selectedProposal.staffRequired} staff members</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium">Estimated Cost</h4>
                        <p>
                          ${selectedProposal.estimatedCost.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium">
                          Construction Time
                        </h4>
                        <p>{selectedProposal.estimatedConstructionTime}</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="feedback" className="space-y-4 pt-4">
                  {selectedProposal.feedback ? (
                    <div className="rounded-md border p-4">
                      <h4 className="text-sm font-medium mb-2">COO Feedback</h4>
                      <p className="text-sm">{selectedProposal.feedback}</p>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        No feedback has been provided yet.
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
            >
              Close
            </Button>
            {selectedProposal && selectedProposal.status === "Draft" && (
              <Button
                variant="destructive"
                onClick={() => {
                  if (selectedProposal) {
                    onDeleteProposal(selectedProposal.id);
                    setIsViewDialogOpen(false);
                  }
                }}
              >
                Delete Draft
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
