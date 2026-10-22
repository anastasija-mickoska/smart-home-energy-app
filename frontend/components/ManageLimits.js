"use client";

import { useState, useEffect } from "react";

export default function ManageLimits({
    weeklyLimit,
    monthlyLimit,
    onClose,
    onSave,
}) {

    const [localWeeklyLimit, setLocalWeeklyLimit] = useState(
        weeklyLimit?.toString() ?? ""
    );
    const [localMonthlyLimit, setLocalMonthlyLimit] = useState(
        monthlyLimit?.toString() ?? ""
    );
    const [error, setError] = useState("");

    useEffect(() => {
        setLocalWeeklyLimit(weeklyLimit?.toString() ?? "");
        setLocalMonthlyLimit(monthlyLimit?.toString() ?? "");
    }, [weeklyLimit, monthlyLimit]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose]);

    const onSavePress = async () => {
        if (
            localWeeklyLimit.trim() === "" ||
            localMonthlyLimit.trim() === ""
        ) {
            setError("Please enter both usage limits.");
            return;
        }

        const weeklyNum = Number(localWeeklyLimit);
        const monthlyNum = Number(localMonthlyLimit);

        if (
            !Number.isFinite(weeklyNum) ||
            !Number.isFinite(monthlyNum) ||
            weeklyNum < 0 ||
            monthlyNum < 0
        ) {
            setError("Please enter valid, non-negative numbers.");
            return;
        }

        try {
            setError("");

            await onSave({
                weeklyLimit: weeklyNum,
                monthlyLimit: monthlyNum,
            });

            onClose();
        } catch {
            setError("Failed to save usage limits. Please try again.");
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="usage-limits-title"
                className="relative w-full max-w-md rounded-[20px] bg-white p-6 shadow-xl"
            >
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close modal"
                    className="absolute right-4 top-3 text-2xl text-gray-500 hover:text-gray-800"
                >
                    &times;
                </button>

                <h2
                    id="usage-limits-title"
                    className="mb-4 text-center text-xl font-bold text-[#1F2F98]"
                >
                    Usage Limits
                </h2>

                <div className="flex w-full flex-col items-center">
                    <label
                        htmlFor="weekly-limit"
                        className="my-[10px] text-center text-xs font-medium tracking-[0.6px] text-[#1F2F98]"
                    >
                        Change weekly limit here:
                    </label>

                    <input
                        id="weekly-limit"
                        type="number"
                        min="0"
                        step="any"
                        value={localWeeklyLimit}
                        onChange={(event) => {
                            setLocalWeeklyLimit(event.target.value);
                            setError("");
                        }}
                        className="my-[5px] h-10 w-4/5 rounded-[20px] border border-black/20 bg-[#F3F3F3] text-center text-black/50 outline-none focus:border-[#1AA7EC] focus:ring-1 focus:ring-[#1AA7EC]"
                    />

                    <label
                        htmlFor="monthly-limit"
                        className="my-[10px] text-center text-xs font-medium tracking-[0.6px] text-[#1F2F98]"
                    >
                        Change monthly limit here:
                    </label>

                    <input
                        id="monthly-limit"
                        type="number"
                        min="0"
                        step="any"
                        value={localMonthlyLimit}
                        onChange={(event) => {
                            setLocalMonthlyLimit(event.target.value);
                            setError("");
                        }}
                        className="my-[5px] h-10 w-4/5 rounded-[20px] border border-black/20 bg-[#F3F3F3] text-center text-black/50 outline-none focus:border-[#1AA7EC] focus:ring-1 focus:ring-[#1AA7EC]"
                    />

                    {error && (
                        <p role="alert" className="mt-3 text-center text-sm text-red-600">
                            {error}
                        </p>
                    )}

                    <button
                        type="button"
                        onClick={onSavePress}
                        className="mt-5 flex h-10 min-w-24 items-center justify-center rounded-[20px] bg-gradient-to-r from-[#4ADEDE] to-[#1AA7EC] px-4 transition-opacity hover:opacity-90"
                    >
                        <span className="p-[10px] text-xs font-medium text-[#F3F3F3]">
                            Save
                        </span>

                        <img
                            src="/add.png"
                            alt=""
                            className="h-[25px] w-[25px] object-contain"
                        />
                    </button>
                </div>
            </div>
        </div>
    );
}