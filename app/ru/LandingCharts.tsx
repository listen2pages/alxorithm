"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { BarChart3, ArrowUpRight } from "lucide-react";
const series = [
  { day: "Пн", revenue: 2800 },
  { day: "Вт", revenue: 3400 },
  { day: "Ср", revenue: 3100 },
  { day: "Чт", revenue: 4200 },
  { day: "Пт", revenue: 5800 },
  { day: "Сб", revenue: 6700 },
  { day: "Вс", revenue: 4800 },
];
const products = [
  { name: "Блюда", value: 15400 },
  { name: "Напитки", value: 8600 },
  { name: "Десерты", value: 6800 },
];
const currency = (n: number) => n.toLocaleString("ru-RU") + " PLN";
const serverSnapshot = () => false;
const motionSnapshot = () =>
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const subscribeMotion = (update: () => void) => {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", update);
  return () => query.removeEventListener("change", update);
};
export default function LandingCharts({
  compact = false,
}: {
  compact?: boolean;
}) {
  const [ready, setReady] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setReady(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    if (chartRef.current) observer.observe(chartRef.current);
    return () => observer.disconnect();
  }, []);
  const animate = useSyncExternalStore(
    subscribeMotion,
    motionSnapshot,
    serverSnapshot,
  );
  return (
    <div
      ref={chartRef}
      className={
        "landing-dashboard " + (compact ? "landing-dashboard-compact" : "")
      }
    >
      <div className="landing-dashboard-top">
        <span>
          <BarChart3 size={18} /> {" Панель продаж "}</span>
        <span className="landing-pill">{"Демо-данные"}</span>
      </div>
      <div className="landing-dashboard-body">
        <div className="landing-chart-heading">
          <div>
            <small>
              {compact
                ? "Выручка по категориям"
                : "Выручка с НДС · пример недели"}
            </small>
            <strong>
              30 800<span> {" PLN"}</span>
            </strong>
          </div>
          <span className="landing-chart-tag">
            <ArrowUpRight size={16} /> {" Всё на одном экране "}</span>
        </div>
        <div
          className="landing-chart"
          role="img"
          aria-label={
            compact
              ? "Пример выручки: блюда 15 400 PLN, напитки 8 600 PLN, десерты 6 800 PLN."
              : "Пример недельной выручки с НДС: 30 800 PLN. Пн 2800, вт 3400, ср 3100, чт 4200, пт 5800, сб 6700, вс 4800 PLN."
          }
        >
          {ready ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{width:300,height:compact?175:205}}>
              {compact ? (
                <BarChart
                  data={products}
                  margin={{ left: -12, right: 8, top: 15, bottom: 0 }}
                >
                  <CartesianGrid
                    vertical={false}
                    stroke="#e6dfd4"
                    strokeDasharray="3 5"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#78695a", fontSize: 11 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#78695a", fontSize: 10 }}
                    tickFormatter={(n) => n / 1000 + "k"}
                  />
                  <Tooltip
                    formatter={(v) => currency(Number(v))}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #ded8cb",
                    }}
                  />
                  <Bar
                    dataKey="value"
                    name="Przychód"
                    fill="#b87333"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={60}
                    isAnimationActive={animate}
                    animationDuration={1000}
                  />
                </BarChart>
              ) : (
                <AreaChart
                  data={series}
                  margin={{ left: -20, right: 8, top: 15, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="landing-revenue-fill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#b87333"
                        stopOpacity={0.28}
                      />
                      <stop
                        offset="100%"
                        stopColor="#b87333"
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    vertical={false}
                    stroke="#e6dfd4"
                    strokeDasharray="3 5"
                  />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#78695a", fontSize: 11 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#78695a", fontSize: 10 }}
                    tickFormatter={(n) => n / 1000 + "k"}
                  />
                  <Tooltip
                    formatter={(v) => currency(Number(v))}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #ded8cb",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Przychód brutto"
                    stroke="#b87333"
                    strokeWidth={3}
                    fill="url(#landing-revenue-fill)"
                    isAnimationActive={animate}
                    animationDuration={1400}
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div className="landing-chart-placeholder" aria-hidden="true">
              {series.map((d) => (
                <div key={d.day}>
                  <span style={{ height: d.revenue / 70 + "%" }} />
                  <small>{d.day}</small>
                </div>
              ))}
            </div>
          )}
        </div>
        {!compact && (
          <div className="landing-dashboard-bottom">
            <div>
              <small>{"Количество чеков"}</small>
              <strong>440</strong>
            </div>
            <div>
              <small>{"Средний чек"}</small>
              <strong>{"70,00 PLN"}</strong>
            </div>
            <div>
              <small>{"Лучший день"}</small>
              <strong>{"Суббота"}</strong>
            </div>
          </div>
        )}
        <p className="landing-caption">
          {" Пример данных. Ваши отчёты создаются по загруженным файлам POS. "}</p>
      </div>
    </div>
  );
}
