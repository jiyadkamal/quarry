'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mountain, Mail, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ email: '', password: '' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) {
                toast.error(data.error || 'Login failed');
                return;
            }
            toast.success(`Welcome back, ${data.user.name}!`);
            router.push(`/dashboard/${data.user.role}`);
            router.refresh();
        } catch {
            toast.error('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side — Branding */}
            <div
                className="hidden lg:flex lg:flex-1 flex-col justify-between p-12 relative overflow-hidden"
            >
                {/* Background Image with Overlay */}
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
                    style={{ backgroundImage: 'url("/images/hero.png")' }}
                />
                <div
                    className="absolute inset-0 z-10"
                    style={{ background: 'linear-gradient(135deg, rgba(4, 56, 115, 0.95) 0%, rgba(10, 90, 173, 0.8) 50%, rgba(2, 37, 80, 0.9) 100%)' }}
                />

                <div className="relative z-20">
                    <div className="flex items-center gap-3 mb-16">
                        <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center">
                            <Mountain className="w-6 h-6 text-primary" />
                        </div>
                        <span className="text-white text-xl font-bold">QuarryMS</span>
                    </div>
                    <h2 className="text-4xl font-bold text-white leading-tight mb-4">
                        Streamline Your<br />
                        <span className="text-accent">Quarry Operations</span>
                    </h2>
                    <p className="text-sky/70 text-lg max-w-md leading-relaxed">
                        Manage materials, track production, coordinate transport — all from one powerful dashboard.
                    </p>
                </div>
                <div className="flex items-center gap-3 relative z-20">
                    <div className="flex -space-x-2">
                        {['#4F9CF9', '#10B981', '#F59E0B', '#8B5CF6'].map((bg, i) => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center text-white text-[10px] font-bold" style={{ background: bg }}>
                                {['A', 'O', 'T', 'M'][i]}
                            </div>
                        ))}
                    </div>
                    <p className="text-sky/50 text-sm">Trusted by quarry teams</p>
                </div>
            </div>

            {/* Right Side — Login Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-surface">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <div className="lg:hidden flex items-center justify-center gap-3 mb-6">
                            <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center">
                                <Mountain className="w-6 h-6 text-accent" />
                            </div>
                            <span className="text-primary text-xl font-bold">QuarryMS</span>
                        </div>
                        <h1 className="text-2xl font-bold text-text-primary">Welcome back</h1>
                        <p className="text-text-secondary mt-1">Sign in to your account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-text-primary">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <input
                                    type="email"
                                    required
                                    placeholder="you@example.com"
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
                                    type="password"
                                    required
                                    placeholder="Enter your password"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    className="w-full rounded-xl border border-border bg-white pl-11 pr-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary-light transition-all duration-200 shadow-lg shadow-primary/20 disabled:opacity-60"
                        >
                            {loading ? (
                                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                            ) : (
                                <>Sign In <ArrowRight className="w-4 h-4" /></>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm text-text-secondary mt-6">
                        Don&apos;t have an account?{' '}
                        <Link href="/register" className="text-secondary font-medium hover:underline">
                            Create one
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
