import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return null;

  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      entitlement: true,
      stripeCustomerId: true,
    },
  });
}

export async function getEntitlement() {
  const user = await getCurrentUser();
  return user?.entitlement ?? "free";
}