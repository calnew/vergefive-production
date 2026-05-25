import { cleanLimited, getAuth, json, readJson, requireSameOrigin } from '../../_lib/auth.js';

export async function onRequestGet(context) {
  const auth = context.data.auth || await getAuth(context.request, context.env);
  if (!auth) return json({ error: 'Login required.' }, 401);
  const profile = await context.env.DB.prepare('select * from business_profiles where user_id = ?').bind(auth.user.id).first();
  return json({ profile: profile || {} });
}

export async function onRequestPut(context) {
  const originError = requireSameOrigin(context);
  if (originError) return originError;
  const auth = context.data.auth || await getAuth(context.request, context.env);
  if (!auth) return json({ error: 'Login required.' }, 401);
  const input = await readJson(context.request);
  const profile = {
    businessName: cleanLimited(input.businessName, 160),
    tradeName: cleanLimited(input.tradeName, 160),
    entityType: cleanLimited(input.entityType, 80),
    formationState: cleanLimited(input.formationState, 80),
    ein: cleanLimited(input.ein, 80),
    industry: cleanLimited(input.industry, 120),
    phone: cleanLimited(input.phone, 60),
    address: cleanLimited(input.address, 240),
    website: cleanLimited(input.website, 180),
    email: cleanLimited(input.email, 180),
    bank: input.bank ? 1 : 0,
    directory411: input.directory411 ? 1 : 0,
    bureauProfile: input.bureauProfile ? 1 : 0,
    vendorTradelines: input.vendorTradelines ? 1 : 0,
    fundingReserve: input.fundingReserve ? 1 : 0
  };
  await context.env.DB.prepare(
    `insert into business_profiles
      (user_id, business_name, trade_name, entity_type, formation_state, ein, industry, phone, address, website, email, bank, directory_411, bureau_profile, vendor_tradelines, funding_reserve, updated_at)
     values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime("now"))
     on conflict(user_id) do update set
      business_name = excluded.business_name,
      trade_name = excluded.trade_name,
      entity_type = excluded.entity_type,
      formation_state = excluded.formation_state,
      ein = excluded.ein,
      industry = excluded.industry,
      phone = excluded.phone,
      address = excluded.address,
      website = excluded.website,
      email = excluded.email,
      bank = excluded.bank,
      directory_411 = excluded.directory_411,
      bureau_profile = excluded.bureau_profile,
      vendor_tradelines = excluded.vendor_tradelines,
      funding_reserve = excluded.funding_reserve,
      updated_at = datetime("now")`
  ).bind(
    auth.user.id,
    profile.businessName,
    profile.tradeName,
    profile.entityType,
    profile.formationState,
    profile.ein,
    profile.industry,
    profile.phone,
    profile.address,
    profile.website,
    profile.email,
    profile.bank,
    profile.directory411,
    profile.bureauProfile,
    profile.vendorTradelines,
    profile.fundingReserve
  ).run();
  return json({ ok: true });
}
