import { auth } from '@/auth';

/**
 * Returns a compact representation of sheet rows for a given range including
 * cell values and background color (if present).
 * Response shape:
 * { rows: [ { cells: [ { text: string, bg?: {r,g,b} } ] } ] }
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const spreadsheetId = params.id;
  const session = await auth();
  // @ts-ignore
  const accessToken = session?.accessToken;
  if (!accessToken) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });

  try {
    const reqUrl = new URL(request.url);
    let range = reqUrl.searchParams.get('range') || 'Sheet1!A1:100';

    // Helper to call spreadsheets.get with includeGridData for a given range
    const fetchGrid = async (r: string) => {
      const url = new URL(`https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}`);
      url.searchParams.set('includeGridData', 'true');
      url.searchParams.set('ranges', r);
      url.searchParams.set('fields', 'sheets(data(rowData(values(userEnteredValue,userEnteredFormat/backgroundColor))))');
      return fetch(url.toString(), { headers: { Authorization: `Bearer ${accessToken}` } });
    };

    // First attempt with the provided (or default) range
    let res = await fetchGrid(range);
    // If Google complains about parsing the range, try to discover the first
    // sheet title and retry with a safe A1 range on that sheet.
    if (!res.ok) {
      const text = await res.text();
      // Detect the specific range parse error message returned by Sheets API
      if (res.status === 400 && text && text.includes('Unable to parse range')) {
        // Fetch spreadsheet metadata to get first sheet title
        const metaUrl = new URL(`https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}`);
        metaUrl.searchParams.set('fields', 'sheets(properties/title)');
        const metaRes = await fetch(metaUrl.toString(), { headers: { Authorization: `Bearer ${accessToken}` } });
        if (metaRes.ok) {
          const meta = await metaRes.json();
          const firstTitle = meta?.sheets?.[0]?.properties?.title;
          if (firstTitle) {
            // Retry with discovered title and a safe range
            range = `${firstTitle}!A1:100`;
            res = await fetchGrid(range);
          }
        }
      }
    }

    if (!res.ok) {
      const text = await res.text();
      return new Response(text, { status: res.status, headers: { 'Content-Type': res.headers.get('content-type') || 'text/plain' } });
    }

    const json = await res.json();
    // json.sheets[0].data[0].rowData -> array of rows
    const rows = (json?.sheets?.[0]?.data?.[0]?.rowData || []).map((row: any) => {
      const cells = (row.values || []).map((v: any) => {
        const text = v?.userEnteredValue ? (v.userEnteredValue.stringValue ?? v.userEnteredValue.numberValue ?? '') : '';
        const bc = v?.userEnteredFormat?.backgroundColor;
        let bg = undefined;
        if (bc) {
          const r = Math.round((bc.red ?? 0) * 255);
          const g = Math.round((bc.green ?? 0) * 255);
          const b = Math.round((bc.blue ?? 0) * 255);
          bg = { r, g, b };
        }
        return { text, bg };
      });
      return { cells };
    });

    return new Response(JSON.stringify({ rows }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    console.error('sheets format proxy error', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
