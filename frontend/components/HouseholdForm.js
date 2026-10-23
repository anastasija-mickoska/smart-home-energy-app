"use client";

import { useState } from "react";
import Image from "next/image";

const inputClass =
    "w-full rounded-[20px] border-1 border-[#00000033] bg-[#f3f3f3] px-3.5 py-3 text-base text-[#0a2638] placeholder:text-slate-500 focus-visible:border-[#4ADEDE] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#4ADEDE]/60";

const COPY = {
    join: {
        title: "Join a household",
        intro: "Enter the household code you received from the household owner.",
        button: "Join Household",
        loading: "Joining…",
        endpoint: `${process.env.NEXT_PUBLIC_API_URL}/api/households/join`,
    },
    create: {
        title: "Create a household",
        intro: "Tell us a little about your household.",
        button: "Create Household",
        loading: "Creating…",
        endpoint: `${process.env.NEXT_PUBLIC_API_URL}/api/households/create`,
    },
};

export default function HouseholdForm({ mode = "join" }) {
    const copy = COPY[mode];

    const [code, setCode] = useState("");
    const [name, setName] = useState("");
    const [city, setCity] = useState("");
    const [size, setSize] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit() {
        if (loading) return;
        setError("");

        let payload;
        if (mode === "join") {
            if (code.trim().length !== 6) {
                setError("The household code should have 6 characters.");
                return;
            }
            payload = { name: name.trim(), household_code: code.trim() };
        } else {
            const n = Number(size);
            const len = code.trim().length
            if (!name.trim() || !code.trim()) {
                setError("Give your household a name and code.");
                return;
            }
            if (!Number.isInteger(n) || n < 1 || n > 10) {
                setError("Enter a number of people between 1 and 10.");
                return;
            }
            if (len != 6) {
                setError("The household should contain exactly 6 characters.");
                return;
            }
            payload = { name: name.trim(), city: city.trim() || null, household_size: n, household_code: code.trim() };
        }

        setLoading(true);
        try {
            const res = await fetch(copy.endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                const household = await res.json();
                window.location.assign(`/households/${household.household_id}`);
                return;
            }

            if (res.status === 401) {
                window.location.assign("/login");
            } else if (res.status === 404) {
                setError("No household found with that code. Check it and try again.");
            } else if (res.status === 409) {
                setError("That household is full, or you already belong to one.");
            } else if (res.status === 422) {
                setError("Check the details and try again.");
            } else {
                setError("Something went wrong on our side. Try again in a moment.");
            }
        } catch {
            setError("Can't reach the server. Check your connection and try again.");
        } finally {
            setLoading(false);
        }
    }

    function handleKeyDown(e) {
        if (e.key === "Enter") handleSubmit();
    }

    return (
        <div className="w-full max-w-sm text-white" onKeyDown={handleKeyDown}>
            <h2 className="mb-2 text-2xl font-bold leading-tight tracking-tight">{copy.title}</h2>
            <p className="mb-7 text-[15px] leading-normal text-white/90">{copy.intro}</p>

            {mode === "join" ? (
                <div className="mb-[18px] flex flex-col gap-4">
                    <label htmlFor="hh-code" className="text-sm font-semibold">
                        Household name
                    </label>
                    <input
                        id="hh-code"
                        type="text"
                        autoComplete="off"
                        autoCapitalize="characters"
                        spellCheck={false}
                        placeholder="Enter name..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={inputClass}
                    />
                    <label htmlFor="hh-code" className="text-sm font-semibold">
                        Household code
                    </label>
                    <input
                        id="hh-code"
                        type="text"
                        autoComplete="off"
                        autoCapitalize="characters"
                        spellCheck={false}
                        maxLength={6}
                        placeholder="6 characters"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        className={inputClass}
                    />
                </div>
            ) : (
                <>
                    <div className="mb-[18px] flex flex-col gap-4">
                        <label htmlFor="hh-name" className="text-sm font-semibold">
                            Household name
                        </label>
                        <input
                            id="hh-name"
                            type="text"
                            autoComplete="on"
                            maxLength={60}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={inputClass}
                        />
                    </div>

                    <div className="mb-[18px] flex flex-col gap-2">
                        <label htmlFor="hh-city" className="text-sm font-semibold">
                            City <span className="font-normal text-white/80">(optional)</span>
                        </label>
                        <input
                            id="hh-city"
                            type="text"
                            autoComplete="address-level2"
                            maxLength={60}
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className={inputClass}
                        />
                    </div>

                    <div className="mb-[18px] flex flex-col gap-2">
                        <label htmlFor="hh-size" className="text-sm font-semibold">
                            Number of people
                        </label>
                        <input
                            id="hh-size"
                            type="number"
                            inputMode="numeric"
                            min={1}
                            max={10}
                            placeholder="1 to 10"
                            value={size}
                            onChange={(e) => setSize(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    <div className="mb-[18px] flex flex-col gap-2">
                        <label htmlFor="hh-code" className="text-sm font-semibold">
                            Household code
                        </label>
                        <input
                            id="hh-code"
                            type="text"
                            autoComplete="off"
                            placeholder="6 characters"
                            minLength={6}
                            maxLength={6}
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                </>
            )}

            {error && (
                <p
                    role="alert"
                    className="mb-4 rounded-md border-l-4 border-red-300 bg-red-500/30 px-3 py-2.5 text-sm leading-snug"
                >
                    {error}
                </p>
            )}

            <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="mt-1.5 inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[linear-gradient(90deg,#4ADEDE,#1AA7EC)] px-6 text-base font-semibold text-[#F3F3F3] hover:enabled:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-default disabled:opacity-65"
            >
                {loading ? copy.loading : copy.button}
                {!loading && (
                    <Image src="/add.png" height={25} width={25} alt="Add icon"/>
                )}
            </button>
        </div>
    );
}