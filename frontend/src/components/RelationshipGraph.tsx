import React from "react";
import ForceGraph2D from "react-force-graph-2d";

export function RelationshipGraph({ items = [], selectedItem }) {
  // יצירת קשרים בין פריטים על בסיס tags משותפים
  const createRelationships = (items) => {
    const links = [];
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const tags1 = items[i].tags.map((tag) => tag.text);
        const tags2 = items[j].tags.map((tag) => tag.text);
        const commonTags = tags1.filter((tag) => tags2.includes(tag));

        if (commonTags.length > 0) {
          links.push({
            source: items[i].id,
            target: items[j].id,
            strength: commonTags.length, // עוצמת הקשר
          });
        }
      }
    }
    return links;
  };

  const relationships = createRelationships(items);

  // יצירת מבנה הנתונים לגרף
  const data = {
    nodes: items.map((item) => ({
      id: item.id,
      name: item.title,
      classification: item.classification,
      color: "#A7C7E7",
    })),
    links: relationships,
  };

  // סינון נתונים אם פריט נבחר
  const filteredData = selectedItem
    ? {
        nodes: data.nodes.filter(
          (node) =>
            node.id === selectedItem.id ||
            data.links.some((link) => link.source === node.id || link.target === node.id)
        ),
        links: data.links.filter(
          (link) => link.source === selectedItem.id || link.target === selectedItem.id
        ),
      }
    : data;

  return (
    <div className="h-96 bg-white rounded-lg shadow-md p-4">
      <ForceGraph2D
        graphData={filteredData}
        width={window.innerWidth * 0.8}
        height={window.innerHeight * 0.6}
        nodeLabel={(node) => `${node.name} (${node.classification})`}
        nodeColor={(node) => (node.id === selectedItem?.id ? "red" : node.color)}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = `${node.name}`;
          const fontSize = 12 / globalScale;
          ctx.fillStyle = node.id === selectedItem?.id ? "red" : node.color;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 8, 0, 2 * Math.PI, false);
          ctx.fill();
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.fillStyle = "black";
          ctx.fillText(label, node.x + 10, node.y + 4);
        }}
        linkColor={() => "rgba(0, 0, 0, 0.2)"}
        linkWidth={(link) => link.strength}
        linkDirectionalParticles={(link) => (link.strength > 1 ? 4 : 0)}
        linkDirectionalParticleSpeed={0.01}
        enableNodeDrag={false}
        d3AlphaDecay={0.05}
      />
    </div>
  );
}
