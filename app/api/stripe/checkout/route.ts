import Stripe from "stripe";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-01-27.acacia",
});

const PRICE_ID = "prod_TvFpw9iDfBbM3T"; // <-- à remplacer par ton Price Stripe (paiement unique)

export async function POST(req: Request) {
    const { username, owner_id } = await req.json();

    if (!username || !owner_id) {
        return Response.json({ error: "missing username/owner_id" }, { status: 400 });
    }

    // Vérifier que le profil appartient bien à ce owner_id (sécurité)
    const { data: profile, error } = await supabaseAdmin
        .from("profiles")
        .select("id, owner_id, plan")
        .eq("username", username)
        .single();

    if (error || !profile) {
        return Response.json({ error: "profile not found" }, { status: 404 });
    }

    if (profile.owner_id !== owner_id) {
        return Response.json({ error: "forbidden" }, { status: 403 });
    }

    // Si déjà pro, inutile de payer
    if (profile.plan === "pro") {
        return Response.json({ error: "already_pro" }, { status: 409 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;

    const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [{ price: PRICE_ID, quantity: 1 }],
        success_url: `${siteUrl}/dashboard?paid=1`,
        cancel_url: `${siteUrl}/dashboard?canceled=1`,
        metadata: {
            username,
            owner_id,
        },
    });

    return Response.json({ url: session.url });
}
