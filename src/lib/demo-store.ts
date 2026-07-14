import { promises as fs } from "node:fs";
import path from "node:path";
import { contacts as baseContacts } from "@/data/mock-data";
import { Contact, TagSummary } from "@/lib/types";

type DemoActivity = Contact["activities"][number] & {
  contactId: string;
};

type DemoState = {
  contacts: Contact[];
  tags: string[];
  activities: DemoActivity[];
};

const demoStorePath = path.join(process.cwd(), ".demo-store.json");

function defaultState(): DemoState {
  return {
    contacts: [],
    tags: [],
    activities: [],
  };
}

async function ensureDemoStore() {
  try {
    await fs.access(demoStorePath);
  } catch {
    await fs.writeFile(demoStorePath, JSON.stringify(defaultState(), null, 2), "utf8");
  }
}

export async function readDemoState(): Promise<DemoState> {
  await ensureDemoStore();
  const raw = await fs.readFile(demoStorePath, "utf8");

  try {
    return { ...defaultState(), ...(JSON.parse(raw) as Partial<DemoState>) };
  } catch {
    return defaultState();
  }
}

export async function writeDemoState(state: DemoState) {
  await fs.writeFile(demoStorePath, JSON.stringify(state, null, 2), "utf8");
}

export async function addDemoTag(name: string) {
  const state = await readDemoState();
  if (!state.tags.includes(name)) {
    state.tags.push(name);
    await writeDemoState(state);
  }
}

export async function addDemoContact(contact: Contact) {
  const state = await readDemoState();
  state.contacts = [contact, ...state.contacts.filter((item) => item.id !== contact.id)];
  await writeDemoState(state);
}

export async function addDemoActivity(activity: DemoActivity) {
  const state = await readDemoState();
  state.activities = [activity, ...state.activities];
  await writeDemoState(state);
}

export async function getDemoContacts(): Promise<Contact[]> {
  const state = await readDemoState();

  return [...state.contacts, ...baseContacts].map((contact) => ({
    ...contact,
    activities: [
      ...state.activities
        .filter((item) => item.contactId === contact.id)
        .map((item) => {
          const { contactId, ...activity } = item;
          void contactId;
          return activity;
        })
        .sort((a, b) => a.date.localeCompare(b.date)),
      ...contact.activities,
    ],
    tags: [...new Set(contact.tags)],
  }));
}

export async function getDemoTagSummaries(): Promise<TagSummary[]> {
  const contacts = await getDemoContacts();
  const state = await readDemoState();
  const counts = new Map<string, number>();

  [...state.tags, ...contacts.flatMap((contact) => contact.tags)].forEach((tag) => {
    counts.set(tag, (counts.get(tag) ?? 0) + 1);
  });

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "ja"));
}
