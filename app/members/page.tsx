"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";


export default function Members() {
  const { data: session, status } = useSession();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      setLoading(true);
      fetch("/api/drive")
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch files");
          return res.json();
        })
        .then((data) => {
          setFiles(data);
          setError("");
        })
        .catch((err) => {
          setError(err.message);
          setFiles([]);
        })
        .finally(() => setLoading(false));
    }
  }, [status]);

  if (status === "loading") {
    return <div style={styles.body}><div style={styles.greeting}>Loading session...</div></div>;
  }

  return (
    <div style={styles.body}>
      <div style={styles.greeting}>Google Drive Files</div>
      <div style={styles.menu}>
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
                <span style={styles.fileName}>{file.name}</span>
                <span style={styles.fileType}>({file.mimeType})</span>
              </li>
            ))}
          </ul>
        )}
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
};