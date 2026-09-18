import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, Eye, EyeOff, User, Phone, UserPlus, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { Input } from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { showAlert } from '../components/shared/ConfirmDialog';

const Login = ({ initialMode = 'login' }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { login } = useAuth();

    // Mode: 'login' | 'register'
    const [isRegistering, setIsRegistering] = useState(
        initialMode === 'register' || location.pathname === '/register'
    );

    // Login Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Register Form State
    const [regForm, setRegForm] = useState({
        name: '',
        email: '',
        password: '',
        phone_number: ''
    });
    const [regLoading, setRegLoading] = useState(false);
    const [showRegPassword, setShowRegPassword] = useState(false);

    // Keep mode in sync if location pathname changes
    useEffect(() => {
        if (location.pathname === '/register') {
            setIsRegistering(true);
        } else if (location.pathname === '/login') {
            setIsRegistering(false);
        }
    }, [location.pathname]);

    const from = location.state?.from?.pathname || '/dashboard';

    // Handle Login Submit
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setLoginLoading(true);
        try {
            await login(email, password);
            showAlert({ title: 'Welcome Back!', text: 'Login successful', icon: 'success' });
            navigate(from, { replace: true });
        } catch (err) {
            showAlert({
                title: 'Login Failed',
                text: err.response?.data?.message || err.message || 'Invalid email or password',
                icon: 'error'
            });
        } finally {
            setLoginLoading(false);
        }
    };

    // Handle Register Field Change
    const handleRegChange = (e) => {
        const { name, value } = e.target;
        setRegForm(prev => ({ ...prev, [name]: value }));
    };

    // Handle Register Submit (POST /admin/create)
    const handleRegisterSubmit = async (e) => {
        e.preventDefault();

        // 1. Validation: Required fields
        if (!regForm.name.trim()) {
            showAlert({ title: 'Missing Field', text: 'Please enter your full name.', icon: 'warning' });
            return;
        }

        // 2. Validation: Email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regForm.email.trim() || !emailRegex.test(regForm.email.trim())) {
            showAlert({ title: 'Invalid Email', text: 'Please enter a valid email address.', icon: 'warning' });
            return;
        }

        // 3. Validation: Password length
        if (!regForm.password || regForm.password.length < 6) {
            showAlert({ title: 'Weak Password', text: 'Password must be at least 6 characters long.', icon: 'warning' });
            return;
        }

        // 4. Validation: Phone number
        if (!regForm.phone_number.trim()) {
            showAlert({ title: 'Missing Field', text: 'Please enter your phone number.', icon: 'warning' });
            return;
        }

        setRegLoading(true);
        try {
            await authService.createAdmin({
                name: regForm.name.trim(),
                email: regForm.email.trim(),
                password: regForm.password,
                phone_number: regForm.phone_number.trim()
            });

            showAlert({
                title: 'Account Created!',
                text: 'Admin account created successfully. You can now sign in.',
                icon: 'success'
            });

            // Set login email to the newly registered email and clear password
            setEmail(regForm.email.trim());
            setPassword('');

            // Reset register form
            setRegForm({
                name: '',
                email: '',
                password: '',
                phone_number: ''
            });
            setShowRegPassword(false);

            // Switch to Login view
            setIsRegistering(false);
            if (location.pathname === '/register') {
                navigate('/login', { replace: true });
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || 'Failed to create admin account. Please try again.';
            showAlert({
                title: 'Registration Failed',
                text: errorMsg,
                icon: 'error'
            });
        } finally {
            setRegLoading(false);
        }
    };

    const switchToRegister = () => {
        setIsRegistering(true);
        if (location.pathname !== '/register') {
            window.history.pushState(null, '', '/register');
        }
    };

    const switchToLogin = () => {
        setIsRegistering(false);
        if (location.pathname !== '/login') {
            window.history.pushState(null, '', '/login');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header / Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl overflow-hidden border border-slate-200/50 shadow-md mb-4 bg-white">
                        <img src="/being_&_beyond_logo.jpg" alt="Being & Beyond Logo" className="w-full h-full object-cover" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 font-serif">
                        {isRegistering ? 'Create Admin Account' : 'Admin Login'}
                    </h1>
                    <p className="text-slate-500 mt-2">
                        {isRegistering
                            ? 'Register a new administrator to manage Being & Beyond'
                            : (
                                <>
                                    Manage your Being <span className="text-primary-500 font-sans">&</span> Beyond website with ease
                                </>
                            )
                        }
                    </p>
                </div>

                <Card className="border-none shadow-xl shadow-slate-200/50">
                    <CardContent className="pt-8 pb-8 px-8">
                        {!isRegistering ? (
                            /* =================== ADMIN LOGIN FLOW =================== */
                            <form onSubmit={handleLoginSubmit} className="space-y-6">
                                <div className="relative">
                                    <Mail className="absolute left-3 top-[38px] h-5 w-5 text-slate-400" />
                                    <Input
                                        label="Email Address"
                                        type="email"
                                        placeholder="admin@beingandbeyond.com"
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

                                {/* Sign In Button */}
                                <Button
                                    type="submit"
                                    className="w-full py-6 text-lg"
                                    isLoading={loginLoading}
                                >
                                    {!loginLoading && <LogIn className="h-5 w-5 mr-2" />}
                                    Sign In
                                </Button>

                                {/* Create Account Option */}
                                <div className="pt-2">
                                    <div className="relative my-3">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-slate-200" />
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-white px-2 text-slate-400">or</span>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={switchToRegister}
                                        className="w-full py-5 text-base border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm"
                                    >
                                        <UserPlus className="h-5 w-5 mr-2 text-[#B3925B]" />
                                        Create Account
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            /* =================== CREATE ACCOUNT FLOW =================== */
                            <form onSubmit={handleRegisterSubmit} className="space-y-4">
                                <div className="relative">
                                    <User className="absolute left-3 top-[38px] h-5 w-5 text-slate-400" />
                                    <Input
                                        label="Full Name"
                                        type="text"
                                        name="name"
                                        placeholder="Jane Doe"
                                        className="pl-10"
                                        value={regForm.name}
                                        onChange={handleRegChange}
                                        required
                                    />
                                </div>

                                <div className="relative">
                                    <Mail className="absolute left-3 top-[38px] h-5 w-5 text-slate-400" />
                                    <Input
                                        label="Email Address"
                                        type="email"
                                        name="email"
                                        placeholder="jane@beingandbeyond.com"
                                        className="pl-10"
                                        value={regForm.email}
                                        onChange={handleRegChange}
                                        required
                                    />
                                </div>

                                <div className="relative">
                                    <Lock className="absolute left-3 top-[38px] h-5 w-5 text-slate-400" />
                                    <Input
                                        label="Password"
                                        type={showRegPassword ? "text" : "password"}
                                        name="password"
                                        placeholder="••••••••"
                                        className="pl-10 pr-10"
                                        value={regForm.password}
                                        onChange={handleRegChange}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowRegPassword(!showRegPassword)}
                                        className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-700 focus:outline-none"
                                        title={showRegPassword ? "Hide password" : "Show password"}
                                    >
                                        {showRegPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>

                                <div className="relative">
                                    <Phone className="absolute left-3 top-[38px] h-5 w-5 text-slate-400" />
                                    <Input
                                        label="Phone Number"
                                        type="text"
                                        name="phone_number"
                                        placeholder="+1 234 567 8900"
                                        className="pl-10"
                                        value={regForm.phone_number}
                                        onChange={handleRegChange}
                                        required
                                    />
                                </div>

                                {/* Create Account Submit Button */}
                                <div className="pt-2">
                                    <Button
                                        type="submit"
                                        className="w-full py-6 text-lg"
                                        isLoading={regLoading}
                                    >
                                        {!regLoading && <UserPlus className="h-5 w-5 mr-2" />}
                                        Create Account
                                    </Button>
                                </div>

                                {/* Back to Sign In option */}
                                <div className="pt-1 text-center">
                                    <button
                                        type="button"
                                        onClick={switchToLogin}
                                        className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-primary-600 transition-colors py-2"
                                    >
                                        <ArrowLeft className="h-4 w-4 mr-1.5" />
                                        Back to Sign In
                                    </button>
                                </div>
                            </form>
                        )}
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

