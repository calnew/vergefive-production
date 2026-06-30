import type { DefaultSession } from "next-auth";
import type { Entitlement } from "@/lib/entitlement";

declare module "next-auth" {
  interface User {
    id: string;
    entitlement: Entitlement;
  }

  interface Session {
    user: {
      id: string;
      entitlement: Entitlement;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    entitlement?: Entitlement;
  }
}
