"use client";

import React, { useState } from "react";
import { Send, User, Hash } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useApp } from "@/contexts/AppContext";
import { toast } from "react-hot-toast";

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransfer: (
    toAccountNumber: string,
    amount: number,
    description: string
  ) => Promise<any>;
  currentBalance: number;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  onTransfer,
  currentBalance,
}) => {
  const { formatAmountSync } = useApp();
  const [formData, setFormData] = useState({
    accountNumber: "",
    amount: "",
    description: "",
    pin: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.accountNumber.trim()) {
      newErrors.accountNumber = "Account number is required";
    } else if (!/^\d{10}$/.test(formData.accountNumber)) {
      newErrors.accountNumber = "Account number must be 10 digits";
    }

    const amount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amount)) {
      newErrors.amount = "Valid amount is required";
    } else if (amount <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    } else if (amount > currentBalance) {
      newErrors.amount = "Insufficient balance";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.pin) {
      newErrors.pin = "PIN is required for transfers";
    } else if (!/^\d{4}$/.test(formData.pin)) {
      newErrors.pin = "PIN must be 4 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Validate PIN against stored PIN
    const isGuest = typeof window !== "undefined" && localStorage.getItem("isGuestMode") === "true";
    let storedPin = "";
    
    if (isGuest) {
      const guestAccount = localStorage.getItem("guestAccount");
      if (guestAccount) {
        const account = JSON.parse(guestAccount);
        storedPin = account.pin;
      }
    } else {
      // For authenticated users, get PIN from user data
      const userData = localStorage.getItem("fastpay-user-data");
      if (userData) {
        const user = JSON.parse(userData);
        storedPin = user.pin;
      }
    }

    if (formData.pin !== storedPin) {
      setErrors({ pin: "Invalid PIN" });
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      await onTransfer(
        formData.accountNumber,
        parseFloat(formData.amount),
        formData.description
      );

      // Reset form and close modal
      setFormData({
        accountNumber: "",
        amount: "",
        description: "",
        pin: "",
      });
      onClose();
    } catch (error: any) {
      // Error is handled in the hook
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      accountNumber: "",
      amount: "",
      description: "",
      pin: "",
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Transfer Money"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-600 dark:bg-gray-600  p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-100 dark:text-gray-100">
              Available Balance
            </span>
            <span className="font-semibold text-blue-900 dark:text-blue-100">
              {formatAmountSync(currentBalance, "USD")}
            </span>
          </div>
        </div>

        <Input
          label="Recipient Account Number"
          name="accountNumber"
          type="text"
          value={formData.accountNumber}
          onChange={handleChange}
          error={errors.accountNumber}
          icon={<User className="h-5 w-5" />}
          placeholder="Enter 10-digit account number"
          maxLength={10}
        />

        <Input
          label="Amount"
          name="amount"
          type="number"
          step="0.01"
          min="0.01"
          value={formData.amount}
          onChange={handleChange}
          error={errors.amount}
          icon={<Hash className="h-5 w-5" />}
          placeholder="0.00"
        />

        <Input
          label="Description"
          name="description"
          type="text"
          value={formData.description}
          onChange={handleChange}
          error={errors.description}
          placeholder="What's this transfer for?"
        />

        <Input
          label="Transaction PIN"
          name="pin"
          type="password"
          value={formData.pin}
          onChange={handleChange}
          error={errors.pin}
          placeholder="Enter your 4-digit PIN"
          maxLength={4}
        />

        {formData.amount && !errors.amount && (
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Transfer Summary
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Amount</span>
                <span className="font-medium">
                  {formatAmountSync(parseFloat(formData.amount) || 0, "USD")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Transfer Fee
                </span>
                <span className="font-medium text-green-600">FREE</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span>
                  {formatAmountSync(parseFloat(formData.amount) || 0, "USD")}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="flex space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button type="submit" loading={loading} className="flex-1">
            <Send className="h-4 w-4 mr-2" />
            Transfer
          </Button>
        </div>
      </form>
    </Modal>
  );
};
