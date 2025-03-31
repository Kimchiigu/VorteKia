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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Search, Plus, FileText, Upload, Camera } from "lucide-react";

export type ProposalStatus = "Pending" | "Approved" | "Rejected";

export interface StoreProposal {
  id: string;
  name: string;
  description: string;
  image: string;
  location: string;
  proposedBy: string;
  submittedDate: string;
  status: ProposalStatus;
  estimatedCost: number;
  estimatedRevenue: number;
  roi: number;
  category: string;
  targetMarket: string;
  feedback?: string;
}

interface SalesProposalProps {
  proposals: StoreProposal[];
  onSubmitProposal: (
    proposal: Omit<
      StoreProposal,
      "id" | "status" | "submittedDate" | "feedback"
    >
  ) => void;
}

export function SalesProposal({
  proposals,
  onSubmitProposal,
}: SalesProposalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] =
    useState<StoreProposal | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Form state for new proposal
  const [formData, setFormData] = useState<
    Omit<StoreProposal, "id" | "status" | "submittedDate" | "feedback">
  >({
    name: "",
    description: "",
    image: "/placeholder.svg?height=200&width=200",
    location: "",
    proposedBy: "Current Retail Manager",
    estimatedCost: 0,
    estimatedRevenue: 0,
    roi: 0,
    category: "",
    targetMarket: "",
  });

  const filteredProposals = proposals.filter(
    (proposal) =>
      proposal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "estimatedCost" || name === "estimatedRevenue") {
      const numValue = Number.parseFloat(value);
      const otherField =
        name === "estimatedCost" ? "estimatedRevenue" : "estimatedCost";
      const otherValue = formData[
        otherField as keyof typeof formData
      ] as number;

      // Calculate ROI when either cost or revenue changes
      let roi = 0;
      if (name === "estimatedCost" && numValue > 0) {
        roi = ((otherValue - numValue) / numValue) * 100;
      } else if (name === "estimatedRevenue" && formData.estimatedCost > 0) {
        roi =
          ((numValue - formData.estimatedCost) / formData.estimatedCost) * 100;
      }

      setFormData((prev) => ({
        ...prev,
        [name]: numValue,
        roi: Math.round(roi * 100) / 100, // Round to 2 decimal places
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

  const openViewDialog = (proposal: StoreProposal) => {
    setSelectedProposal(proposal);
    setIsViewDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      image: "/placeholder.svg?height=200&width=200",
      location: "",
      proposedBy: "Current Retail Manager",
      estimatedCost: 0,
      estimatedRevenue: 0,
      roi: 0,
      category: "",
      targetMarket: "",
    });
    setImagePreview(null);
  };

  const getStatusBadgeVariant = (status: ProposalStatus) => {
    switch (status) {
      case "Approved":
        return "success";
      case "Rejected":
        return "destructive";
      case "Pending":
        return "warning";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Store Proposals</h2>
          <p className="text-muted-foreground">
            Propose new store ideas to the CEO
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Store Proposal
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
                    <TableHead>Store Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Submitted Date</TableHead>
                    <TableHead className="text-right">Est. Cost</TableHead>
                    <TableHead className="text-right">ROI</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProposals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No proposals found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProposals.map((proposal) => (
                      <TableRow key={proposal.id}>
                        <TableCell className="font-medium">
                          {proposal.name}
                        </TableCell>
                        <TableCell>{proposal.category}</TableCell>
                        <TableCell>{proposal.location}</TableCell>
                        <TableCell>{proposal.submittedDate}</TableCell>
                        <TableCell className="text-right">
                          ${proposal.estimatedCost.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {proposal.roi}%
                        </TableCell>
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
                            }
                          >
                            {proposal.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openViewDialog(proposal)}
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
            <DialogTitle>New Store Proposal</DialogTitle>
            <DialogDescription>
              Submit a new store idea for CEO approval.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="image">Store Concept Image</Label>
                <div className="flex items-center gap-4">
                  <div className="relative h-32 w-32 rounded-md border border-input bg-muted flex items-center justify-center overflow-hidden">
                    {imagePreview ? (
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Store concept preview"
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

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="name">Store Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Describe the store concept, products, and unique selling points..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Store Category</Label>
                <Input
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="e.g., Apparel, Toys, Souvenirs"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Proposed Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Main Entrance, North Wing"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetMarket">Target Market</Label>
                <Input
                  id="targetMarket"
                  name="targetMarket"
                  value={formData.targetMarket}
                  onChange={handleInputChange}
                  placeholder="e.g., Families, Teenagers, Adults"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedCost">Estimated Setup Cost ($)</Label>
                <Input
                  id="estimatedCost"
                  name="estimatedCost"
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.estimatedCost}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedRevenue">
                  Estimated Annual Revenue ($)
                </Label>
                <Input
                  id="estimatedRevenue"
                  name="estimatedRevenue"
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.estimatedRevenue}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="roi">Return on Investment (%)</Label>
                <Input
                  id="roi"
                  name="roi"
                  type="number"
                  value={formData.roi}
                  readOnly
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Automatically calculated based on cost and revenue
                </p>
              </div>
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
            <Button
              onClick={handleSubmitProposal}
              disabled={
                !formData.name ||
                !formData.category ||
                !formData.location ||
                formData.estimatedCost <= 0
              }
            >
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
              View the details of this store proposal.
            </DialogDescription>
          </DialogHeader>
          {selectedProposal && (
            <div className="space-y-6 py-4">
              <div className="relative h-48 w-full rounded-md bg-muted overflow-hidden">
                <img
                  src={selectedProposal.image || "/placeholder.svg"}
                  alt={selectedProposal.name}
                  className="h-full w-full object-cover"
                />
              </div>

              <div>
                <h3 className="text-xl font-bold">{selectedProposal.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant={
                      getStatusBadgeVariant(selectedProposal.status) as
                        | "default"
                        | "secondary"
                        | "destructive"
                        | "outline"
                        | "success"
                        | "warning"
                    }
                  >
                    {selectedProposal.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Submitted on {selectedProposal.submittedDate}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedProposal.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Category</h4>
                    <p className="text-sm">{selectedProposal.category}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Location</h4>
                    <p className="text-sm">{selectedProposal.location}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Target Market</h4>
                    <p className="text-sm">{selectedProposal.targetMarket}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Estimated Cost</h4>
                    <p className="text-lg font-semibold">
                      ${selectedProposal.estimatedCost.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">
                      Estimated Revenue
                    </h4>
                    <p className="text-lg font-semibold">
                      ${selectedProposal.estimatedRevenue.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">ROI</h4>
                    <p className="text-lg font-semibold">
                      {selectedProposal.roi}%
                    </p>
                  </div>
                </div>

                {selectedProposal.feedback && (
                  <div className="rounded-md border p-4 bg-muted/50">
                    <h4 className="text-sm font-medium mb-1">CEO Feedback</h4>
                    <p className="text-sm">{selectedProposal.feedback}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
