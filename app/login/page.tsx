"use client";

import { useState } from "react";
import { supabaseBrowser } from "../../lib/supabaseBrowser";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    async function sendMagicLink() {
        setErr(null);
        const { error } = await supabaseBrowser.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${window.location.origin}/dashboard`,
            },
        });

        if (error) setErr(error.message);
        else setSent(true);
    }

    return (
        <main style={{ padding: 24, maxWidth: 420, margin: "0 auto", fontFamily: "system-ui" }}>
            <h1>Connexion</h1>
            <p>Entre ton email, tu recevras un lien de connexion.</p>

            <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemple.com"
                style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid #ddd" }}
            />

            <button
                onClick={sendMagicLink}
                style={{ marginTop: 12, padding: 12, width: "100%", borderRadius: 10 }}
            >
                Envoyer le lien
            </button>

            {sent && <p style={{ marginTop: 12 }}>✅ Vérifie ta boîte mail.</p>}
            {err && <p style={{ marginTop: 12, color: "tomato" }}>{err}</p>}
        </main>
    );
}
