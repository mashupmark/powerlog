/** Max limit a pouch db query can handle (-2 because it does an extra lookup) */
export const POUCH_DB_MAX_LIMIT = 2 ** 32 - 2;

/** Type of the entries stored within the db */
export type Log = {
  startedAt: string;
  stoppedAt: string;
  location?: string;
  customerName?: string;
  projectName?: string;
  notes?: string;
  archived?: boolean;
};
