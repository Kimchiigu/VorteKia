import { NavbarStaff } from "@/components/staff/navbar-staff";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {Key, Lock, User} from "lucide-react";

export default function StaffLogin() {
  return (
    <main className="min-h-screen w-full bg-background flex flex-col">
      <NavbarStaff />
      <div className="flex flex-grow items-center justify-center">
        <div className="container mx-auto px-4 flex flex-col items-center justify-center">
          <div className="text-center mb-8">
            <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center mx-auto">
              <Lock className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight mt-2">
              VorteKia Staff Portal
            </h1>
            <p className="text-muted-foreground">
              Sign in to access the staff dashboard
            </p>
          </div>

          <div className="w-full max-w-md">
            <Card>
              <CardContent className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Staff ID</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="username"
                      placeholder="Enter your unique ID"
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="password"
                        placeholder="Enter your password"
                        type="password"
                        className="pl-9"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Sign In</Button>
              </CardFooter>
            </Card>
          </div>

          <div className="text-center text-sm text-muted-foreground mt-8">
            <p>Staff use only. Unauthorized access is prohibited.</p>
            <p className="mt-1">
              © {new Date().getFullYear()} VorteKia Theme Park. All rights
              reserved.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
