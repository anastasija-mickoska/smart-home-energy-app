import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#F3F3F3] p-8 text-center text-[#1F2F98]">
      <h1 className="text-[32px] font-bold tracking-[0.1em]">404</h1>
      <p className="text-base font-medium">The household can't be found.</p>
      <Link
        href="/"
        className="rounded-full bg-[#1AA7EC] px-6 py-2 font-semibold text-[#F3F3F3]"
      >
        Back to home
      </Link>
    </main>
  );
}