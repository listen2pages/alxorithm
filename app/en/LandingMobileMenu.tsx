"use client";
import { useRef, useState } from "react";
import Link from "@/i18n/navigation";
import { Menu } from "lucide-react";
export default function LandingMobileMenu() {
  const ref = useRef<HTMLButtonElement>(null);
  const [open,setOpen]=useState(false);
  return (
    <div
      className="landing-mobile-menu"
      onKeyDown={(e) => {
        if (e.key === "Escape" && ref.current) {
          setOpen(false);
          ref.current.focus();
        }
      }}
    >
      <button ref={ref} type="button" aria-label="Open menu" aria-expanded={open} aria-controls="landing-mobile-links" onClick={()=>setOpen(v=>!v)}>
        <Menu size={23} />
      </button>
      {open&&<nav id="landing-mobile-links"
        aria-label="Mobile menu"
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a"))setOpen(false);
        }}
      >
        <Link href="#funkcje">{"Features"}</Link>
        <Link href="#jak-to-dziala">{"How it works"}</Link>
        <Link href="/demo">{"Demo"}</Link>
        <Link href="/cennik">{"Choose a subscription"}</Link>
        <Link href="/login">{"Sign in"}</Link>
      </nav>}
    </div>
  );
}
