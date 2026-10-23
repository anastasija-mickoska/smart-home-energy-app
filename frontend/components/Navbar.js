"use client"

import Image from "next/image";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function handleLogout() {
  try {
    const res = await fetch(`${API_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error("Logout failed");
    }

    window.location.assign("/login");
  } catch {
    setError("Unable to log out. Please try again.");
  }
}

export default function Navbar() {
    return (
        <header className="w-full bg-[#1aa7ec] flex flex-row gap-4 p-6">
            <button onClick={handleLogout} className="cursor-pointer md:mx-8 mx-4">
                <Image src="/logout.png" width={25} height={25} alt="Logout icon"/>
            </button>
        </header>
    )
}