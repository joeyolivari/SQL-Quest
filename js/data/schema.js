export const schema = {
  clients: [
    ['client_id', 'INTEGER PK'], ['full_name', 'TEXT'], ['email', 'TEXT'],
    ['advisor_id', 'INTEGER FK'], ['kyc_status', 'TEXT'], ['province', 'TEXT'],
    ['risk_rating', 'TEXT'], ['onboarding_date', 'TEXT']
  ],
  advisors: [
    ['advisor_id', 'INTEGER PK'], ['advisor_name', 'TEXT'], ['branch', 'TEXT'],
    ['region', 'TEXT'], ['license_type', 'TEXT']
  ],
  accounts: [
    ['account_id', 'INTEGER PK'], ['client_id', 'INTEGER FK'], ['account_type', 'TEXT'],
    ['balance', 'REAL'], ['open_date', 'TEXT'], ['account_status', 'TEXT'],
    ['last_review_date', 'TEXT']
  ],
  transactions: [
    ['transaction_id', 'INTEGER PK'], ['account_id', 'INTEGER FK'],
    ['transaction_date', 'TEXT'], ['amount', 'REAL'], ['transaction_type', 'TEXT'],
    ['debit_credit', 'TEXT'], ['transaction_status', 'TEXT'], ['description', 'TEXT']
  ],
  journal_entries: [
    ['journal_id', 'INTEGER PK'], ['transaction_id', 'INTEGER FK'], ['entry_date', 'TEXT'],
    ['debit_amount', 'REAL'], ['credit_amount', 'REAL'], ['gl_account', 'TEXT'],
    ['created_by', 'TEXT']
  ],
  compliance_reviews: [
    ['review_id', 'INTEGER PK'], ['account_id', 'INTEGER FK'], ['review_date', 'TEXT'],
    ['issue_type', 'TEXT'], ['severity', 'TEXT'], ['review_status', 'TEXT'],
    ['assigned_to', 'TEXT']
  ],
  compliance_flags: [
    ['flag_id', 'INTEGER PK'], ['transaction_id', 'INTEGER FK'], ['flag_type', 'TEXT'],
    ['severity', 'TEXT'], ['reviewed', 'INTEGER'], ['created_date', 'TEXT']
  ],
  regulatory_updates: [
    ['update_id', 'INTEGER PK'], ['regulator', 'TEXT'], ['topic', 'TEXT'],
    ['effective_date', 'TEXT'], ['impact_level', 'TEXT'], ['summary', 'TEXT']
  ]
};
