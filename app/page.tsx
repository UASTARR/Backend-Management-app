import { signIn } from "@/auth"

export default function SignIn() {
  return (
    <div>
      <div style={styles.body}>
        <div style={styles.header}>
          <img src="/STARRLogoWhite.png" alt="STARR Logo" style={styles.logo} />
          <div style={styles.title}>UASTARR<br/> MANAGEMENT</div>
        </div>

        <form
        action={async () => {
          "use server"
          await signIn("google" , {
            redirectTo:'/dashboard'
          })
        }}
        style={styles.form}
      >
  <button type="submit" style={styles.googleButton}>
    <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <g clipPath="url(#clip0)">
          <path d="M23.04 12.261c0-.81-.073-1.588-.209-2.339H12v4.427h6.24a5.34 5.34 0 01-2.316 3.51v2.908h3.74c2.187-2.017 3.436-4.99 3.436-8.506z" fill="#4285F4"/>
          <path d="M12 24c3.24 0 5.96-1.08 7.946-2.94l-3.74-2.908c-1.04.7-2.37 1.12-4.206 1.12-3.23 0-5.97-2.18-6.95-5.11H1.19v3.09A11.997 11.997 0 0012 24z" fill="#34A853"/>
          <path d="M5.05 14.162A7.19 7.19 0 014.36 12c0-.75.13-1.48.36-2.162V6.748H1.19A12.004 12.004 0 000 12c0 1.97.48 3.83 1.19 5.252l3.86-3.09z" fill="#FBBC05"/>
          <path d="M12 4.77c1.76 0 3.34.6 4.59 1.77l3.43-3.43C17.96 1.08 15.24 0 12 0A11.997 11.997 0 001.19 6.748l3.86 3.09C6.03 6.95 8.77 4.77 12 4.77z" fill="#EA4335"/>
        </g>
        <defs>
          <clipPath id="clip0">
            <rect width="24" height="24" fill="white"/>
          </clipPath>
        </defs>
      </svg>
      <span>Sign in with Google</span>
    </span>
  </button>
</form>
      </div>
    </div>

  
  )
} 


const styles = {
  body: {
    backgroundColor: '#343434',
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center'
  },
  header: {
    display: 'flex',
    flexDirection: 'row' as const,
    height: '20vh',
    alignItems: 'stretch',
  },
  title: {
    color: 'white',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: '6vh',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    height: '100%',
  },
  logo: {
    width: "auto",
    height: "100%",
    margin: 10
  },
  inputBoxes: {
    margin: 30,
    display: 'flex',
    flexDirection: 'column' as const
  },
  inputs: {
    width: '300px',
    height: '40px',
    padding: '10px',
    fontSize: '1.2rem',
    borderRadius: '5px',
    border: '1px solid #ccc',
    marginTop: '20px',
    boxSizing: 'border-box' as const,
    background: '#fff',
    color: '#343434',
    fontFamily: 'monospace'
  },
  form: {
    marginTop: '40px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    border: 'none',
    background: 'transparent',
    borderRadius: 0,
    padding: 0,
    boxShadow: 'none',
  },
googleButton: {
  padding: '12px 32px',
  fontSize: '1.2rem',
  borderRadius: '6px',
  border: 'none',
  background: '#fff',
  color: '#343434',
  fontWeight: 'bold',
  cursor: 'pointer',
  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  marginTop: '10px',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  transition: 'box-shadow 0.2s',
},
}