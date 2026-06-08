"use client";

import Image from "next/image";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-gray-50">
      <header className="w-full h-[74px] bg-[#12372A] shadow-md flex items-center justify-between px-6 md:px-12 lg:px-24 animate-in fade-in duration-700">
        <div className="flex items-center gap-3">
          <Image
            src="/profile-old.webp"
            alt="DormPay logo"
            width={40}
            height={40}
            className="rounded-lg"
          />
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">DormPay</h1>
        </div>
      </header>

      <main className="w-full flex items-center justify-center min-h-[calc(100vh-74px)] px-4 py-10">
        <ForgotPasswordForm />
      </main>
    </div>
  );
}
