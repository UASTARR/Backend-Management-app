import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/drive.readonly'
        }
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
  if (account?.access_token) {
    token.accessToken = account.access_token;
  }
  if (profile) {
    token.name = profile.name;
  }
  return token;
},
    async session({ session, token }) {
  if (token) {
    session.user.name = token.name;
    // @ts-ignore
    session.accessToken = token.accessToken;
  }
  return session;
}
  }
})