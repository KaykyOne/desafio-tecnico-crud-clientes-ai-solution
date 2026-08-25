"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "#ffffff",
          "--normal-text": "#183d34",
          "--normal-border": "#dce8e2",
          "--success-bg": "#eaf7f0",
          "--success-text": "#197967",
          "--success-border": "#cce7dc",
          "--error-bg": "#fff0ed",
          "--error-text": "#a25042",
          "--error-border": "#f0d8d3",
          "--warning-bg": "#fff7e8",
          "--warning-text": "#95651c",
          "--warning-border": "#f2dfb4",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast !rounded-2xl !shadow-[0_18px_45px_-24px_rgba(24,61,52,0.55)]",
          title: "!font-bold",
          description: "!text-black",
          success: "!border-[#cce7dc] !bg-[#eaf7f0] !text-[#197967]",
          error: "!border-[#f0d8d3] !bg-[#fff0ed] !text-[#a25042]",
          warning: "!border-[#f2dfb4] !bg-[#fff7e8] !text-[#95651c]",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };

export default Toaster;
