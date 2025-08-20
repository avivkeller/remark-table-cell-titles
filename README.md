# remark-table-cell-titles

A [remark](https://github.com/remarkjs/remark) plugin that adds `data-title` attributes to table cells in Markdown tables. This makes tables more accessible for responsive designs where table headers can be displayed as labels on small screens.

## Installation

```bash
npm install remark-table-cell-titles
```

## Usage

```js
import { remark } from "remark";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";
import remarkTableCellTitles from "remark-table-cell-titles";

const markdown = `
| Header 1 | Header 2 |
| -------- | -------- |
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |
`;

// Basic usage
const result = await remark()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkTableCellTitles)
  .use(remarkHtml, { sanitize: false })
  .process(markdown);

console.log(result.toString());
// Output will contain:
// <td data-title="Header 1">Cell 1</td>
// <td data-title="Header 2">Cell 2</td>
// <td data-title="Header 1">Cell 3</td>
// <td data-title="Header 2">Cell 4</td>
```

## Configuration Options

The plugin accepts several configuration options:

```js
remark().use(remarkTableCellTitles, {
  attributeName: "data-title", // Custom attribute name
  skipEmptyHeaders: false, // Skip adding attributes for empty headers
  headerTransform: (node) => toString(node), // Transform header node before using as attribute
});
```

### attributeName

Type: `string`  
Default: `'data-title'`

Custom attribute name to use instead of `data-title`.

```js
remark().use(remarkTableCellTitles, { attributeName: "data-header" });
```

This will generate: `<td data-header="Header 1">Cell 1</td>`

### skipEmptyHeaders

Type: `boolean`  
Default: `false`

Skip adding attributes for cells that correspond to empty headers.

```js
remark().use(remarkTableCellTitles, { skipEmptyHeaders: true });
```

### headerTransform

Type: `Function`  
Default: `(node) => toString(text)`

Transform header text before using it as an attribute value.

```js
remark().use(remarkTableCellTitles, {
  headerTransform: (node) =>
    node.children[0].value.toLowerCase().replace(/\s+/g, "-"),
});
```

This will generate: `<td data-title="header-1">Cell 1</td>`

## Complex Header Support

The plugin properly handles complex header content including:

- Formatted text (bold, italic, etc.)
- Links
- Other inline elements

For example, with this markdown:

```markdown
| **Bold Header** | [Link Header](https://example.com) |
| --------------- | ---------------------------------- |
| Cell 1          | Cell 2                             |
```

The plugin will extract the text content from the complex header elements:

```html
<td data-title="Bold Header">Cell 1</td>
<td data-title="Link Header">Cell 2</td>
```

## CSS Usage Example

This plugin is particularly useful for responsive tables. Here's an example CSS implementation:

```css
@media screen and (max-width: 600px) {
  table {
    border: 0;
  }

  table thead {
    display: none;
  }

  table tr {
    display: block;
    margin-bottom: 0.5em;
    border: 1px solid #ddd;
  }

  table td {
    display: block;
    text-align: right;
    border-bottom: 1px solid #ddd;
    padding-left: 50%;
    position: relative;
  }

  table td:before {
    content: attr(data-title);
    position: absolute;
    left: 6px;
    font-weight: bold;
  }
}
```

## License

MIT
