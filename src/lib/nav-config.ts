// lib/nav-config.ts
export const adminNavConfig = [
  // {
  //   title: "Dashboard",
  //   url: "/dashboard/admin",
  //   icon: "SquareTerminal",
  //   isActive: true,
  //   items: [
  //     { title: "Overview", url: "/dashboard/admin" },
  //     { title: "Analytics", url: "/dashboard/admin/analytics" },
  //   ],
  // },
  {
    title: "Users",
    url: "/dashboard/admin/list-users",
    icon: "Users",
    // items: [
    //   { title: "All Users", url: "/dashboard/admin/users" },
    //   { title: "Roles", url: "/dashboard/admin/users/roles" },
    // ],
  },
  // {
  //   title: "Settings",
  //   url: "/dashboard/admin/settings",
  //   icon: "Settings2",
  //   items: [
  //     { title: "General", url: "/dashboard/admin/settings/general" },
  //     { title: "Billing", url: "/dashboard/admin/settings/billing" },
  //   ],
  // },
];

export const studentNavConfig = [
  {
    title: "SCTEVT",
    url: "/dashboard/student/sctevt",
    icon: "User",
    isActive: true,
    items: [
      { title: "Results", url: "/dashboard/student/sctevt/results" },
      { title: "Marksheet", url: "/dashboard/student/sctevt/marksheet" },
      {
        title: "Provisional Marksheet",
        url: "/dashboard/student/sctevt/provisional-marksheet",
      },
      // { title: "Profile", url: "/dashboard/student/profile" },
    ],
  },
  {
    title: "BPUT",
    url: "/dashboard/student/bput",
    icon: "User",
    isActive: true,
    items: [
      { title: "Results", url: "/dashboard/student/bput/results" },
      // { title: "Marksheet", url: "/dashboard/student/sctevt/marksheet" },
      // {
      //   title: "Provisional Marksheet",
      //   url: "/dashboard/student/sctevt/provisional-marksheet",
      // },
      // { title: "Profile", url: "/dashboard/student/profile" },
    ],
  },
  // {
  //   title: "Profile",
  //   url: "/dashboard/student/profile",
  //   icon: "User",
  // },
];
