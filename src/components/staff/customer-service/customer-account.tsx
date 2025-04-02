"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { UserPlus, RefreshCw, Check } from "lucide-react";

export interface NewCustomerData {
  id: string;
  name: string;
  email: string;
  dob: string;
  initialBalance: number;
}

interface CustomerAccountProps {
  onCreateCustomer: (customer: NewCustomerData) => void;
}

export function CustomerAccount({ onCreateCustomer }: CustomerAccountProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [initialBalance, setInitialBalance] = useState(0);
  const [customIdEnabled, setCustomIdEnabled] = useState(false);
  const [customId, setCustomId] = useState("");
  const [generatedId, setGeneratedId] = useState("");
  const [success, setSuccess] = useState(false);

  const generateCustomerId = () => {
    const prefix = "CUS";
    const timestamp = Date.now().toString().slice(-6);
    const randomNum = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    const nameInitials = name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase();

    return `${prefix}-${nameInitials}${timestamp}-${randomNum}`;
  };

  const handleGenerateId = () => {
    setGeneratedId(generateCustomerId());
  };

  const handleCreateCustomer = () => {
    const customerId = customIdEnabled
      ? customId
      : generatedId || generateCustomerId();

    const newCustomer: NewCustomerData = {
      id: customerId,
      name,
      email,
      dob,
      initialBalance,
    };

    onCreateCustomer(newCustomer);

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      resetForm();
    }, 2000);
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setDob("");
    setInitialBalance(0);
    setCustomIdEnabled(false);
    setCustomId("");
    setGeneratedId("");
  };

  const isFormValid = () => {
    return (
      name.trim() !== "" &&
      email.trim() !== "" &&
      dob.trim() !== "" &&
      (customIdEnabled ? customId.trim() !== "" : true)
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Create Customer Account
        </CardTitle>
        <CardDescription>
          Add a new customer with name, email, DOB, balance, and ID
        </CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="rounded-full bg-green-100 p-3 mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-medium text-center">
              Customer Created Successfully!
            </h3>
            <p className="text-muted-foreground text-center mt-2">
              The customer account has been created.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter customer name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="balance">Initial Balance ($)</Label>
                <Input
                  id="balance"
                  type="number"
                  min="0"
                  step="0.01"
                  value={initialBalance}
                  onChange={(e) =>
                    setInitialBalance(Number.parseFloat(e.target.value))
                  }
                />
              </div>
            </div>

            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="custom-id" className="text-base">
                  Use Custom ID
                </Label>
                <Switch
                  id="custom-id"
                  checked={customIdEnabled}
                  onCheckedChange={setCustomIdEnabled}
                />
              </div>

              {customIdEnabled ? (
                <div className="space-y-2">
                  <Label htmlFor="custom-id-input">Custom Customer ID</Label>
                  <Input
                    id="custom-id-input"
                    placeholder="Enter custom ID"
                    value={customId}
                    onChange={(e) => setCustomId(e.target.value)}
                    required
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="generated-id">Generated Customer ID</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateId}
                      disabled={!name}
                      className="h-8"
                    >
                      <RefreshCw className="h-3 w-3 mr-2" />
                      Generate
                    </Button>
                  </div>
                  <Input
                    id="generated-id"
                    value={generatedId}
                    readOnly
                    placeholder="ID will be generated automatically"
                    className="bg-muted"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button onClick={handleCreateCustomer} disabled={!isFormValid()}>
                <UserPlus className="h-4 w-4 mr-2" />
                Create Customer
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
