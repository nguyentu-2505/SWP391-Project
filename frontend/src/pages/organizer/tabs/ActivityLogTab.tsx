import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../../services/api';
import { History, Loader2, User } from 'lucide-react';

interface AuditLog {
    id: number;
    userId: number | null;
    username: string;
    action: string;
    details: string;
    createdAt: string;
}

const ActivityLogTab: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const fetchLogs = async (pageNum: number, append = false) => {
        if (pageNum === 0) setLoading(true);
        else setLoadingMore(true);
        try {
            const response = await api.get(`/audit-logs/event/${eventId}?page=${pageNum}&size=10`);
            const responseData = response.data;
            const content = responseData.data || [];
            const pagination = responseData.pagination;
            if (append) {
                setLogs(prev => [...prev, ...content]);
            } else {
                setLogs(content);
            }
            if (pagination) {
                setHasMore(pagination.page + 1 < pagination.totalPages);
            } else {
                setHasMore(false);
            }
            setPage(pageNum);
        } catch (err) {
            console.error("Failed to fetch event audit logs:", err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        if (eventId) {
            fetchLogs(0, false);
        }
    }, [eventId]);

    const handleLoadMore = () => {
        fetchLogs(page + 1, true);
    };

    const getActionBadgeColor = (action: string) => {
        const act = action.toUpperCase();
        if (act.includes('CREATE') || act.includes('CLONE') || act.includes('ADD') || act.includes('ASSIGN')) {
            return 'bg-green-100 text-green-800 border border-green-200';
        }
        if (act.includes('DELETE') || act.includes('REMOVE') || act.includes('DISQUALIFY') || act.includes('CANCEL')) {
            return 'bg-red-100 text-red-800 border border-red-200';
        }
        return 'bg-blue-100 text-blue-800 border border-blue-200';
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
                <History size={20} className="text-gray-600" />
                <h2 className="text-xl font-semibold text-gray-800">Event Activity Log</h2>
            </div>

            {logs.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                    <p className="text-sm">No activity recorded for this event yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm bg-white">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Performed By</th>
                                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {logs.map(log => (
                                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-xs font-medium">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${getActionBadgeColor(log.action)}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-700 max-w-md truncate" title={log.details}>
                                            {log.details}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                                            <div className="flex items-center gap-1.5">
                                                <User size={12} className="text-slate-400" />
                                                <span className="font-medium text-slate-700">{log.username}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-right font-mono text-slate-400">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {hasMore && (
                        <div className="flex justify-center pt-2">
                            <button
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                                className="px-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
                            >
                                {loadingMore ? <Loader2 size={12} className="animate-spin" /> : null}
                                Load More Logs
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ActivityLogTab;
