import { prisma } from '@/lib/prisma';
import LoginPicker from '@/components/LoginPicker';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  const users = await prisma.user.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, email: true },
  });

  return (
    <main className="login">
      <h1>Ajaia Docs</h1>
      <p>Choose a demo account to sign in. Switch accounts at any time to test sharing.</p>
      {users.length === 0 ? (
        <div className="error">No users found. Run <code>npm run db:seed</code> to create the demo accounts.</div>
      ) : (
        <LoginPicker users={users} />
      )}
    </main>
  );
}
