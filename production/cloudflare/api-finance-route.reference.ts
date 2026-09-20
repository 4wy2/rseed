/**
 * Reference: production persistence strategy used by the hosted site.
 * It stores one JSON FinanceState per authenticated user in Cloudflare D1,
 * with optimistic revision checks to prevent overwriting another tab.
 *
 * The portable ZIP defaults to lib/local-store.ts so `npm run dev` works
 * without a Cloudflare account. To restore D1, bind a database named DB and
 * replace getFinance/putFinance with D1 SELECT/INSERT/UPDATE operations against
 * the finance_workspaces table in drizzle/0000_finance_workspaces.sql.
 */
export {};
