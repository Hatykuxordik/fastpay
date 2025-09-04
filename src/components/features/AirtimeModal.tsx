import React, { useState } from "react";
import { Smartphone, Phone } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useApp } from "@/contexts/AppContext";
import {
  NIGERIAN_MOBILE_NETWORKS,
  AIRTIME_DENOMINATIONS,
} from "@/lib/currency";
import { Transaction } from "@/components/ui/TransactionCard";

interface AirtimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase: (transaction: Omit<Transaction, "id">) => Promise<any>;
  currentBalance: number;
}

const networks = [
  ...NIGERIAN_MOBILE_NETWORKS.map((network) => ({
    id: network.id,
    name: network.name,
    color: network.color,
  })),
  { id: "verizon", name: "Verizon", color: "#FF0000" },
  { id: "att", name: "AT&T", color: "#0066CC" },
  { id: "tmobile", name: "T-Mobile", color: "#E20074" },
  { id: "sprint", name: "Sprint", color: "#FFCC00" },
];

const quickAmounts = AIRTIME_DENOMINATIONS.slice(0, 4); // Use first 4 Nigerian denominations

export const AirtimeModal: React.FC<AirtimeModalProps> = ({
  isOpen,
  onClose,
  onPurchase,
  currentBalance,
}) => {
  const { formatAmountSync } = useApp();
  const [selectedNetwork, setSelectedNetwork] = useState<string>("");
  const [formData, setFormData] = useState({
    phoneNumber: "",
    amount: "",
    recipientName: "",
    pin: "",
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

  const handleQuickAmount = (amount: number) => {
    setFormData((prev) => ({ ...prev, amount: amount.toString() }));
    if (errors.amount) {
      setErrors((prev) => ({ ...prev, amount: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!selectedNetwork) {
      newErrors.network = "Please select a network";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (
      !/^\+?[\d\s-()]{10,}$/.test(formData.phoneNumber.replace(/\s/g, ""))
    ) {
      newErrors.phoneNumber = "Please enter a valid phone number";
    }

    const amount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amount)) {
      newErrors.amount = "Valid amount is required";
    } else if (amount < 5) {
      newErrors.amount = "Minimum amount is $5";
    } else if (amount > 500) {
      newErrors.amount = "Maximum amount is $500";
    } else if (amount > currentBalance) {
      newErrors.amount = "Insufficient balance";
    }

    if (!formData.pin) {
      newErrors.pin = "PIN is required for airtime purchase";
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
      return;
    }

    setLoading(true);
    try {
      const selectedNetworkData = networks.find(
        (net) => net.id === selectedNetwork
      );

      await onPurchase({
        type: "expense",
        category: "airtime",
        amount: parseFloat(formData.amount),
        description: `${selectedNetworkData?.name} Airtime - ${formData.phoneNumber}`,
        recipient: formData.recipientName || formData.phoneNumber,
        date: new Date().toISOString(),
        status: "completed",
      });

      // Calculate cashback (2% for airtime purchases)
      const cashback = parseFloat(formData.amount) * 0.02;
      if (cashback > 0) {
        setTimeout(async () => {
          await onPurchase({
            type: "income",
            category: "other",
            amount: cashback,
            description: `Cashback from ${selectedNetworkData?.name} airtime purchase`,
            date: new Date().toISOString(),
            status: "completed",
          });
        }, 1000);
      }

      // Reset form and close modal
      setFormData({ phoneNumber: "", amount: "", recipientName: "" });
      setSelectedNetwork("");
      onClose();
    } catch (error: any) {
      // Error is handled in the hook
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ phoneNumber: "", amount: "", recipientName: "" });
    setSelectedNetwork("");
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Buy Airtime" size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-theme-muted p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-theme-foreground">
              Available Balance
            </span>
            <span className="font-semibold text-blue-600">
              {formatAmountSync(currentBalance)}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-theme-foreground mb-3">
            Select Network
          </label>
          <div className="grid grid-cols-2 gap-3">
            {networks.map((network) => (
              <button
                key={network.id}
                type="button"
                onClick={() => setSelectedNetwork(network.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedNetwork === network.id
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-theme hover:border-theme-muted"
                }`}
              >
                <div
                  className={`${network.color} p-2 rounded-full w-fit mx-auto mb-2`}
                >
                  <Smartphone className="h-5 w-5 text-white" />
                </div>
                <p className="text-sm font-medium text-theme-card-foreground">
                  {network.name}
                </p>
              </button>
            ))}
          </div>
          {errors.network && (
            <p className="mt-1 text-sm text-red-600">{errors.network}</p>
          )}
        </div>

        <Input
          label="Phone Number"
          name="phoneNumber"
          type="tel"
          value={formData.phoneNumber}
          onChange={handleChange}
          error={errors.phoneNumber}
          icon={<Phone className="h-5 w-5 text-gray-400" />}
          placeholder="Enter phone number"
        />

        <Input
          label="Recipient Name (Optional)"
          name="recipientName"
          type="text"
          value={formData.recipientName}
          onChange={handleChange}
          placeholder="Enter recipient name"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-3">
            Amount
          </label>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {quickAmounts.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => handleQuickAmount(amount)}
                className={`p-2 rounded-lg border text-sm font-medium transition-colors ${
                  formData.amount === amount.toString()
                    ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                }`}
              >
                ${amount}
              </button>
            ))}
          </div>
          <Input
            name="amount"
            type="number"
            step="0.01"
            min="5"
            max="500"
            value={formData.amount}
            onChange={handleChange}
            error={errors.amount}
            placeholder="Enter custom amount"
          />
        </div>

        {formData.amount && !errors.amount && (
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
              Purchase Summary
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-purple-700 dark:text-purple-300">
                  Airtime Value
                </span>
                <span className="font-medium">
                  {formatAmountSync(parseFloat(formData.amount) || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-700 dark:text-purple-300">
                  Service Fee
                </span>
                <span className="font-medium text-green-600">FREE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-700 dark:text-purple-300">
                  Cashback (2%)
                </span>
                <span className="font-medium text-green-600">
                  +{formatAmountSync((parseFloat(formData.amount) || 0) * 0.02)}
                </span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total Cost</span>
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
            <Smartphone className="h-4 w-4 mr-2" />
            Buy Airtime
          </Button>
        </div>
      </form>
    </Modal>
  );
};
