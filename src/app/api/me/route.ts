import { NextResponse } from 'next/server';

import { db } from '@/db';
import { userTable } from '@/db/schema';
import { requireAuth } from '@/lib/auth-middleware';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const userId = await requireAuth();
    if (!userId) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const [user] = await db.select().from(userTable).where(eq(userTable.id, userId));
    if (!user) return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });

    // Return only safe user fields
    const safe = {
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: (user as any).isAdmin ?? false,
    };

    return NextResponse.json({ ok: true, user: safe });
  } catch (err) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
}
