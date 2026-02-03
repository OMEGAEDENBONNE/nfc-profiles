import { supabase } from "../../../../lib/supabaseClient";

export const dynamic = "force-dynamic";

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ username: string }> }
) {
    const { username } = await params;

    const { data: profile, error } = await supabase
        .from("profiles")
        .select("full_name, phone, email, website, is_active")
        .eq("username", username)
        .single();

    if (error || !profile || profile.is_active !== true) {
        return new Response("Not found", { status: 404 });
    }

    const fullName = profile.full_name || username;
    const phone = (profile.phone || "").replace(/\s+/g, "");
    const email = (profile.email || "").trim();
    const website = (profile.website || "").trim();

    const vcf = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `FN:${escapeVCF(fullName)}`,
        phone ? `TEL;TYPE=CELL:${escapeVCF(phone)}` : "",
        email ? `EMAIL:${escapeVCF(email)}` : "",
        website ? `URL:${escapeVCF(website)}` : "",
        "END:VCARD",
    ]
        .filter(Boolean)
        .join("\r\n");

    return new Response(vcf, {
        headers: {
            "Content-Type": "text/vcard; charset=utf-8",
            "Content-Disposition": `attachment; filename="${username}.vcf"`,
            "Cache-Control": "no-store",
        },
    });
}

function escapeVCF(value: string) {
    return value
        .replace(/\\/g, "\\\\")
        .replace(/\n/g, "\\n")
        .replace(/;/g, "\\;")
        .replace(/,/g, "\\,");
}
