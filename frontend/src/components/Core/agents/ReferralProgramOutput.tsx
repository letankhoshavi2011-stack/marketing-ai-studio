import React from 'react';
import {
    Gift,
    ShieldCheck,
    Target,
    Sparkles,
    Mail,
    Share2,
    ListChecks,
    FileText,
    Repeat,
} from 'lucide-react';
import { marked } from 'marked';

interface MessagingTemplate {
    channel?: string;
    copy?: string;
}

interface ReferralProgramOutputProps {
    data: any;
    compact?: boolean;
}

const Card: React.FC<{ title: string; icon?: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div
        style={{
            border: '1px solid var(--border-default)',
            borderRadius: 12,
            padding: 12,
            background: 'var(--bg-secondary)',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
        }}
    >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {icon}
            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>{title}</span>
        </div>
        {children}
    </div>
);

const Badge: React.FC<{ text: string }> = ({ text }) => (
    <span
        style={{
            padding: '4px 10px',
            borderRadius: 999,
            border: '1px solid var(--border-default)',
            background: 'var(--bg-primary)',
            fontSize: 11,
            color: 'var(--text-secondary)',
            fontWeight: 700,
        }}
    >
        {text}
    </span>
);

const KeyValue: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => {
    if (!value) return null;
    return (
        <div style={{ display: 'flex', gap: 8, fontSize: 12.5, color: 'var(--text-secondary)' }}>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{label}:</span>
            <span style={{ flex: 1 }}>{value}</span>
        </div>
    );
};

const ListBlock: React.FC<{ title: string; items?: string[] }> = ({ title, items }) => {
    if (!items || items.length === 0) return null;
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</span>
            <ul style={{ margin: 0, paddingLeft: 16, color: 'var(--text-secondary)', lineHeight: 1.5, fontSize: 12.5 }}>
                {items.map((item, idx) => (
                    <li key={idx}>{item}</li>
                ))}
            </ul>
        </div>
    );
};

const ReferralProgramOutput: React.FC<ReferralProgramOutputProps> = ({ data, compact = false }) => {
    if (!data) return null;

    const {
        title,
        program_summary,
        program_overview = {},
        incentive_structure = {},
        program_rules = {},
        viral_loop_mechanics = {},
        lifecycle_integration = {},
        fraud_prevention = {},
        success_metrics = {},
        messaging_templates = [],
        recommendations = [],
        action_items = [],
        sections = [],
        text_content,
    } = data;

    const hasViralLoop =
        viral_loop_mechanics.trigger ||
        viral_loop_mechanics.share ||
        viral_loop_mechanics.onboarding ||
        viral_loop_mechanics.conversion ||
        viral_loop_mechanics.reward_delivery;

    // Drop noisy fallback sections that contain raw JSON blobs
    const renderedSections =
        Array.isArray(sections) && sections.length > 0
            ? sections.filter(
                  (s: any) =>
                      s &&
                      typeof s.content === 'string' &&
                      s.content.trim() !== '' &&
                      !s.content.trim().startsWith('{') &&
                      !s.content.trim().startsWith('[')
              )
            : [];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 10 : 14 }}>
            {/* Header */}
            <div
                style={{
                    padding: compact ? 12 : 14,
                    borderRadius: 12,
                    border: '1px solid var(--border-default)',
                    background: 'var(--bg-secondary)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <Gift size={16} color="var(--accent-1)" />
                    <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>
                        {title || 'Referral Program'}
                    </span>
                </div>
                {program_summary && (
                    <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{program_summary}</span>
                )}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {program_overview.focus && <Badge text={`Focus: ${program_overview.focus}`} />}
                    {program_overview.target_audience && <Badge text={`Audience: ${program_overview.target_audience}`} />}
                    {program_overview.core_mechanic && <Badge text={`Mechanic: ${program_overview.core_mechanic}`} />}
                    {program_overview.psychological_driver && <Badge text={`Driver: ${program_overview.psychological_driver}`} />}
                </div>
            </div>

            {/* Core pillars */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
                <Card title="Incentives" icon={<Sparkles size={13} color="var(--accent-1)" />}>
                    <KeyValue label="Advocate Reward" value={incentive_structure.advocate_reward} />
                    <KeyValue label="Friend Reward" value={incentive_structure.friend_reward} />
                    <KeyValue label="Model" value={incentive_structure.reward_model || incentive_structure.reward_rationale} />
                    <KeyValue label="Trigger" value={incentive_structure.payout_trigger} />
                    <KeyValue label="Timing" value={incentive_structure.payout_timing} />
                    <KeyValue label="Budget / Referral" value={incentive_structure.total_budget_per_referral} />
                    <KeyValue label="Referral Limit" value={incentive_structure.referral_limit} />
                </Card>

                <Card title="Rules & Eligibility" icon={<ShieldCheck size={13} color="var(--accent-1)" />}>
                    <KeyValue label="Eligibility" value={program_rules.eligibility} />
                    <KeyValue label="Program Cap" value={program_rules.referral_cap} />
                    <KeyValue label="Cap Rationale" value={program_rules.cap_rationale} />
                </Card>

                <Card title="Success Metrics" icon={<Target size={13} color="var(--accent-1)" />}>
                    <ListBlock title="Primary KPIs" items={success_metrics.primary_kpis} />
                    <ListBlock title="Secondary KPIs" items={success_metrics.secondary_kpis} />
                </Card>
            </div>

            {/* Viral loop and lifecycle */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
                {hasViralLoop && (
                    <Card title="Viral Loop" icon={<Share2 size={13} color="var(--accent-1)" />}>
                        <KeyValue label="Trigger" value={viral_loop_mechanics.trigger} />
                        <KeyValue label="Share" value={viral_loop_mechanics.share} />
                        <KeyValue label="Onboarding" value={viral_loop_mechanics.onboarding} />
                        <KeyValue label="Conversion" value={viral_loop_mechanics.conversion} />
                        <KeyValue label="Reward Delivery" value={viral_loop_mechanics.reward_delivery} />
                    </Card>
                )}

                {(lifecycle_integration.onboarding ||
                    lifecycle_integration.transactional_emails ||
                    lifecycle_integration.win_back) && (
                    <Card title="Lifecycle" icon={<Repeat size={13} color="var(--accent-1)" />}>
                        <KeyValue label="Onboarding" value={lifecycle_integration.onboarding} />
                        <KeyValue label="Transactional Emails" value={lifecycle_integration.transactional_emails} />
                        <KeyValue label="Win-back" value={lifecycle_integration.win_back} />
                    </Card>
                )}

                {(fraud_prevention.device_fingerprinting ||
                    fraud_prevention.payment_verification ||
                    fraud_prevention.ip_monitoring ||
                    fraud_prevention.reward_vesting) && (
                    <Card title="Fraud Prevention" icon={<ShieldCheck size={13} color="var(--accent-1)" />}>
                        <KeyValue label="Device Fingerprinting" value={fraud_prevention.device_fingerprinting} />
                        <KeyValue label="Payment Verification" value={fraud_prevention.payment_verification} />
                        <KeyValue label="IP Monitoring" value={fraud_prevention.ip_monitoring} />
                        <KeyValue label="Reward Vesting" value={fraud_prevention.reward_vesting} />
                    </Card>
                )}
            </div>

            {/* Messaging */}
            {messaging_templates.length > 0 && (
                <Card title="Messaging Templates" icon={<Mail size={13} color="var(--accent-1)" />}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
                        {messaging_templates.map((m: MessagingTemplate, i: number) => (
                            <div
                                key={i}
                                style={{
                                    border: '1px solid var(--border-default)',
                                    borderRadius: 10,
                                    padding: 10,
                                    background: 'var(--bg-primary)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 6,
                                }}
                            >
                                <Badge text={m.channel || 'Channel'} />
                                {m.copy && <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.55 }}>{m.copy}</span>}
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Recommendations & next steps */}
            {(recommendations.length > 0 || action_items.length > 0) && (
                <Card title="Actions" icon={<ListChecks size={13} color="var(--accent-1)" />}>
                    <ListBlock title="Recommendations" items={recommendations} />
                    <div style={{ height: 4 }} />
                    <ListBlock title="Action Items" items={action_items} />
                </Card>
            )}

            {/* Generic sections fallback */}
            {renderedSections.length > 0 && (
                <Card title="Additional Sections" icon={<Sparkles size={13} color="var(--accent-1)" />}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }}>
                        {renderedSections.map((s: any, i: number) => (
                            <div
                                key={i}
                                style={{
                                    border: '1px solid var(--border-default)',
                                    borderRadius: 10,
                                    padding: 10,
                                    background: 'var(--bg-primary)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 6,
                                }}
                            >
                                <div style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--text-primary)' }}>
                                    {s.heading || `Section ${i + 1}`}
                                </div>
                                {s.content && (
                                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                                        {s.content}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Raw markdown fallback */}
            {text_content && (
                <Card title="Program Notes" icon={<FileText size={13} color="var(--accent-1)" />}>
                    <div className="deckcard-md" dangerouslySetInnerHTML={{ __html: marked.parse(text_content, { breaks: true }) as string }} />
                </Card>
            )}
        </div>
    );
};

export default ReferralProgramOutput;
