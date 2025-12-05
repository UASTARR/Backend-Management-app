import { auth } from '@/auth';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const spreadsheetId = params.id;
  const session = await auth();
  // @ts-ignore
  const accessToken = session?.accessToken;
  if (!accessToken) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });

  const reqUrl = new URL(request.url);
  const range = reqUrl.searchParams.get('range') || 'Sheet1';

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}`;

  try {
    async function fetchValuesFor(rangeToUse: string) {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(rangeToUse)}`;
      return await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
    }

    // First attempt with requested range
    let res = await fetchValuesFor(range);
    if (res.ok) {
      const json = await res.json();
      return new Response(JSON.stringify(json), { headers: { 'Content-Type': 'application/json' } });
    }

    // If Google complains about parsing the range, try to recover by using the first sheet's title
    if (res.status === 400) {
      const errText = await res.text();
      // check message to confirm it's a range parse error
      if (errText && errText.includes('Unable to parse range')) {
        // fetch spreadsheet metadata to get sheet titles
        const metaUrl = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}?fields=sheets.properties.title`;
        const metaRes = await fetch(metaUrl, { headers: { Authorization: `Bearer ${accessToken}` } });
        if (metaRes.ok) {
          const metaJson = await metaRes.json();
          const firstTitle = metaJson?.sheets?.[0]?.properties?.title;
          if (firstTitle) {
            // Try with the sheet title, then fallback to title!A1:1000
            const tryRanges = [firstTitle, `${firstTitle}!A1:1000`];
            for (const r of tryRanges) {
              const retryRes = await fetchValuesFor(r);
              if (retryRes.ok) {
                const json = await retryRes.json();
                return new Response(JSON.stringify(json), { headers: { 'Content-Type': 'application/json' } });
              }
            }
            // if retries failed, forward original Google error
            return new Response(errText, { status: 400, headers: { 'Content-Type': 'application/json' } });
          }
        }
      }
      // forward other 400 responses
      return new Response(errText, { status: res.status, headers: { 'Content-Type': res.headers.get('content-type') || 'text/plain' } });
    }

    // forward non-OK responses
    const text = await res.text();
    return new Response(text, { status: res.status, headers: { 'Content-Type': res.headers.get('content-type') || 'text/plain' } });
  } catch (err: any) {
    console.error('Sheets API proxy error:', err);
    return new Response(JSON.stringify({ error: 'Sheets API failed', details: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
