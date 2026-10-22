import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import HouseholdForm from "../../../components/HouseholdForm";

async function getUser(token) {
  const res = await fetch(`${process.env.API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error("Could not load your profile");
  return res.json();
}

export default async function WelcomePage() {
  // const token = (await cookies()).get("token")?.value;
  // if (!token) redirect("/login");

  // const me = await getUser(token);
  // if (!me) redirect("/login");

  // if (me.household) redirect(`/households/{$id}`);

  // const isOwner = me.role === "owner";
  const isOwner = false; // temporary: delete this line when you re-enable the logic above

  return (
    <main className="flex min-h-screen flex-col md:flex-row">
      <section className="flex min-w-0 flex-1 flex-col items-center justify-center gap-8 bg-[#F3F3F3] px-6 py-12 md:px-12">
        <h1 className="break-words text-center text-[26px] font-bold tracking-[0.1em] text-[#1F2F98] sm:text-[32px]">
          {/* Welcome, {me.name}! */} Welcome, Anastasija!
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
    </main>
  );
}