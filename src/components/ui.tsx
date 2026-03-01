'use client';

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

// ─── Stat Card ────────────────────────────────────────────
interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    trend?: { value: number; positive: boolean };
    color: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

const colorMap = {
    blue: { bg: 'bg-info-light', iconBg: 'bg-secondary', text: 'text-secondary' },
    green: { bg: 'bg-success-light', iconBg: 'bg-success', text: 'text-success' },
    yellow: { bg: 'bg-warning-light', iconBg: 'bg-warning', text: 'text-warning' },
    red: { bg: 'bg-danger-light', iconBg: 'bg-danger', text: 'text-danger' },
    purple: { bg: 'bg-[#EDE9FE]', iconBg: 'bg-[#8B5CF6]', text: 'text-[#8B5CF6]' },
};

export function StatCard({ title, value, subtitle, icon: Icon, trend, color }: StatCardProps) {
    const c = colorMap[color];
    return (
        <div className="bg-surface-card rounded-2xl p-5 border border-border-light card-hover shadow-sm">
            <div className="flex items-start justify-between mb-3">
                <div className={`w-11 h-11 rounded-xl ${c.iconBg} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
                {trend && (
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${trend.positive ? 'bg-success-light text-success' : 'bg-danger-light text-danger'}`}>
                        {trend.positive ? '+' : ''}{trend.value}%
                    </span>
                )}
            </div>
            <p className="text-2xl font-bold text-text-primary">{value}</p>
            <p className="text-sm text-text-secondary mt-0.5">{title}</p>
            {subtitle && <p className="text-xs text-text-muted mt-1">{subtitle}</p>}
        </div>
    );
}

// ─── Data Card (Section container) ────────────────────────
interface DataCardProps {
    title: string;
    subtitle?: string;
    action?: ReactNode;
    children: ReactNode;
    className?: string;
}

export function DataCard({ title, subtitle, action, children, className = '' }: DataCardProps) {
    return (
        <div className={`bg-surface-card rounded-2xl border border-border-light shadow-sm ${className}`}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-light">
                <div>
                    <h3 className="text-base font-semibold text-text-primary">{title}</h3>
                    {subtitle && <p className="text-xs text-text-secondary mt-0.5">{subtitle}</p>}
                </div>
                {action}
            </div>
            <div className="p-6">{children}</div>
        </div>
    );
}

// ─── Status Badge ────────────────────────────────────────
interface StatusBadgeProps {
    status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
    const normalized = status.toLowerCase();
    let cls = 'status-pending';
    if (['approved', 'running', 'active', 'connected'].includes(normalized)) cls = 'status-approved';
    if (['rejected', 'stopped', 'disconnected'].includes(normalized)) cls = 'status-rejected';
    if (['maintenance', 'warning'].includes(normalized)) cls = 'status-maintenance';
    if (['pending', 'processing'].includes(normalized)) cls = 'status-pending';

    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide ${cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${cls === 'status-approved' ? 'bg-success' :
                    cls === 'status-rejected' ? 'bg-danger' :
                        cls === 'status-maintenance' ? 'bg-warning' : 'bg-info'
                }`} />
            {status}
        </span>
    );
}

// ─── Loading Skeleton ────────────────────────────────────
export function LoadingSkeleton({ rows = 3, className = '' }: { rows?: number; className?: string }) {
    return (
        <div className={`space-y-3 ${className}`}>
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="skeleton h-4 w-full" style={{ width: `${100 - i * 15}%` }} />
            ))}
        </div>
    );
}

// ─── Empty State ─────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-sky-light flex items-center justify-center mb-4">
                <Icon className="w-7 h-7 text-text-muted" />
            </div>
            <h4 className="text-base font-semibold text-text-primary mb-1">{title}</h4>
            <p className="text-sm text-text-secondary max-w-xs">{description}</p>
        </div>
    );
}

// ─── Button ──────────────────────────────────────────────
interface ButtonProps {
    children: ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    disabled?: boolean;
    type?: 'button' | 'submit';
    icon?: LucideIcon;
    className?: string;
}

export function Button({
    children, onClick, variant = 'primary', size = 'md', loading, disabled, type = 'button', icon: Icon, className = ''
}: ButtonProps) {
    const variants = {
        primary: 'bg-primary text-white hover:bg-primary-light shadow-md shadow-primary/15',
        secondary: 'bg-sky-light text-primary hover:bg-sky border border-sky',
        danger: 'bg-danger text-white hover:bg-red-600',
        ghost: 'bg-transparent text-text-secondary hover:bg-surface hover:text-text-primary border border-border-light',
    };
    const sizes = {
        sm: 'px-3 py-1.5 text-xs gap-1.5',
        md: 'px-4 py-2.5 text-sm gap-2',
        lg: 'px-6 py-3 text-base gap-2',
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
        >
            {loading ? (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
            ) : Icon ? (
                <Icon className="w-4 h-4" />
            ) : null}
            {children}
        </button>
    );
}

// ─── Input ───────────────────────────────────────────────
interface InputProps {
    label: string;
    name: string;
    type?: string;
    placeholder?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    icon?: LucideIcon;
    required?: boolean;
}

export function Input({ label, name, type = 'text', placeholder, value, onChange, error, icon: Icon, required }: InputProps) {
    return (
        <div className="space-y-1.5">
            <label htmlFor={name} className="text-sm font-medium text-text-primary">
                {label} {required && <span className="text-danger">*</span>}
            </label>
            <div className="relative">
                {Icon && (
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                )}
                <input
                    id={name}
                    name={name}
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    required={required}
                    className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none transition-all duration-200 
            ${Icon ? 'pl-10' : ''} 
            ${error ? 'border-danger focus:ring-2 focus:ring-danger/20' : 'border-border focus:border-secondary focus:ring-2 focus:ring-secondary/20'}`}
                />
            </div>
            {error && <p className="text-xs text-danger">{error}</p>}
        </div>
    );
}

// ─── Select ──────────────────────────────────────────────
interface SelectProps {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: { value: string; label: string }[];
    placeholder?: string;
    required?: boolean;
}

export function Select({ label, name, value, onChange, options, placeholder, required }: SelectProps) {
    return (
        <div className="space-y-1.5">
            <label htmlFor={name} className="text-sm font-medium text-text-primary">
                {label} {required && <span className="text-danger">*</span>}
            </label>
            <select
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-text-primary outline-none transition-all focus:border-secondary focus:ring-2 focus:ring-secondary/20"
            >
                {placeholder && <option value="">{placeholder}</option>}
                {options.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                ))}
            </select>
        </div>
    );
}

// ─── Modal ───────────────────────────────────────────────
interface ModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 animate-scale-in">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border-light">
                    <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
                    <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors text-xl leading-none">&times;</button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
}
