"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { Dormer, UpdateDormerInput } from "@/features/dormers/data";

interface EditDormerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, dormerData: UpdateDormerInput) => Promise<any> | any;
  dormerData: Dormer | null;
  roomNumbers: string[];
}

export default function EditDormerModal({
  isOpen,
  onClose,
  onUpdate,
  dormerData,
  roomNumbers,
}: EditDormerModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (dormerData) {
      setFirstName(dormerData.first_name || "");
      setLastName(dormerData.last_name || "");
      setEmail(dormerData.email || "");
      setPhone(dormerData.phone || "");
      setRoomNumber(dormerData.room_number || "");
    }
  }, [dormerData, isOpen]);

  const handleSave = async () => {
    if (!firstName || !lastName || !email || !roomNumber || !dormerData) {
      toast.info("Please fill in all required fields.");
      return;
    }
    setIsSaving(true);
    try {
      await onUpdate(dormerData.id, {
        first_name: firstName,
        last_name: lastName,
        email,
        phone: phone || null,
        room_number: roomNumber,
      });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (isSaving) return;
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        className="sm:max-w-2xl max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Edit Dormer</DialogTitle>
          <DialogDescription>
            Fill in the details to edit a dormitory resident
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">
                First Name{" "}
                <span className="text-xs text-gray-500">
                  ({firstName.length}/50)
                </span>
              </Label>
              <Input
                id="firstName"
                className="mt-1"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                maxLength={50}
                disabled={isSaving}
              />
            </div>
            <div>
              <Label htmlFor="lastName">
                Last Name{" "}
                <span className="text-xs text-gray-500">
                  ({lastName.length}/50)
                </span>
              </Label>
              <Input
                id="lastName"
                className="mt-1"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                maxLength={50}
                disabled={isSaving}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">
                Email{" "}
                <span className="text-xs text-gray-500">
                  ({email.length}/100)
                </span>
              </Label>
              <Input
                id="email"
                type="email"
                className="mt-1"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={100}
                disabled={isSaving}
              />
            </div>
            <div>
              <Label htmlFor="phone">
                Phone (Optional){" "}
                <span className="text-xs text-gray-500">
                  ({phone.length}/20)
                </span>
              </Label>
              <Input
                id="phone"
                type="tel"
                className="mt-1"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={20}
                disabled={isSaving}
              />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <Label htmlFor="roomNumber">Room Number</Label>
            <Select value={roomNumber} onValueChange={setRoomNumber} disabled={isSaving}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select room" />
              </SelectTrigger>
              <SelectContent>
                {roomNumbers.map((room) => (
                  <SelectItem key={room} value={room}>
                    {room}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
