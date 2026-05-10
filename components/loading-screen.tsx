import Image from "next/image";

export function LoadingScreen({ message = "Loading…" }: { message?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 text-gray-600">
      <Image
        src="/profile.webp"
        alt="DormPay logo"
        width={48}
        height={48}
        className="animate-pulse rounded-lg"
      />
      <p className="mt-4 text-base">{message}</p>
    </div>
  );
}
