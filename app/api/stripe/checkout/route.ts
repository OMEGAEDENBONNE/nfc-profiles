import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PRICE_ID = "price_1SxPJRRz68iaqbgtoQ7fz4tn"; // ✅ ton price_...

export async function POST(req: Request) {
    try {
        const { username, owner_id } = await req.json();

        if (!username || !owner_id) {
            return Response.json({ error: "missing username/owner_id" }, { status: 400 });
        }

        const { data: profile, error: pErr } = await supabaseAdmin
            .from("profiles")
            .select("id, owner_id, plan")
            .eq("username", username)
            .single();

        if (pErr || !profile) {
            return Response.json({ error: "profile not found" }, { status: 404 });
        }
        if (profile.owner_id !== owner_id) {
            return Response.json({ error: "forbidden" }, { status: 403 });
        }
        if (profile.plan === "pro") {
            return Response.json({ error: "already_pro" }, { status: 409 });
        }

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
        if (!siteUrl) {
            return Response.json({ error: "Missing NEXT_PUBLIC_SITE_URL on server" }, { status: 500 });
        }

        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            line_items: [{ price: PRICE_ID, quantity: 1 }],
            success_url: `${siteUrl}/dashboard?paid=1`,
            cancel_url: `${siteUrl}/dashboard?canceled=1`,
            metadata: { username, owner_id },
        });

        return Response.json({ url: session.url });
    } catch (e: any) {
        return Response.json(
            { error: e?.message || "checkout_failed" },
            { status: 500 }
        );
    }
}
