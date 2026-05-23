import React from 'react';

type Status = 'DRAFT' | 'REGISTRATION_OPEN' | 'ONGOING' | 'ENDED' | 'CANCELLED' | string;

interface StatusBadgeProps {
    status: Status;
    size?: 'sm' | 'md';
}

const statusConfig: Record<string, { label: string; className: string }> = {
    DRAFT: {
        label: 'Draft',
        className: 'bg-gray-100 text-gray-600 border border-gray-200',
    },
    REGISTRATION_OPEN: {
        label: 'Registration Open',
        className: 'bg-green-100 text-green-700 border border-green-200',
    },
    ONGOING: {
        label: 'Ongoing',
        className: 'bg-blue-100 text-blue-700 border border-blue-200',
    },
    ENDED: {
        label: 'Ended',
        className: 'bg-slate-100 text-slate-500 border border-slate-200',
    },
    CANCELLED: {
        label: 'Cancelled',
        className: 'bg-red-100 text-red-600 border border-red-200',
    },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
    const config = statusConfig[status] ?? {
        label: status.replace(/_/g, ' '),
        className: 'bg-gray-100 text-gray-600 border border-gray-200',
    };

    const sizeClass = size === 'md'
        ? 'px-3 py-1 text-sm font-semibold'
        : 'px-2 py-0.5 text-xs font-medium';

    return (
        <span className={`inline-flex items-center rounded-full ${sizeClass} ${config.className}`}>
            {config.label}
        </span>
    );
};

export default StatusBadge;
