"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";


export default function Members() {
  const { data: session, status } = useSession();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState('');
  const [sheetValues, setSheetValues] = useState<string[][] | null>(null);
  const [sheetLoading, setSheetLoading] = useState(false);

  async function openSheet(fileId: string, range = 'Sheet1') {
    setSheetLoading(true);
    setSheetValues(null);
    console.log('openSheet called for', fileId, 'range', range);
    try {
      const res = await fetch(`/api/sheets/${fileId}/values?range=${encodeURIComponent(range)}`);
      console.log('fetch sent, awaiting response...');
      if (!res.ok) {
        const text = await res.text();
        console.error('sheet fetch returned non-ok:', res.status, text);
        throw new Error(text || 'Failed to fetch sheet');
      }
      const json = await res.json();
      console.log('sheet json:', json);
      const values: string[][] = json.values || [];
      setSheetValues(values);
      setError('');
    } catch (err: any) {
      console.error('openSheet error', err);
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
    height: '100vh',
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
    maxWidth: '900px',
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