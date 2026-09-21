export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body?.name ?? '').trim();
    const contact = String(body?.contact ?? '').trim();
    const help = String(body?.help ?? '').trim();
    const isEmail = Boolean(body?.isEmail);

    if (!name || !contact || !help) {
      return Response.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const apiKey = (globalThis as typeof globalThis & {
      process?: { env?: Record<string, string | undefined> };
    }).process?.env?.BREVO_API_KEY;

    if (!apiKey) {
      return Response.json({ error: 'Brevo API key is not configured.' }, { status: 500 });
    }

    const payload = {
      email: isEmail ? contact : undefined,
      attributes: {
        FIRSTNAME: name,
        SERVICE_INTEREST: help,
        LEAD_SOURCE: 'Website',
        WHATSAPP: isEmail ? undefined : contact,
      },
      listIds: [],
      updateEnabled: true,
    };

    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify(payload),
    });

    const text = await response.text();

    if (!response.ok) {
      let errorMessage = 'There was a problem sending your message.';
      try {
        const parsed = JSON.parse(text);
        if (parsed?.message) errorMessage = parsed.message;
      } catch {
        // keep default
      }
      return Response.json({ error: errorMessage }, { status: response.status || 500 });
    }

    return Response.json({ success: true, message: 'Message sent successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Brevo contact submission failed:', error);
    return Response.json({ error: 'There was a problem sending your message.' }, { status: 500 });
  }
}
