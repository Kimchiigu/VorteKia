"use client";

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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  CheckCircle,
  XCircle,
  Store,
  Utensils,
  FileText,
} from "lucide-react";

export type ProposalType = "Store" | "Restaurant" | "Removal";
export type ProposalStatus = "Pending" | "Approved" | "Declined";

export interface Proposal {
  id: string;
  type: ProposalType;
  name: string;
  submittedBy: string;
  submittedDate: string;
  description: string;
  status: ProposalStatus;
  image?: string;
  details: Record<string, any>;
}

interface ProposalApprovalProps {
  proposals: Proposal[];
  onApproveProposal: (proposalId: string) => void;
  onDeclineProposal: (proposalId: string, reason: string) => void;
}

export function ProposalApproval({
  proposals,
  onApproveProposal,
  onDeclineProposal,
}: ProposalApprovalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<ProposalType | "All">("All");
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(
    null
  );
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isDeclineDialogOpen, setIsDeclineDialogOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState("");

  const filteredProposals = proposals.filter(
    (proposal) =>
      (activeTab === "All" || proposal.type === activeTab) &&
      (proposal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proposal.submittedBy.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const pendingProposals = filteredProposals.filter(
    (proposal) => proposal.status === "Pending"
  );

  const handleViewDetails = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setIsDetailsDialogOpen(true);
  };

  const handleApprove = () => {
    if (selectedProposal) {
      onApproveProposal(selectedProposal.id);
      setIsDetailsDialogOpen(false);
    }
  };

  const handleOpenDeclineDialog = () => {
    setIsDetailsDialogOpen(false);
    setIsDeclineDialogOpen(true);
  };

  const handleDecline = () => {
    if (selectedProposal && declineReason) {
      onDeclineProposal(selectedProposal.id, declineReason);
      setDeclineReason("");
      setIsDeclineDialogOpen(false);
    }
  };

  const getProposalTypeIcon = (type: ProposalType) => {
    switch (type) {
      case "Store":
        return <Store className="h-4 w-4 mr-2" />;
      case "Restaurant":
        return <Utensils className="h-4 w-4 mr-2" />;
      case "Removal":
        return <XCircle className="h-4 w-4 mr-2" />;
      default:
        return null;
    }
  };

  const getStatusBadgeVariant = (status: ProposalStatus) => {
    switch (status) {
      case "Approved":
        return "success";
      case "Declined":
        return "destructive";
      case "Pending":
        return "warning";
      default:
        return "secondary";
    }
  };

  const getProposalTypeBadgeVariant = (type: ProposalType) => {
    switch (type) {
      case "Store":
        return "default";
      case "Restaurant":
        return "info";
      case "Removal":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">
            Proposal Approval
          </h2>
          <p className="text-muted-foreground">
            Review and approve or decline proposals for new stores, restaurants,
            and removals
          </p>
        </div>
        <Badge variant="warning" className="text-sm py-1 px-3">
          {pendingProposals.length} Pending Approvals
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Proposals</CardTitle>
          <Tabs
            defaultValue="All"
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as ProposalType | "All")
            }
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="All">All</TabsTrigger>
              <TabsTrigger value="Store">Stores</TabsTrigger>
              <TabsTrigger value="Restaurant">Restaurants</TabsTrigger>
              <TabsTrigger value="Removal">Removals</TabsTrigger>
            </TabsList>
          </Tabs>
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
                    <TableHead>Type</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Submitted By</TableHead>
                    <TableHead>Date</TableHead>
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
                        <TableCell>
                          <Badge
                            variant={
                              getProposalTypeBadgeVariant(proposal.type) as
                                | "default"
                                | "secondary"
                                | "destructive"
                                | "outline"
                                | "success"
                                | "warning"
                                | "info"
                            }
                          >
                            {getProposalTypeIcon(proposal.type)}
                            {proposal.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {proposal.name}
                        </TableCell>
                        <TableCell>{proposal.submittedBy}</TableCell>
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
                            onClick={() => handleViewDetails(proposal)}
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

      {/* Proposal Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Proposal Details</DialogTitle>
            <DialogDescription>
              Review the details of this proposal
            </DialogDescription>
          </DialogHeader>
          {selectedProposal && (
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold">{selectedProposal.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant={
                        getProposalTypeBadgeVariant(selectedProposal.type) as
                          | "default"
                          | "secondary"
                          | "destructive"
                          | "outline"
                          | "success"
                          | "warning"
                          | "info"
                      }
                    >
                      {getProposalTypeIcon(selectedProposal.type)}
                      {selectedProposal.type}
                    </Badge>
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
                </div>
                <div className="text-sm text-muted-foreground">
                  <div>Submitted by: {selectedProposal.submittedBy}</div>
                  <div>Date: {selectedProposal.submittedDate}</div>
                </div>
              </div>

              {selectedProposal.image && (
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
              )}

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Description</h3>
                <p className="text-sm">{selectedProposal.description}</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Details</h3>
                <div className="rounded-md border p-4 bg-muted/50">
                  {selectedProposal.type === "Store" && (
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Location: </span>
                        <span className="text-muted-foreground">
                          {selectedProposal.details.location}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Size: </span>
                        <span className="text-muted-foreground">
                          {selectedProposal.details.size}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Category: </span>
                        <span className="text-muted-foreground">
                          {selectedProposal.details.category}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Estimated Cost: </span>
                        <span className="text-muted-foreground">
                          $
                          {selectedProposal.details.estimatedCost?.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Estimated Revenue: </span>
                        <span className="text-muted-foreground">
                          $
                          {selectedProposal.details.estimatedRevenue?.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">ROI: </span>
                        <span className="text-muted-foreground">
                          {selectedProposal.details.roi}%
                        </span>
                      </div>
                    </div>
                  )}

                  {selectedProposal.type === "Restaurant" && (
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Location: </span>
                        <span className="text-muted-foreground">
                          {selectedProposal.details.location}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Cuisine: </span>
                        <span className="text-muted-foreground">
                          {selectedProposal.details.cuisine}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Opening Hours: </span>
                        <span className="text-muted-foreground">
                          {selectedProposal.details.openingHours}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Closing Hours: </span>
                        <span className="text-muted-foreground">
                          {selectedProposal.details.closingHours}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Seating Capacity: </span>
                        <span className="text-muted-foreground">
                          {selectedProposal.details.seatingCapacity}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Estimated Cost: </span>
                        <span className="text-muted-foreground">
                          $
                          {selectedProposal.details.estimatedCost?.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Estimated Revenue: </span>
                        <span className="text-muted-foreground">
                          $
                          {selectedProposal.details.estimatedRevenue?.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">ROI: </span>
                        <span className="text-muted-foreground">
                          {selectedProposal.details.roi}%
                        </span>
                      </div>
                    </div>
                  )}

                  {selectedProposal.type === "Removal" && (
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Facility Name: </span>
                        <span className="text-muted-foreground">
                          {selectedProposal.details.facilityName}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Facility Type: </span>
                        <span className="text-muted-foreground">
                          {selectedProposal.details.facilityType}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">
                          Reason for Removal:{" "}
                        </span>
                        <span className="text-muted-foreground">
                          {selectedProposal.details.removalReason}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Current Revenue: </span>
                        <span className="text-muted-foreground">
                          $
                          {selectedProposal.details.currentRevenue?.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Removal Cost: </span>
                        <span className="text-muted-foreground">
                          $
                          {selectedProposal.details.removalCost?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDetailsDialogOpen(false)}
            >
              Close
            </Button>
            {selectedProposal && selectedProposal.status === "Pending" && (
              <>
                <Button variant="destructive" onClick={handleOpenDeclineDialog}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Decline
                </Button>
                <Button onClick={handleApprove}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Decline Reason Dialog */}
      <Dialog open={isDeclineDialogOpen} onOpenChange={setIsDeclineDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Decline Proposal</DialogTitle>
            <DialogDescription>
              Please provide a reason for declining this proposal
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="decline-reason" className="text-sm font-medium">
                Reason for Declining
              </label>
              <textarea
                id="decline-reason"
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Enter your reason for declining this proposal..."
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeclineDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDecline}
              disabled={!declineReason}
            >
              Confirm Decline
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
