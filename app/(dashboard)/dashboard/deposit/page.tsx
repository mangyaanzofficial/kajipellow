import { Card } from "@/components/ui/card";
import { DepositForm } from "./deposit-form";

export default function DepositPage() {
  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-6">Deposit Saldo</h1>
      <Card className="p-6">
        <DepositForm />
      </Card>
    </div>
  );
}
