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
import { Search, Plus, FileText, Upload, Camera } from "lucide-react";

export type ProposalStatus = "Pending" | "Approved" | "Rejected";

export interface RideProposal {
  id: string;
  title: string;
  type: "Ride" | "Restaurant" | "Store";
  cost: number;
  image: string;
  description: string;
  status: ProposalStatus;
  date: string;
  feedback?: string;
}

interface RideProposalProps {
  proposals: RideProposal[];
  onSubmitProposal: (
    proposal: Omit<RideProposal, "id" | "status" | "date" | "feedback" | "type">
  ) => void;
}

export function RideProposal({
  proposals,
  onSubmitProposal,
}: RideProposalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<RideProposal | null>(
    null
  );
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Form state for new proposal - removed type as it will be set by backend
  const [formData, setFormData] = useState<
    Omit<RideProposal, "id" | "status" | "submittedDate" | "feedback" | "type">
  >({
    title: "",
    cost: 0,
    image: "/placeholder.svg?height=200&width=400",
    description: "",
    date: "",
  });

  const filteredProposals = proposals.filter(
    (proposal) =>
      proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "cost") {
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
      title: "",
      cost: 0,
      image: "/placeholder.svg?height=200&width=400",
      description: "",
      date: "",
    });
    setImagePreview(null);
  };

  const getStatusBadgeVariant = (status: ProposalStatus) => {
    switch (status) {
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

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "Ride":
        return "info";
      case "Restaurant":
        return "success";
      case "Store":
        return "warning";
      default:
        return "secondary";
    }
  };

  const isFormValid = () => {
    return (
      formData.title.trim() !== "" &&
      formData.description.trim() !== "" &&
      formData.cost > 0
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Proposals</h2>
          <p className="text-muted-foreground">
            Submit new proposals for approval
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Proposal
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
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Submitted Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProposals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No proposals found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProposals.map((proposal) => (
                      <TableRow key={proposal.id}>
                        <TableCell className="font-medium">
                          {proposal.title}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              getTypeBadgeVariant(proposal.type) as
                                | "default"
                                | "secondary"
                                | "destructive"
                                | "outline"
                                | "success"
                                | "warning"
                                | "info"
                            }
                          >
                            {proposal.type}
                          </Badge>
                        </TableCell>
                        <TableCell>${proposal.cost.toLocaleString()}</TableCell>
                        <TableCell>{proposal.date}</TableCell>
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
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>New Proposal</DialogTitle>
            <DialogDescription>
              Submit a new proposal for approval
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="image">Concept Image</Label>
              <div className="flex items-center gap-4">
                <div className="relative h-32 w-32 rounded-md border border-input bg-muted flex items-center justify-center overflow-hidden">
                  {imagePreview ? (
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Concept preview"
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
                    onClick={() => document.getElementById("image")?.click()}
                    className="w-full"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Image
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">Cost ($)</Label>
              <Input
                id="cost"
                name="cost"
                type="number"
                min="0"
                step="1000"
                value={formData.cost || ""}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
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
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Proposal Details</DialogTitle>
            <DialogDescription>
              Detailed information about the proposal
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
                  alt={selectedProposal.title}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold">
                    {selectedProposal.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant={
                        getTypeBadgeVariant(selectedProposal.type) as
                          | "default"
                          | "secondary"
                          | "destructive"
                          | "outline"
                          | "success"
                          | "warning"
                          | "info"
                      }
                    >
                      {selectedProposal.type}
                    </Badge>
                  </div>
                </div>
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
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium">Description</h4>
                  <p className="mt-1">{selectedProposal.description}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium">Cost</h4>
                  <p>${selectedProposal.cost.toLocaleString()}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium">Submitted Date</h4>
                  <p>{selectedProposal.date}</p>
                </div>

                {selectedProposal.feedback && (
                  <div className="rounded-md border p-4">
                    <h4 className="text-sm font-medium mb-2">Feedback</h4>
                    <p className="text-sm">{selectedProposal.feedback}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
