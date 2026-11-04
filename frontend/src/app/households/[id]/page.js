import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Dashboard from "../../../../components/Dashboard";
import Navbar from "../../../../components/Navbar";

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

async function getDashboard(id) {
    const cookieStore = await cookies();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/households/${id}`, {
        headers: {
            Cookie: cookieStore.toString(),
        },
        cache: "no-store",
    });
    if (res.status === 401) redirect("/login");
    if (res.status === 404) redirect("/notFound");
    if (res.status === 403) redirect("/accessDenied");
    if (!res.ok) throw new Error("Could not load the dashboard");
    return res.json();
}

async function getAppliances(id) {
    const cookieStore = await cookies();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/households/${id}/appliances`, {
        headers: {
            Cookie: cookieStore.toString(),
        },
        cache: "no-store",
    });
    
    if (res.status === 401) redirect("/login");
    if (res.status === 404) redirect("/notFound");
    if (res.status === 403) redirect("/accessDenied");
    if (!res.ok) throw new Error("Could not load the dashboard");
    return res.json();
}


export default async function HouseholdPage({ params }) {
    const { id } = await params;
    const me = await getUser();
    const isOwner = me.role === 'owner';

    const householdData = await getDashboard(id);
    const applianceData = await getAppliances(id);

    return <>
        <Navbar />
        <Dashboard household={householdData} appliances={applianceData} isOwner={isOwner} /> 
    </>;
}