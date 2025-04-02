import { HeroStaff } from "@/components/staff/hero-staff";
import LostAndFound from "./lost-and-found/lost-and-found";
import { useLocation } from "react-router";
import CustomerService from "./customer-service/customer-service";
import RideManager from "./ride-manager/ride-manager";
import RideStaff from "./ride-staff/ride-staff";
import FNBSupervisor from "./fnb-supervisor/fnb-supervisor";
import Chef from "./chef/chef";
import Waiter from "./waiter/waiter";
import MaintenanceManager from "./maintenance-manager/maintenance-manager";
import MaintenanceStaff from "./maintenance-staff/maintenance-staff";
import RetailManager from "./retail-manager/retail-manager";
import SalesAssociate from "./sales-associate/sales-associate";
import CEO from "./executives/ceo";
import CFO from "./executives/cfo";
import COO from "./executives/coo";
import { NavbarStaff } from "@/components/staff/navbar-staff";

export default function StaffHome() {
  const location = useLocation();
  const user = location.state?.user;
  console.log("User ID :", user.user_id);

  return (
    <main className="min-h-screen w-full bg-background">
      <NavbarStaff userId={user.user_id} role={user.role} />
      <div className="container mx-auto px-4 py-8">
        <HeroStaff
          name={user.name ? user.name : "Guest"}
          role={user.role ? user.role : "Unknown"}
        />
        <div className="mt-12 space-y-16">
          {user ? (
            <>
              {user.role === "Customer Service" && (
                <CustomerService userId={user.user_id} />
              )}
              {user.role === "Lost And Found Staff" && <LostAndFound />}
              {user.role === "Ride Manager" && (
                <RideManager staffId={user.user_id} />
              )}
              {user.role === "Ride Staff" && <RideStaff />}
              {user.role === "F&B Supervisor" && <FNBSupervisor />}
              {user.role === "Chef" && <Chef />}
              {user.role === "Waiter" && <Waiter />}
              {user.role === "Maintenance Manager" && <MaintenanceManager />}
              {user.role === "Maintenance Staff" && <MaintenanceStaff />}
              {user.role === "Retail Manager" && <RetailManager />}
              {user.role === "Sales Associate" && <SalesAssociate />}
              {user.role === "CEO" && <CEO />}
              {user.role === "CFO" && <CFO />}
              {user.role === "COO" && <COO />}
            </>
          ) : (
            <p className="text-red-500">
              No user data available. Please log in again.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
