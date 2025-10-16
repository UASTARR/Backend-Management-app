import { google } from "googleapis";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  // @ts-ignore
  const accessToken = session?.accessToken;
  if (!accessToken) return new Response(JSON.stringify([]), { status: 401 });

  // Create OAuth2 client and set credentials
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });

  const drive = google.drive({ version: "v3", auth: oauth2Client });
  try {
    const result = await drive.files.list({
      pageSize: 10,
      fields: "files(id, name, mimeType)",
    });
    return new Response(JSON.stringify(result.data.files ?? []), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Google Drive API error:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch files" }), { status: 500 });
  }
}