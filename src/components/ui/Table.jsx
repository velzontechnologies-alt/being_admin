import React from 'react';
import { cn } from '../../utils/cn';

const Table = ({ headers, children, className }) => {
    return (
        <div className={cn('w-full overflow-x-auto rounded-xl border border-slate-100 bg-white', className)}>
            <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50">
                    <tr>
                        {headers.map((header, index) => (
                            <th
                                key={index}
                                className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100"
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {children}
                </tbody>
            </table>
        </div>
    );
};

const TableRow = ({ children, className }) => {
    return (
        <tr className={cn('hover:bg-slate-50 transition-colors', className)}>
            {children}
        </tr>
    );
};

const TableCell = ({ children, className }) => {
    return (
        <td className={cn('px-6 py-4 text-sm text-slate-600', className)}>
            {children}
        </td>
    );
};

export { Table, TableRow, TableCell };
