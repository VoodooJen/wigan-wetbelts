import Stripe from "stripe";
import { getServerEnv } from "@/lib/env";

let stripeClient: Stripe | null = null;

export function getStripe() {
  if (!stripeClient) {
    stripeClient = new Stripe(getServerEnv().stripeSecretKey, {
      apiVersion: "2025-02-24.acacia"
    });
  }

  return stripeClient;
}
