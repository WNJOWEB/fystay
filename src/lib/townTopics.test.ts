import { describe, expect, it } from "vitest";
import type { LocalPlace } from "@prisma/client";
import { composeTopicEntries, estimateTopicEntries, findTopic, isIndexableTopic, MAX_LOCAL_ENTRIES, MIN_INDEXABLE_ENTRIES, TOWN_TOPICS } from "./townTopics";
import { LOCAL_GUIDES } from "./localGuide";

const place = (over: Partial<LocalPlace>): LocalPlace =>
  ({ id: "p", name: "Place", category: "RESTAURANT", website: null, openingHours: null, address: null, dogFriendly: null, ...over }) as LocalPlace;

describe("town topics", () => {
  it("has unique slugs", () => {
    expect(new Set(TOWN_TOPICS.map((t) => t.slug)).size).toBe(TOWN_TOPICS.length);
  });

  it("lists curated entries first, then live places, without duplicates", () => {
    const eat = findTopic("places-to-eat")!;
    const guide = LOCAL_GUIDES.blackpool;
    const curated = guide.eat[0].name;
    const entries = composeTopicEntries(eat, guide, [
      place({ id: "1", name: curated.toUpperCase() }),
      place({ id: "2", name: "Zed's Kitchen" }),
      place({ id: "3", name: "A Cafe", category: "CAFE" }),
    ]);
    expect(entries[0]).toMatchObject({ name: curated, source: "curated" });
    expect(entries.filter((e) => e.source === "local").map((e) => e.name)).toEqual(["Zed's Kitchen"]);
  });

  it("puts places with a website first and caps the live list", () => {
    const eat = findTopic("places-to-eat")!;
    const many = Array.from({ length: 40 }, (_, i) => place({ id: `${i}`, name: `Spot ${i}`, website: i === 39 ? "https://x.test" : null }));
    const local = composeTopicEntries(eat, LOCAL_GUIDES.blackpool, many).filter((e) => e.source === "local");
    expect(local).toHaveLength(MAX_LOCAL_ENTRIES);
    expect(local[0].name).toBe("Spot 39");
  });

  it("dog-friendly uses the dog-friendly flag, not a category", () => {
    const dog = findTopic("dog-friendly")!;
    const entries = composeTopicEntries(dog, LOCAL_GUIDES.blackpool, [
      place({ id: "1", name: "Dog Park", category: "PARK", dogFriendly: true }),
      place({ id: "2", name: "No Dogs Cafe", category: "CAFE", dogFriendly: false }),
    ]);
    expect(entries.map((e) => e.name)).toContain("Dog Park");
    expect(entries.map((e) => e.name)).not.toContain("No Dogs Cafe");
  });

  it("keeps thin pages out of the index", () => {
    const eat = findTopic("places-to-eat")!;
    expect(isIndexableTopic(eat, MIN_INDEXABLE_ENTRIES - 1)).toBe(false);
    expect(isIndexableTopic(eat, MIN_INDEXABLE_ENTRIES)).toBe(true);
    expect(isIndexableTopic(findTopic("perfect-days")!, 0)).toBe(true);
  });

  it("estimates entries from counts: curated plus capped live places", () => {
    const eat = findTopic("places-to-eat")!;
    const curated = LOCAL_GUIDES.blackpool.eat.length;
    expect(estimateTopicEntries(eat, LOCAL_GUIDES.blackpool, {}, 0)).toBe(curated);
    expect(estimateTopicEntries(eat, LOCAL_GUIDES.blackpool, { RESTAURANT: 100 }, 0)).toBe(curated + MAX_LOCAL_ENTRIES);
    expect(estimateTopicEntries(findTopic("dog-friendly")!, LOCAL_GUIDES.blackpool, { PARK: 50 }, 4)).toBe(LOCAL_GUIDES.blackpool.dogFriendly.length + 4);
  });
});
