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
