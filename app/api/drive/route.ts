import { google } from "googleapis";
import { auth } from "@/auth";

export async function GET(request: Request) {
  const session = await auth();
  // @ts-ignore
  const accessToken = session?.accessToken;
  if (!accessToken) return new Response(JSON.stringify([]), { status: 401 });

  // Create OAuth2 client and set credentials
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });

  const drive = google.drive({ version: "v3", auth: oauth2Client });
  try {
    const url = new URL(request.url);
    const keyword = url.searchParams.get('keyword');
    // base query: only spreadsheets
    let q = "mimeType='application/vnd.google-apps.spreadsheet'";
    if (keyword) {
      // name contains keyword (case-insensitive not directly supported by Drive API; this will do a contains match)
      q += ` and name contains '${keyword.replace("'", "\\'")}'`;
    }

    const result = await drive.files.list({
      pageSize: 50,
      fields: "files(id, name, mimeType, webViewLink)",
      q,
      corpora: 'allDrives',
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
    });
    return new Response(JSON.stringify(result.data.files ?? []), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Google Drive API error:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch files" }), { status: 500 });
  }
}