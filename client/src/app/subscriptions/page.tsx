"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";

const plans = [
  {
    name: "Monthly Plan",
    price: "5.00",
    period: "/month",
    description: "Perfect for individuals and small teams",
    features: [],
    popular: false,
  },
  {
    name: "Yearly Plan",
    price: "50.00",
    period: "/year",
    description: "Save 17% with annual billing",
    features: [],
    popular: true,
  },
];
type PaymentDetails = {
  id?: string;
  status: string;
  payer: {
    name: { given_name: string; surname: string };
    email_address: string;
    payer_id: string;
    address: { country_code: string };
  };
  purchase_units: Array<{
    amount: { currency_code: string; value: string };
    payments: { captures: Array<{ id: string; status: string; create_time: string }> };
  }>;
};
interface Plan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular: boolean;
}

export default function Page() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const auth = useSelector((state: RootState) => state.auth);

  // 🔒 Check for authentication token
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("You need to be logged in to access this page.");
      router.replace("/login");
    }
  }, [router, auth.userId]);  // ✅ Added 'auth.userId' to dependencies

  const handlePayment = async (details: PaymentDetails) => {
    try {
      setLoading(true);
      console.log("Processing payment with details:", details);

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/user/handlepayment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: auth.userId,
          purchase_units: details.purchase_units,
          id: details.id,
          status: details.status,
          payer: details.payer,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to process payment");
      }

      // ✅ Show success toast notification
      toast.success(`Payment Successful! 🎉 Plan: ${selectedPlan?.name} - $${selectedPlan?.price}`);

      // ✅ Redirect to the /try-beta page after payment
      setTimeout(() => {
        router.push("/try-beta");
      }, 2000);  // 2-second delay for user to see the success message

    } catch (error) {
      console.error("Payment error:", error);
    
      if (error instanceof Error) {
        toast.error(`Payment failed: ${error.message}`);
      } else {
        toast.error("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  return (
    <PayPalScriptProvider
      options={{
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
        intent: "capture",
        enableFunding: "card",
      }}
    >
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-4">
              Choose Your Plan
            </h1>
            <p className="text-xl text-gray-600">
              Select the perfect plan for your needs. Upgrade or downgrade at any time.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <Card key={plan.name} className={`relative ${plan.popular ? "border-primary shadow-lg" : ""}`}>
                {plan.popular && <Badge className="absolute -top-3 right-4 bg-primary">Most Popular</Badge>}
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  {selectedPlan?.name === plan.name ? (
                    <div className="w-full">
                      <PayPalButtons
                        createOrder={(data, actions) => {
                          return actions.order.create({
                            intent: "CAPTURE",  // ✅ Added intent
                            purchase_units: [
                              {
                                amount: {
                                  currency_code: "USD",
                                  value: plan.price,
                                },
                              },
                            ],
                          });
                        }}
                        onApprove={(data, actions) => {
                          console.log("Payment successful");
                          if (actions.order) {
                            return actions.order.capture().then((details) => {
                              handlePayment(details as PaymentDetails);
                            });
                          } else {
                            console.error("PayPal order is undefined.");
                            toast.error("Payment processing failed. Please try again.");
                            return Promise.reject("Order not found.");
                          }
                        }}
                        onError={(err) => {
                          console.error("PayPal error:", err);
                          toast.error("Payment error occurred.");
                        }}
                      />
                    </div>
                  ) : (
                    <Button
                      className="w-full"
                      size="lg"
                      variant={plan.popular ? "default" : "outline"}
                      onClick={() => setSelectedPlan(plan)}
                      disabled={loading}
                    >
                      Subscribe Now
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-sm text-gray-600">All plans include a 30-day money-back guarantee</p>
          </div>
        </div>
      </div>
    </PayPalScriptProvider>
  );
}
