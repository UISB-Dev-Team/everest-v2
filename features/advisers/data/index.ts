import * as mock from "./mock";
import type {
  Adviser,
  CreateAdviserInput,
  UpdateAdviserInput,
} from "./types";

export interface AdvisersDataAccess {
  list(): Promise<Adviser[]>;
  listForDormitory(dormitoryId: string): Promise<Adviser[]>;
  getById(id: string): Promise<Adviser | null>;
  create(input: CreateAdviserInput): Promise<Adviser>;
  update(input: UpdateAdviserInput): Promise<Adviser>;
  remove(id: string): Promise<void>;
}

export const advisersData: AdvisersDataAccess = mock;

export type {
  Adviser,
  CreateAdviserInput,
  DormitoryRole,
  Profile,
  UpdateAdviserInput,
} from "./types";
