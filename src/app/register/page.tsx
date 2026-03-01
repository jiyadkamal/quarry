'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mountain, Mail, Lock, User, ArrowRight, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'operator' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) {
                toast.error(data.error || 'Registration failed');
                return;
            }
            toast.success('Account created! Please sign in.');
            if (data.operatorId) {
                toast.success(`Your Operator ID: ${data.operatorId}`, { duration: 8000 });
            }
            router.push('/login');
        } catch {
            toast.error('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const roles = [
        { value: 'operator', label: 'Operator', desc: 'Manage production & stock' },
        { value: 'transport', label: 'Transport / User', desc: 'Request materials' },
    ];

    return (
        <div className="min-h-screen flex">
            {/* Left Panel */}
            <div
                className="hidden lg:flex lg:flex-1 flex-col justify-between p-12"
                style={{ background: 'linear-gradient(135deg, #043873 0%, #0a5aad 50%, #022550 100%)' }}
            >
                <div>
                    <div className="flex items-center gap-3 mb-16">
                        <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center">
                            <Mountain className="w-6 h-6 text-primary" />
                        </div>
                        <span className="text-white text-xl font-bold">QuarryMS</span>
                    </div>
                    <h2 className="text-4xl font-bold text-white leading-tight mb-4">
                        Join the<br />
                        <span className="text-accent">Management Platform</span>
                    </h2>
                    <p className="text-sky/70 text-lg max-w-md leading-relaxed">
                        Create your account and start managing quarry operations with your team.
                    </p>
                </div>
                <div className="space-y-3">
                    {roles.map((r) => (
                        <div key={r.value} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5">
                            <Shield className="w-4 h-4 text-accent" />
                            <div>
                                <p className="text-white text-sm font-medium">{r.label}</p>
                                <p className="text-sky/50 text-xs">{r.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Panel — Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-surface">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <div className="lg:hidden flex items-center justify-center gap-3 mb-6">
                            <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center">
                                <Mountain className="w-6 h-6 text-accent" />
                            </div>
                            <span className="text-primary text-xl font-bold">QuarryMS</span>
                        </div>
                        <h1 className="text-2xl font-bold text-text-primary">Create Account</h1>
                        <p className="text-text-secondary mt-1">Fill in your details to get started</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-text-primary">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <input
                                    type="text" required placeholder="John Doe"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full rounded-xl border border-border bg-white pl-11 pr-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-text-primary">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <input
                                    type="email" required placeholder="you@example.com"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="w-full rounded-xl border border-border bg-white pl-11 pr-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-text-primary">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <input
                                    type="password" required placeholder="Minimum 6 characters"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    className="w-full rounded-xl border border-border bg-white pl-11 pr-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-text-primary">Role</label>
                            <select
                                value={form.role}
                                onChange={(e) => setForm({ ...form, role: e.target.value })}
                                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all"
                            >
                                {roles.map((r) => (
                                    <option key={r.value} value={r.value}>{r.label}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="submit" disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary-light transition-all duration-200 shadow-lg shadow-primary/20 disabled:opacity-60"
                        >
                            {loading ? (
                                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                            ) : (
                                <>Create Account <ArrowRight className="w-4 h-4" /></>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm text-text-secondary mt-6">
                        Already have an account?{' '}
                        <Link href="/login" className="text-secondary font-medium hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
