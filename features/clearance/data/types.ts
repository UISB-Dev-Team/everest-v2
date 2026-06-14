export interface ClearanceStatus {
  dormerId: string;
  dormerFullName: string;
  academicPeriodId: string;
  isCleared: boolean;
  unpaidBillsCount: number;
  unpaidBillsTotal: number;
  unpaidFinesCount: number;
  unpaidFinesTotal: number;
  unpaidEventsCount: number;
  unpaidEventsTotal: number;
  outstandingTotal: number;
}

export interface ClearanceCertificate {
  dormerId: string;
  dormerFullName: string;
  academicPeriodId: string;
  issuedAt: string;
  reference: string;
}
