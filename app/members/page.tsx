"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";


export default function Members() {
  // NextAuth hook that provides the current session and loading status.
  // - `session` contains user data and, importantly for Drive/Sheets access,
  //   `session.accessToken` (if your NextAuth callbacks attach it).
  // - `status` === 'authenticated' when the session is ready and valid.
  // If `useSession` complains, ensure your root `app/layout.tsx` wraps children
  // with <SessionProvider> from `next-auth/react`.
  const { data: session, status } = useSession();
  // Files fetched from the Drive listing API (`/api/drive`). Each file has
  // shape: { id: string, name: string, mimeType: string, webViewLink?: string }
  const [files, setFiles] = useState([]);
  // Loading indicator for the files list request
  const [loading, setLoading] = useState(false);
  // User-visible error message. We keep a single string here for simplicity;
  // for richer errors you might store { message, details }.
  const [error, setError] = useState("");
  // A keyword to filter sheet names. Passed to `/api/drive?keyword=...` which
  // uses Drive API `q` param to search names containing the keyword.
  const [keyword, setKeyword] = useState('');
  // Values loaded from the Sheets proxy (`/api/sheets/{id}/values`). The
  // Sheets API returns { range, majorDimension, values: string[][] }
  const [sheetValues, setSheetValues] = useState<string[][] | null>(null);
  // Loading indicator for the sheet values request
  const [sheetLoading, setSheetLoading] = useState(false);

  /**
   * Fetch values for a spreadsheet. The client passes a spreadsheetId and a range
   * (defaults to 'Sheet1'). The server proxy (`/api/sheets/[id]/values`) will
   * attempt the requested range and automatically fall back to the first sheet
   * if the range is invalid.
   *
   * Sets `sheetLoading` while in-flight and stores the result in `sheetValues`.
   */
  /**
   * openSheet(fileId, range)
   * ------------------------
   * Purpose:
   *   Fetch values for a spreadsheet. This is a client-side wrapper that
   *   calls the server proxy at `/api/sheets/{fileId}/values?range=...`.
   *
   * Parameters:
   *   - fileId: the Drive fileId of the Google Sheets spreadsheet.
   *   - range: a Sheets range string (defaults to 'Sheet1'). The server
   *     proxy will attempt this range first and automatically fall back to
   *     the spreadsheet's first sheet if the range is invalid.
   *
   * Behavior:
   *   - Shows a loading indicator via `sheetLoading`.
   *   - Stores the returned `values` array (string[][]) in `sheetValues`.
   *   - Stores a user-friendly error message in `error` on failure.
   *
   * Debugging tips:
   *   - If you get 401 responses, confirm `session.accessToken` is present.
   *     Check your NextAuth jwt/session callbacks in `auth.ts`.
   *   - If you get 400/INVALID_ARGUMENT (range parse error), the server
   *     proxy attempts to recover by reading the first sheet title and retrying.
   *   - Use the Network panel to inspect the exact response body from
   *     `/api/sheets/{id}/values` — Google returns helpful JSON errors.
   */
  async function openSheet(fileId: string, range = 'Sheet1') {
    setSheetLoading(true);
    setSheetValues(null);
    try {
      // Call the server proxy which handles authorization and retries.
      const res = await fetch(`/api/sheets/${fileId}/values?range=${encodeURIComponent(range)}`);
      if (!res.ok) {
        // Server often forwards Google's JSON error — use it in the UI.
        const text = await res.text();
        throw new Error(text || 'Failed to fetch sheet');
      }
      // Expected payload: { range: string, majorDimension: string, values: string[][] }
      const json = await res.json();
      const values: string[][] = json.values || [];
      setSheetValues(values);
      setError('');
    } catch (err: any) {
      // Store human-readable message; the UI shows it in red. For deeper
      // debugging keep console logs available (or forward server logs).
      setError(err?.message || 'Failed to load sheet');
    } finally {
      setSheetLoading(false);
    }
  }

  async function fetchFiles(kw = '') {
    setLoading(true);
    setError('');
    try {
      const url = kw ? `/api/drive?keyword=${encodeURIComponent(kw)}` : '/api/drive';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch files');
      const data = await res.json();
      setFiles(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch files');
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (status === "authenticated") {
      fetchFiles(keyword);
    }
  }, [status]);

  if (status === "loading") {
    return <div style={styles.body}><div style={styles.greeting}>Loading session...</div></div>;
  }

  return (
    <div style={styles.body}>
      <div style={styles.greeting}>Google Drive Files</div>
      <div style={styles.menu}>
        <div style={styles.searchRow}>
          <input
            placeholder="Search sheets by keyword"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={styles.searchInput}
          />
          <button style={styles.smallButton} onClick={() => fetchFiles(keyword)}>Search</button>
        </div>
        {loading ? (
          <div style={styles.loading}>Loading files...</div>
        ) : error ? (
          <div style={styles.error}>Error: {error}</div>
        ) : files.length === 0 ? (
          <div style={styles.noFiles}>No files found.</div>
        ) : (
          <ul style={styles.fileList}>
            {files.map((file: any) => (
              <li key={file.id} style={styles.fileItem}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={styles.fileName}>{file.name}</span>
                    <span style={styles.fileType}>({file.mimeType})</span>
                  </div>
                  <div>
                    {file.mimeType === 'application/vnd.google-apps.spreadsheet' ? (
                      <button style={styles.smallButton} onClick={() => openSheet(file.id)}>Open</button>
                    ) : null}
                  </div>
                </li>
            ))}
          </ul>
        )}
          {sheetLoading ? (
            <div style={styles.loading}>Loading sheet...</div>
          ) : sheetValues ? (
            <div style={styles.sheetContainer}>
              <button style={styles.smallButton} onClick={() => setSheetValues(null)}>Close Sheet</button>
              <div style={{ overflowX: 'auto' }}>
                <table style={styles.sheetTable}>
                  <tbody>
                    {sheetValues.map((row, ri) => (
                      <tr key={ri}>
                        {row.map((cell, ci) => (
                          <td key={ci} style={styles.sheetCell}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
      </div>
    </div>
  );
}

const styles = {
  body: {
    backgroundColor: '#343434',
    width: '100vw',
    height: '100',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greeting: {
    color: 'white',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: '6vh',
    display: 'flex',
    flexDirection: 'column' as const,
    marginTop: '40px',
    marginBottom: '20px',
    textAlign: 'center' as const,
  },
  menu: {
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    width: '100%',
  },
  loading: {
    color: '#bbb',
    fontFamily: 'monospace',
    fontSize: '2vh',
    marginTop: '20px',
  },
  error: {
    color: 'red',
    fontFamily: 'monospace',
    fontSize: '2vh',
    marginTop: '20px',
  },
  noFiles: {
    color: '#bbb',
    fontFamily: 'monospace',
    fontSize: '2vh',
    marginTop: '20px',
  },
  fileList: {
    listStyle: 'none',
    padding: 0,
    marginTop: '20px',
    width: '80%',
    maxWidth: '600px',
  },
  fileItem: {
    background: '#222',
    color: 'white',
    fontFamily: 'monospace',
    fontSize: '2vh',
    margin: '10px 0',
    padding: '16px',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },
  fileName: {
    fontWeight: 'bold',
  },
  fileType: {
    color: '#bbb',
    marginLeft: '10px',
    fontSize: '1.8vh',
  },
  searchRow: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  searchInput: {
    padding: '8px 12px',
    borderRadius: 6,
    border: '1px solid #444',
    background: '#111',
    color: '#fff',
    fontFamily: 'monospace'
  },
  smallButton: {
    marginLeft: '8px',
    padding: '6px 10px',
    borderRadius: '6px',
    border: 'none',
    background: '#fff',
    color: '#343434',
    cursor: 'pointer',
    fontFamily: 'monospace'
  },
  sheetContainer: {
    width: '90%',
    background: '#222',
    padding: '16px',
    borderRadius: '8px',
    marginTop: '20px',
    marginBottom: '40px'
  },
  sheetTable: {
    borderCollapse: 'collapse' as const,
    width: '100%'
  },
  sheetCell: {
    border: '1px solid #444',
    padding: '8px',
    color: '#ddd',
    fontFamily: 'monospace',
    fontSize: '1.6vh'
  }
};