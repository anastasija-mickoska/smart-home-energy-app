import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Dashboard from "../../../../components/Dashboard";
import Navbar from "../../../../components/Navbar";

const USE_SAMPLE = true;

const SAMPLE = {
    household: { id: 1, name: "Household 1", city: "Belgrade", weekly_limit_kwh: 40, monthly_limit_kwh: 160 },
    periods: {
        daily: {
            kwh: 4.35, cost: 52.2,
            appliances: [
                { name: "Heater", kwh: 1.4 }, { name: "Fridge", kwh: 0.95 }, { name: "Washing Machine", kwh: 0.5 },
                { name: "TV", kwh: 0.4 }, { name: "Computer", kwh: 0.4 }, { name: "Dishwasher", kwh: 0.3 },
                { name: "Kettle", kwh: 0.2 }, { name: "Microwave", kwh: 0.1 }, { name: "Laptop", kwh: 0.1 },
            ],
        },
        weekly: {
            kwh: 29.2, cost: 350.4,
            appliances: [
                { name: "Heater", kwh: 9.6 }, { name: "Fridge", kwh: 6.7 }, { name: "Washing Machine", kwh: 2.9 },
                { name: "Computer", kwh: 2.6 }, { name: "TV", kwh: 2.2 }, { name: "Dishwasher", kwh: 2.1 },
                { name: "Kettle", kwh: 1.4 }, { name: "Microwave", kwh: 1.0 }, { name: "Laptop", kwh: 0.7 },
            ],
        },
        monthly: {
            kwh: 125.7, cost: 1508.4,
            appliances: [
                { name: "Heater", kwh: 41.5 }, { name: "Fridge", kwh: 28.8 }, { name: "Washing Machine", kwh: 12.4 },
                { name: "Computer", kwh: 11.2 }, { name: "TV", kwh: 9.6 }, { name: "Dishwasher", kwh: 8.9 },
                { name: "Kettle", kwh: 6.1 }, { name: "Microwave", kwh: 4.2 }, { name: "Laptop", kwh: 3.0 },
            ],
        },
    },
};

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
    const res = await fetch(`${process.env.API_URL}/api/households/${id}`, {
        headers: {
            Cookie: cookieStore.toString(),
        },
        cache: "no-store",
    });
    if (res.status === 401) redirect("/login");
    if (res.status === 403 || res.status === 404) notFound(); // don't reveal which households exist
    if (!res.ok) throw new Error("Could not load the dashboard");
    return res.json();
}

export default async function HouseholdPage({ params }) {
    const { id } = await params;
    const me = await getUser();
    const isOwner = me.role === 'owner';

    if (USE_SAMPLE) return <>
        <Navbar />
        <Dashboard data={SAMPLE} />;
    </>

    const data = await getDashboard(id);
    return <>
        <Navbar />
        <Dashboard data={data} isOwner={isOwner} />
    </>;
}