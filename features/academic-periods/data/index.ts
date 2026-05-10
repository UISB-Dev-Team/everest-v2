import * as mock from "./mock";
import type {
  AcademicPeriod,
  CreateAcademicPeriodInput,
  UpdateAcademicPeriodInput,
} from "./types";

export interface AcademicPeriodsDataAccess {
  list(): Promise<AcademicPeriod[]>;
  getCurrent(): Promise<AcademicPeriod | null>;
  getById(id: string): Promise<AcademicPeriod | null>;
  create(input: CreateAcademicPeriodInput): Promise<AcademicPeriod>;
  update(id: string, input: UpdateAcademicPeriodInput): Promise<AcademicPeriod>;
  setCurrent(id: string): Promise<AcademicPeriod>;
}

export const academicPeriodsData: AcademicPeriodsDataAccess = mock;

export type {
  AcademicPeriod,
  CreateAcademicPeriodInput,
  UpdateAcademicPeriodInput,
} from "./types";
