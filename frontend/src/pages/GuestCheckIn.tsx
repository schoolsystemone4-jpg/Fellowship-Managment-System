import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, Check, X } from 'lucide-react';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

interface Event {
    id: string;
    name: string;
    date: string;
    startTime: string;
    endTime: string;
}

const GuestCheckIn = () => {
    const [activeEvent, setActiveEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [checking, setChecking] = useState(false);
    const [formData, setFormData] = useState({
        guestName: '',
        guestPhone: '',
        purpose: '',
    });
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchActiveEvent();
    }, []);

    const fetchActiveEvent = async () => {
        try {
            const response = await api.get('/events/active');
            setActiveEvent(response.data);
        } catch (error: any) {
            if (error.response?.status === 404) {
                setError('No active event at the moment');
            } else {
                setError('Failed to load event');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setChecking(true);
        setError('');

        try {
            await api.post('/attendance/guest-check-in', {
                eventId: activeEvent?.id,
                ...formData,
            });

            setSuccess(true);
            setFormData({ guestName: '', guestPhone: '', purpose: '' });

            setTimeout(() => {
                setSuccess(false);
            }, 3000);
        } catch (error: any) {
            setError(error.response?.data?.error || 'Check-in failed');
        } finally {
            setChecking(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    if (!activeEvent && !loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-6">
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full border border-white/20 text-center">
                    <X size={64} className="mx-auto mb-4 text-red-400" />
                    <h2 className="text-2xl font-bold text-white mb-2">No Active Event</h2>
                    <p className="text-white/80">{error || 'There is no event currently accepting check-ins.'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 p-6">
            <div className="max-w-2xl mx-auto">
                {/* Event Info */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 mb-6 border border-white/20">
                    <h1 className="text-3xl font-bold text-white mb-2">{activeEvent?.name}</h1>
                    <p className="text-purple-200">
                        {new Date(activeEvent?.date || '').toLocaleDateString()} • {activeEvent?.startTime} - {activeEvent?.endTime}
                    </p>
                </div>

                {/* Success Message */}
                {success && (
                    <div className="bg-green-500/20 backdrop-blur-xl rounded-2xl p-6 mb-6 border border-green-500/30 flex items-center gap-4 animate-fade-in">
                        <Check size={48} className="text-green-400" />
                        <div>
                            <h3 className="text-xl font-bold text-white">Check-in Successful!</h3>
                            <p className="text-green-200">Welcome to {activeEvent?.name}</p>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && !success && (
                    <div className="bg-red-500/20 backdrop-blur-xl rounded-2xl p-6 mb-6 border border-red-500/30 flex items-center gap-4">
                        <X size={48} className="text-red-400" />
                        <div>
                            <h3 className="text-xl font-bold text-white">Check-in Failed</h3>
                            <p className="text-red-200">{error}</p>
                        </div>
                    </div>
                )}

                {/* Guest Check-in Form */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
                    <div className="flex items-center gap-3 mb-6">
                        <UserPlus size={32} className="text-purple-300" />
                        <h2 className="text-2xl font-bold text-white">Guest Check-in</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-white mb-2 font-semibold">Full Name *</label>
                            <input
                                type="text"
                                required
                                value={formData.guestName}
                                onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="John Doe"
                            />
                        </div>

                        <div>
                            <label className="block text-white mb-2 font-semibold">Phone Number (Optional)</label>
                            <input
                                type="tel"
                                value={formData.guestPhone}
                                onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="+256 700 000 000"
                            />
                        </div>

                        <div>
                            <label className="block text-white mb-2 font-semibold">Purpose of Visit (Optional)</label>
                            <textarea
                                value={formData.purpose}
                                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Guest speaker, visitor, etc."
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={checking}
                            className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold hover:from-pink-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {checking ? 'Checking In...' : 'Check In'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default GuestCheckIn;
