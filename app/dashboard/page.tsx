"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "../../lib/supabaseBrowser";

type Profile = {
    id: string;
    username: string;
    full_name: string | null;
    phone: string | null;
    whatsapp: string | null;
    website: string | null;
    email: string | null;
    bio: string | null;
    is_active: boolean;
    plan: string;
    owner_id: string;
};

export default function DashboardPage() {
    const [userId, setUserId] = useState<string | null>(null);
    const [profile, setProfile] = useState<Partial<Profile>>({});
    const [status, setStatus] = useState<string>("");

    useEffect(() => {
        supabaseBrowser.auth.getUser().then(({ data }) => {
            setUserId(data.user?.id ?? null);
        });
    }, []);

    useEffect(() => {
        if (!userId) return;
        (async () => {
            const { data, error } = await supabaseBrowser
                .from("profiles")
                .select("*")
                .eq("owner_id", userId)
                .single();

            if (!error && data) setProfile(data);
        })();
    }, [userId]);

    async function save() {
        if (!userId) return;
        setStatus("Sauvegarde...");

        // Si pas encore de profil → create
        if (!profile.id) {
            const { error } = await supabaseBrowser.from("profiles").insert({
                username: profile.username,
                full_name: profile.full_name,
                phone: profile.phone,
                whatsapp: profile.whatsapp,
                website: profile.website,
                email: profile.email,
                bio: profile.bio,
                is_active: true,
                plan: "free",
                owner_id: userId,
            });

            setStatus(error ? `❌ ${error.message}` : "✅ Profil créé");
            return;
        }

        // Sinon → update
        const { error } = await supabaseBrowser
            .from("profiles")
            .update({
                full_name: profile.full_name,
                phone: profile.phone,
                whatsapp: profile.whatsapp,
                website: profile.website,
                Email: profile.email,
                bio: profile.bio,
            })
            .eq("id", profile.id);

        setStatus(error ? `❌ ${error.message}` : "✅ Profil mis à jour");
    }

    async function logout() {
        await supabaseBrowser.auth.signOut();
        window.location.href = "/login";
    }

    if (!userId) {
        return (
            <main style={{ padding: 24, fontFamily: "system-ui" }}>
                <h1>Dashboard</h1>
                <p>
                    Tu n’es pas connecté. Va sur <a href="/login">/login</a>
                </p>
            </main>
        );
    }

    return (
        <main style={{ padding: 24, maxWidth: 520, margin: "0 auto", fontFamily: "system-ui" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h1>Dashboard</h1>
                <button onClick={logout} style={{ padding: 10, borderRadius: 10 }}>
                    Déconnexion
                </button>
            </div>

            <label>Username (URL)</label>
            <input
                value={profile.username ?? ""}
                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                placeholder="ex: alpha01"
                style={inp}
                disabled={!!profile.id} // verrouille après création
            />

            <label>Nom</label>
            <input
                value={profile.full_name ?? ""}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                style={inp}
            />

            <label>Téléphone</label>
            <input
                value={profile.phone ?? ""}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                style={inp}
            />

            <label>WhatsApp</label>
            <input
                value={profile.whatsapp ?? ""}
                onChange={(e) => setProfile({ ...profile, whatsapp: e.target.value })}
                style={inp}
            />

            <label>Site</label>
            <input
                value={profile.website ?? ""}
                onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                style={inp}
            />
            <label>Email</label>
            <input
                value={profile.email ?? ""}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                style={inp}
            />


            <label>Bio</label>
            <textarea
                value={profile.bio ?? ""}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                style={{ ...inp, height: 90 }}
            />

            <button onClick={save} style={{ marginTop: 12, padding: 12, width: "100%", borderRadius: 10 }}>
                Sauvegarder
            </button>

            {status && <p style={{ marginTop: 12 }}>{status}</p>}

            {!!profile.username && (
                <p style={{ marginTop: 12, opacity: 0.8 }}>
                    Lien public : <a href={`/u/${profile.username}`}>/u/{profile.username}</a>
                </p>
            )}
        </main>
    );
}

const inp: React.CSSProperties = {
    width: "100%",
    padding: 12,
    borderRadius: 10,
    border: "1px solid #ddd",
    margin: "6px 0 14px",
};
