import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Redirect to field-tech page after signin
      if (url.startsWith('/')) return `${baseUrl}/wise-hvac-demo${url}`;
      return baseUrl;
    },
  },
});

export { handler as GET, handler as POST };
