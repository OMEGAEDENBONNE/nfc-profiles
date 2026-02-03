"use client";

import { useState } from "react";
import { supabaseBrowser } from "../../lib/supabaseBrowser";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [cooldown, setCooldown] = useState(0);

    async function sendMagicLink() {
        if (cooldown > 0 || !email) return;

        setErr(null);

        const { error } = await supabaseBrowser.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${window.location.origin}/dashboard`,
            },
        });

        if (error) {
            setErr(error.message);
            return;
        }

        setSent(true);

        // cooldown anti-spam (30 secondes)
        setCooldown(30);
        const timer = setInterval(() => {
            setCooldown((c) => {
                if (c <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return c - 1;
            });
        }, 1000);
    }

    return (
        <main
            style={{
                padding: 24,
                maxWidth: 420,
                margin: "0 auto",
                fontFamily: "system-ui",
            }}
        >
            <h1>Connexion</h1>
            <p>Entre ton email, tu recevras un lien de connexion.e</p>

            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemple.com"
                style={{
                    width: "100%",
                    padding: 12,
                    borderRadius: 10,
                    border: "1px solid #ddd",
                }}
            />

            <button
                onClick={sendMagicLink}
                disabled={cooldown > 0}
                style={{
                    marginTop: 12,
                    padding: 12,
                    width: "100%",
                    borderRadius: 10,
                    opacity: cooldown > 0 ? 0.6 : 1,
                    cursor: cooldown > 0 ? "not-allowed" : "pointer",
                }}
            >
                {cooldown > 0
                    ? `Attends ${cooldown}s`
                    : "Envoyer le lien"}
            </button>

            {sent && (
                <p style={{ marginTop: 12 }}>
                    ✅ Vérifie ta boîte mail (pense au spam).
                </p>
            )}

            {err && (
                <p style={{ marginTop: 12, color: "tomato" }}>
                    ❌ {err}
                </p>
            )}
        </main>
    );
}
