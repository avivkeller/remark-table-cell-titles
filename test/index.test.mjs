import { remark } from "remark";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";
import dedent from "dedent";
import { describe, it, expect } from "vitest";

import remarkTableCellTitles from "../index.mjs";

describe("remarkTableCellTitles", () => {
  const process = async (markdown, options = {}) => {
    const result = await remark()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkTableCellTitles, options)
      .use(remarkHtml, { sanitize: false })
      .process(markdown);

    return result.toString();
  };

  it("adds data-title attributes to table cells", async () => {
    const input = dedent`
      | Header 1 | Header 2 |
      | -------- | -------- |
      | Cell 1   | Cell 2   |
      | Cell 3   | Cell 4   |
    `;

    const output = await process(input);
    expect(output).toContain('<td data-title="Header 1">Cell 1</td>');
    expect(output).toContain('<td data-title="Header 2">Cell 2</td>');
    expect(output).toContain('<td data-title="Header 1">Cell 3</td>');
    expect(output).toContain('<td data-title="Header 2">Cell 4</td>');
  });

  it("uses custom attribute name when specified", async () => {
    const input = dedent`
      | Header 1 | Header 2 |
      | -------- | -------- |
      | Cell 1   | Cell 2   |
    `;

    const output = await process(input, { attributeName: "data-header" });
    expect(output).toContain('<td data-header="Header 1">Cell 1</td>');
    expect(output).toContain('<td data-header="Header 2">Cell 2</td>');
  });

  it("skips empty headers when skipEmptyHeaders is true", async () => {
    const input = dedent`
      | Header 1 |  |
      | -------- | -------- |
      | Cell 1   | Cell 2   |
    `;

    const output = await process(input, { skipEmptyHeaders: true });
    expect(output).toContain('<td data-title="Header 1">Cell 1</td>');
    expect(output).not.toContain('data-title=""');
  });

  it("applies headerTransform function to header text", async () => {
    const input = dedent`
      | Header 1 | Header 2 |
      | -------- | -------- |
      | Cell 1   | Cell 2   |
    `;

    const output = await process(input, {
      headerTransform: (node) =>
        node.children[0].value.toLowerCase().replace(/\s+/g, "-"),
    });

    expect(output).toContain('<td data-title="header-1">Cell 1</td>');
    expect(output).toContain('<td data-title="header-2">Cell 2</td>');
  });

  it("handles tables with no body rows", async () => {
    const input = dedent`
      | Header 1 | Header 2 |
      | -------- | -------- |
    `;

    const output = await process(input);
    expect(output).not.toContain("data-title");
  });

  it("handles tables with no headers", async () => {
    const input = dedent`
      | | |
      | - | - |
      | Cell 1 | Cell 2 |
    `;

    const output = await process(input);
    expect(output).toContain('<td data-title="">Cell 1</td>');
    expect(output).toContain('<td data-title="">Cell 2</td>');
  });

  it("handles complex header content with formatting", async () => {
    const input = dedent`
      | **Bold Header** | *Italic Header* |
      | --------------- | --------------- |
      | Cell 1          | Cell 2          |
    `;

    const output = await process(input);
    expect(output).toContain('<td data-title="Bold Header">Cell 1</td>');
    expect(output).toContain('<td data-title="Italic Header">Cell 2</td>');
  });

  it("handles header content with links", async () => {
    const input = dedent`
      | [Link Header](https://example.com) | Plain Header |
      | ---------------------------------- | ------------ |
      | Cell 1                             | Cell 2       |
    `;

    const output = await process(input);
    expect(output).toContain('<td data-title="Link Header">Cell 1</td>');
    expect(output).toContain('<td data-title="Plain Header">Cell 2</td>');
  });
});
