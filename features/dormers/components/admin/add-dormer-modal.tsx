"use client";

import { useState } from "react";
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
import {
  MaboloRoomNumber,
  SampaguitaRoomNumber,
} from "@/lib/constants/room-numbers";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useDormitory } from "@/features/dashboard/hooks/useDormitory";
import type { CreateDormerInput } from "@/features/dormers/data";

interface AddDormerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dormerData: CreateDormerInput) => Promise<void> | void;
}

export default function AddDormerModal({
  isOpen,
  onClose,
  onSave,
}: AddDormerModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const { user } = useAuth();
  const { dormitory } = useDormitory(user?.dormitoryId ?? null);
  const isMabolo = dormitory?.name?.toLowerCase().includes("mabolo");

  const handleSave = async () => {
    if (!firstName || !lastName || !email || !roomNumber) {
      toast.info("Please fill in all required fields.");
      return;
    }
    await onSave({
      first_name: firstName,
      last_name: lastName,
      email,
      phone: phone || null,
      room_number: roomNumber,
      dormitory_id: user?.dormitoryId ?? null,
      is_active: true,
    });
    handleClose();
  };

  const handleClose = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setRoomNumber("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        className="sm:max-w-2xl max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Add New Dormer</DialogTitle>
          <DialogDescription>
            Fill in the details to register a new dormitory resident
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
              />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <Label htmlFor="roomNumber">Room Number</Label>
            <Select value={roomNumber} onValueChange={setRoomNumber}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select room" />
              </SelectTrigger>
              <SelectContent>
                {(isMabolo ? MaboloRoomNumber : SampaguitaRoomNumber).map(
                  (room) => (
                    <SelectItem key={room} value={room}>
                      {room}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={handleSave}
          >
            Save Dormer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
