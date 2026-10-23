import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import HouseholdForm from "../../../components/HouseholdForm";
import Navbar from "../../../components/Navbar";

async function getUser() {
  const cookieStore = await cookies();

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`,
      {
        headers: {
          Cookie: cookieStore.toString(),
        },
        cache: "no-store",
      }
    );

    if (res.status === 401) {
      redirect("/login");
    }

    if (!res.ok) {
      throw new Error("Could not load your profile");
    }

    return await res.json();
  } catch (error) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    throw error;
  }
}

export default async function WelcomePage() {
  const me = await getUser();
  if (!me) redirect("/login");

  if (me.household_id != 0) redirect(`/households/${me.household_id}`);

  const isOwner = me.role === "owner";

  return (
    <main className="flex flex-col h-screen">
      <Navbar />
      <section className="flex flex-1 md:flex-row flex-col">
        <section className="flex min-w-0 flex-1 flex-col items-center justify-center gap-8 bg-[#F3F3F3] px-6 py-12 md:px-12">
          <h1 className="break-words text-center text-[26px] font-bold tracking-[0.1em] text-[#1F2F98] sm:text-[32px]">
            Welcome, {me.name}!
          </h1>

          <div className="flex min-h-20 w-full max-w-md items-center justify-center rounded-[20px] bg-[#4ADEDE] px-5 py-5">
            <p className="text-center text-base font-medium text-[white]">
              You are not part of a household yet.
            </p>
          </div>
        </section>

        <section className="flex min-w-0 flex-1 items-center justify-center bg-[linear-gradient(0deg,#f3f3f3,#1ca7ec)] px-6 py-12 md:px-12">
          <HouseholdForm mode={isOwner ? "create" : "join"} />
        </section>
      </section>
    </main>
  );
}