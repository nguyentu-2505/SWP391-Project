import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const VerifyOtpPage: React.FC = () => {
    const [otp, setOtp] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const emailFromUrl = searchParams.get('email');
        if (emailFromUrl) {
            setEmail(emailFromUrl);
        } else {
            setError('Email not found. Please go back to the registration page.');
        }
    }, [location]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await api.post('/auth/verify-otp', { email, otpCode: otp });
            setSuccess('Account verified successfully! You can now log in.');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err: any) {
            setError(err.response?.data?.error?.message || 'Invalid or expired OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    
    // TODO: Add a "Resend OTP" button and functionality in a later task

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900">Verify Your Account</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        An OTP has been sent to <strong>{email}</strong>. Please enter it below.
                    </p>
                </div>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="otp" className="block text-sm font-medium text-gray-700">One-Time Password (OTP)</label>
                        <input
                            id="otp"
                            name="otp"
                            type="text"
                            required
                            maxLength={6}
                            className="w-full px-3 py-2 mt-1 text-center tracking-widest font-bold text-lg border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                        />
                    </div>
                    
                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                    {success && <p className="text-sm text-green-600 text-center">{success}</p>}

                    <div>
                        <button
                            type="submit"
                            disabled={loading || !otp || !!success}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {loading ? 'Verifying...' : 'Verify Account'}
                        </button>
                    </div>
                </form>
                 <p className="text-sm text-center text-gray-600">
                    Didn't receive the code?{' '}
                    <button className="font-medium text-blue-600 hover:text-blue-500 disabled:text-gray-400" disabled>
                        Resend OTP
                    </button>
                </p>
            </div>
        </div>
    );
};

export default VerifyOtpPage;
