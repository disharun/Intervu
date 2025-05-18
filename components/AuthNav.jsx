"use client";
import { Button } from "./ui/button";
import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function AuthNav() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  if (isSignedIn) {
    return (
      <div className="flex gap-4 items-center">
        <Button onClick={() => router.push("/dashboard")} variant="outline">
          Go to Dashboard
        </Button>
        <UserButton afterSignOutUrl="/" />
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      <SignInButton mode="modal">
        <Button variant="outline">Sign In</Button>
      </SignInButton>
      <SignUpButton mode="modal">
        <Button>Sign Up</Button>
      </SignUpButton>
    </div>
  );
}
