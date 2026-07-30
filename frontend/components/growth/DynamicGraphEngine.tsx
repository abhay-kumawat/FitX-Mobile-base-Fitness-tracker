import React from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area, BarChart, Bar, Legend } from "recharts";

type GraphType = "line" | "area" | "bar";

interface DynamicGraphEngineProps {
  data: any[];
  type?: GraphType;
  xKey?: string;
  lines?: { key: string; color: string; name?: string }[];
  areas?: { key: string; color: string; name?: string }[];
  bars?: { key: string; color: string; name?: string }[];
  height?: number;
}

export function DynamicGraphEngine({
  data,
  type = "line",
  xKey = "date",
  lines = [],
  areas = [],
  bars = [],
  height = 300,
}: DynamicGraphEngineProps) {
  
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-full text-sm text-slate-400 font-medium">No data available for this timeframe</div>;
  }

  const renderTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700/50 text-xs">
          <p className="font-bold mb-2 text-slate-300 border-b border-slate-700 pb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="font-medium">{entry.name}:</span>
              <span className="font-black text-emerald-400">{entry.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    switch (type) {
      case "area":
        return (
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              {areas.map((area, i) => (
                <linearGradient key={area.key} id={`color${area.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={area.color} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={area.color} stopOpacity={0}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey={xKey} tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={false} tickMargin={10} minTickGap={20} />
            <YAxis tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={false} />
            <Tooltip content={renderTooltip} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 600, color: '#475569' }} />
            {areas.map(area => (
              <Area key={area.key} type="monotone" dataKey={area.key} name={area.name || area.key} stroke={area.color} fillOpacity={1} fill={`url(#color${area.key})`} strokeWidth={3} />
            ))}
          </AreaChart>
        );
        
      case "bar":
        return (
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey={xKey} tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={false} tickMargin={10} minTickGap={20} />
            <YAxis tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={false} />
            <Tooltip content={renderTooltip} cursor={{ fill: '#f1f5f9' }} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 600, color: '#475569' }} />
            {bars.map(bar => (
              <Bar key={bar.key} dataKey={bar.key} name={bar.name || bar.key} fill={bar.color} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        );
        
      case "line":
      default:
        return (
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey={xKey} tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={false} tickMargin={10} minTickGap={20} />
            <YAxis tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={false} />
            <Tooltip content={renderTooltip} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 600, color: '#475569' }} />
            {lines.map(line => (
              <Line key={line.key} type="monotone" dataKey={line.key} name={line.name || line.key} stroke={line.color} strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
            ))}
          </LineChart>
        );
    }
  };

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}
