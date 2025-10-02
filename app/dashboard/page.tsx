import { auth } from "@/auth";

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
		<img src="/user.svg" alt="Members" style={styles.icon}/>
		<hr style={styles.divider}/>
		<img src="/image.svg" alt="images" style={styles.icon}/>
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
  },
  greeting: {
    color: 'white',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: '6vh',
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%',
  },
  menu: {
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    width: '100%',
  },
  icon: {
    width: '120px',
    height: '120px',
    margin: '20px 0',
  },
  divider: {
    borderTop: "3px solid #bbb",
    width: "80%",
    margin: "20px 0"
  }
};



