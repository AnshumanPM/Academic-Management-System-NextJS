// lib/nav-config.ts
export const adminNavConfig = [
  {
    title: "Dashboard",
    url: "/dashboard/admin",
    icon: "SquareTerminal",
    isActive: true,
    items: [
      { title: "Overview", url: "/dashboard/admin" },
      { title: "Analytics", url: "/dashboard/admin/analytics" },
    ],
  },
  {
    title: "Users",
    url: "/dashboard/admin/users",
    icon: "Users",
    items: [
      { title: "All Users", url: "/dashboard/admin/users" },
      { title: "Roles", url: "/dashboard/admin/users/roles" },
    ],
  },
  {
    title: "Settings",
    url: "/dashboard/admin/settings",
    icon: "Settings2",
    items: [
      { title: "General", url: "/dashboard/admin/settings/general" },
      { title: "Billing", url: "/dashboard/admin/settings/billing" },
    ],
  },
];

export const studentNavConfig = [
  {
    title: "Student",
    url: "/dashboard/student",
    icon: "GraduationCap",
    isActive: true,
    items: [
      { title: "Results", url: "/dashboard/student/results" },
      // { title: "Profile", url: "/dashboard/student/profile" },
    ],
  },
  // {
  //   title: "Profile",
  //   url: "/dashboard/student/profile",
  //   icon: "User",
  // },
];
