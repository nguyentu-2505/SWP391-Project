import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code, ArrowRight, Eye, EyeOff, User, Mail, IdCard, Lock, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const RegisterPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fptStudentId, setFptStudentId] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.post('/auth/register', { username, email, password, fptStudentId });
            navigate(`/verify-otp?email=${email}`);
        } catch (err: any) {
            setError(err.response?.data?.error?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            {/* Back to Home */}
            <div className="mb-4">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="pl-0 text-on-surface-variant hover:text-on-surface hover:bg-transparent"
                    leftIcon={<ArrowLeft size={16} />}
                    onClick={() => navigate('/')}
                >
                    Back to Home
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex mb-8 border-b border-outline-variant">
                <button 
                    onClick={() => navigate('/login')}
                    className="flex-1 pb-3 text-center text-on-surface-variant border-b-2 border-transparent hover:text-on-surface transition-colors cursor-pointer"
                >
                    Log In
                </button>
                <button className="flex-1 pb-3 font-semibold text-center text-primary border-b-2 border-primary transition-colors cursor-pointer">
                    Create Account
                </button>
            </div>
            {/* Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Username Field */}
                <Input 
                    label="Username"
                    id="username"
                    name="username"
                    placeholder="Enter your username"
                    required
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    leftIcon={<User size={18} />}
                />

                {/* Email Field */}
                <Input 
                    label="Email Address"
                    id="email"
                    name="email"
                    placeholder="john@example.com"
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    leftIcon={<Mail size={18} />}
                />

                {/* FPT Student ID Field */}
                <Input 
                    label="FPT Student ID"
                    id="fptStudentId"
                    name="fptStudentId"
                    placeholder="SE170001"
                    required
                    type="text"
                    value={fptStudentId}
                    onChange={(e) => setFptStudentId(e.target.value)}
                    leftIcon={<IdCard size={18} />}
                />

                {/* Password Field */}
                <Input 
                    label="Password"
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    required
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    leftIcon={<Lock size={18} />}
                    rightIcon={showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    onRightIconClick={() => setShowPassword(!showPassword)}
                />

                {/* Error Message */}
                {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg">{error}</p>}

                {/* Main Action */}
                <Button 
                    type="submit"
                    className="w-full"
                    isLoading={loading}
                    rightIcon={<ArrowRight size={18} />}
                >
                    Create Account
                </Button>
            </form>
        </AuthLayout>
    );
};

export default RegisterPage;
