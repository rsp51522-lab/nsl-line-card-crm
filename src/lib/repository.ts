import { aiSuggestions, contacts as mockContacts, dashboardMetrics, quickActions, searchableFields, todayTasks } from "@/data/mock-data";
import { Contact, DashboardMetrics, TagSummary } from "@/lib/types";
import { createSupabaseServerClient, getBusinessCardPublicUrl, hasSupabaseEnv } from "@/lib/supabase";

type SearchFilters = {
  query?: string;
  tag?: string;
  businessCategory?: string;
  followUpOnly?: boolean;
};

function stringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function matchesFilters(contact: Contact, filters: SearchFilters) {
  const q = filters.query?.trim().toLowerCase();
  const inQuery =
    !q ||
    [
      contact.companyName,
      contact.personName,
      contact.address,
      contact.businessCategory,
      contact.referrer,
      contact.memo,
      contact.tags.join(" "),
    ]
      .join(" ")
      .toLowerCase()
      .includes(q);

  const inTag = !filters.tag || contact.tags.includes(filters.tag);
  const inCategory = !filters.businessCategory || contact.businessCategory === filters.businessCategory;
  const followUpOk = !filters.followUpOnly || contact.followUpStatus !== "completed";

  return inQuery && inTag && inCategory && followUpOk;
}

function aggregateTags(items: Contact[]): TagSummary[] {
  const counts = new Map<string, number>();

  items.forEach((contact) => {
    contact.tags.forEach((tag) => {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    });
  });

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "ja"));
}

async function getDemoContactsFromStore() {
  const { getDemoContacts } = await import("@/lib/demo-store");
  return getDemoContacts();
}

async function getDemoTagSummariesFromStore() {
  const { getDemoTagSummaries } = await import("@/lib/demo-store");
  return getDemoTagSummaries();
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  if (!hasSupabaseEnv()) return dashboardMetrics;

  try {
    const supabase = createSupabaseServerClient();
    const today = new Date().toISOString().slice(0, 10);
    const monthStart = today.slice(0, 8) + "01";

    const [
      totalRes,
      todayRes,
      monthRes,
      followRes,
      visitRes,
      dueTodayRes,
      ocrPendingRes,
    ] = await Promise.all([
      supabase.from("contacts").select("*", { count: "exact", head: true }).is("deleted_at", null),
      supabase.from("contacts").select("*", { count: "exact", head: true }).eq("first_registered_at", today).is("deleted_at", null),
      supabase.from("contacts").select("*", { count: "exact", head: true }).gte("first_registered_at", monthStart).is("deleted_at", null),
      supabase.from("contacts").select("*", { count: "exact", head: true }).in("follow_up_status", ["scheduled", "due_today", "overdue"]).is("deleted_at", null),
      supabase.from("contacts").select("*", { count: "exact", head: true }).eq("next_follow_up_type", "訪問").is("deleted_at", null),
      supabase.from("contacts").select("*", { count: "exact", head: true }).eq("next_follow_up_date", today).is("deleted_at", null),
      supabase.from("ocr_jobs").select("*", { count: "exact", head: true }).eq("status", "pending"),
    ]);

    return {
      totalCards: totalRes.count ?? 0,
      todayRegistered: todayRes.count ?? 0,
      monthRegistered: monthRes.count ?? 0,
      needFollowUp: followRes.count ?? 0,
      nextVisits: visitRes.count ?? 0,
      dueToday: dueTodayRes.count ?? 0,
      unreadThanks: 0,
      ocrPending: ocrPendingRes.count ?? 0,
    };
  } catch {
    return dashboardMetrics;
  }
}

export async function getContacts(filters: SearchFilters = {}): Promise<Contact[]> {
  if (!hasSupabaseEnv()) {
    const contacts = await getDemoContactsFromStore();
    return contacts.filter((contact) => matchesFilters(contact, filters));
  }

  try {
    const supabase = createSupabaseServerClient();
    let query = supabase
      .from("contacts")
      .select(
        `
          id,
          company_name,
          person_name,
          department,
          position,
          postal_code,
          address,
          email,
          phone,
          mobile_phone,
          fax,
          website_url,
          instagram_url,
          line_id_or_url,
          facebook_url,
          memo,
          ai_summary,
          customer_rank,
          referrer_name,
          business_category,
          first_registered_at,
          updated_at,
          next_follow_up_date,
          next_follow_up_type,
          follow_up_status,
          business_card_exchanged_at,
          business_card_event_name,
          contact_images (
            side,
            storage_path
          ),
          contact_tags (
            tags ( name )
          )
        `,
      )
      .is("deleted_at", null)
      .order("updated_at", { ascending: false });

    if (filters.query?.trim()) {
      const q = filters.query.trim();
      query = query.or(
        [
          `company_name.ilike.%${q}%`,
          `person_name.ilike.%${q}%`,
          `address.ilike.%${q}%`,
          `business_category.ilike.%${q}%`,
          `referrer_name.ilike.%${q}%`,
        ].join(","),
      );
    }

    if (filters.businessCategory) query = query.eq("business_category", filters.businessCategory);
    if (filters.followUpOnly) query = query.in("follow_up_status", ["scheduled", "due_today", "overdue"]);

    const { data, error } = await query;
    if (error || !data) return mockContacts.filter((contact) => matchesFilters(contact, filters));

    const mapped: Contact[] = (data as Array<Record<string, unknown>>).map((row) => {
      const imageRows = Array.isArray(row.contact_images)
        ? row.contact_images as Array<{ side?: string; storage_path?: string }>
        : [];

      const frontImagePath = imageRows.find((item) => item.side === "front")?.storage_path ?? "";
      const backImagePath = imageRows.find((item) => item.side === "back")?.storage_path ?? "";

      return {
        id: stringValue(row.id),
        companyName: stringValue(row.company_name),
        personName: stringValue(row.person_name),
        department: stringValue(row.department),
        position: stringValue(row.position),
        postalCode: stringValue(row.postal_code),
        address: stringValue(row.address),
        email: stringValue(row.email),
        phone: stringValue(row.phone),
        mobilePhone: stringValue(row.mobile_phone),
        fax: stringValue(row.fax),
        websiteUrl: stringValue(row.website_url),
        instagramUrl: stringValue(row.instagram_url),
        lineUrl: stringValue(row.line_id_or_url),
        facebookUrl: stringValue(row.facebook_url),
        memo: stringValue(row.memo),
        aiSummary: typeof row.ai_summary === "string" ? row.ai_summary.split("\n").filter(Boolean) : [],
        tags:
          Array.isArray(row.contact_tags)
            ? row.contact_tags.flatMap((item) => {
                const nested = item as { tags?: { name?: string } | { name?: string }[] };
                if (Array.isArray(nested.tags)) {
                  return nested.tags.flatMap((tag) => (tag?.name ? [tag.name] : []));
                }
                return nested.tags?.name ? [nested.tags.name] : [];
              })
            : [],
        customerRank: (row.customer_rank ?? 3) as Contact["customerRank"],
        referrer: stringValue(row.referrer_name),
        businessCategory: stringValue(row.business_category),
        firstRegisteredAt: stringValue(row.first_registered_at),
        updatedAt: stringValue(row.updated_at).slice(0, 10),
        nextFollowUpDate: stringValue(row.next_follow_up_date),
        nextFollowUpType: stringValue(row.next_follow_up_type),
        followUpStatus: (row.follow_up_status ?? "scheduled") as Contact["followUpStatus"],
        exchangedAt: stringValue(row.business_card_exchanged_at),
        eventName: stringValue(row.business_card_event_name),
        frontImageLabel: frontImagePath ? "表面あり" : "表面未登録",
        backImageLabel: backImagePath ? "裏面あり" : "裏面未登録",
        frontImageUrl: frontImagePath ? getBusinessCardPublicUrl(frontImagePath) : undefined,
        backImageUrl: backImagePath ? getBusinessCardPublicUrl(backImagePath) : undefined,
        ocrWarnings: [],
        activities: [],
        salesRecords: [],
      };
    });

    return mapped.filter((contact) => matchesFilters(contact, filters));
  } catch {
    return mockContacts.filter((contact) => matchesFilters(contact, filters));
  }
}

export async function getContactById(id: string): Promise<Contact | null> {
  const mockContactsMerged = hasSupabaseEnv() ? mockContacts : await getDemoContactsFromStore();
  const mockMatch = mockContactsMerged.find((contact) => contact.id === id) ?? null;
  if (!hasSupabaseEnv()) return mockMatch;

  try {
    const supabase = createSupabaseServerClient();
    const base = await getContacts();
    const contact = base.find((item) => item.id === id);
    if (!contact) return mockMatch;

    const [activityRes, salesRes, imageRes, ocrRes] = await Promise.all([
      supabase
        .from("activity_logs")
        .select("id, activity_date, activity_type, title, detail, next_action")
        .eq("contact_id", id)
        .order("activity_date", { ascending: true }),
      supabase
        .from("sales_records")
        .select("project_name, contract_amount, order_date, status")
        .eq("contact_id", id)
        .order("order_date", { ascending: false }),
      supabase.from("contact_images").select("side, storage_path").eq("contact_id", id),
      supabase
        .from("ocr_jobs")
        .select("id, ocr_fields(field_name, field_value, confidence)")
        .eq("contact_id", id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    return {
      ...contact,
      frontImageLabel:
        imageRes.data?.some((item) => item.side === "front") ? "表面あり" : "表面未登録",
      backImageLabel:
        imageRes.data?.some((item) => item.side === "back") ? "裏面あり" : "裏面未登録",
      frontImageUrl: getBusinessCardPublicUrl(
        imageRes.data?.find((item) => item.side === "front")?.storage_path ?? "",
      ) || undefined,
      backImageUrl: getBusinessCardPublicUrl(
        imageRes.data?.find((item) => item.side === "back")?.storage_path ?? "",
      ) || undefined,
      activities:
        activityRes.data?.map((item) => ({
          id: item.id,
          date: item.activity_date,
          type: item.activity_type as Contact["activities"][number]["type"],
          title: item.title,
          detail: item.detail ?? "",
          nextAction: item.next_action ?? undefined,
        })) ?? mockMatch?.activities ?? [],
      salesRecords:
        salesRes.data?.map((item) => ({
          projectName: item.project_name,
          amount: Number(item.contract_amount ?? 0),
          orderDate: item.order_date ?? "",
          status: item.status as Contact["salesRecords"][number]["status"],
        })) ?? mockMatch?.salesRecords ?? [],
      ocrWarnings:
        Array.isArray(ocrRes.data?.ocr_fields)
          ? ocrRes.data.ocr_fields
              .filter((field) => Number(field.confidence ?? 1) < 0.8)
              .map((field) => ({
                field: field.field_name ?? "",
                value: field.field_value ?? "",
                confidence: Number(field.confidence ?? 0),
              }))
          : mockMatch?.ocrWarnings ?? [],
    };
  } catch {
    return mockMatch;
  }
}

export async function getTagSummaries(): Promise<TagSummary[]> {
  if (!hasSupabaseEnv()) return getDemoTagSummariesFromStore();
  const items = await getContacts();
  return aggregateTags(items);
}

export async function getSearchMeta() {
  return {
    quickActions,
    aiSuggestions,
    todayTasks,
    searchableFields,
  };
}
