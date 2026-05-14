import React, { useEffect, useState } from 'react';
import { PrizeService, Prize } from '../services/PrizeService';

const PrizesPage: React.FC = () => {
    const [prizes, setPrizes] = useState<Prize[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPrizes = async () => {
            try {
                // For now, fetching prizes for hackathon event 1.
                const allPrizes = await PrizeService.getPrizesByEvent(1);
                setPrizes(allPrizes);
            } catch (err) {
                setError('Failed to fetch prizes.');
            } finally {
                setLoading(false);
            }
        };

        fetchPrizes();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Prizes</h1>
            <div className="bg-white shadow-md rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Team ID</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {prizes.map((prize) => (
                            <tr key={prize.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{prize.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{prize.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{prize.description}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{prize.quantity}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{prize.teamId || 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PrizesPage;