"use client";
import React, { useEffect } from "react";
import { usePathname } from "next/navigation";

function Header() {
  const path = usePathname();
  useEffect(() => {
    console.log(path);
  }, []);
  return <div></div>;
}

export default Header;
