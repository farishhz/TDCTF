import React from 'react';
import Link from 'next/link';
import { formatRelativeDate } from '@/shared/lib'
import { ImageWithFallback } from '@/shared/components'
import type { Solver } from '../types'

interface SolversListProps {
  solvers: Solver[];
}

const FirstBloodBadge: React.FC = () => (
  <span
    title="First Blood"
    className="inline-flex items-center gap-0.5 shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold text-red-200 bg-red-500/20 dark:bg-red-500/25"
  >
    <span className="leading-none">🩸</span>
    <span>First Blood</span>
  </span>
)

const SolversList: React.FC<SolversListProps> = ({ solvers }) => {
  // Find the earliest solve time to identify First Blood correctly regardless of sort order
  const firstBloodTime = React.useMemo(() => {
    if (solvers.length === 0) return null;
    return Math.min(...solvers.map(s => new Date(s.solvedAt).getTime()));
  }, [solvers]);

  return (
    <ul className="space-y-2">
      {solvers.length === 0 ? (
        <li className="text-gray-400 dark:text-gray-500">No solves yet.</li>
      ) : (
        solvers.map((solver, idx) => {
          const isFirstBlood = firstBloodTime && new Date(solver.solvedAt).getTime() === firstBloodTime;

          return (
            <li
              key={idx}
              className="flex justify-between items-center text-sm md:text-base text-gray-700 dark:text-gray-200 px-1 py-1"
            >
              <div className="flex items-center gap-2 min-w-0">
                <ImageWithFallback
                  src={solver.picture}
                  size={24}
                  className="h-6 w-6 rounded-md shadow-sm border border-gray-200/20 dark:border-gray-800/35 shrink-0"
                />
                <Link
                  href={`/user/${encodeURIComponent(solver.username)}`}
                  className={`hover:underline truncate block ${isFirstBlood ? 'font-bold text-red-400' : 'text-pink-600 dark:text-pink-300'}`}
                  style={{ maxWidth: '180px' }}
                  title={solver.username}
                >
                  {solver.username}
                </Link>
                {isFirstBlood && <FirstBloodBadge />}
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-300 shrink-0 ml-2">{formatRelativeDate(solver.solvedAt)}</span>
            </li>
          );
        })
      )}
    </ul>
  );
};

export default SolversList;
