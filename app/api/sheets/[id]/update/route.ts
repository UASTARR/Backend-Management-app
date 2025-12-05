import { auth } from '@/auth';

/**
 * Accepts batched updates and forwards to Google Sheets values:batchUpdate.
 * Request JSON: { updates: [{ range: string, values: string[][] }], valueInputOption?: 'RAW' | 'USER_ENTERED' }
 */
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const spreadsheetId = params.id;
  const session = await auth();
  // @ts-ignore
  const accessToken = session?.accessToken;
  if (!accessToken) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });

  try {
    const body = await request.json();
    const updates = Array.isArray(body?.updates) ? body.updates : [];
    const valueInputOption = body?.valueInputOption || 'USER_ENTERED';

    if (updates.length === 0) {
      return new Response(JSON.stringify({ error: 'No updates provided' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const payload = {
      valueInputOption,
      data: updates.map((u: any) => ({ range: u.range, values: u.values }))
    };

    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values:batchUpdate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const text = await res.text();
    return new Response(text, { status: res.status, headers: { 'Content-Type': res.headers.get('content-type') || 'application/json' } });
  } catch (err: any) {
    console.error('sheets update proxy error', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
