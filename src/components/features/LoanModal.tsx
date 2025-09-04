import React, { useState } from "react";
import { Zap, Calculator, AlertCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatCurrency } from "@/lib/utils";
import { Loan } from "@/lib/database";

interface LoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoanRequest: (amount: number, termMonths: number) => Promise<any>;
  existingLoans: Loan[];
}

const loanTerms = [
  { months: 6, label: "6 months" },
  { months: 12, label: "1 year" },
  { months: 24, label: "2 years" },
  { months: 36, label: "3 years" },
];

export const LoanModal: React.FC<LoanModalProps> = ({
  isOpen,
  onClose,
  onLoanRequest,
  existingLoans,
}) => {
  const [formData, setFormData] = useState({
    amount: "",
    termMonths: 12,
    purpose: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "termMonths" ? parseInt(value) : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const calculateLoanDetails = () => {
    const amount = parseFloat(formData.amount) || 0;
    const interestRate = 0.15; // 15% annual interest rate
    const monthlyRate = interestRate / 12;
    const termMonths = formData.termMonths;

    const monthlyPayment =
      amount > 0
        ? (amount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
          (Math.pow(1 + monthlyRate, termMonths) - 1)
        : 0;

    const totalPayment = monthlyPayment * termMonths;
    const totalInterest = totalPayment - amount;

    return {
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      totalPayment: Math.round(totalPayment * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      interestRate: interestRate * 100,
    };
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    const amount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amount)) {
      newErrors.amount = "Valid amount is required";
    } else if (amount < 100) {
      newErrors.amount = "Minimum loan amount is $100";
    } else if (amount > 10000) {
      newErrors.amount = "Maximum loan amount is $10,000";
    }

    if (!formData.purpose.trim()) {
      newErrors.purpose = "Loan purpose is required";
    }

    // Check for existing active loans
    const activeLoans = existingLoans.filter(
      (loan) => loan.status === "active"
    );
    if (activeLoans.length >= 2) {
      newErrors.general = "You can only have up to 2 active loans at a time";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      await onLoanRequest(parseFloat(formData.amount), formData.termMonths);

      // Reset form and close modal
      setFormData({ amount: "", termMonths: 12, purpose: "" });
      onClose();
    } catch (error: any) {
      // Error is handled in the hook
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ amount: "", termMonths: 12, purpose: "" });
    setErrors({});
    onClose();
  };

  const loanDetails = calculateLoanDetails();
  const activeLoans = existingLoans.filter((loan) => loan.status === "active");

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Request Loan" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {activeLoans.length > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5 mr-3" />
              <div>
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                  Existing Active Loans
                </h4>
                <div className="mt-2 space-y-1">
                  {activeLoans.map((loan, index) => (
                    <p
                      key={index}
                      className="text-sm text-yellow-700 dark:text-yellow-300"
                    >
                      {formatCurrency(loan.remaining_balance)} remaining -{" "}
                      {formatCurrency(loan.monthly_payment)}/month
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {errors.general && (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-700 dark:text-red-300">
              {errors.general}
            </p>
          </div>
        )}

        <Input
          label="Loan Amount"
          name="amount"
          type="number"
          step="0.01"
          min="100"
          max="10000"
          value={formData.amount}
          onChange={handleChange}
          error={errors.amount}
          placeholder="Enter loan amount ($100 - $10,000)"
        />

        <div>
          <label className="block text-sm font-medium text-theme-foreground mb-3">
            Loan Term
          </label>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {loanTerms.map((term) => (
              <button
                key={term.months}
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, termMonths: term.months }))
                }
                className={`p-3 rounded-lg border-2 transition-all ${
                  formData.termMonths === term.months
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-theme hover:border-theme-muted"
                }`}
              >
                <p className="text-sm font-medium text-theme-card-foreground">
                  {term.label}
                </p>
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Loan Purpose"
          name="purpose"
          type="text"
          value={formData.purpose}
          onChange={handleChange}
          error={errors.purpose}
          placeholder="What will you use this loan for?"
        />

        {formData.amount && !errors.amount && (
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-3 flex items-center">
              <Calculator className="h-4 w-4 mr-2" />
              Loan Calculation
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-orange-700 dark:text-orange-300">
                  Loan Amount
                </span>
                <p className="font-semibold text-lg text-theme-foreground">
                  {formatCurrency(parseFloat(formData.amount))}
                </p>
              </div>
              <div>
                <span className="text-orange-700 dark:text-orange-300">
                  Interest Rate
                </span>
                <p className="font-semibold text-lg text-theme-foreground">
                  {loanDetails.interestRate}% APR
                </p>
              </div>
              <div>
                <span className="text-orange-700 dark:text-orange-300">
                  Monthly Payment
                </span>
                <p className="font-semibold text-lg text-theme-foreground">
                  {formatCurrency(loanDetails.monthlyPayment)}
                </p>
              </div>
              <div>
                <span className="text-orange-700 dark:text-orange-300">
                  Total Interest
                </span>
                <p className="font-semibold text-lg text-theme-foreground">
                  {formatCurrency(loanDetails.totalInterest)}
                </p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-orange-200 dark:border-orange-800">
              <div className="flex justify-between items-center">
                <span className="text-orange-700 dark:text-orange-300">
                  Total Repayment
                </span>
                <span className="font-bold text-xl text-theme-foreground">
                  {formatCurrency(loanDetails.totalPayment)}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-theme-muted p-4 rounded-lg">
          <h4 className="font-medium text-theme-foreground mb-2">
            Loan Terms & Conditions
          </h4>
          <ul className="text-sm text-theme-muted space-y-1">
            <li>• Instant approval for qualified applicants</li>
            <li>• No prepayment penalties</li>
            <li>• Fixed interest rate of 15% APR</li>
            <li>• Maximum 2 active loans per account</li>
            <li>• Funds disbursed immediately upon approval</li>
          </ul>
        </div>

        <div className="flex space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
            className="flex-1"
            disabled={!!errors.general}
          >
            <Zap className="h-4 w-4 mr-2" />
            Request Loan
          </Button>
        </div>
      </form>
    </Modal>
  );
};
