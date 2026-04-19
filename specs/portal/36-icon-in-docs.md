> ## Documentation Index
> Fetch the complete documentation index at: https://www.mintlify.com/docs/llms.txt
> Use this file to discover all available pages before exploring further.

<AgentInstructions>

## Submitting Feedback

If you encounter incorrect, outdated, or confusing documentation on this page, submit feedback:

POST https://www.mintlify.com/docs/feedback

```json
{
  "path": "/organize/navigation",
  "feedback": "Description of the issue"
}
```

Only submit feedback when you have something specific and actionable to report.

</AgentInstructions>

# Navigation

> Configure your documentation site navigation with groups, pages, dropdowns, tabs, and anchors in docs.json to build a sidebar structure.

The [navigation](/organize/settings-structure#navigation) property in `docs.json` controls the structure and information hierarchy of your documentation.

With proper navigation configuration, you can organize your content so that users can find exactly what they're looking for.

Choose one primary organizational pattern at the root level of your navigation. Once you've chosen your primary pattern, you can nest other navigation elements within it.

## Pages

Pages are the most fundamental navigation component. Each page is an MDX file in your documentation repository.

<img className="block dark:hidden pointer-events-none" src="https://mintcdn.com/mintlify/Y6rP0BmbzgwHuEoU/images/navigation/pages-light.png?fit=max&auto=format&n=Y6rP0BmbzgwHuEoU&q=85&s=d9531be8cc28553992a6513ff09fc6ed" alt="Decorative graphic of pages." width="1184" height="320" data-path="images/navigation/pages-light.png" />

<img className="hidden dark:block pointer-events-none" src="https://mintcdn.com/mintlify/Y6rP0BmbzgwHuEoU/images/navigation/pages-dark.png?fit=max&auto=format&n=Y6rP0BmbzgwHuEoU&q=85&s=ec51691241465e13d49afafcd30748f8" alt="Decorative graphic of pages." width="1184" height="320" data-path="images/navigation/pages-dark.png" />

In the `navigation` object, `pages` is an array where each entry must reference the path to a [page file](/organize/pages).

```json theme={null}
{
  "navigation": {
    "pages": [
      "settings",
      "pages",
      "navigation",
      "themes",
      "custom-domain"
    ]
  }
}
```

## Groups

Use groups to organize your sidebar navigation into sections. You can nest groups within each other, label them with tags, and style them with icons.

<img className="block dark:hidden pointer-events-none" src="https://mintcdn.com/mintlify/Y6rP0BmbzgwHuEoU/images/navigation/groups-light.png?fit=max&auto=format&n=Y6rP0BmbzgwHuEoU&q=85&s=393243b71cd60407c0ea883359592699" alt="Decorative graphic of groups." width="1184" height="320" data-path="images/navigation/groups-light.png" />

<img className="hidden dark:block pointer-events-none" src="https://mintcdn.com/mintlify/Y6rP0BmbzgwHuEoU/images/navigation/groups-dark.png?fit=max&auto=format&n=Y6rP0BmbzgwHuEoU&q=85&s=834d116249fcd1484808f1a534ea2892" alt="Decorative graphic of groups." width="1184" height="320" data-path="images/navigation/groups-dark.png" />

In the `navigation` object, `groups` is an array where each entry is an object that requires a `group` field and a `pages` field. The `icon`, `tag`, `root`, and `expanded` fields are optional.

```json theme={null}
{
  "navigation": {
    "groups": [
      {
        "group": "Getting started",
        "icon": "play",
        "pages": [
          "quickstart",
          {
            "group": "Editing",
            "expanded": false,
            "icon": "pencil",
            "pages": [
              "installation",
              "editor"
            ]
          }
        ]
      },
      {
        "group": "Writing content",
        "icon": "notebook-text",
        "tag": "NEW",
        "pages": [
          "writing-content/page",
          "writing-content/text"
        ]
      }
    ]
  }
}
```

### Root page

Use the `root` property to designate a main page for a group. When a group has a root page, clicking the group title in the sidebar navigation opens the root page. Root pages work for top-level and nested groups.

```json Example group with a root page theme={null}
{
  "navigation": {
    "groups": [
      {
        "group": "API pages",
        "root": "api-overview",
        "pages": [
          "api-reference/get",
          "api-reference/post",
          "api-reference/delete"
        ]
      }
    ]
  }
}
```

### Directory listings

Use the `directory` property to automatically render a directory of child pages and groups on group root pages. When you set `directory` on any object within the `navigation` tree in `docs.json`, groups with a `root` page matching or beneath that object display a listing of their pages and groups below their page contents.

The `directory` property accepts three values:

| Value         | Behavior                                                       |
| :------------ | :------------------------------------------------------------- |
| `"none"`      | No directory listing. Default value.                           |
| `"accordion"` | Displays child pages in a collapsible list grouped by section. |
| `"card"`      | Displays child pages in a horizontal card layout.              |

The `directory` value inherits recursively through the navigation tree. Set it on anywhere within the navigation object and all descendant groups inherit the same value. Any descendant can override the inherited value by setting `directory` to a different value.

You can set `directory` anywhere in the navigation object in your `docs.json` file, including on tabs, anchors, dropdowns, products, versions, languages, and individual groups.

```json theme={null}
{
  "navigation": {
    "groups": [
      {
        "group": "Help Center",
        "root": "help/index",
        "directory": "accordion",
        "pages": [
          {
            "group": "Getting Started",
            "root": "help/getting-started/index",
            "pages": [
              "help/getting-started/quickstart",
              "help/getting-started/install"
            ]
          },
          {
            "group": "API Reference",
            "root": "help/api/index",
            "directory": "none",
            "pages": [
              "help/api/overview",
              "help/api/endpoints"
            ]
          }
        ]
      }
    ]
  }
}
```

In this example:

* **Help Center** uses `"accordion"` and its root page displays a directory listing.
* **Getting Started** inherits `"accordion"` from its parent and also displays a directory listing.
* **API Reference** overrides with `"none"`, so its root page does not display a directory listing.

<Note>
  The `directory` property only affects groups that have a `root` page. Groups without a `root` page are not affected.
</Note>

### Default expanded state

Use the `expanded` property to control the default state of a nested group in the navigation sidebar.

* `expanded: true`: Expands the group by default.
* `expanded: false` or omitted: Collapses the group by default.

<Note>
  The `expanded` property only affects nested groups--groups within groups. Top-level groups always expand and you cannot collapse them.
</Note>

```json theme={null}
{
  "group": "Getting started",
  "pages": [
    "quickstart",
    {
      "group": "Advanced",
      "expanded": false,
      "pages": ["installation", "configuration"]
    }
  ]
}
```

## Tabs

Tabs create distinct sections of your documentation with separate URL paths. Tabs create a horizontal navigation bar at the top of your documentation that lets users switch between sections.

<img className="block dark:hidden pointer-events-none" src="https://mintcdn.com/mintlify/Y6rP0BmbzgwHuEoU/images/navigation/tabs-light.png?fit=max&auto=format&n=Y6rP0BmbzgwHuEoU&q=85&s=aeec785d0771a3a7a87d941e318bf8e7" alt="Decorative graphic of a tab navigation." width="1184" height="320" data-path="images/navigation/tabs-light.png" />

<img className="hidden dark:block pointer-events-none" src="https://mintcdn.com/mintlify/Y6rP0BmbzgwHuEoU/images/navigation/tabs-dark.png?fit=max&auto=format&n=Y6rP0BmbzgwHuEoU&q=85&s=20637c7abbe07ee7b2c41c4df26d2ffd" alt="Decorative graphic of a tab navigation." width="1184" height="320" data-path="images/navigation/tabs-dark.png" />

In the `navigation` object, `tabs` is an array where each entry is an object that requires a `tab` field and can contain other navigation fields such as groups, pages, icons, or links to external pages.

```json theme={null}
{
  "navigation": {
    "tabs": [
      {
        "tab": "API reference",
        "icon": "square-terminal",
        "pages": [
          "api-reference/get",
          "api-reference/post",
          "api-reference/delete"
        ]
      },
      {
        "tab": "SDKs",
        "icon": "code",
        "pages": [
          "sdk/fetch",
          "sdk/create",
          "sdk/delete"
        ]
      },
      {
        "tab": "Blog",
        "icon": "newspaper",
        "href": "https://external-link.com/blog"
      }
    ]
  }
}
```

### Menus

Menus add dropdown navigation items to a tab. Use menus to help users go directly to specific pages within a tab.

In the `navigation` object, `menu` is an array where each entry is an object that requires an `item` field and can contain other navigation fields such as groups, pages, icons, or links to external pages.

Menu items can only contain groups, pages, and external links.

```json theme={null}
{
  "navigation": {
    "tabs": [
      {
        "tab": "Developer tools",
        "icon": "square-terminal",
        "menu": [
          {
            "item": "API reference",
            "icon": "rocket",
            "groups": [
              {
                "group": "Core endpoints",
                "icon": "square-terminal",
                "pages": [
                  "api-reference/get",
                  "api-reference/post",
                  "api-reference/delete"
                ]
              }
            ]
          },
          {
            "item": "SDKs",
            "icon": "code",
            "description": "SDKs are used to interact with the API.",
            "pages": [
              "sdk/fetch",
              "sdk/create",
              "sdk/delete"
            ]
          }
        ]
      }
    ]
  }
}
```

## Anchors

Anchors add persistent navigation items to the top of your sidebar. Use anchors to section your content, provide quick access to external resources, or create prominent calls to action.

<img className="block dark:hidden pointer-events-none" src="https://mintcdn.com/mintlify/Y6rP0BmbzgwHuEoU/images/navigation/anchors-light.png?fit=max&auto=format&n=Y6rP0BmbzgwHuEoU&q=85&s=e66255f62fc5d17ca135f21f84ed9325" alt="Decorative graphic of an anchor navigation." width="1184" height="320" data-path="images/navigation/anchors-light.png" />

<img className="hidden dark:block pointer-events-none" src="https://mintcdn.com/mintlify/Y6rP0BmbzgwHuEoU/images/navigation/anchors-dark.png?fit=max&auto=format&n=Y6rP0BmbzgwHuEoU&q=85&s=734e33b5fd52071d6f4019b273f2a0e8" alt="Decorative graphic of an anchor navigation." width="1184" height="320" data-path="images/navigation/anchors-dark.png" />

In the `navigation` object, `anchors` is an array where each entry is an object that requires an `anchor` field and can contain other navigation fields such as groups, pages, icons, or links to external pages.

```json theme={null}
{
  "navigation": {
    "anchors": [
      {
        "anchor": "Documentation",
        "icon": "book-open",
        "pages": [
          "quickstart",
          "development",
          "navigation"
        ]
      },
      {
        "anchor": "API reference",
        "icon": "square-terminal",
        "pages": [
          "api-reference/get",
          "api-reference/post",
          "api-reference/delete"
        ]
      },
      {
        "anchor": "Blog",
        "href": "https://external-link.com/blog"
      }
    ]
  }
}
```

### Global anchors

Use global anchors for links that should appear on all pages, regardless of which section of your navigation the user is viewing. Global anchors are particularly useful for linking to resources outside your documentation (such as a blog, community forum, or support portal) or for providing consistent access to important internal pages (such as a changelog or status page).

Global anchors support both external URLs and relative paths to pages within your documentation.

```json theme={null}
{
  "navigation": {
    "global":  {
      "anchors": [
        {
          "anchor": "Changelog",
          "icon": "list",
          "href": "/changelog"
        },
        {
          "anchor": "Blog",
          "icon": "pencil",
          "href": "https://mintlify.com/blog"
        }
      ]
    },
    "tabs": /*...*/
  }
}
```

## Products

<img className="block dark:hidden pointer-events-none" src="https://mintcdn.com/mintlify/uTIQZECUoznwRp7Y/images/navigation/product-switcher-light.png?fit=max&auto=format&n=uTIQZECUoznwRp7Y&q=85&s=ab051b15c6e533eb2d723fed8f400704" alt="Decorative graphic of a product switcher." width="2368" height="640" data-path="images/navigation/product-switcher-light.png" />

<img className="hidden dark:block pointer-events-none" src="https://mintcdn.com/mintlify/uTIQZECUoznwRp7Y/images/navigation/product-switcher-dark.png?fit=max&auto=format&n=uTIQZECUoznwRp7Y&q=85&s=4827f6913945eeadb2c54362ee0f748d" alt="Decorative graphic of a product switcher." width="2368" height="640" data-path="images/navigation/product-switcher-dark.png" />

Products create a dedicated navigation division for organizing product-specific documentation. Use products to separate different offerings, services, or major feature sets within your documentation.

In the `navigation` object, `products` is an array where each entry is an object that requires a `product` field and can contain other navigation fields such as groups, pages, icons, or links to external pages.

```json theme={null}
{
  "navigation": {
    "products": [
      {
        "product": "Core API",
        "description": "Core API description",    
        "icon": "api",
        "groups": [
          {
            "group": "Getting started",
            "pages": [
              "core-api/quickstart",
              "core-api/authentication"
            ]
          },
          {
            "group": "Endpoints",
            "pages": [
              "core-api/users",
              "core-api/orders"
            ]
          }
        ]
      },
      {
        "product": "Analytics Platform",
        "description": "Analytics Platform description",
        "icon": "chart-bar",
        "pages": [
          "analytics/overview",
          "analytics/dashboard",
          "analytics/reports"
        ]
      },
      {
        "product": "Mobile SDK",
        "description": "Mobile SDK description",
        "icon": "smartphone",
        "href": "https://mobile-sdk-docs.example.com"
      }
    ]
  }
}
```

## Dropdowns

Dropdowns are an expandable menu at the top of your sidebar navigation. Each item in a dropdown directs to a section of your documentation.

<img className="block dark:hidden pointer-events-none" src="https://mintcdn.com/mintlify/Y6rP0BmbzgwHuEoU/images/navigation/dropdowns-light.png?fit=max&auto=format&n=Y6rP0BmbzgwHuEoU&q=85&s=f04faa13e4a15c6866b8ceee98362018" alt="Decorative graphic of a dropdown navigation." width="1184" height="320" data-path="images/navigation/dropdowns-light.png" />

<img className="hidden dark:block pointer-events-none" src="https://mintcdn.com/mintlify/Y6rP0BmbzgwHuEoU/images/navigation/dropdowns-dark.png?fit=max&auto=format&n=Y6rP0BmbzgwHuEoU&q=85&s=4ee16248cae08fee00fe98952b599041" alt="Decorative graphic of a dropdown navigation." width="1184" height="320" data-path="images/navigation/dropdowns-dark.png" />

In the `navigation` object, `dropdowns` is an array where each entry is an object that requires a `dropdown` field and can contain other navigation fields such as groups, pages, icons, or links to external pages.

```json theme={null}
{
  "navigation": {
    "dropdowns": [
      {
        "dropdown": "Documentation",
        "icon": "book-open",
        "pages": [
          "quickstart",
          "development",
          "navigation"
        ]
      },
      {
        "dropdown": "API reference",
        "icon": "square-terminal",
        "pages": [
          "api-reference/get",
          "api-reference/post",
          "api-reference/delete"
        ]
      },
      {
        "dropdown": "Blog",
        "href": "https://external-link.com/blog"
      }
    ]
  }
}
```

## OpenAPI

Integrate OpenAPI specifications directly into your navigation structure to automatically generate API documentation. Create dedicated API sections or place endpoint pages within other navigation components.

Set a default OpenAPI specification at any level of your navigation hierarchy. Child elements inherit the specification unless they define their own.

<Note>
  When you add the `openapi` property to a navigation element (such as an anchor, tab, or group) without specifying any pages, Mintlify automatically generates pages for **all endpoints** defined in your OpenAPI specification.

  To control which endpoints appear, explicitly list the desired endpoints in a `pages` array.
</Note>

For more information about referencing OpenAPI endpoints in your docs, see the [OpenAPI setup](/api-playground/openapi-setup).

```json theme={null}
{
  "navigation": {
    "groups": [
      {
        "group": "API reference",
        "openapi": "/path/to/openapi-v1.json",
        "pages": [
          "overview",
          "authentication",
          "GET /users",
          "POST /users",
          {
            "group": "Products",
            "openapi": "/path/to/openapi-v2.json",
            "pages": [
              "GET /products",
              "POST /products"
            ]
          }
        ]
      }
    ]
  }
}
```

## Versions

Partition your navigation into different versions. Versions are selectable from a dropdown menu.

<img className="block dark:hidden pointer-events-none" src="https://mintcdn.com/mintlify/f7fo9pnTEtzBD70_/images/navigation/versions-light.png?fit=max&auto=format&n=f7fo9pnTEtzBD70_&q=85&s=85e9cca71a814be044a285028cf9a2a1" alt="Decorative graphic of a version switcher." width="1184" height="320" data-path="images/navigation/versions-light.png" />

<img className="hidden dark:block pointer-events-none" src="https://mintcdn.com/mintlify/f7fo9pnTEtzBD70_/images/navigation/versions-dark.png?fit=max&auto=format&n=f7fo9pnTEtzBD70_&q=85&s=fdb637aea218b4035afdaca14dae7d38" alt="Decorative graphic of a version switcher." width="1184" height="320" data-path="images/navigation/versions-dark.png" />

In the `navigation` object, `versions` is an array where each entry is an object that requires a `version` field and can contain any other navigation fields.

```json theme={null}
{
  "navigation": {
    "versions": [
      {
        "version": "1.0.0",
        "groups": [
          {
            "group": "Getting started",
            "pages": ["v1/overview", "v1/quickstart", "v1/development"]
          }
        ]
      },
      {
        "version": "2.0.0",
        "groups": [
          {
            "group": "Getting started",
            "pages": ["v2/overview", "v2/quickstart", "v2/development"]
          }
        ]
      }
    ]
  }
}
```

### Default version

Mintlify uses the first version in the `versions` array as the default. Use the `default` field to specify a different version as the default.

```json theme={null}
{
  "navigation": {
    "versions": [
      {
        "version": "1.0.0",
        "groups": [
          {
            "group": "Getting started",
            "pages": ["v1/overview", "v1/quickstart"]
          }
        ]
      },
      {
        "version": "2.0.0",
        "default": true,
        "groups": [
          {
            "group": "Getting started",
            "pages": ["v2/overview", "v2/quickstart"]
          }
        ]
      }
    ]
  }
}
```

### Version tags

Add a badge label to version entries in the version selector dropdown using the optional `tag` field. Use tags to highlight specific versions such as "Latest," "Recommended," or "Beta."

```json theme={null}
{
  "navigation": {
    "versions": [
      {
        "version": "2026_03",
        "tag": "Latest",
        "groups": [
          {
            "group": "Getting started",
            "pages": ["getting-started", "quickstart"]
          }
        ]
      },
      {
        "version": "2025_12",
        "tag": "Recommended",
        "groups": [
          {
            "group": "Getting started",
            "pages": ["2025_12/getting-started", "2025_12/quickstart"]
          }
        ]
      },
      {
        "version": "2025_09",
        "tag": "Deprecated",
        "groups": [
          {
            "group": "Getting started",
            "pages": ["2025_09/getting-started", "2025_09/quickstart"]
          }
        ]
      }
    ]
  }
}
```

## Languages

Partition your navigation into different languages. Languages are selectable from a dropdown menu.

<img className="block dark:hidden pointer-events-none" src="https://mintcdn.com/mintlify/Y6rP0BmbzgwHuEoU/images/navigation/languages-light.png?fit=max&auto=format&n=Y6rP0BmbzgwHuEoU&q=85&s=e451ef6550588674e26e264ce2cbe399" alt="Decorative graphic of a language switcher." width="1184" height="320" data-path="images/navigation/languages-light.png" />

<img className="hidden dark:block pointer-events-none" src="https://mintcdn.com/mintlify/Y6rP0BmbzgwHuEoU/images/navigation/languages-dark.png?fit=max&auto=format&n=Y6rP0BmbzgwHuEoU&q=85&s=99a90032d57cfefe2b46fb0d191391c7" alt="Decorative graphic of a language switcher." width="1184" height="320" data-path="images/navigation/languages-dark.png" />

In the `navigation` object, `languages` is an array where each entry is an object that requires a `language` field and can contain any other navigation fields, including language-specific banner, footer, and navbar configurations.

We currently support the following languages for localization:

<CardGroup cols={2}>
  <Card title="Arabic (ar)" icon="https://mintcdn.com/mintlify/Y6rP0BmbzgwHuEoU/images/navigation/languages/ar.png?fit=max&auto=format&n=Y6rP0BmbzgwHuEoU&q=85&s=3d848d9025b508f338803a8ec6e0cfcf" horizontal width="60" height="60" data-path="images/navigation/languages/ar.png" />

  <Card title="Catalan (ca)" icon="https://mintcdn.com/mintlify/SFVvas0BlzNCrx6E/images/navigation/languages/ca.png?fit=max&auto=format&n=SFVvas0BlzNCrx6E&q=85&s=c2bd093fc3ca84a8f4a39bf030c55601" horizontal width="480" height="480" data-path="images/navigation/languages/ca.png" />

  <Card title="Czech (cs)" icon="https://mintcdn.com/mintlify/BTaDCk_Uxbf62Se-/images/navigation/languages/cs.png?fit=max&auto=format&n=BTaDCk_Uxbf62Se-&q=85&s=b880294f53cff62c04d639e8e281f4dc" horizontal width="480" height="480" data-path="images/navigation/languages/cs.png" />

  <Card title="Chinese (cn)" icon="https://mintcdn.com/mintlify/Y6rP0BmbzgwHuEoU/images/navigation/languages/cn.png?fit=max&auto=format&n=Y6rP0BmbzgwHuEoU&q=85&s=77d74a80d5ef3abcbef683a48c26c799" horizontal width="60" height="60" data-path="images/navigation/languages/cn.png" />

  <Card title="Chinese (zh-Hant)" icon="https://mintcdn.com/mintlify/Y6rP0BmbzgwHuEoU/images/navigation/languages/cn.png?fit=max&auto=format&n=Y6rP0BmbzgwHuEoU&q=85&s=77d74a80d5ef3abcbef683a48c26c799" horizontal width="60" height="60" data-path="images/navigation/languages/cn.png" />

  <Card title="Dutch (nl)" icon="https://mintcdn.com/mintlify/4vDiMoxdniYs_vyk/images/navigation/languages/nl.png?fit=max&auto=format&n=4vDiMoxdniYs_vyk&q=85&s=da927dcce7501df5f80aba862868355b" horizontal width="480" height="480" data-path="images/navigation/languages/nl.png" />

  <Card title="English (en)" icon="https://mintcdn.com/mintlify/Y6rP0BmbzgwHuEoU/images/navigation/languages/en.png?fit=max&auto=format&n=Y6rP0BmbzgwHuEoU&q=85&s=25d8b8c6c7473091d33c16b602eb381a" horizontal width="60" height="60" data-path="images/navigation/languages/en.png" />

  <Card title="Finnish (fi)" icon="https://mintcdn.com/mintlify/hESSwTRaaBk3yc5l/images/navigation/languages/fi.png?fit=max&auto=format&n=hESSwTRaaBk3yc5l&q=85&s=743bad8305375fbb53b37fc54f63ad3e" horizontal width="480" height="480" data-path="images/navigation/languages/fi.png" />

  <Card title="French (fr)" icon="https://mintcdn.com/mintlify/Y6rP0BmbzgwHuEoU/images/navigation/languages/fr.png?fit=max&auto=format&n=Y6rP0BmbzgwHuEoU&q=85&s=ccf6b50a06031c5961d642aeb92d87b1" horizontal width="60" height="60" data-path="images/navigation/languages/fr.png" />

  <Card title="German (de)" icon="https://mintcdn.com/mintlify/Y6rP0BmbzgwHuEoU/images/navigation/languages/de.png?fit=max&auto=format&n=Y6rP0BmbzgwHuEoU&q=85&s=831c61a2dfd61b73164938b664507542" horizontal width="60" height="60" data-path="images/navigation/languages/de.png" />

  <Card title="Hebrew (he)" icon="https://mintcdn.com/mintlify/Xr3wiklTC3GE1PaM/images/navigation/languages/he.png?fit=max&auto=format&n=Xr3wiklTC3GE1PaM&q=85&s=e51655c25bcdf50287eb43dbade78598" horizontal width="480" height="480" data-path="images/navigation/languages/he.png" />

  <Card title="Hindi (hi)" icon="https://mintcdn.com/mintlify/BTaDCk_Uxbf62Se-/images/navigation/languages/hi.png?fit=max&auto=format&n=BTaDCk_Uxbf62Se-&q=85&s=9bb83682ddc748abb1e6be010852f9d1" horizontal width="480" height="480" data-path="images/navigation/languages/hi.png" />

  <Card title="Hungarian (hu)" icon="https://mintcdn.com/mintlify/K47DUHt_ZDaM-1yJ/images/navigation/languages/hu.png?fit=max&auto=format&n=K47DUHt_ZDaM-1yJ&q=85&s=a5b675fcb17937cc4fda0a2bf7db5b32" horizontal width="480" height="480" data-path="images/navigation/languages/hu.png" />

  <Card title="Indonesian (id)" icon="https://mintcdn.com/mintlify/Y6rP0BmbzgwHuEoU/images/navigation/languages/id.png?fit=max&auto=format&n=Y6rP0BmbzgwHuEoU&q=85&s=8fbde287fb60df0d0712f3d0db7aba1b" horizontal width="60" height="60" data-path="images/navigation/languages/id.png" />

  <Card title="Italian (it)" icon="https://mintcdn.com/mintlify/Y6rP0BmbzgwHuEoU/images/navigation/languages/it.png?fit=max&auto=format&n=Y6rP0BmbzgwHuEoU&q=85&s=dc39bd6cd67e91394e03842e588681df" horizontal width="60" height="60" data-path="images/navigation/languages/it.png" />

  <Card title="Japanese (jp)" icon="https://mintcdn.com/mintlify/Y6rP0BmbzgwHuEoU/images/navigation/languages/jp.png?fit=max&auto=format&n=Y6rP0BmbzgwHuEoU&q=85&s=69b17ac2f3202e4bf28945e8408f67e3" horizontal width="60" height="60" data-path="images/navigation/languages/jp.png" />

  <Card title="Korean (ko)" icon="https://mintcdn.com/mintlify/Y6rP0BmbzgwHuEoU/images/navigation/languages/ko.png?fit=max&auto=format&n=Y6rP0BmbzgwHuEoU&q=85&s=a555f0a68a4beb076b3556a7f0264b5e" horizontal width="60" height="60" data-path="images/navigation/languages/ko.png" />

  <Card title="Latvian (lv)" icon="https://mintcdn.com/mintlify/4vDiMoxdniYs_vyk/images/navigation/languages/lv.png?fit=max&auto=format&n=4vDiMoxdniYs_vyk&q=85&s=61c384db51dc61621e62f4c565935b02" horizontal width="480" height="480" data-path="images/navigation/languages/lv.png" />

  <Card title="Norwegian (no)" icon="https://mintcdn.com/mintlify/4vDiMoxdniYs_vyk/images/navigation/languages/no.png?fit=max&auto=format&n=4vDiMoxdniYs_vyk&q=85&s=993784e6321e0da6be58d4b8451a9425" horizontal width="480" height="480" data-path="images/navigation/languages/no.png" />

  <Card title="Polish (pl)" icon="https://mintcdn.com/mintlify/Xr3wiklTC3GE1PaM/images/navigation/languages/pl.png?fit=max&auto=format&n=Xr3wiklTC3GE1PaM&q=85&s=c032c7a1341941978d80307821c82c34" horizontal width="480" height="480" data-path="images/navigation/languages/pl.png" />

  <Card title="Portuguese (pt-BR)" icon="https://mintcdn.com/mintlify/Y6rP0BmbzgwHuEoU/images/navigation/languages/pt-br.png?fit=max&auto=format&n=Y6rP0BmbzgwHuEoU&q=85&s=96a015424865291e54cefc8633cc8d78" horizontal width="60" height="60" data-path="images/navigation/languages/pt-br.png" />

  <Card title="Romanian (ro)" icon="https://mintcdn.com/mintlify/BTaDCk_Uxbf62Se-/images/navigation/languages/ro.png?fit=max&auto=format&n=BTaDCk_Uxbf62Se-&q=85&s=5a3925857c9de6c3c818edde060f51c9" horizontal width="480" height="480" data-path="images/navigation/languages/ro.png" />

  <Card title="Russian (ru)" icon="https://mintcdn.com/mintlify/Y6rP0BmbzgwHuEoU/images/navigation/languages/ru.png?fit=max&auto=format&n=Y6rP0BmbzgwHuEoU&q=85&s=0f52006163f89fe293525925000eb554" horizontal width="60" height="60" data-path="images/navigation/languages/ru.png" />

  <Card title="Spanish (es)" icon="https://mintcdn.com/mintlify/Y6rP0BmbzgwHuEoU/images/navigation/languages/es.png?fit=max&auto=format&n=Y6rP0BmbzgwHuEoU&q=85&s=14af4f5bf5e19c20d2062465ca6b9011" horizontal width="60" height="60" data-path="images/navigation/languages/es.png" />

  <Card title="Swedish (sv)" icon="https://mintcdn.com/mintlify/bbYdWMDGyp4158HR/images/navigation/languages/sv.png?fit=max&auto=format&n=bbYdWMDGyp4158HR&q=85&s=b62a991d880845b46daa65220ca451b5" horizontal width="480" height="480" data-path="images/navigation/languages/sv.png" />

  <Card title="Turkish (tr)" icon="https://mintcdn.com/mintlify/Y6rP0BmbzgwHuEoU/images/navigation/languages/tr.png?fit=max&auto=format&n=Y6rP0BmbzgwHuEoU&q=85&s=e52a73a891fa250497c853c557b0a91f" horizontal width="60" height="60" data-path="images/navigation/languages/tr.png" />

  <Card title="Ukrainian (uk)" icon="https://mintcdn.com/mintlify/8p1xhF2gnPXDMRE_/images/navigation/languages/ua.png?fit=max&auto=format&n=8p1xhF2gnPXDMRE_&q=85&s=2e0f017cadda1fa0305e0e57c9de2860" horizontal width="480" height="480" data-path="images/navigation/languages/ua.png" />

  <Card title="Uzbek (uz)" icon="https://mintcdn.com/mintlify/Xr3wiklTC3GE1PaM/images/navigation/languages/uz.png?fit=max&auto=format&n=Xr3wiklTC3GE1PaM&q=85&s=dd6427a746dcfc6e8972e8ea0b5dc20f" horizontal width="480" height="480" data-path="images/navigation/languages/uz.png" />

  <Card title="Vietnamese (vi)" icon="https://mintcdn.com/mintlify/BTaDCk_Uxbf62Se-/images/navigation/languages/vi.png?fit=max&auto=format&n=BTaDCk_Uxbf62Se-&q=85&s=970f4a7e12c0dd29f3980c22cbddad9e" horizontal width="480" height="480" data-path="images/navigation/languages/vi.png" />
</CardGroup>

```json theme={null}
{
  "navigation": {
    "languages": [
      {
        "language": "en",
        "banner": {
          "content": "🚀 Version 2.0 is now live! See our [changelog](/en/changelog) for details.",
          "dismissible": true
        },
        "footer": {
          "socials": {
            "x": "https://x.com/mintlify"
          },
          "links": [
            {
              "header": "Resources",
              "items": [
                { "label": "Documentation", "href": "/en/docs" },
                { "label": "Blog", "href": "https://mintlify.com/blog" }
              ]
            }
          ]
        },
        "navbar": {
          "links": [
            { "label": "Docs", "href": "/en/docs" }
          ],
          "primary": {
            "type": "button",
            "label": "Get Started",
            "href": "/en/quickstart"
          }
        },
        "groups": [
          {
            "group": "Getting started",
            "pages": ["en/overview", "en/quickstart", "en/development"]
          }
        ]
      },
      {
        "language": "es",
        "banner": {
          "content": "🚀 ¡La versión 2.0 ya está disponible! Consulta nuestro [registro de cambios](/es/changelog).",
          "dismissible": true
        },
        "footer": {
          "socials": {
            "x": "https://x.com/mintlify"
          },
          "links": [
            {
              "header": "Recursos",
              "items": [
                { "label": "Documentación", "href": "/es/docs" },
                { "label": "Blog", "href": "https://mintlify.com/blog" }
              ]
            }
          ]
        },
        "navbar": {
          "links": [
            { "label": "Documentación", "href": "/es/docs" }
          ],
          "primary": {
            "type": "button",
            "label": "Comenzar",
            "href": "/es/quickstart"
          }
        },
        "groups": [
          {
            "group": "Getting started",
            "pages": ["es/overview", "es/quickstart", "es/development"]
          }
        ]
      }
    ]
  }
}
```

For automated translations, [contact our sales team](mailto:gtm@mintlify.com) to discuss solutions.

## Nesting

You can nest navigation elements within each other to create complex hierarchies. You must have one root-level parent navigation element such as tabs, groups, or a dropdown. You can nest other types of navigation elements within your primary navigation pattern.

Each navigation element can contain one type of child element at each level of your navigation hierarchy. For example, a tab can contain anchors that contain groups, but a tab cannot contain both anchors and groups at the same level.

<CodeGroup>
  ```json Tabs containing anchors theme={null}
  {
    "navigation": {
      "tabs": [
        {
          "tab": "Documentation",
          "anchors": [
            {
              "anchor": "Guides",
              "icon": "book-open",
              "pages": ["quickstart", "tutorial"]
            },
            {
              "anchor": "API Reference",
              "icon": "code",
              "pages": ["api/overview", "api/endpoints"]
            }
          ]
        },
        {
          "tab": "Resources",
          "groups": [
            {
              "group": "Help",
              "pages": ["support", "faq"]
            }
          ]
        }
      ]
    }
  }
  ```

  ```json Anchors containing tabs theme={null}
  {
    "navigation": {
      "anchors": [
        {
          "anchor": "Documentation",
          "icon": "book-open",
          "tabs": [
            {
              "tab": "Guides",
              "pages": ["quickstart", "tutorial"]
            },
            {
              "tab": "API",
              "pages": ["api/overview", "api/endpoints"]
            }
          ]
        },
        {
          "anchor": "Community",
          "icon": "users",
          "href": "https://community.example.com"
        }
      ]
    }
  }
  ```

  ```json Products containing tabs theme={null}
  {
    "navigation": {
      "products": [
        {
          "product": "Platform",
          "icon": "server",
          "tabs": [
            {
              "tab": "Documentation",
              "groups": [
                {
                  "group": "Getting started",
                  "pages": ["platform/quickstart"]
                }
              ]
            },
            {
              "tab": "API Reference",
              "pages": ["platform/api"]
            }
          ]
        },
        {
          "product": "Mobile SDK",
          "icon": "mobile",
          "pages": ["mobile/overview"]
        }
      ]
    }
  }
  ```

  ```json Multi-product SaaS with tabs and menu theme={null}
  {
    "navigation": {
      "products": [
        {
          "product": "Platform",
          "icon": "cloud",
          "tabs": [
            {
              "tab": "Documentation",
              "menu": [
                {
                  "item": "Getting Started",
                  "icon": "rocket",
                  "groups": [
                    {
                      "group": "Setup",
                      "pages": ["platform/install", "platform/config"]
                    },
                    {
                      "group": "Core Concepts",
                      "pages": ["platform/concepts/auth", "platform/concepts/data"]
                    }
                  ]
                },
                {
                  "item": "Guides",
                  "icon": "book",
                  "pages": ["platform/guides/deployment", "platform/guides/scaling"]
                }
              ]
            },
            {
              "tab": "API Reference",
              "groups": [
                {
                  "group": "REST API",
                  "pages": ["platform/api/users", "platform/api/projects"]
                },
                {
                  "group": "GraphQL",
                  "pages": ["platform/api/graphql/queries", "platform/api/graphql/mutations"]
                }
              ]
            }
          ]
        },
        {
          "product": "Analytics",
          "icon": "chart-bar",
          "tabs": [
            {
              "tab": "Documentation",
              "groups": [
                {
                  "group": "Getting Started",
                  "pages": ["analytics/quickstart", "analytics/setup"]
                }
              ]
            },
            {
              "tab": "API",
              "pages": ["analytics/api/events", "analytics/api/reports"]
            }
          ]
        }
      ]
    }
  }
  ```

  ```json Versioned docs with tabs theme={null}
  {
    "navigation": {
      "versions": [
        {
          "version": "v2.0",
          "tabs": [
            {
              "tab": "Documentation",
              "groups": [
                {
                  "group": "Getting Started",
                  "pages": ["v2/quickstart", "v2/migration-from-v1"]
                },
                {
                  "group": "Features",
                  "pages": ["v2/features/auth", "v2/features/api"]
                }
              ]
            },
            {
              "tab": "API Reference",
              "pages": ["v2/api/overview", "v2/api/endpoints"]
            }
          ]
        },
        {
          "version": "v1.0",
          "tabs": [
            {
              "tab": "Documentation",
              "groups": [
                {
                  "group": "Getting Started",
                  "pages": ["v1/quickstart"]
                }
              ]
            },
            {
              "tab": "API Reference",
              "pages": ["v1/api/overview"]
            }
          ]
        }
      ]
    }
  }
  ```
</CodeGroup>

## Breadcrumbs

Breadcrumbs display the full navigation path at the top of pages. Some themes have breadcrumbs enabled by default and others do not. You can control whether breadcrumbs display on your site using the `styling` property in your `docs.json`.

<CodeGroup>
  ```json Display full breadcrumbs theme={null}
  "styling": {
    "eyebrows": "breadcrumbs"
  }
  ```

  ```json Display parent section only theme={null}
  "styling": {
    "eyebrows": "section"
  }
  ```
</CodeGroup>

## Interaction configuration

Control how users interact with navigation elements using the `interaction` property in your `docs.json`.

### Enable auto-navigation for groups

When a user expands a navigation group, some themes automatically navigate to the first page in the group. You can override a theme's default behavior using the `drilldown` option.

* Set to `true` to force automatic navigation to the first page when a user selects a navigation group.
* Set to `false` to prevent navigation and only expand or collapse the group when a user selects a navigation group.
* Leave unset to use the theme's default behavior.

<CodeGroup>
  ```json Force navigation theme={null}
  "interaction": {
    "drilldown": true  // Force navigation to first page when a user expands a dropdown
  }
  ```

  ```json Prevent navigation theme={null}
  "interaction": {
    "drilldown": false // Never navigate, only expand or collapse the group
  }
  ```
</CodeGroup>


> ## Documentation Index
> Fetch the complete documentation index at: https://www.mintlify.com/docs/llms.txt
> Use this file to discover all available pages before exploring further.

<AgentInstructions>

## Submitting Feedback

If you encounter incorrect, outdated, or confusing documentation on this page, submit feedback:

POST https://www.mintlify.com/docs/feedback

```json
{
  "path": "/components/icons",
  "feedback": "Description of the issue"
}
```

Only submit feedback when you have something specific and actionable to report.

</AgentInstructions>

# Icons

> Add icons from Font Awesome, Lucide, Tabler, or custom sources to your documentation pages using the icon component with size and color options.

Use icons from Font Awesome, Lucide, Tabler, SVGs, external URLs, or files in your project to enhance your documentation.

<Icon icon="flag" size={32} />

```mdx Icon example theme={null}
<Icon icon="flag" size={32} />
```

## Inline icons

Icons are placed inline when used within a sentence, paragraph, or heading. <Icon icon="flag" iconType="solid" /> Use icons for decoration or to add visual emphasis.

```markdown Inline icon example theme={null}
Icons are placed inline when used within a sentence, paragraph, or heading. <Icon icon="flag" iconType="solid" /> Use icons for decoration or to add visual emphasis.
```

## Properties

<ResponseField name="icon" type="string" required>
  The icon to display.

  Options:

  * [Font Awesome icon](https://fontawesome.com/icons) name, if you have the `icons.library` [property](/organize/settings-appearance#param-icons) set to `fontawesome` in your `docs.json`
  * [Lucide icon](https://lucide.dev/icons) name, if you have the `icons.library` [property](/organize/settings-appearance#param-icons) set to `lucide` in your `docs.json`
  * [Tabler icon](https://tabler.io/icons) name, if you have the `icons.library` [property](/organize/settings-appearance#param-icons) set to `tabler` in your `docs.json`
  * URL to an externally hosted icon
  * Path to an icon file in your project
</ResponseField>

<ResponseField name="iconType" type="string">
  The [Font Awesome](https://fontawesome.com/icons) icon style. Only used with Font Awesome icons.

  Options: `regular`, `solid`, `light`, `thin`, `sharp-solid`, `duotone`, `brands`.
</ResponseField>

<ResponseField name="color" type="string">
  The color of the icon as a hex code (for example, `#FF5733`).
</ResponseField>

<ResponseField name="size" type="number">
  The size of the icon in pixels.
</ResponseField>

<ResponseField name="className" type="string">
  Custom CSS class name to apply to the icon.
</ResponseField>


