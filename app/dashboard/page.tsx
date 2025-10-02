import { auth } from "@/auth";
import Link from "next/link";

export default async function Dashboard() {
  const session = await auth();

  return (
    <div style={styles.body}>
      {session?.user?.name ? (
        <div style={styles.greeting}>Welcome {session.user.name}</div>
      ) : (
        <p>Welcome, guest</p>
      )}

      <div style={styles.menu}>
        <Link href={'/members'} style={styles.option}>
            <img src="/user.svg" alt="Members" style={styles.icon}/>
            <div style={{textAlign: 'center', fontWeight: 'bold', fontFamily: 'monospace',}}>Members</div>
        </Link>
        <hr style={styles.divider}/>
        <Link href={'/photos'}>
            <img src="/image.svg" alt="images" style={styles.icon}/>
            <div style={{textAlign: 'center', fontWeight: 'bold', fontFamily: 'monospace',}}>Members</div>
        </Link>
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
    justifyContent: 'space-between'
  },
  greeting: {
    color: 'white',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: '6vh',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  menu: {
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    width: '100%',
  },
  option: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  icon: {
    width: '120px',
    height: '120px',
    margin: '20px 0',
  },
  divider: {
    borderTop: "3px solid #bbb",
    width: "30%",
    margin: "20px 0"
  }
};



