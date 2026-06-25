const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = "demo@vergefive.com";
  const passwordHash = await hash("VergeFiveDemo123!", 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name: "QA Paid Path",
      entitlement: "self_serve",
      passwordHash,
    },
    create: {
      email,
      name: "QA Paid Path",
      passwordHash,
      entitlement: "self_serve",
    },
  });

  await prisma.business.deleteMany({ where: { userId: user.id } });

  await prisma.business.create({
    data: {
      userId: user.id,
      name: "TurnCom 360 LLC",
      entityType: "LLC",
      address: "Henderson, NC 27536",
      phone: "(252) 555-0148",
      website: "https://turncom360.com",
      email: "qa@turncom360.com",
      scans: {
        create: {
          readinessScore: 56,
          grade: "Fair",
          signalsTotal: 9,
          signalsClean: 5,
          issues: {
            create: [
              {
                key: "phones",
                title: "Phone signal mismatch",
                detail: "The public phone signal does not consistently match the business profile and directory records.",
                severity: "high",
                impactRank: 1,
                status: "todo",
              },
              {
                key: "email",
                title: "Free email as primary contact",
                detail: "The primary contact email should use the business domain instead of a free email provider.",
                severity: "high",
                impactRank: 2,
                status: "todo",
              },
              {
                key: "address",
                title: "Address inconsistency",
                detail: "The business address is not consistent across public records, directories, and application-ready profile data.",
                severity: "high",
                impactRank: 3,
                status: "todo",
              },
              {
                key: "bank-rating",
                title: "Bank rating below Low-5",
                detail: "The current banking signal is below the Low-5 readiness target for stronger account reviews.",
                severity: "med",
                impactRank: 4,
                status: "todo",
              },
            ],
          },
          accountMatches: {
            create: [
              {
                name: "Crown Office Supplies",
                category: "vendor_net30",
                tier: "ready",
                reason: "Starter vendor account that fits the current readiness profile after the core identity fixes are tracked.",
                faceBg: "from-[#0E1A2B] via-[#1F6AA5] to-[#3DB7C8]",
              },
              {
                name: "Uline",
                category: "vendor_net30",
                tier: "ready",
                reason: "Net 30 vendor path with simple setup requirements and useful payment-history potential.",
                faceBg: "from-[#0E1A2B] via-[#174EA6] to-[#2563EB]",
              },
              {
                name: "BofA Secured",
                category: "secured_card",
                tier: "ready",
                reason: "Secured business card option that can fit early-stage credit-building when cash collateral is available.",
                faceBg: "from-[#0E1A2B] via-[#466AA8] to-[#D8E4F2]",
              },
              {
                name: "Capital One Spark",
                category: "credit_card",
                tier: "unlock_next",
                reason: "Useful business card path once identity, contact, and bank signals are stronger.",
                unlockReason: "Complete phone, address, domain email, and bank-rating fixes before applying.",
                faceBg: "from-[#0E1A2B] via-[#B33448] to-[#E37A4A]",
              },
              {
                name: "Amazon Business Amex",
                category: "credit_card",
                tier: "unlock_next",
                reason: "Good fit after the company profile shows cleaner public consistency and stronger readiness signals.",
                unlockReason: "Resolve high-impact identity issues and improve banking readiness first.",
                faceBg: "from-[#0E1A2B] via-[#186CA3] to-[#F59E0B]",
              },
              {
                name: "Chase Ink",
                category: "credit_card",
                tier: "unlock_next",
                reason: "Higher-value business credit path that should wait until readiness is cleaner.",
                unlockReason: "Finish the high-impact fixes and reach the next readiness threshold before applying.",
                faceBg: "from-[#0E1A2B] via-[#143A72] to-[#2563EB]",
              },
            ],
          },
        },
      },
    },
  });

  console.log("Seeded demo user:", email);
  console.log("Demo password: VergeFiveDemo123!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
