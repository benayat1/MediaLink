import { useState, useCallback } from "react";
import { AnalyzedItem, Relationship } from "../types";

export function useItems() {
  const [items, setItems] = useState<AnalyzedItem[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);

  // Fetch items from the server
  const fetchItems = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:8000/items");
      if (response.ok) {
        const data: AnalyzedItem[] = await response.json();
        setItems(data);
      } else {
        console.error("Failed to fetch items");
      }
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  }, []);

  const addItem = useCallback(
    (newItem: Omit<AnalyzedItem, "id" | "dateAnalyzed">) => {
      const id = (items.length + 1).toString();
      const item: AnalyzedItem = {
        ...newItem,
        id,
        dateAnalyzed: new Date().toISOString(),
      };
      setItems((prev) => [...prev, item]);
      return item;
    },
    [items]
  );

  const addRelationship = useCallback(
    (source: string, target: string) => {
      const sourceItem = items.find((item) => item.id === source);
      const targetItem = items.find((item) => item.id === target);

      if (!sourceItem || !targetItem) return;

      const commonTags = sourceItem.tags.filter((tag) =>
        targetItem.tags.some((t) => t.text === tag.text)
      );
      const strength =
        commonTags.length /
        Math.max(sourceItem.tags.length, targetItem.tags.length);

      const relationship: Relationship = {
        source,
        target,
        strength,
        commonTags,
      };

      setRelationships((prev) => [...prev, relationship]);
    },
    [items]
  );

  return {
    items,
    relationships,
    fetchItems,
    addItem,
    setItems,
    addRelationship,
  };
}
