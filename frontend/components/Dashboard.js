"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  PieChart,
  Pie,
  Sector,
  Tooltip,
} from "recharts";

import Limits from "./Limits";
import CustomButton from "./CustomButton";
import ManageLimits from "./ManageLimits";
import { notFound } from "next/navigation";

const PERIODS = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
];

const PIE_COLORS = [
  "#4ADEDE",
  "#1AA7EC",
  "#1F2F98",
  "#055B5C",
  "#7FFFD4",
  "#289C8E",
];

const OVER_COLOR = "#D64545";
const TRACK_COLOR = "#E0E0E0";

const format1 = (n) => Number(n || 0).toFixed(1);
const format2 = (n) => Number(n || 0).toFixed(2);

function limitFor(period, householdData) {
  if (period === "weekly") return householdData.weekly_limit_kwh;
  if (period === "monthly") return householdData.monthly_limit_kwh;

  return householdData.weekly_limit_kwh != null
    ? householdData.weekly_limit_kwh / 7
    : null;
}

function percentLabel(share) {
  return share < 0.005 ? "<1%" : `${Math.round(share * 100)}%`;
}

function kwhFor(appliance, period) {
  return (
    (Number(appliance[`${period}_low_kwh`]) || 0) +
    (Number(appliance[`${period}_high_kwh`]) || 0)
  );
}

function buildSlices(appliances = [], period = "daily") {
  const applianceList = Array.isArray(appliances) ? appliances : [];

  const items = applianceList
    .map((appliance) => ({
      name: appliance.appliance_type,
      kwh: kwhFor(appliance, period),
    }))
    .filter((item) => item.kwh > 0)
    .sort((a, b) => b.kwh - a.kwh);

  const total = items.reduce((sum, item) => sum + item.kwh, 0);

  return items.map((item, index) => ({
    ...item,
    color: PIE_COLORS[index % PIE_COLORS.length],
    share: total > 0 ? item.kwh / total : 0,
  }));
}

function Donut({ used, limit, period }) {
  const hasLimit = limit != null && Number(limit) > 0;
  const ratio = hasLimit ? used / limit : 0;
  const pct = Math.round(ratio * 100);
  const over = ratio > 1;

  const chartData = [
    {
      name: "Usage",
      value: Math.min(Math.max(ratio * 100, 0), 100),
      fill: over ? OVER_COLOR : "#4ADEDE",
    },
  ];

  const summary = hasLimit
    ? `${format1(used)} kWh used, ${pct}% of the ${period} limit`
    : `${format1(used)} kWh used, no limit set`;

  return (
    <div className="relative mx-auto h-52 w-52">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius="72%"
          outerRadius="100%"
          startAngle={90}
          endAngle={-270}
          barSize={20}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />

          <RadialBar
            dataKey="value"
            background={{ fill: TRACK_COLOR }}
            cornerRadius={10}
            isAnimationActive={false}
          />
        </RadialBarChart>
      </ResponsiveContainer>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-9 text-center"
      >
        <span className="text-2xl font-bold">{format1(used)} kWh</span>

        <span className="mt-1 text-xs font-bold">
          {hasLimit ? `${pct}% of ${period} limit` : "No limit set"}
        </span>
      </div>

      <span className="sr-only">{summary}</span>
    </div>
  );
}

function AppliancePie({ slices }) {
  if (slices.length === 0) {
    return (
      <p className="py-8 text-center text-base font-medium">
        No appliance usage data available for this period.
      </p>
    );
  }

  if (slices.length === 1) {
    const appliance = slices[0];

    return (
      <div className="mt-8 flex items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="h-4 w-4 shrink-0 rounded-full"
            style={{ backgroundColor: appliance.color }}
          />
          <div className="min-w-0">
            <p className="break-words text-base font-bold">{appliance.name}</p>
            <p className="text-sm text-gray-500">100% of appliance usage</p>
          </div>
        </div>

        <p className="shrink-0 text-lg font-bold">
          {format2(appliance.kwh)} kWh
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto h-52 w-full max-w-xs">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              dataKey="kwh"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius="90%"
              paddingAngle={1}
              stroke="#F3F3F3"
              strokeWidth={1.5}
              isAnimationActive={false}
              shape={(props) => (
                <Sector
                  {...props}
                  fill={
                    props.payload?.color ??
                    PIE_COLORS[props.index % PIE_COLORS.length]
                  }
                />
              )}
            />

            <Tooltip
              formatter={(value, name) => [`${format2(value)} kWh`, name]}
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #E0E0E0",
                fontSize: "12px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="mt-5 space-y-2">
        {slices.map((slice, index) => (
          <li
            key={`${slice.name}-${index}`}
            className="flex items-center gap-2 text-sm font-medium"
          >
            <span
              aria-hidden="true"
              className="h-3 w-3 shrink-0 rounded-sm"
              style={{ backgroundColor: slice.color }}
            />

            <span className="min-w-0 flex-1 break-words">{slice.name}</span>

            <span className="shrink-0">{format2(slice.kwh)} kWh</span>

            <span className="w-10 shrink-0 text-right">
              {percentLabel(slice.share)}
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}

export default function Dashboard({ household, appliances, isOwner }) {
  const [period, setPeriod] = useState("daily");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [householdData, setHouseholdData] = useState(household);
  const slices = buildSlices(appliances, period);

  const usageByPeriod = {
    daily: {
      highTariff: Number(household.daily_high_tariff_kwh) || 0,
      lowTariff: Number(household.daily_low_tariff_kwh) || 0,
      highTariffCost: Number(household.daily_high_tariff_cost) || 0,
      lowTariffCost: Number(household.daily_low_tariff_cost) || 0,
    },
    weekly: {
      highTariff: Number(household.weekly_high_tariff_kwh) || 0,
      lowTariff: Number(household.weekly_low_tariff_kwh) || 0,
      highTariffCost: Number(household.weekly_high_tariff_cost) || 0,
      lowTariffCost: Number(household.weekly_low_tariff_cost) || 0,
    },
    monthly: {
      highTariff: Number(household.monthly_high_tariff_kwh) || 0,
      lowTariff: Number(household.monthly_low_tariff_kwh) || 0,
      highTariffCost: Number(household.monthly_high_tariff_cost) || 0,
      lowTariffCost: Number(household.monthly_low_tariff_cost) || 0,
    },
  };

  const current = usageByPeriod[period];

  const used = current.highTariff + current.lowTariff;

  const totalCost = current.highTariffCost + current.lowTariffCost;

  const limit = limitFor(period, householdData);
  const hasLimit = limit != null && limit > 0;
  const over = hasLimit && used > limit;

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const handleSaveLimits = async ({ weeklyLimit, monthlyLimit }) => {
    try {
      const res = await fetch(
        `${API_URL}/api/households/${household.household_id}/saveLimits`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            household_id: household.household_id,
            weekly_limit: weeklyLimit,
            monthly_limit: monthlyLimit,
          }),
        },
      );

      if (res.status === 401) {
        window.location.assign("/login");
        return false;
      }

      if (res.status === 403) {
        throw new Error("You don't have permission to update these limits.");
      }

      if (res.status === 404) {
        return redirect("/notFound");
      }

      if (!res.ok) {
        throw new Error(responseText || "Could not save usage limits.");
      }

      setHouseholdData((prev) => ({
        ...prev,
        weekly_limit_kwh: weeklyLimit,
        monthly_limit_kwh: monthlyLimit,
      }));
      setIsModalOpen(false);

      return true;
    } catch (error) {
      console.error("Error in handleSaveLimits:", error);
      throw error;
    }
  };

  return (
    <main className="min-h-screen bg-[#F3F3F3] px-4 py-8 text-[#1F2F98] sm:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header>
          <div className="mt-[30px] flex flex-col items-center justify-center gap-5">
            <div className="flex w-fit max-w-full items-center justify-center rounded-[20px] bg-[#4ADEDE] px-8 py-[15px] sm:px-[50px]">
              <p className="break-words text-center text-[24px] font-semibold text-[#F3F3F3] md:text-[32px]">
                {household.name}
              </p>
            </div>
          </div>
        </header>

        <div className="flex justify-center">
          <Limits
            week={householdData.weekly_limit_kwh}
            month={householdData.monthly_limit_kwh}
          />
        </div>

        {isModalOpen && (
          <ManageLimits
            weeklyLimit={householdData.weekly_limit_kwh}
            monthlyLimit={householdData.monthly_limit_kwh}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveLimits}
          />
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Usage versus limit */}
          <section
            aria-labelledby="usage-title"
            className="rounded-[20px] bg-[#1AA7EC]/10 p-6"
          >
            <h2
              id="usage-title"
              className="mb-5 text-xl font-bold tracking-wide"
            >
              Usage vs limit
            </h2>

            <Donut used={used} limit={limit} period={period} />

            {/* Tariff breakdown */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-white p-3">
                <div>
                  <p className="font-bold">High tariff</p>
                  <p className="text-xs text-gray-500">
                    Higher electricity rate
                  </p>
                </div>
                <p className="font-bold">{format2(current.highTariff)} kWh</p>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-white p-3">
                <div>
                  <p className="font-bold">Low tariff</p>
                  <p className="text-xs text-gray-500">
                    Lower electricity rate
                  </p>
                </div>
                <p className="font-bold">{format2(current.lowTariff)} kWh</p>
              </div>
            </div>

            {/* Total cost */}
            <div className="mt-4 rounded-2xl bg-[#4ADEDE] px-5 py-4 text-center text-white">
              <p className="text-sm font-medium">Total electricity cost</p>
              <p className="mt-1 text-2xl font-bold">
                {format2(totalCost)} den
              </p>
            </div>

            {/* Limit information */}
            <div className="mt-5 space-y-1 text-center text-sm font-medium">
              {over && (
                <p className="font-bold text-[#B42318]">
                  You are over your {period} limit.
                </p>
              )}

              {hasLimit && period === "daily" && (
                <p>
                  Daily budget is your weekly limit divided by 7 (
                  {format1(limit)} kWh).
                </p>
              )}

              {!hasLimit && (
                <p>
                  {period === "daily"
                    ? "Set a weekly limit to get a daily budget."
                    : `Set a ${period} limit to track your progress.`}
                </p>
              )}
            </div>
          </section>

          {/* Appliance usage */}
          <section
            aria-labelledby="appliances-title"
            className="rounded-[20px] bg-[#1AA7EC]/10 p-6"
          >
            <h2
              id="appliances-title"
              className="mb-5 text-xl font-bold tracking-wide"
            >
              Appliance usage
            </h2>

            <AppliancePie slices={slices} />
          </section>
        </div>

        <div
          role="group"
          aria-label="Period"
          className="flex flex-wrap justify-center gap-3"
        >
          {PERIODS.map((p) => (
            <button
              key={p.key}
              type="button"
              aria-pressed={period === p.key}
              onClick={() => setPeriod(p.key)}
              className={`rounded-full px-5 py-1.5 text-base font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F2F98] motion-reduce:transition-none ${
                period === p.key
                  ? "bg-[#1AA7EC] text-[#F3F3F3]"
                  : "bg-white text-[#1F2F98] hover:bg-[#4ADEDE]/30"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {isOwner && (
          <div className="flex justify-center">
            <CustomButton
              imgSource="edit"
              text="Manage Usage Limits"
              onClick={() => setIsModalOpen(true)}
            />
          </div>
        )}
      </div>
    </main>
  );
}
