import { useAcademicPeriod } from "@/features/academic-periods/hooks/useAcademicPeriods";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { CreateBillInput } from "@/features/payments/data";
import { createBill } from "@/features/payments/data/supabase";
import { useDormitory } from "@/lib/hooks/useDormitory";
import { toast } from "sonner";
import { deleteBillData } from "../data/supabase";

export function useBills() {
    const { selected: selectedPeriod } = useAcademicPeriod();
    const { dormitoryId } = useDormitory()
    const { user } = useAuth();
    const mapBillInput = (billData: any) => {
        return {
            academic_period_id: selectedPeriod?.id,
            billing_month: billData.billingPeriod,
            created_at: new Date().toISOString(),
            created_by: user?.id,
            description: billData.description,
            dormer_id: billData.dormerId,
            dormitory_id: dormitoryId,
            regular_charge_id: billData.payableId,
            status: billData.status,
            total_amount_due: billData.totalAmountDue,
            updated_at: new Date().toISOString(),
            is_deleted: false,
        } as CreateBillInput;
    };

    const generateBill = async (billData: any) => {
        try {
            const mappedInput = mapBillInput(billData) as CreateBillInput;
            const result = await createBill(mappedInput);
            toast.success("Bill generated successfully");
            return result;
        } catch (error) {
            toast.error("Failed to generate bill");
        }
    }

    const generateBillsBulk = async (billsData: any[]) => {
        try {
            for (const billData of billsData) {
                const mappedInput = mapBillInput(billData) as CreateBillInput;
                await createBill(mappedInput);
            }
            toast.success("Bills generated successfully");
        } catch (error) {
            toast.error("Failed to generate bills");
        }
    }

    const deleteBill = async (billId: string) => {
        try {
            await deleteBillData(billId);
            toast.success("Bill deleted successfully");
        } catch (error) {
            toast.error("Failed to delete bill");
        }
    }


    return {
        generateBill,
        generateBillsBulk,
        deleteBill
    }
}