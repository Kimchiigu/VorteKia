const roleSlogans: Record<string, string> = {
  "Customer Service": "Helping guests, one smile at a time!",
  "Lost And Found Staff": "Reuniting guests with what matters most.",
  "Ride Manager": "Leading the thrill, one ride at a time!",
  "Ride Staff": "Powering unforgettable adventures.",
  "F&B Supervisor": "Serving excellence across every plate.",
  Chef: "Crafting delicious experiences.",
  Waiter: "Delivering joy, one dish at a time.",
  "Maintenance Manager": "Keeping everything running smoothly.",
  "Maintenance Staff": "Fixing problems before they happen.",
  "Retail Manager": "Bringing the best to every shopper.",
  "Sales Associate": "Turning visitors into happy customers.",
  CEO: "Driving the vision of VorteKia.",
  CFO: "Securing a smart financial future.",
  COO: "Optimizing operations for greatness.",
};

export function HeroStaff({ name, role }: HeroStaffProps) {
  const slogan = roleSlogans[role] || "Make the Best of VorteKia";

  return (
    <div className="relative py-16 md:py-24 overflow-hidden rounded-3xl bg-gradient-to-r from-purple-700 to-indigo-700">
      <div className="absolute inset-0 bg-[url('/placeholder.svg?height=800&width=1200')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
      <div className="relative container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6">
          Welcome,{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
            {name}
          </span>
        </h1>
        <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8">
          {role} — {slogan}
        </p>
      </div>
    </div>
  );
}
