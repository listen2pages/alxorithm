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
      <button ref={ref} type="button" aria-label="Открыть меню" aria-expanded={open} aria-controls="landing-mobile-links" onClick={()=>setOpen(v=>!v)}>
        <Menu size={23} />
      </button>
      {open&&<nav id="landing-mobile-links"
        aria-label="Мобильное меню"
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a"))setOpen(false);
        }}
      >
        <Link href="#funkcje">{"Возможности"}</Link>
        <Link href="#jak-to-dziala">{"Как это работает"}</Link>
        <Link href="/demo">{"Демо"}</Link>
        <Link href="/cennik">{"Выбрать подписку"}</Link>
        <Link href="/login">{"Войти"}</Link>
      </nav>}
    </div>
  );
}
