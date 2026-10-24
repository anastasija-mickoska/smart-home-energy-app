"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

import Limits from "./Limits";
import CustomButton from "./CustomButton";
import ManageLimits from "./ManageLimits";

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

const fmt1 = (n) => Number(n || 0).toFixed(1);
const fmt2 = (n) => Number(n || 0).toFixed(2);

function limitFor(period, household) {
  if (period === "weekly") return household.weekly_limit_kwh;
  if (period === "monthly") return household.monthly_limit_kwh;

  return household.weekly_limit_kwh != null
    ? household.weekly_limit_kwh / 7
    : null;
}

const limitName = (period) =>
  period === "daily" ? "daily budget" : `${period} limit`;

function percentLabel(share) {
  return share < 0.005 ? "<1%" : `${Math.round(share * 100)}%`;
}

// Include every appliance with positive consumption.
function buildSlices(appliances = []) {
  const items = appliances
    .filter((appliance) => Number(appliance.kwh) > 0)
    .map((appliance) => ({
      ...appliance,
      kwh: Number(appliance.kwh),
    }))
    .sort((a, b) => b.kwh - a.kwh);

  const total = items.reduce((sum, appliance) => sum + appliance.kwh, 0);

  return items.map((appliance, index) => ({
    ...appliance,
    color: PIE_COLORS[index % PIE_COLORS.length],
    share: total > 0 ? appliance.kwh / total : 0,
  }));
}

// Usage versus limit chart
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
    ? `${fmt1(used)} kWh used, ${pct}% of the ${limitName(period)}`
    : `${fmt1(used)} kWh used, no limit set`;

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
        <span className="text-2xl font-bold">
          {fmt1(used)} kWh
        </span>

        <span className="mt-1 text-xs font-bold">
          {hasLimit ? `${pct}% of ${limitName(period)}` : "No limit set"}
        </span>
      </div>

      <span className="sr-only">{summary}</span>
    </div>
  );
}

// Appliance consumption pie chart
function AppliancePie({ slices }) {
  if (slices.length === 0) {
    return (
      <p className="text-base font-medium">
        No appliance usage data available for this period.
      </p>
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
              paddingAngle={slices.length > 1 ? 1 : 0}
              stroke="#F3F3F3"
              strokeWidth={1.5}
              isAnimationActive={false}
            >
              {slices.map((slice, index) => (
                <Cell
                  key={`${slice.name}-${index}`}
                  fill={slice.color}
                />
              ))}
            </Pie>

            <Tooltip
              formatter={(value, name) => [
                `${fmt2(value)} kWh`,
                name,
              ]}
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #E0E0E0",
                fontSize: "12px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Dynamic legend: one entry for every positive-usage appliance */}
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

            <span className="min-w-0 flex-1 break-words">
              {slice.name}
            </span>

            <span className="shrink-0">
              {fmt2(slice.kwh)} kWh
            </span>

            <span className="w-10 shrink-0 text-right">
              {percentLabel(slice.share)}
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}

export default function Dashboard({ data, isOwner }) {
  const [period, setPeriod] = useState("daily");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  // const slices = buildSlices(current.appliances);

  const usageByPeriod = {
    daily: {
      highTariff: data.daily_high_tariff_kwh,
      lowTariff: data.daily_low_tariff_kwh,
      highTariffCost: data.daily_high_tariff_cost,
      lowTariffCost: data.daily_low_tariff_cost,
    },
    weekly: {
      highTariff: data.weekly_high_tariff_kwh,
      lowTariff: data.weekly_low_tariff_kwh,
      highTariffCost: data.weekly_high_tariff_cost,
      lowTariffCost: data.weekly_low_tariff_cost,
    },
    monthly: {
      highTariff: data.monthly_high_tariff_kwh,
      lowTariff: data.monthly_low_tariff_kwh,
      highTariffCost: data.monthly_high_tariff_cost,
      lowTariffCost: data.monthly_low_tariff_cost,
    },
  };

  const current = usageByPeriod[period];
  const used = current.highTariff + current.lowTariff;
  const cost = current.highTariffCost + current.lowTariffCost;

  const limit = limitFor(period, household);
  const hasLimit = limit != null && limit > 0;
  const over = hasLimit && used > limit;

  const handleSaveLimits = async (newWeeklyLimit, newMonthlyLimit) => {
    // Call your API here to save the new limits.

    console.log(newWeeklyLimit, newMonthlyLimit);

    setIsModalOpen(false);
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

        <Limits
          week={household.weekly_limit_kwh}
          month={household.monthly_limit_kwh}
        />

        {isModalOpen && (
          <ManageLimits
            weeklyLimit={household.weekly_limit_kwh}
            monthlyLimit={household.monthly_limit_kwh}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveLimits}
          />
        )}

        {/* Charts */}
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

            <Donut
              used={used}
              limit={limit}
              period={period}
            />

            <div className="mt-5 space-y-1 text-center text-sm font-medium">
              {over && (
                <p className="font-bold text-[#B42318]">
                  You are over your {limitName(period)}.
                </p>
              )}

              {hasLimit && period === "daily" && (
                <p>
                  Daily budget is your weekly limit divided by 7 (
                  {fmt1(limit)} kWh).
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

            {slices.length > 0 && (
              <p className="mt-4 text-base font-bold">
                Total cost: {fmt2(current.cost)} den
              </p>
            )}
          </section>
        </div>

        {/* Period selector */}
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
              className={`rounded-full px-5 py-1.5 text-base font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F2F98] motion-reduce:transition-none ${period === p.key
                ? "bg-[#1AA7EC] text-[#F3F3F3]"
                : "bg-white text-[#1F2F98] hover:bg-[#4ADEDE]/30"
                }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {isOwner && (
          <CustomButton
            imgSource="edit"
            text="Manage Usage Limits"
            onClick={() => setIsModalOpen(true)}
          />
        )}

      </div>
    </main>
  );
}