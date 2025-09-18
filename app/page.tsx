
import { signIn } from "@/auth"
 
export default function SignIn() {
  return (
    <div>
      <div style={styles.body}>
        <div style={styles.header}>
          <img src="/STARRLogoWhite.png" alt="STARR Logo" style={styles.logo} />
          <div style={styles.title}>UASTARR<br/> MANAGEMENT</div>
        </div>

        {/* <div style={styles.inputBoxes}>
          <input 
            type="text"
            name="name"
            placeholder="username"
            style={styles.inputs}/>
          <input 
            type="password"
            name="password"
            placeholder="password"
            style={styles.inputs}/>

        </div> */}

        <form
        action={async () => {
          "use server"
          await signIn("google")
        }}
        style={styles.form}
      >
  <button type="submit" style={styles.googleButton}>Signin with Google</button>
      </form>
      </div>
    </div>
  )
} 

// export default function Home() {
//   return (
//     <div style={styles.body}>
//       <div style={styles.header}>
        {/* <img src="/STARRLogoWhite.png" alt="STARR Logo" style={styles.logo} />
        <div style={styles.title}>UASTARR<br/> MANAGEMENT</div>
      </div>

      <div style={styles.inputBoxes}>
        <input 
          type="text"
          name="name"
          placeholder="username"
          style={styles.inputs}/>
        <input 
          type="password"
          name="password"
          placeholder="password"
          style={styles.inputs}/>
      </div>


    </div>
  );
} */}

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
    border: '2px solid #4285F4',
    background: '#fff',
    borderRadius: '8px',
    padding: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
  },
googleButton: {
  padding: '12px 32px',
  fontSize: '1.2rem',
  borderRadius: '6px',
  border: 'none',
  background: '#4285F4',
  color: '#fff',
  fontWeight: 'bold',
  cursor: 'pointer',
  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  marginTop: '10px',
},
}