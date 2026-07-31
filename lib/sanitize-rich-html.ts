import sanitizeHtml from "sanitize-html";

const RICH_TEXT_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "del",
  "mark",
  "small",
  "sub",
  "sup",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "blockquote",
  "ul",
  "ol",
  "li",
  "a",
  "table",
  "thead",
  "tbody",
  "tfoot",
  "tr",
  "th",
  "td",
  "caption",
  "colgroup",
  "col",
  "img",
  "figure",
  "figcaption",
  "hr",
  "pre",
  "code",
] as const;

const HEADING_ATTRIBUTES = ["id"];

const RICH_TEXT_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [...RICH_TEXT_TAGS],
  allowedAttributes: {
    a: [
      "href",
      "title",
      { name: "target", values: ["_blank", "_self"] },
      {
        name: "rel",
        multiple: true,
        values: ["noopener", "noreferrer", "nofollow", "ugc", "sponsored"],
      },
    ],
    blockquote: ["cite"],
    h1: HEADING_ATTRIBUTES,
    h2: HEADING_ATTRIBUTES,
    h3: HEADING_ATTRIBUTES,
    h4: HEADING_ATTRIBUTES,
    h5: HEADING_ATTRIBUTES,
    h6: HEADING_ATTRIBUTES,
    img: [
      "src",
      "alt",
      "title",
      "width",
      "height",
      { name: "loading", values: ["lazy", "eager"] },
      { name: "decoding", values: ["async", "sync", "auto"] },
    ],
    ol: ["start", "type"],
    li: ["value"],
    th: [
      "colspan",
      "rowspan",
      { name: "scope", values: ["row", "col", "rowgroup", "colgroup"] },
    ],
    td: ["colspan", "rowspan"],
    col: ["span"],
    colgroup: ["span"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: {
    a: ["http", "https", "mailto", "tel"],
    blockquote: ["http", "https"],
    img: ["http", "https"],
  },
  allowedSchemesAppliedToAttributes: ["href", "src", "cite"],
  allowProtocolRelative: false,
  disallowedTagsMode: "discard",
  nonTextTags: ["script", "style", "textarea", "option", "noscript"],
  parseStyleAttributes: false,
  nestingLimit: 50,
  transformTags: {
    a: (tagName, attributes) => {
      if (attributes.target !== "_blank") {
        return { tagName, attribs: attributes };
      }

      const relValues = new Set(
        (attributes.rel ?? "").split(/\s+/).filter(Boolean),
      );
      relValues.add("noopener");
      relValues.add("noreferrer");

      return {
        tagName,
        attribs: {
          ...attributes,
          rel: [...relValues].join(" "),
        },
      };
    },
  },
  exclusiveFilter: (frame) => frame.tag === "img" && !frame.attribs.src,
};

/**
 * Keeps useful editorial markup while removing executable or unsafe HTML.
 */
export function sanitizeRichHtml(untrustedHtml: string): string {
  return sanitizeHtml(untrustedHtml, RICH_TEXT_OPTIONS);
}
