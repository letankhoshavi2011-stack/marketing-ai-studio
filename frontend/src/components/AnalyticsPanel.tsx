import React, { useEffect, useState, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Activity, Coins, Zap, Calendar, Bot, LayoutGrid, ChevronDown, BarChart3, TrendingUp, RefreshCw } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { analyticsApi } from '../services/api';
import { AppLogo } from './Icons';
import PanelHeader from './PanelHeader';

// Custom Dropdown Component for a more premium feel
function CustomDropdown({
    label,
    icon: Icon,
    value,
    options,
    onChange
}: {
    label: string,
    icon: any,
    value: any,
    options: { label: string, value: any }[],
    onChange: (val: any) => void
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={dropdownRef} style={{ position: 'relative' }}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-default)', padding: '10px 16px', borderRadius: 'var(--radius-md)',
                    cursor: 'pointer', transition: 'all 0.2s', minWidth: 160, userSelect: 'none'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-1)'; e.currentTarget.style.backgroundColor = 'rgba(124, 92, 255, 0.05)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'; }}
            >
                <Icon size={16} color="var(--text-muted)" />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {selectedOption?.label || label}
                </span>
                <ChevronDown size={14} color="var(--text-muted)" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
            </div>

            {isOpen && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 100,
                    background: 'var(--bg-card)', border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', padding: '6px',
                    minWidth: '100%', animation: 'fadeInScale 0.2s ease-out'
                }}>
                    {options.map((opt) => (
                        <div
                            key={opt.value}
                            onClick={() => { onChange(opt.value); setIsOpen(false); }}
                            style={{
                                padding: '8px 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                                fontSize: 13, fontWeight: 500, color: opt.value === value ? 'var(--accent-1)' : 'var(--text-secondary)',
                                background: opt.value === value ? 'rgba(124, 92, 255, 0.08)' : 'transparent',
                                transition: '0.15s'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = opt.value === value ? 'rgba(124, 92, 255, 0.12)' : 'rgba(255, 255, 255, 0.05)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = opt.value === value ? 'rgba(124, 92, 255, 0.08)' : 'transparent'; }}
                        >
                            {opt.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function AnalyticsPanel() {
    const { activeWorkspace, workspaces } = useAppStore();

    const [selectedWsId, setSelectedWsId] = useState<string>(activeWorkspace?.uuid || 'all');
    const [summary, setSummary] = useState({ total_cost: 0, total_tokens: 0, total_requests: 0 });
    const [timeseries, setTimeseries] = useState<Array<{ date: string; cost: number; tokens: number; avg_latency: number }>>([]);
    const [agents, setAgents] = useState<Array<{ name: string; cost: number; tokens: number; calls: number }>>([]);
    const [days, setDays] = useState(30);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);
        try {
            const wsId = selectedWsId === 'all' ? undefined : selectedWsId;
            const [sumRes, timeRes, agRes] = await Promise.all([
                analyticsApi.summary(wsId, undefined, days),
                analyticsApi.timeseries(wsId, undefined, days),
                analyticsApi.agents(wsId, undefined, days)
            ]);

            setSummary(sumRes);
            setTimeseries((timeRes || []).map((t: any) => ({
                date: t.date || '',
                cost: t.cost || 0,
                tokens: t.tokens || 0,
                avg_latency: t.avg_latency || 0
            })));
            setAgents(agRes);
        } catch (err) {
            console.error('Failed to load analytics', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [selectedWsId, days]);

    const fmtTokens = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
        return num.toString();
    };

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-primary)', overflowY: 'auto' }} className="custom-scrollbar">
            {/* ══ HEADER ══ */}
            <div className="mobile-padding" style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-default)', background: 'var(--bg-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} className="mobile-stack">
                    <PanelHeader
                        title="Analytics"
                        Icon={BarChart3}
                        subtitle={(
                            <>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><TrendingUp size={13} color="var(--accent-1)" /> performance tracking</span>
                                <span style={{ opacity: 0.3 }}>•</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Coins size={13} color="var(--accent-2)" /> resource consumption</span>
                            </>
                        )}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }} className="mobile-stack">
                        <CustomDropdown
                            label="All Workspaces"
                            icon={LayoutGrid}
                            value={selectedWsId}
                            options={[{ label: 'All Workspaces', value: 'all' }, ...workspaces.map(ws => ({ label: ws.name, value: ws.uuid }))]}
                            onChange={setSelectedWsId}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-primary)', padding: '10px 16px', borderRadius: 10, border: '1px solid var(--border-default)' }}>
                            <Calendar size={14} color="var(--text-muted)" />
                            <select
                                value={days}
                                onChange={(e) => setDays(Number(e.target.value))}
                                style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: 13, outline: 'none', cursor: 'pointer' }}
                            >
                                <option value={7}>Last 7 Days</option>
                                <option value={30}>Last 30 Days</option>
                                <option value={90}>Last 90 Days</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
                    <RefreshCw size={32} color="var(--primary)" className="animate-spin" />
                </div>
            ) : (
                <div className="mobile-padding" style={{ flex: 1, paddingBottom: 60 }}>
                    {/* Summary Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 24 }}>
                        <SummaryCard icon={Coins} label="Total Spend" value={`$${summary.total_cost.toFixed(4)}`} color="var(--accent-1)" />
                        <SummaryCard icon={Zap} label="Tokens processed" value={fmtTokens(summary.total_tokens)} color="var(--accent-2)" />
                        <SummaryCard icon={Activity} label="AI Interactions" value={summary.total_requests.toString()} color="var(--accent-3)" />
                        <SummaryCard icon={Activity} label="Avg. Latency" value={timeseries.length > 0 ? `${(timeseries.reduce((acc, curr) => acc + curr.avg_latency, 0) / timeseries.length / 1000).toFixed(2)}s` : '0.00s'} color="var(--text-accent)" />
                    </div>

                    {/* Charts Area */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <ChartContainer title="Tokens Over Time" icon={Zap}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={timeseries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--accent-1)" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="var(--accent-1)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="date" stroke="var(--border-default)" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickMargin={12} axisLine={false} tickLine={false} />
                                    <YAxis stroke="var(--border-default)" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={fmtTokens} tickMargin={12} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        cursor={{ stroke: 'var(--border-hover)', strokeWidth: 1 }}
                                        contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-hover)', borderRadius: 12, boxShadow: 'var(--shadow-lg)', padding: '12px' }}
                                    />
                                    <Area type="monotone" dataKey="tokens" stroke="var(--accent-1)" strokeWidth={3} fillOpacity={1} fill="url(#colorTokens)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </ChartContainer>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
                            <ChartContainer title="System Latency" icon={Activity}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={timeseries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--accent-3)" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="var(--accent-3)" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="date" stroke="var(--border-default)" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickMargin={12} axisLine={false} tickLine={false} />
                                        <YAxis stroke="var(--border-default)" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={(val) => `${(val / 1000).toFixed(1)}s`} tickMargin={12} axisLine={false} tickLine={false} />
                                        <Tooltip
                                            cursor={{ stroke: 'var(--border-hover)', strokeWidth: 1 }}
                                            contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-hover)', borderRadius: 12, boxShadow: 'var(--shadow-lg)' }}
                                        />
                                        <Area type="monotone" dataKey="avg_latency" stroke="var(--accent-3)" strokeWidth={3} fillOpacity={1} fill="url(#colorLatency)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </ChartContainer>

                            <ChartContainer title="Top Agents" icon={Bot}>
                                {agents.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={agents.slice(0, 5)} layout="vertical" margin={{ top: 0, right: 20, left: 40, bottom: 0 }}>
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontWeight: 600 }} width={120} />
                                            <Tooltip
                                                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                                contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-hover)', borderRadius: 12, boxShadow: 'var(--shadow-lg)' }}
                                            />
                                            <Bar dataKey="cost" radius={[0, 4, 4, 0]} barSize={20}>
                                                {agents.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--accent-2)' : 'var(--accent-1)'} opacity={index === 0 ? 1 : 0.7} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <EmptyState message="No agent data yet." />
                                )}
                            </ChartContainer>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function SummaryCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: string, color: string }) {
    return (
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', padding: 24, borderRadius: 'var(--radius-lg)', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 12, right: 12, opacity: 0.1, color }}>
                <Icon size={40} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}15`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={16} color={color} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</span>
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{value}</h2>
        </div>
    );
}

function ChartContainer({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) {
    return (
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', padding: 24, borderRadius: 'var(--radius-lg)', height: 360, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon size={16} color="var(--accent-1)" />
                {title}
            </h3>
            <div style={{ flex: 1, minHeight: 0 }}>
                {children}
            </div>
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
            <AppLogo size={32} style={{ opacity: 0.2, marginBottom: 12 }} />
            <p style={{ fontSize: 12 }}>{message}</p>
        </div>
    );
}
