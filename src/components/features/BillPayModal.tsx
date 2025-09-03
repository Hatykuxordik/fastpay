import React, { useState } from "react";
import { CreditCard, Zap, Wifi, Droplets, Home } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useApp } from "@/contexts/AppContext";
import { Transaction } from "@/components/ui/TransactionCard";

interface BillPayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPayment: (transaction: Omit<Transaction, "id">) => Promise<any>;
  currentBalance: number;
}

const billCategories = [
  { id: "electricity", name: "Electricity", icon: Zap, color: "bg-yellow-500" },
  { id: "internet", name: "Internet", icon: Wifi, color: "bg-blue-500" },
  { id: "water", name: "Water", icon: Droplets, color: "bg-cyan-500" },
  { id: "rent", name: "Rent", icon: Home, color: "bg-green-500" },
];

export const BillPayModal: React.FC<BillPayModalProps> = ({
  isOpen,
  onClose,
  onPayment,
  currentBalance,
}) => {
  const { formatAmountSync } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [formData, setFormData] = useState({
    billNumber: "",
    amount: "",
    customerName: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!selectedCategory) {
      newErrors.category = "Please select a bill category";
    }

    if (!formData.billNumber.trim()) {
      newErrors.billNumber = "Bill number is required";
    }

    const amount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amount)) {
      newErrors.amount = "Valid amount is required";
    } else if (amount <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    } else if (amount > currentBalance) {
      newErrors.amount = "Insufficient balance";
    }

    if (!formData.customerName.trim()) {
      newErrors.customerName = "Customer name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const selectedCategoryData = billCategories.find(
        (cat) => cat.id === selectedCategory
      );

      await onPayment({
        type: "expense",
        category: "bill_pay",
        amount: parseFloat(formData.amount),
        description: `${selectedCategoryData?.name} Bill Payment - ${formData.billNumber}`,
        recipient: formData.customerName,
        date: new Date().toISOString(),
        status: "completed",
      });

      // Calculate cashback (1% for bill payments)
      const cashback = parseFloat(formData.amount) * 0.01;
      if (cashback > 0) {
        setTimeout(async () => {
          await onPayment({
            type: "income",
            category: "other",
            amount: cashback,
            description: `Cashback from ${selectedCategoryData?.name} bill payment`,
            date: new Date().toISOString(),
            status: "completed",
          });
        }, 1000);
      }

      // Reset form and close modal
      setFormData({ billNumber: "", amount: "", customerName: "" });
      setSelectedCategory("");
      onClose();
    } catch (error: any) {
      // Error is handled in the hook
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ billNumber: "", amount: "", customerName: "" });
    setSelectedCategory("");
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Pay Bills" size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-600 dark:bg-gray-600  p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-100 dark:text-gray-100">
              Available Balance
            </span>
            <span className="font-semibold text-blue-900 dark:text-blue-100">
              {formatAmountSync(currentBalance)}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-500 mb-3">
            Select Bill Category
          </label>
          <div className="grid grid-cols-2 gap-3">
            {billCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelectedCategory(category.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedCategory === category.id
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                }`}
              >
                <div
                  className={`${category.color} p-2 rounded-full w-fit mx-auto mb-2`}
                >
                  <category.icon className="h-5 w-5 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {category.name}
                </p>
              </button>
            ))}
          </div>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category}</p>
          )}
        </div>

        <Input
          label="Bill Number / Account Number"
          name="billNumber"
          type="text"
          value={formData.billNumber}
          onChange={handleChange}
          error={errors.billNumber}
          placeholder="Enter your bill number"
        />

        <Input
          label="Customer Name"
          name="customerName"
          type="text"
          value={formData.customerName}
          onChange={handleChange}
          error={errors.customerName}
          placeholder="Enter customer name"
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
          placeholder="0.00"
        />

        {formData.amount && !errors.amount && (
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
              Payment Summary
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-green-700 dark:text-green-300">
                  Bill Amount
                </span>
                <span className="font-medium">
                  {formatAmountSync(parseFloat(formData.amount) || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700 dark:text-green-300">
                  Processing Fee
                </span>
                <span className="font-medium text-green-600">FREE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700 dark:text-green-300">
                  Cashback (1%)
                </span>
                <span className="font-medium text-green-600">
                  +{formatAmountSync((parseFloat(formData.amount) || 0) * 0.01)}
                </span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total Charge</span>
                <span>
                  {formatAmountSync(parseFloat(formData.amount) || 0)}
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
            <CreditCard className="h-4 w-4 mr-2" />
            Pay Bill
          </Button>
        </div>
      </form>
    </Modal>
  );
};
