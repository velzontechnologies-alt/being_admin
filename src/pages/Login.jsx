import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { showAlert } from '../components/shared/ConfirmDialog';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/dashboard';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            showAlert({ title: 'Welcome Back!', text: 'Login successful', icon: 'success' });
            navigate(from, { replace: true });
        } catch (err) {
            showAlert({ title: 'Login Failed', text: err.message, icon: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl overflow-hidden border border-slate-200/50 shadow-md mb-4 bg-white">
                        <img src="/being_&_beyond_logo.jpg" alt="Being & Beyond Logo" className="w-full h-full object-cover" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 font-serif">Admin Login</h1>
                    <p className="text-slate-500 mt-2">Manage your Being <span className="text-primary-500 font-sans">&</span> Beyond website with ease</p>
                </div>

                <Card className="border-none shadow-xl shadow-slate-200/50">
                    <CardContent className="pt-8 pb-8 px-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="relative">
                                <Mail className="absolute left-3 top-[38px] h-5 w-5 text-slate-400" />
                                <Input
                                    label="Email Address"
                                    type="email"
                                    className="pl-10"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="relative">
                                <Lock className="absolute left-3 top-[38px] h-5 w-5 text-slate-400" />
                                <Input
                                    label="Password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="pl-10 pr-10"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-700 focus:outline-none"
                                    title={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>

                            <Button
                                type="submit"
                                className="w-full py-6 text-lg"
                                isLoading={loading}
                            >
                                {!loading && <LogIn className="h-5 w-5 mr-2" />}
                                Sign In
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <p className="text-center text-slate-400 text-sm mt-8">
                    © {new Date().getFullYear()} Being & Beyond. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default Login;
