import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { createTw } from "react-pdf-tailwind";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const tw = createTw({
  colors: {
    background: "hsl(0, 0%, 100%)",
    foreground: "hsl(0, 0%, 3.9%)",
    card: "hsl(0, 0%, 100%)",
    "card-foreground": "hsl(0, 0%, 3.9%)",
    popover: "hsl(0, 0%, 100%)",
    "popover-foreground": "hsl(0, 0%, 3.9%)",
    primary: "hsl(0, 0%, 9%)",
    "primary-foreground": "hsl(0, 0%, 98%)",
    secondary: "hsl(0, 0%, 96.1%)",
    "secondary-foreground": "hsl(0, 0%, 9%)",
    muted: "hsl(0, 0%, 96.1%)",
    "muted-foreground": "hsl(0, 0%, 45.1%)",
    accent: "hsl(0, 0%, 96.1%)",
    "accent-foreground": "hsl(0, 0%, 9%)",
    destructive: "hsl(0, 84.2%, 60.2%)",
    border: "hsl(0, 0%, 89.8%)",
    input: "hsl(0, 0%, 89.8%)",
    ring: "hsl(0, 0%, 3.9%)",
  },
  borderRadius: {
    DEFAULT: "0.5rem",
    sm: "calc(0.5rem - 4px)",
    md: "calc(0.5rem - 2px)",
    lg: "0.5rem",
    xl: "calc(0.5rem + 4px)",
  },
  fontFamily: {
    sans: ["Helvetica"],
  },
});
