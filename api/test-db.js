export default async function handler(req, res) {
  try {
    const response = await fetch(
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
          message: "Test Nexora",
          reply: "Supabase berhasil menerima data."
        })
      }
    );

    const result = await response.text();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: result
      });
    }

    return res.status(200).json({
      success: true,
      message: "Data berhasil disimpan ke Supabase"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
