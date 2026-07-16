import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";

export default function Navbar() {
  const navLinks = [
    {
      name: "Home",
      link: "/",
    },
    {
      name: "Search Properties",
      link: "/properties",
    },
  ];

  return (
    <header className="border-b border-stone-200/80">
      <nav className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 xl:px-10 2xl:px-12">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="font-heading text-2xl font-semibold text-primary-800 sm:text-3xl lg:text-4xl">
            AURA ESTATES
          </Link>

          <div className="flex items-center gap-2 sm:hidden">
            <Button variant="ghost" size="sm" className="px-4 py-2">
              Sign in
            </Button>
            <Button size="sm" className="px-4 py-2">
              Sign up
            </Button>
          </div>
        </div>

        <ul className="flex flex-wrap items-center gap-4 sm:gap-6">
          {navLinks.map((item) => (
            <li key={item.name} className="list-none">
              <Link
                href={item.link}
                className="text-sm font-medium text-primary-800 transition hover:text-primary-700 sm:text-base">
                {item.name}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 sm:flex">
          <Button
            variant="ghost"
            size="lg"
            className="px-6 py-4 sm:px-7 sm:py-5">
            Sign in
          </Button>
          <Button size="lg" className="px-6 py-4 sm:px-7 sm:py-5">
            Sign up
          </Button>
        </div>
      </nav>
    </header>
  );
}
