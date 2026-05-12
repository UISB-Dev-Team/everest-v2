
import { createClient } from "@/lib/supabase/client";
import type {
  CreateDormerInput,
  Dormer,
  DormerWithBills,
  UpdateDormerInput,
} from "./types";
import type { Bill } from "@/features/payments/data";


// export interface DormersDataAccess {
//   list(): Promise<Dormer[]>;
//   listForDormitory(dormitoryId: string): Promise<Dormer[]>;
//   listForDormitoryWithBills(dormitoryId: string): Promise<DormerWithBills[]>;
//   getById(id: string): Promise<Dormer | null>;
//   create(input: CreateDormerInput): Promise<Dormer>;
//   update(id: string, input: UpdateDormerInput): Promise<Dormer>;
//   remove(id: string): Promise<void>;
//   importMany(inputs: CreateDormerInput[]): Promise<Dormer[]>;
// }

const supabase = createClient()

export async function list(): Promise<Dormer[]> {
    const { data, error } = await supabase.from("profiles").select("*");

    if (error) {
        console.error("Error fetching dormers:", error);
        return [];
    }

    return data;
}