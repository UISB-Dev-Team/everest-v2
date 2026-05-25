import { useAcademicPeriod } from "@/features/academic-periods/hooks/useAcademicPeriods";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Bill, CreateBillInput } from "@/features/payments/data";
import { createBill } from "@/features/payments/data/supabase";
import { useDormitory } from "@/lib/hooks/useDormitory";
import { toast } from "sonner";
import { deleteBillData, getDormerByEmail } from "../data/supabase";
import { sendEmail } from "@/lib/email";
import { Dormer, dormersData, DormerWithBills, ImportedBill } from "../data";
import { newBillTemplate } from "@/emails/dormers/newBill";
import { billPaymentInvoiceTemplate } from "@/emails/dormers/billPaymentInvoice";
import { getBillingPeriodLabel } from "@/lib/utils/billing-periods";
import { RegularCharge } from "@/features/regular-charges/data";

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

    const generateBill = async (billData: any, dormer: DormerWithBills) => {
        try {
            const mappedInput = mapBillInput(billData) as CreateBillInput;
            const result = await createBill(mappedInput);
            toast.success("Bill generated successfully");
            
            await sendEmail({
                to: dormer?.email!,
                subject: `New Bill for ${billData.billingPeriod}`,
                html: newBillTemplate(
                    dormer?.first_name!,
                    billData.billingPeriod,
                    billData.totalAmountDue
                )
            })
            return result;
        } catch (error) {
            toast.error("Failed to generate bill");
        }
    }

    const generateBillsBulk = async (billsData: any[], dormer: DormerWithBills) => {
        try {
            const bills: Bill[] = [];
            for (const billData of billsData) {
                const mappedInput = mapBillInput(billData) as CreateBillInput;
                const result = await generateBill(mappedInput, dormer);
                bills.push(result as Bill);
            }
             
            return bills
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

    const importBills = async (
        billsData: ImportedBill[],
        payable: RegularCharge
    ): Promise<{ successCount: number; errorCount: number; errors: string[], createdBills: Bill[] }> => {
        try {
            const parsingErrors = billsData
            .filter((b) => b.error)
            .map((b) => b.error!);
            if (parsingErrors.length > 0) {
                return { successCount: 0, errorCount: parsingErrors.length, errors: parsingErrors, createdBills: [] };
            }

            const errors: string[] = [];
            const createdBills: Bill[] = [];
            let successCount = 0;
            let errorCount = 0;

            for (const billData of billsData) {
                const dormer = await getDormerByEmail(billData.email);
                if (!dormer) {
                    errorCount++;
                    errors.push(`No dormer found for ${billData.email}`);
                    continue;
                }

                const mappedInput = mapBillInput({
                    ...billData, 
                    dormerId: dormer.id, 
                    status: "Unpaid", 
                    totalAmountDue: payable.amount, 
                    payableId: payable.id, 
                    billingPeriod: billData.billing_month, 
                    description: payable.description
                }) as CreateBillInput;
                const result = await createBill(mappedInput);
                if (result) {
                    successCount++;
                    createdBills.push(result as Bill);
                    await sendEmail({
                        to: dormer?.email!,
                        subject: `New Bill for ${billData.billing_month}`,
                        html: newBillTemplate(
                            dormer?.first_name!,
                            billData.billing_month,
                            payable.amount
                        )
                    })
                } else {
                    errorCount++;
                    errors.push(`Failed to create bill for ${billData.email} - ${billData.billing_month}`);
                }
            }
            return { successCount, errorCount, errors, createdBills };
        } catch (error) {
            toast.error("Failed to import bills");
            return { successCount: 0, errorCount: 0, errors: [], createdBills: [] };
        }
    };


    return {
        generateBill,
        generateBillsBulk,
        deleteBill,
        importBills
    }
}