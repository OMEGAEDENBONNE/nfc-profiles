import { supabase } from "../../../lib/supabaseClient";

export const dynamic = "force-dynamic";

export default async function Page(props: {
    params: Promise<{ username: string }>;
}) {
    const { username } = await props.params;

    const { data: profile, error } = await supabase
        .from("profiles")
        .select("username, full_name, phone, whatsapp, website, bio, is_active")
        .eq("username", username)
        .single();

    if (error || !profile) {
        return (
            <main style={{ padding: 24, fontFamily: "system-ui" }}>
                <h1>Profil introuvable</h1>
                <p>Vérifie le lien NFC.</p>
                {error && (
                    <pre style={{ marginTop: 16, opacity: 0.7 }}>
                        {JSON.stringify(error, null, 2)}
                    </pre>
                )}
            </main>
        );
    }

    const phoneClean = (profile.phone || "").replace(/\s+/g, "");
    const whatsappClean = (profile.whatsapp || phoneClean).replace(/\s+/g, "");

    return (
        <main style={{ padding: 24, maxWidth: 520, margin: "0 auto", fontFamily: "system-ui" }}>
            <h1 style={{ fontSize: 28, marginBottom: 8 }}>
                {profile.full_name || profile.username}
            </h1>

            {profile.bio && <p style={{ opacity: 0.8, marginTop: 0 }}>{profile.bio}</p>}

            <div style={{ display: "grid", gap: 12, marginTop: 24 }}>
                {phoneClean && (
                    <a href={`tel:${phoneClean}`} style={btnStyle}>
                        📞 Appeler
                    </a>
                )}

                {whatsappClean && (
                    <a href={`https://wa.me/${whatsappClean.replace("+", "")}`} style={btnStyle}>
                        💬 WhatsApp
                    </a>
                )}
                <a href={`/u/${username}/contact`} style={btnStyle}>
                    👤 Ajouter au contact
                </a>


                {profile.website && (
                    <a href={profile.website} target="_blank" rel="noreferrer" style={btnStyle}>
                        🌐 Site web
                    </a>
                )}
            </div>

            <p style={{ marginTop: 24, opacity: 0.6, fontSize: 12 }}>Scanné via NFC</p>
        </main>
    );
}

const btnStyle: React.CSSProperties = {
    display: "block",
    padding: "14px 16px",
    border: "1px solid #ddd",
    borderRadius: 12,
    textDecoration: "none",
    color: "inherit",
};
