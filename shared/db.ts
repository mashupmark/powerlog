/** Type of the entries stored within the db */
export type Log = {
  _id: string;
  startedAt: string;
  stoppedAt: string;
  location?: string;
  customerName?: string;
  projectName?: string;
  notes?: string;
};
