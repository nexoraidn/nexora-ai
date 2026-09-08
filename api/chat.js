export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // =========================
    // 1. Kirim pesan ke OpenAI
    // =========================
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        input: message
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "OpenAI API error"
      });
    }

    const reply = data.output_text;

    // =========================
    // 2. Simpan ke Supabase
    // =========================
    const supabaseResponse = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/conversations`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": process.env.SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${process.env.SUPABASE_ANON_KEY}`,
          "Prefer": "return=minimal"
        },
        body: JSON.stringify({
          message: message,
          reply: reply
        })
      }
    );

    if (!supabaseResponse.ok) {
      const supabaseError = await supabaseResponse.text();

      console.error("Supabase error:", supabaseError);

      return res.status(500).json({
        error: "Failed to save conversation"
      });
    }

    // =========================
    // 3. Kirim balasan ke chat
    // =========================
    return res.status(200).json({
      reply: reply
    });

  } catch (error) {
    console.error("Server error:", error);

    return res.status(500).json({
      error: "Server error"
    });
  }
}
