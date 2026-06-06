import { Suspense } from "react";
import Image from "next/image";
import { LoginForm } from "@/features/auth/components/login-form";

function LoginFormSkeleton() {
  return (
    <div className="w-full max-w-md sm:max-w-lg lg:max-w-xl xl:max-w-2xl rounded-2xl border border-gray-200 bg-white shadow-2xl p-8 space-y-5 animate-pulse">
      <div className="h-8 w-24 bg-gray-200 rounded-lg" />
      <div className="h-10 bg-gray-100 rounded-lg" />
      <div className="h-10 bg-gray-100 rounded-lg" />
      <div className="h-12 bg-gray-200 rounded-lg" />
    </div>
  );
}

export function LoginPage() {
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
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            DormPay
          </h1>
        </div>
      </header>

      <main className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8 sm:py-12 md:py-16 lg:py-20">
        <div className="flex flex-col items-center justify-between gap-8 md:gap-10 lg:gap-16 xl:gap-20 lg:grid lg:grid-cols-2">
          {/* Left: hero */}
          <div className="flex-1 w-full lg:max-w-2xl space-y-3 md:space-y-4 lg:space-y-5 order-2 lg:order-1 text-center lg:text-right relative">
            <div className="block lg:absolute lg:bottom-0 lg:left-15 mb-6 lg:mb-0 w-48 sm:w-56 md:w-64 mx-auto lg:mx-0 lg:w-[28rem] xl:w-[30rem] 2xl:w-[32rem] animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-700">
              <Image
                src="/landing-vector1.png"
                alt="DormPay illustration"
                width={640}
                height={640}
                priority
                className="w-full h-auto object-contain drop-shadow-lg"
              />
            </div>

            <div className="space-y-4 md:space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold text-[#12372A] leading-[0.95] tracking-tight">
                DormPay
              </h1>
              <div className="w-16 sm:w-20 h-1 sm:h-1.5 bg-[#12372A] rounded-full mx-auto lg:ml-auto lg:mr-0" />
            </div>

            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-[#12372A] leading-tight animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
              Your official portal for managing dorm payments.
            </p>
          </div>

          {/* Right: sign-in card */}
          <div className="order-2 lg:order-2 w-full lg:w-auto flex justify-center items-start lg:flex-shrink-0">
            <Suspense fallback={<LoginFormSkeleton />}>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}
