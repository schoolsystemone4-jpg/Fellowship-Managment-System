import React from 'react';
import { useAuth } from '../context/AuthContext';
import QRCode from 'react-qr-code';
import { User, Mail, Hash, Shield } from 'lucide-react';

const Profile = () => {
    const { user } = useAuth();

    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-3xl font-bold text-white mb-8">My Profile</h1>

            <div className="grid md:grid-cols-3 gap-8">
                {/* User Info Card */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700 shadow-xl">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                                {user.fullName.charAt(0)}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">{user.fullName}</h2>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal-500/10 text-teal-400 border border-teal-500/20 mt-2">
                                    {user.role.replace('_', ' ')}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                                <Mail className="text-slate-400" size={24} />
                                <div>
                                    <p className="text-sm text-slate-400">Email Address</p>
                                    <p className="text-white font-medium">{user.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                                <Hash className="text-slate-400" size={24} />
                                <div>
                                    <p className="text-sm text-slate-400">Fellowship Number</p>
                                    <p className="text-white font-medium font-mono">{user.fellowshipNumber}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                                <Shield className="text-slate-400" size={24} />
                                <div>
                                    <p className="text-sm text-slate-400">Account Role</p>
                                    <p className="text-white font-medium">{user.role.replace('_', ' ')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* QR Code Card */}
                <div className="md:col-span-1">
                    <div className="bg-white rounded-2xl p-8 shadow-xl flex flex-col items-center justify-center text-center h-full min-h-[400px]">
                        <div className="mb-6">
                            <QRCode
                                value={user.qrCode}
                                size={200}
                            />
                        </div>
                        <h3 className="text-slate-900 font-bold text-xl mb-2">Your Check-in QR</h3>
                        <p className="text-slate-500 text-sm">
                            Show this code at the entrance to check in to events
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
