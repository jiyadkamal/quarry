'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    Package,
    Factory,
    Truck,
    ClipboardList,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Mountain,
    Wrench,
    BarChart3,
    Link2,
    History,
    ShieldCheck,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface SidebarProps {
    role: 'admin' | 'operator' | 'transport';
    userName: string;
    userEmail: string;
    operatorId?: string;
}

const roleConfig = {
    admin: {
        label: 'Administrator',
        links: [
            { href: '/dashboard/admin', label: 'Dashboard', icon: LayoutDashboard },
            { href: '/dashboard/admin/users', label: 'User Management', icon: Users },
            { href: '/dashboard/admin/stock', label: 'Stock Overview', icon: Package },
            { href: '/dashboard/admin/requests', label: 'Dispatch Requests', icon: ClipboardList },
            { href: '/dashboard/admin/analytics', label: 'Analytics', icon: BarChart3 },
        ],
    },
    operator: {
        label: 'Operator',
        links: [
            { href: '/dashboard/operator', label: 'Dashboard', icon: LayoutDashboard },
            { href: '/dashboard/operator/production', label: 'Production', icon: Factory },
            { href: '/dashboard/operator/stock', label: 'Stock Management', icon: Package },
            { href: '/dashboard/operator/machines', label: 'Machine Status', icon: Wrench },
            { href: '/dashboard/operator/requests', label: 'Requests', icon: ClipboardList },
            { href: '/dashboard/operator/connections', label: 'Connected Users', icon: Link2 },
        ],
    },
    transport: {
        label: 'Transport / User',
        links: [
            { href: '/dashboard/transport', label: 'Dashboard', icon: LayoutDashboard },
            { href: '/dashboard/transport/connect', label: 'Connect Operator', icon: Link2 },
            { href: '/dashboard/transport/request', label: 'New Request', icon: Truck },
            { href: '/dashboard/transport/history', label: 'Dispatch History', icon: History },
        ],
    },
};

export default function Sidebar({ role, userName, userEmail, operatorId }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [collapsed, setCollapsed] = useState(false);

    const config = roleConfig[role];

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            toast.success('Logged out successfully');
            router.push('/login');
        } catch {
            toast.error('Logout failed');
        }
    };

    return (
        <aside
            className={`fixed left-0 top-0 h-screen z-50 flex flex-col transition-all duration-300 ease-in-out ${collapsed ? 'w-[72px]' : 'w-[260px]'
                }`}
            style={{ background: 'linear-gradient(180deg, #043873 0%, #022550 100%)' }}
        >
            {/* Logo */}
            <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#FFE492' }}>
                    <Mountain className="w-5 h-5" style={{ color: '#043873' }} />
                </div>
                {!collapsed && (
                    <div className="animate-fade-in">
                        <h1 className="text-white font-bold text-lg leading-tight">QuarryMS</h1>
                        <p className="text-[11px]" style={{ color: 'rgba(196,222,253,0.6)' }}>Material Management</p>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-3 overflow-y-auto">
                <div className={`mb-3 px-2 ${collapsed ? 'hidden' : ''}`}>
                    <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(196,222,253,0.4)' }}>
                        Navigation
                    </span>
                </div>
                <ul className="space-y-1">
                    {config.links.map((link) => {
                        const isActive = pathname === link.href;
                        const Icon = link.icon;
                        return (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative"
                                    style={{
                                        background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                                        color: isActive ? '#FFFFFF' : 'rgba(196,222,253,0.7)',
                                    }}
                                    title={collapsed ? link.label : undefined}
                                    onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#FFFFFF'; } }}
                                    onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(196,222,253,0.7)'; } }}
                                >
                                    {isActive && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full" style={{ background: '#FFE492' }} />
                                    )}
                                    <Icon className="w-[18px] h-[18px] shrink-0" style={{ color: isActive ? '#FFE492' : 'inherit' }} />
                                    {!collapsed && (
                                        <span className="text-[13px] font-medium truncate">{link.label}</span>
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* User Info */}
            <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                {operatorId && !collapsed && (
                    <div className="mb-2 px-3 py-3 rounded-xl flex items-center gap-2 hover:bg-accent/25 transition-colors cursor-default" style={{ background: 'rgba(255,228,146,0.2)', border: '1px solid rgba(255,228,146,0.3)' }}>
                        <ShieldCheck className="w-6 h-6" style={{ color: '#FFE492' }} />
                        <span className="text-[18px] font-mono font-black tracking-widest text-accent uppercase">{operatorId}</span>
                    </div>
                )}
                <div className={`flex items-center gap-3 px-2 py-2 ${collapsed ? 'justify-center' : ''}`}>
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 text-white text-xs font-bold">
                        {userName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    {!collapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-white text-[13px] font-medium truncate">{userName}</p>
                            <p className="text-[11px] truncate" style={{ color: 'rgba(196,222,253,0.5)' }}>{config.label}</p>
                        </div>
                    )}
                </div>
                <button
                    onClick={handleLogout}
                    className={`w-full mt-2 flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${collapsed ? 'justify-center' : ''
                        }`}
                    style={{ color: 'rgba(196,222,253,0.6)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(196,222,253,0.6)'; e.currentTarget.style.background = 'transparent'; }}
                >
                    <LogOut className="w-4 h-4" />
                    {!collapsed && <span className="text-[13px]">Logout</span>}
                </button>
            </div>

            {/* Collapse Toggle */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-20 w-6 h-6 bg-primary-light border-2 rounded-full flex items-center justify-center text-white hover:bg-secondary transition-colors shadow-lg"
                style={{ borderColor: 'rgba(196,222,253,0.3)' }}
            >
                {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
            </button>
        </aside>
    );
}
