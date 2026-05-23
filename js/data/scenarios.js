export const scenarios = [
  {
    id: 'client-docs',
    name: 'Client Documentation Review',
    description: 'Investigate KYC completeness and client documentation gaps.',
    missionIds: [1, 2, 7, 11, 14],
    color: '#38bdf8'
  },
  {
    id: 'transaction-monitoring',
    name: 'Transaction Monitoring',
    description: 'Screen transactions for suspicious activity and structuring risk.',
    missionIds: [3, 9, 13, 15, 18],
    color: '#f59e0b'
  },
  {
    id: 'reconciliation',
    name: 'Reconciliation and Accounting',
    description: 'Find unbalanced journal entries and multi-flag accounts.',
    missionIds: [8, 16],
    color: '#a78bfa'
  },
  {
    id: 'advisor-risk',
    name: 'Advisor Risk Dashboard',
    description: 'Measure advisor workload and identify risk concentrations.',
    missionIds: [5, 6, 12, 17, 20],
    color: '#22c55e'
  },
  {
    id: 'audit-readiness',
    name: 'Audit Readiness',
    description: 'Identify missing reviews, overdue items, and compliance gaps.',
    missionIds: [4, 7, 14, 19],
    color: '#ef4444'
  },
  {
    id: 'boss-mode',
    name: 'Boss Mode',
    description: 'The most complex multi-table compliance queries.',
    missionIds: [9, 10, 16, 17, 20],
    color: '#f97316'
  }
];
