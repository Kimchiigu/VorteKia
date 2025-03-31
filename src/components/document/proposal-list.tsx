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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, FileText, CheckCircle, XCircle } from "lucide-react";

export type ProposalStatus = "Pending" | "Approved" | "Declined";

export interface Proposal {
  id: string;
  name: string;
  submittedBy: string;
  submittedDate: string;
  estimatedCost: number;
  estimatedRevenue: number;
  roi: number;
  status: ProposalStatus;
  description: string;
  details: {
    location: string;
    size: string;
    cuisine: string;
    staffingRequirements: string;
    equipmentNeeds: string;
  };
}

interface ProposalListProps {
  proposals: Proposal[];
  role?: "cfo" | "supervisor" | "manager";
  onUpdateStatus?: (proposalId: string, newStatus: ProposalStatus) => void;
}

export function ProposalList({
  proposals,
  role = "cfo",
  onUpdateStatus,
}: ProposalListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredProposals = proposals.filter(
    (proposal) =>
      proposal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.submittedBy.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setIsDialogOpen(true);
  };

  const handleUpdateStatus = (
    proposalId: string,
    newStatus: ProposalStatus
  ) => {
    if (onUpdateStatus) {
      onUpdateStatus(proposalId, newStatus);
    }
    setIsDialogOpen(false);
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

  const canApproveOrDecline = role === "cfo" || role === "manager";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">
            Restaurant Proposals
          </h2>
          <p className="text-muted-foreground">
            Review and manage restaurant proposals
          </p>
        </div>
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
                    <TableHead>Name</TableHead>
                    <TableHead>Submitted By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Est. Cost</TableHead>
                    <TableHead className="text-right">Est. Revenue</TableHead>
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
                        <TableCell>{proposal.submittedBy}</TableCell>
                        <TableCell>{proposal.submittedDate}</TableCell>
                        <TableCell className="text-right">
                          ${proposal.estimatedCost.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          ${proposal.estimatedRevenue.toLocaleString()}
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

      {selectedProposal && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{selectedProposal.name}</DialogTitle>
              <DialogDescription>
                Submitted by {selectedProposal.submittedBy} on{" "}
                {selectedProposal.submittedDate}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Description</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedProposal.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <h4 className="text-sm font-medium mb-1">Status</h4>
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
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Details</h4>
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
                    <span className="font-medium">Cuisine: </span>
                    <span className="text-muted-foreground">
                      {selectedProposal.details.cuisine}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Staffing: </span>
                    <span className="text-muted-foreground">
                      {selectedProposal.details.staffingRequirements}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium">Equipment: </span>
                    <span className="text-muted-foreground">
                      {selectedProposal.details.equipmentNeeds}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="flex items-center justify-end space-x-2">
              {canApproveOrDecline && selectedProposal.status === "Pending" && (
                <>
                  <Button
                    variant="outline"
                    onClick={() =>
                      handleUpdateStatus(selectedProposal.id, "Declined")
                    }
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Decline
                  </Button>
                  <Button
                    onClick={() =>
                      handleUpdateStatus(selectedProposal.id, "Approved")
                    }
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                </>
              )}
              {(!canApproveOrDecline ||
                selectedProposal.status !== "Pending") && (
                <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
