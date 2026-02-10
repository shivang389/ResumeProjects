import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const BudgetChart = ({ history, forecast }) => {
  // Combine history and forecast into one dataset
  const data = [...(history || []), ...(forecast || [])];

  if (!data || data.length === 0) {
     return (
        <div className="h-full flex flex-col items-center justify-center text-gray-500 text-center p-4">
           <p className="mb-2">📉 Not enough data yet.</p>
           <p className="text-xs">Add expenses to see AI predictions!</p>
        </div>
     );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
        <XAxis 
            dataKey="name" 
            stroke="#9ca3af" 
            tick={{fontSize: 12}} 
            tickLine={false}
            axisLine={false}
        />
        <YAxis 
            stroke="#9ca3af" 
            tick={{fontSize: 12}} 
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `₹${value}`}
        />
        <Tooltip 
            contentStyle={{ backgroundColor: '#1A1A2E', borderColor: '#ffffff20', color: '#fff', borderRadius: '12px' }} 
            itemStyle={{ color: '#22d3ee' }}
            formatter={(value) => [`₹${value}`, "Amount"]}
        />
        <Area 
            type="monotone" 
            dataKey="amount" 
            stroke="#22d3ee" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorAmount)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default BudgetChart;