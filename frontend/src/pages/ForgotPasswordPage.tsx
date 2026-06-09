import React from 'react';
import { ArrowRight, Mail } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const ForgotPasswordPage: React.FC = () => {
    return (
        <AuthLayout>
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-on-surface">Email Recovery</h2>
                <p className="mt-2 text-sm text-on-surface-variant">
                    Enter your email to recover your account
                </p>
            </div>

            <form className="space-y-6">
                <Input 
                    label="Email Address"
                    id="email"
                    name="email"
                    placeholder="john@example.com"
                    required
                    type="email"
                    leftIcon={<Mail size={18} />}
                />

                <Button 
                    type="submit"
                    className="w-full"
                    rightIcon={<ArrowRight size={18} />}
                >
                    Send Recovery Email
                </Button>
            </form>

            <p className="text-sm text-center text-on-surface-variant mt-6">
                Remember your password?{' '}
                <a href="/login" className="font-semibold text-primary hover:underline cursor-pointer">
                    Log in
                </a>
            </p>
        </AuthLayout>
    );
};

export default ForgotPasswordPage;
