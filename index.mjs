import { visit } from "unist-util-visit";
import { toString } from "mdast-util-to-string";

/**
 * remark-table-cell-titles
 *
 * Adds `data-title="<header>"` to each <td> in markdown tables,
 * where <header> is taken from the corresponding <th>.
 *
 * @param {Object} options - Configuration options
 * @param {string} [options.attributeName='data-title'] - Custom attribute name to use instead of data-title
 * @param {boolean} [options.skipEmptyHeaders=false] - Skip adding attributes for empty headers
 * @param {function(import('mdast').TableCell): string} [options.headerTransform] - Optional function to transform header text before using as attribute.
 */
export default function remarkTableCellTitles(options = {}) {
  const {
    attributeName = "data-title",
    skipEmptyHeaders = false,
    headerTransform = (node) => toString(node),
  } = options;

  return (tree) => {
    visit(tree, "table", (tableNode) => {
      if (!tableNode.children?.length) return;

      // Assume first row is header (as per GFM tables)
      const headerRow = tableNode.children[0];
      if (headerRow?.type !== "tableRow") return;

      // Extract header text for each column using mdast-util-to-string
      // This properly handles complex header content with nested elements
      const headers = headerRow.children.map((cell) => headerTransform(cell));

      // Apply data-title to each cell in body rows
      tableNode.children.slice(1).forEach((row) => {
        if (row.type !== "tableRow") return;

        row.children.forEach((cell, colIndex) => {
          const headerText = headers[colIndex] || "";

          // Skip if header is empty and skipEmptyHeaders is true
          if (skipEmptyHeaders && !headerText) return;

          // Ensure data and hProperties objects exist
          cell.data = cell.data || {};
          cell.data.hProperties = cell.data.hProperties || {};

          // Set the attribute
          cell.data.hProperties[attributeName] = headerText;
        });
      });
    });
  };
}
