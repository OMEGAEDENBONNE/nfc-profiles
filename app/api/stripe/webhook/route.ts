import Stripe from "stripe";
import { headers } from "next/headers";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-01-27.acacia",
});

export async function POST(req: Request) {
    const body = await req.text();
    const sig = (await headers()).get("stripe-signature");

    if (!sig) return new Response("Missing signature", { status: 400 });

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch {
        return new Response("Invalid signature", { status: 400 });
    }

    // Paiement réussi
    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;

        const username = session.metadata?.username;
        const owner_id = session.metadata?.owner_id;

        // payment_intent pour traçabilité
        const paymentIntentId =
            typeof session.payment_intent === "string" ? session.payment_intent : null;

        if (username && owner_id) {
            await supabaseAdmin
                .from("profiles")
                .update({
                    plan: "pro",
                    is_active: true,
                    activated_at: new Date().toISOString(),
                    stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
                    stripe_payment_intent_id: paymentIntentId,
                })
                .eq("username", username)
                .eq("owner_id", owner_id);
        }
    }

    return new Response("ok");
}
