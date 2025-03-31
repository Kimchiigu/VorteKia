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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { UserPlus, RefreshCw, Check, Key } from "lucide-react";

export interface NewStaffData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  password: string;
}

interface StaffCreationProps {
  onCreateStaff: (staff: NewStaffData) => void;
}

export function StaffCreation({ onCreateStaff }: StaffCreationProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [department, setDepartment] = useState("");
  const [password, setPassword] = useState("");
  const [customIdEnabled, setCustomIdEnabled] = useState(false);
  const [customId, setCustomId] = useState("");
  const [generatedId, setGeneratedId] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const generateStaffId = () => {
    // Custom algorithm for ID generation
    const prefix = "VK";
    const deptCode = department.substring(0, 2).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    const randomNum = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    const nameInitials = name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase();

    return `${prefix}-${deptCode}${nameInitials}${timestamp}-${randomNum}`;
  };

  const generateRandomPassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(password);
  };

  const handleGenerateId = () => {
    setGeneratedId(generateStaffId());
  };

  const handleCreateStaff = () => {
    const staffId = customIdEnabled
      ? customId
      : generatedId || generateStaffId();

    const newStaff: NewStaffData = {
      id: staffId,
      name,
      email,
      phone,
      role,
      department,
      password,
    };

    onCreateStaff(newStaff);

    // Show success message
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      resetForm();
    }, 2000);
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setRole("");
    setDepartment("");
    setPassword("");
    setCustomIdEnabled(false);
    setCustomId("");
    setGeneratedId("");
  };

  const isFormValid = () => {
    return (
      name.trim() !== "" &&
      email.trim() !== "" &&
      phone.trim() !== "" &&
      role.trim() !== "" &&
      department.trim() !== "" &&
      password.trim() !== "" &&
      (customIdEnabled ? customId.trim() !== "" : true)
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Create Staff Account
        </CardTitle>
        <CardDescription>
          Add a new staff member to the system with a custom or generated ID
        </CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="rounded-full bg-green-100 p-3 mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-medium text-center">
              Staff Created Successfully!
            </h3>
            <p className="text-muted-foreground text-center mt-2">
              The new staff account has been added to the system.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter staff name"
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
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Rides">Rides</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                    <SelectItem value="Retail">Retail</SelectItem>
                    <SelectItem value="Food">Food & Beverage</SelectItem>
                    <SelectItem value="Customer">Customer Service</SelectItem>
                    <SelectItem value="Admin">Administration</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ride Staff">Ride Staff</SelectItem>
                    <SelectItem value="Ride Manager">Ride Manager</SelectItem>
                    <SelectItem value="Maintenance Staff">
                      Maintenance Staff
                    </SelectItem>
                    <SelectItem value="Maintenance Manager">
                      Maintenance Manager
                    </SelectItem>
                    <SelectItem value="Sales Associate">
                      Sales Associate
                    </SelectItem>
                    <SelectItem value="Retail Manager">
                      Retail Manager
                    </SelectItem>
                    <SelectItem value="Chef">Chef</SelectItem>
                    <SelectItem value="Waiter">Waiter</SelectItem>
                    <SelectItem value="F&B Supervisor">
                      F&B Supervisor
                    </SelectItem>
                    <SelectItem value="Customer Service">
                      Customer Service
                    </SelectItem>
                    <SelectItem value="CFO">CFO</SelectItem>
                    <SelectItem value="COO">COO</SelectItem>
                    <SelectItem value="CEO">CEO</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Password</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateRandomPassword}
                    className="h-8"
                  >
                    <RefreshCw className="h-3 w-3 mr-2" />
                    Generate
                  </Button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <Key className="h-4 w-4" />
                  </Button>
                </div>
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
                  <Label htmlFor="custom-id-input">Custom Staff ID</Label>
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
                    <Label htmlFor="generated-id">Generated Staff ID</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateId}
                      disabled={!name || !department}
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
                  <p className="text-xs text-muted-foreground">
                    ID will be generated based on name, department, and
                    timestamp if not refreshed manually
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button onClick={handleCreateStaff} disabled={!isFormValid()}>
                <UserPlus className="h-4 w-4 mr-2" />
                Create Staff Account
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
