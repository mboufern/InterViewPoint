import React, { useMemo } from 'react';
import { InterviewResult } from '../types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, ScatterChart, Scatter, ZAxis, Cell
} from 'recharts';
import { BarChart3, Trophy, Activity, Grid, Users } from 'lucide-react';

interface GlobalStatisticsProps {
  results: InterviewResult[];
}

// Custom Tooltip for Charts
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg ring-1 ring-black/5 z-50">
          {label && <p className="mb-2 text-xs font-semibold uppercase text-gray-500 tracking-wider">{label}</p>}
          <div className="flex flex-col gap-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center gap-2 text-sm font-medium">
                {entry.color && <span className="block h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />}
                <span className="text-gray-600">{entry.name}:</span>
                <span className="ml-auto font-bold text-gray-900">
                    {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
};

export const GlobalStatistics: React.FC<GlobalStatisticsProps> = ({ results }) => {
  
  // --- 1. Leaderboard Data ---
  const leaderboardData = useMemo(() => {
    return results.map(r => ({
      name: r.candidateName,
      score: r.maxPossibleScore > 0 ? (r.totalScore / r.maxPossibleScore) * 100 : 0,
      rawScore: r.totalScore,
      maxScore: r.maxPossibleScore,
      date: new Date(r.date).toLocaleDateString()
    })).sort((a, b) => b.score - a.score);
  }, [results]);

  // --- 2. Score Distribution (Box Plot Proxy: Scatter Strip Plot) ---
  const distributionData = useMemo(() => {
    const points: any[] = [];
    results.forEach(r => {
        // Group scores by category name to aggregate across different templates
        const catScores: Record<string, { total: number, max: number }> = {};
        
        r.questions.forEach(q => {
             const catName = r.categories.find(c => c.id === q.categoryId)?.name || 'Unknown';
             if (!catScores[catName]) catScores[catName] = { total: 0, max: 0 };
             
             catScores[catName].max += (100 * q.multiplier);
             if (q.answer) {
                 catScores[catName].total += q.answer.score;
             }
        });

        Object.entries(catScores).forEach(([catName, stats]) => {
            if (stats.max > 0) {
                points.push({
                    category: catName,
                    score: (stats.total / stats.max) * 100,
                    candidate: r.candidateName
                });
            }
        });
    });
    return points;
  }, [results]);

  // --- 3. Skill Matrix Heatmap Data ---
  const heatmapData = useMemo(() => {
      // Get all unique categories across all interviews
      // Explicitly casting to string[] to avoid 'unknown' type issues during map iteration
      const allCategories = Array.from(new Set(results.flatMap(r => r.categories.map(c => c.name)))).sort() as string[];
      
      const rows = results.map(r => {
          const catMap: Record<string, number> = {};
          
          r.categories.forEach(c => {
               // Calculate score for this category
               let total = 0;
               let max = 0;
               r.questions.filter(q => q.categoryId === c.id).forEach(q => {
                   max += 100 * q.multiplier;
                   if (q.answer) total += q.answer.score;
               });
               catMap[c.name] = max > 0 ? (total / max) * 100 : 0;
          });

          return {
              candidate: r.candidateName,
              scores: allCategories.map(cat => ({ 
                  category: cat, 
                  value: catMap[cat] !== undefined ? catMap[cat] : null 
              }))
          };
      });

      return { categories: allCategories, rows };
  }, [results]);

  // --- 4. Histogram Data ---
  const histogramData = useMemo(() => {
      const bins = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
      const counts = Array(bins.length - 1).fill(0).map((_, i) => ({
          range: `${bins[i]}-${bins[i+1]}%`,
          count: 0,
          min: bins[i],
          max: bins[i+1]
      }));

      results.forEach(r => {
          const pct = r.maxPossibleScore > 0 ? (r.totalScore / r.maxPossibleScore) * 100 : 0;
          const binIndex = Math.min(Math.floor(pct / 10), 9);
          counts[binIndex].count++;
      });

      return counts;
  }, [results]);

  if (results.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center h-full bg-gray-50 text-gray-400">
              <BarChart3 className="w-16 h-16 mb-4 text-gray-300" />
              <h2 className="text-xl font-bold text-gray-500">No Data Available</h2>
              <p>Conduct some interviews to generate statistics.</p>
          </div>
      );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="px-8 py-5 border-b border-gray-200 bg-white flex justify-between items-center shadow-sm z-10">
        <div>
            <div className="flex items-center gap-2 text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">
                <Activity className="w-3 h-3" />
                <span>Analytics</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Global Statistics</h1>
        </div>
        <div className="text-sm text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
            {results.length} Interviews Analyzed
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8">
         <div className="max-w-6xl mx-auto space-y-8 pb-10">
            
            {/* Top Row: Leaderboard & Histogram */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 1. Candidate Leaderboard */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col h-[400px]">
                    <div className="flex items-center gap-2 mb-6">
                        <Trophy className="w-5 h-5 text-warning" />
                        <h2 className="font-bold text-gray-800">Candidate Leaderboard</h2>
                    </div>
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart 
                                data={leaderboardData} 
                                layout="vertical" 
                                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" domain={[0, 100]} hide />
                                <YAxis 
                                    dataKey="name" 
                                    type="category" 
                                    width={100} 
                                    tick={{ fontSize: 11, fontWeight: 500, fill: '#475569' }} 
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip 
                                    cursor={{fill: '#f8fafc'}}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            return (
                                                <div className="bg-white p-3 border border-gray-100 shadow-xl rounded-lg text-xs">
                                                    <div className="font-bold text-gray-900 mb-1">{data.name}</div>
                                                    <div className="text-primary font-bold">{data.score.toFixed(1)}%</div>
                                                    <div className="text-gray-400 mt-1">{data.rawScore}/{data.maxScore} pts</div>
                                                    <div className="text-gray-300 italic">{data.date}</div>
                                                </div>
                                            )
                                        }
                                        return null;
                                    }}
                                />
                                <ReferenceLine x={100} stroke="#dc2626" strokeDasharray="3 3" label={{ position: 'top', value: 'Max', fill: '#dc2626', fontSize: 10 }} />
                                <Bar dataKey="score" fill="#144346" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 4. Histogram */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col h-[400px]">
                    <div className="flex items-center gap-2 mb-6">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        <h2 className="font-bold text-gray-800">Score Distribution (Histogram)</h2>
                    </div>
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={histogramData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis 
                                    dataKey="range" 
                                    tick={{ fontSize: 10, fill: '#64748b' }} 
                                    axisLine={false} 
                                    tickLine={false} 
                                />
                                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                                <Tooltip cursor={{fill: '#f8fafc'}} content={<CustomTooltip />} />
                                <Bar dataKey="count" name="Candidates" fill="#aef1cb" radius={[4, 4, 0, 0]} stroke="#144346" strokeWidth={1} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Middle: Score Distribution by Category */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col h-[400px]">
                 <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-primary" />
                    <h2 className="font-bold text-gray-800">Score Distribution by Category</h2>
                </div>
                <p className="text-xs text-gray-500 mb-6">Visualizes the spread of scores. Each dot represents a candidate's score in that category.</p>
                <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis 
                                dataKey="category" 
                                type="category" 
                                allowDuplicatedCategory={false} 
                                tick={{ fontSize: 12, fontWeight: 600, fill: '#334155' }}
                                axisLine={{ stroke: '#e2e8f0' }}
                                tickLine={false}
                            />
                            <YAxis 
                                type="number" 
                                dataKey="score" 
                                name="Score" 
                                unit="%" 
                                domain={[0, 100]} 
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 11, fill: '#64748b' }}
                            />
                            <ZAxis type="number" range={[50, 50]} />
                            <Tooltip 
                                cursor={{ strokeDasharray: '3 3' }} 
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        return (
                                            <div className="bg-white p-2 border border-gray-200 shadow-lg rounded text-xs">
                                                <div className="font-bold">{data.candidate}</div>
                                                <div className="text-gray-500">{data.category}: {data.score.toFixed(0)}%</div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }} 
                            />
                            <Scatter name="Scores" data={distributionData} fill="#144346" fillOpacity={0.6} />
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Bottom: Skill Matrix Heatmap */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center gap-2">
                    <Grid className="w-5 h-5 text-primary" />
                    <h2 className="font-bold text-gray-800">Skill Matrix Heatmap</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Candidate</th>
                                {heatmapData.categories.map(cat => (
                                    <th key={cat} className="px-6 py-4 font-semibold text-center">{cat}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {heatmapData.rows.map((row, idx) => (
                                <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{row.candidate}</td>
                                    {row.scores.map((s, i) => {
                                        // Calculate color intensity
                                        // 0% -> light red/gray, 100% -> dark primary
                                        // Using opacity of primary color #144346
                                        const opacity = s.value !== null ? (s.value / 100) * 0.9 + 0.1 : 0;
                                        const bgColor = s.value !== null 
                                            ? `rgba(20, 67, 70, ${opacity})` 
                                            : '#f3f4f6';
                                        const textColor = s.value !== null && s.value > 50 ? 'white' : 'black';
                                        
                                        return (
                                            <td key={i} className="p-1">
                                                <div 
                                                    className="w-full h-10 flex items-center justify-center rounded text-xs font-bold transition hover:scale-105 cursor-default"
                                                    style={{ backgroundColor: bgColor, color: textColor }}
                                                    title={s.value !== null ? `${s.value.toFixed(1)}%` : 'N/A'}
                                                >
                                                    {s.value !== null ? s.value.toFixed(0) : '-'}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

         </div>
      </div>
    </div>
  );
};