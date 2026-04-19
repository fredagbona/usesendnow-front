> ## Documentation Index
> Fetch the complete documentation index at: https://www.mintlify.com/docs/llms.txt
> Use this file to discover all available pages before exploring further.

<AgentInstructions>

## Submitting Feedback

If you encounter incorrect, outdated, or confusing documentation on this page, submit feedback:

POST https://www.mintlify.com/docs/feedback

```json
{
  "path": "/guides/internationalization",
  "feedback": "Description of the issue"
}
```

Only submit feedback when you have something specific and actionable to report.

</AgentInstructions>

# How to set up multi-language documentation

> Set up multi-language documentation with locale-based routing, language switcher navigation, and translated content to reach global audiences.

Internationalization (i18n) is the process of designing software or content to work for different languages and locales. This guide explains how to structure files, configure navigation, and maintain translations effectively so that you can help users access your documentation in their preferred language and improve global reach.

## File structure

Organize translated content in language-specific directories to keep your documentation maintainable and structure your navigation by language.

Create a separate directory for each language using [ISO 639-1 language codes](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes). Place translated files in these directories with the same structure as your default language.

<Expandable title="supported language codes">
  * `ar` - Arabic
  * `ca` - Catalan
  * `cs` - Czech
  * `zh` or `zh-Hans` - Chinese (Simplified)
  * `zh-Hant` - Chinese (Traditional)
  * `de` - German
  * `en` - English
  * `es` - Spanish
  * `fi` - Finnish
  * `fr` - French
  * `fr-CA` - French (Canadian)
  * `he` - Hebrew
  * `hi` - Hindi
  * `hu` - Hungarian
  * `id` - Indonesian
  * `it` - Italian
  * `ja` - Japanese
  * `ko` - Korean
  * `lv` - Latvian
  * `nl` - Dutch
  * `no` - Norwegian
  * `pl` - Polish
  * `pt` or `pt-BR` - Portuguese
  * `ro` - Romanian
  * `ru` - Russian
  * `sv` - Swedish
  * `tr` - Turkish
  * `uk` - Ukrainian
  * `uz` - Uzbek
  * `vi` - Vietnamese
</Expandable>

```text Example file structure theme={null}
docs/
├── index.mdx                    # English (default)
├── quickstart.mdx
├── fr/
│   ├── index.mdx               # French
│   ├── quickstart.mdx
├── es/
│   ├── index.mdx               # Spanish
│   ├── quickstart.mdx
└── zh/
    ├── index.mdx               # Chinese
    └── quickstart.mdx
```

<Tip>
  Keep the same filenames and directory structure across all languages. This makes it easier to maintain translations and identify missing content.
</Tip>

## Configure the language switcher

To add a language switcher to your documentation, configure the `languages` array in your `docs.json` navigation.

```json docs.json theme={null}
{
  "navigation": {
    "languages": [
      {
        "language": "en",
        "groups": [
          {
            "group": "Getting started",
            "pages": ["index", "quickstart"]
          }
        ]
      },
      {
        "language": "es",
        "groups": [
          {
            "group": "Comenzando",
            "pages": ["es/index", "es/quickstart"]
          }
        ]
      }
    ]
  }
}
```

Each language entry in the `languages` array requires:

* `language`: ISO 639-1 language code
* Full navigation structure
* Paths to translated files

The navigation structure can differ between languages to accommodate language-specific content needs.

### Set default language

The first language in the `languages` array is automatically used as the default. To use a different language as the default, either reorder the array or add the `default` property:

```json docs.json theme={null}
{
  "navigation": {
    "languages": [
      {
        "language": "es",
        "groups": [...]
      },
      {
        "language": "en",
        "groups": [...]
      }
    ]
  }
}
```

Alternatively, use the `default` property to override the order:

```json docs.json theme={null}
{
  "navigation": {
    "languages": [
      {
        "language": "en",
        "groups": [...]
      },
      {
        "language": "es",
        "default": true,
        "groups": [...]
      }
    ]
  }
}
```

### Single language documentation

If you only want one language available without a language switcher, remove the `languages` field from your navigation configuration. Instead, define your navigation structure directly:

```json docs.json theme={null}
{
  "navigation": {
    "tabs": [
      {
        "tab": "Documentation",
        "groups": [
          {
            "group": "Getting started",
            "pages": ["index", "quickstart"]
          }
        ]
      }
    ]
  }
}
```

This displays your documentation in a single language without the language switcher UI.

<Tip>
  Translate navigation labels like group or tab names to match the language of the content. This creates a fully localized experience for your users.
</Tip>

### Global navigation

To add global navigation elements that appear across all languages, configure the `global` object in your `docs.json` navigation.

```json docs.json theme={null}
{
  "navigation": {
    "global": {
      "anchors": [
        {
          "anchor": "Documentation",
          "href": "https://example.com/docs"
        },
        {
          "anchor": "Blog",
          "href": "https://example.com/blog"
        }
      ]
    },
    "languages": [
      // Language-specific navigation
    ]
  }
}
```

### Localized footer and navbar

Customize the footer and navbar for each language to display translated content and region-specific links.

Add `footer` and `navbar` properties to each language configuration:

```json docs.json theme={null}
{
  "navigation": {
    "languages": [
      {
        "language": "en",
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
            "pages": ["en/quickstart", "en/index"]
          }
        ]
      },
      {
        "language": "es",
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
            "group": "Comenzando",
            "pages": ["es/quickstart", "es/index"]
          }
        ]
      }
    ]
  }
}
```

Language-specific `footer` and `navbar` override the global settings for that language. If a language doesn't define these properties, it inherits the global configuration.

You can also configure a language-specific `banner` using the same pattern.

## Maintain translations

Keep translations accurate and synchronized with your source content.

### Translation workflow

1. Update source content in your primary language.
2. Identify changed content.
3. Translate changed content.
4. Review translations for accuracy.
5. Update translated files.
6. Verify navigation and links work.

### Automated translations

For automated translation solutions, [contact the Mintlify sales team](mailto:gtm@mintlify.com).

### External translation providers

If you work with your own translation vendors or regional translators, you can integrate their workflow with your Mintlify documentation using GitHub Actions or similar CI/CD tools.

1. **Export source content**: Extract MDX files that need translation.
2. **Send to translators**: Provide files to your translation provider.
3. **Receive translations**: Get translated MDX files back.
4. **Import and deploy**: Add translated files to language directories and update navigation.

This GitHub Actions workflow automatically exports changed English content for translation when PRs merge to main.

```yaml .github/workflows/export-for-translation.yml theme={null}
name: Export content for translation

on:
  push:
    branches: [main]
    paths:
      - '*.mdx'
      - '!es/**'
      - '!fr/**'
      - '!zh/**'

# Prevent concurrent workflow runs to avoid race conditions
concurrency:
  group: translation-export-${{ github.ref }}
  cancel-in-progress: false

jobs:
  export:
    runs-on: ubuntu-latest
    
    # Early exit if no changes detected (optional - acts as additional safety)
    outputs:
      files-changed: ${{ steps.changed.outputs.has-files }}
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 2

      - name: Get changed MDX files
        id: changed
        run: |
          # Check if parent commit exists (handles initial push)
          if ! git rev-parse HEAD~1 >/dev/null 2>&1; then
            echo "has-files=false" >> $GITHUB_OUTPUT
            echo "files=" >> $GITHUB_OUTPUT
            echo "No parent commit found - skipping export"
            exit 0
          fi
          
          # Get list of changed MDX files (excluding translation dirs)
          files=$(git diff --name-only HEAD~1 HEAD -- '*.mdx' ':!es/' ':!fr/' ':!zh/' | tr '\n' ' ')
          
          if [ -z "$files" ]; then
            echo "has-files=false" >> $GITHUB_OUTPUT
            echo "files=" >> $GITHUB_OUTPUT
            echo "No MDX files changed - skipping export"
          else
            echo "has-files=true" >> $GITHUB_OUTPUT
            echo "files=$files" >> $GITHUB_OUTPUT
            echo "Found changed files: $files"
          fi
        shell: bash

      - name: Create translation package directory
        if: steps.changed.outputs.has-files == 'true'
        run: |
          mkdir -p translation-export
          echo "Created translation-export directory"

      - name: Copy changed files to export directory
        if: steps.changed.outputs.has-files == 'true'
        run: |
          failed_count=0
          for file in ${{ steps.changed.outputs.files }}; do
            if [ -f "$file" ]; then
              target_dir="translation-export/$(dirname "$file")"
              mkdir -p "$target_dir"
              cp "$file" "$target_dir/"
              echo "✓ Copied: $file"
            else
              echo "✗ File not found: $file"
              ((failed_count++))
            fi
          done
          
          if [ $failed_count -gt 0 ]; then
            echo "Warning: $failed_count file(s) could not be copied"
          fi
        shell: bash

      - name: Validate translation package
        if: steps.changed.outputs.has-files == 'true'
        run: |
          echo "Translation package contents:"
          find translation-export -type f -name "*.mdx" | sort
          echo ""
          file_count=$(find translation-export -type f -name "*.mdx" | wc -l)
          echo "Total MDX files: $file_count"

      - name: Upload translation package
        if: steps.changed.outputs.has-files == 'true'
        uses: actions/upload-artifact@v4
        with:
          name: translation-export-${{ github.sha }}
          path: translation-export/
          retention-days: 30
          if-no-files-found: error
          compression-level: 9

      - name: Print job summary
        if: steps.changed.outputs.has-files == 'true'
        run: |
          echo "## Translation Export Complete" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "**Artifact:** \`translation-export-${{ github.sha }}\`" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "**Changed Files:**" >> $GITHUB_STEP_SUMMARY
          echo "${{ steps.changed.outputs.files }}" | tr ' ' '\n' | sed 's/^/- /' >> $GITHUB_STEP_SUMMARY
```

This GitHub Actions workflow validates and imports translated content when added via PR.

```yaml .github/workflows/import-translations.yml theme={null}
name: Import translations

on:
  pull_request:
    paths:
      - 'es/**'
      - 'fr/**'
      - 'zh/**'

# Define explicit permissions
permissions:
  contents: read
  pull-requests: write

jobs:
  validate:
    runs-on: ubuntu-latest
    
    outputs:
      validation-status: ${{ steps.final-check.outputs.status }}
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Full history to ensure origin/main is available

      - name: Fetch origin/main reference
        run: |
          git fetch origin main:origin/main 2>/dev/null || echo "origin/main not available, using latest"
        continue-on-error: true

      - name: Get changed translation files
        id: changed-files
        run: |
          # Get all changed MDX files in translation directories
          files=$(git diff --name-only origin/main..HEAD -- 'es/**/*.mdx' 'fr/**/*.mdx' 'zh/**/*.mdx' | sort)
          
          if [ -z "$files" ]; then
            echo "No translation MDX files detected in this PR"
            echo "files=" >> $GITHUB_OUTPUT
            echo "count=0" >> $GITHUB_OUTPUT
          else
            echo "Found $(echo "$files" | wc -l) translation files"
            echo "$files"
            echo "files=$files" >> $GITHUB_OUTPUT
            echo "count=$(echo "$files" | wc -l)" >> $GITHUB_OUTPUT
          fi
        shell: bash

      - name: Validate frontmatter
        id: frontmatter
        if: steps.changed-files.outputs.count > 0
        run: |
          failed_files=()
          success_count=0
          total=${{ steps.changed-files.outputs.count }}
          
          while IFS= read -r file; do
            if [ ! -f "$file" ]; then
              echo "✗ File not found: $file"
              failed_files+=("$file")
              continue
            fi
            
            # Check for valid frontmatter (lines 1-2 must be ---)
            first_line=$(sed -n '1p' "$file")
            second_line=$(sed -n '2p' "$file")
            last_line=$(awk 'NF' "$file" | tail -1)
            
            if [ "$first_line" = "---" ] && grep -q "^---$" "$file"; then
              echo "✓ Valid frontmatter: $file"
              ((success_count++))
            else
              echo "✗ Invalid frontmatter in $file"
              echo "  Line 1: '$first_line'"
              failed_files+=("$file")
            fi
          done <<< "${{ steps.changed-files.outputs.files }}"
          
          echo ""
          echo "Frontmatter check: $success_count/$total passed"
          
          if [ ${#failed_files[@]} -gt 0 ]; then
            echo "frontmatter_valid=false" >> $GITHUB_OUTPUT
            printf 'failed_files=%s\n' "${failed_files[@]}" >> $GITHUB_OUTPUT
          else
            echo "frontmatter_valid=true" >> $GITHUB_OUTPUT
          fi
        shell: bash

      - name: Check file structure
        id: structure
        if: steps.changed-files.outputs.count > 0
        run: |
          missing_sources=()
          orphaned_count=0
          
          while IFS= read -r translated_file; do
            # Extract language and relative path
            # e.g., "es/docs/guide.mdx" -> lang="es", relative_path="docs/guide.mdx"
            lang=$(echo "$translated_file" | cut -d'/' -f1)
            relative_path=$(echo "$translated_file" | cut -d'/' -f2-)
            source_file="$relative_path"
            
            if [ ! -f "$source_file" ]; then
              echo "Missing source: $translated_file -> $source_file"
              missing_sources+=("$translated_file")
              ((orphaned_count++))
            else
              echo "✓ Found source: $translated_file -> $source_file"
            fi
          done <<< "${{ steps.changed-files.outputs.files }}"
          
          echo ""
          echo "Structure check: $orphaned_count orphaned file(s)"
          
          if [ $orphaned_count -gt 0 ]; then
            echo "structure_valid=false" >> $GITHUB_OUTPUT
            printf 'missing_sources=%s\n' "${missing_sources[@]}" >> $GITHUB_OUTPUT
          else
            echo "structure_valid=true" >> $GITHUB_OUTPUT
          fi
        shell: bash

      - name: Validate file integrity
        id: integrity
        if: steps.changed-files.outputs.count > 0
        run: |
          integrity_passed=true
          
          while IFS= read -r file; do
            # Check file is readable and not empty
            if [ ! -r "$file" ] || [ ! -s "$file" ]; then
              echo "✗ File integrity issue: $file (not readable or empty)"
              integrity_passed=false
            fi
            
            # Basic check: file should have content after frontmatter
            line_count=$(wc -l < "$file")
            if [ "$line_count" -lt 5 ]; then
              echo "File is suspiciously short: $file ($line_count lines)"
            fi
          done <<< "${{ steps.changed-files.outputs.files }}"
          
          if [ "$integrity_passed" = true ]; then
            echo "integrity_valid=true" >> $GITHUB_OUTPUT
          else
            echo "integrity_valid=false" >> $GITHUB_OUTPUT
          fi
        shell: bash

      - name: Generate validation report
        if: always()
        run: |
          echo "## Translation Validation Report" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "**Files Changed:** ${{ steps.changed-files.outputs.count }}" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          
          if [ "${{ steps.changed-files.outputs.count }}" = "0" ]; then
            echo "No translation MDX files found in this PR" >> $GITHUB_STEP_SUMMARY
            echo "" >> $GITHUB_STEP_SUMMARY
            echo "> This could mean:" >> $GITHUB_STEP_SUMMARY
            echo "- Only non-MDX files in es/, fr/, or zh/ directories were changed" >> $GITHUB_STEP_SUMMARY
            echo "- Workflow was triggered but no translation content to validate" >> $GITHUB_STEP_SUMMARY
          else
            echo "### Validation Results" >> $GITHUB_STEP_SUMMARY
            echo "- Frontmatter: ${{ steps.frontmatter.outputs.frontmatter_valid }}" >> $GITHUB_STEP_SUMMARY
            echo "- File Structure: ${{ steps.structure.outputs.structure_valid }}" >> $GITHUB_STEP_SUMMARY
            echo "- File Integrity: ${{ steps.integrity.outputs.integrity_valid }}" >> $GITHUB_STEP_SUMMARY
            echo "" >> $GITHUB_STEP_SUMMARY
          fi
        shell: bash

      - name: Final validation check
        id: final-check
        # Only run this check if we actually had MDX files to validate
        if: steps.changed-files.outputs.count > 0
        run: |
          validation_failed=false
          
          if [ "${{ steps.frontmatter.outputs.frontmatter_valid }}" != "true" ]; then
            echo "Frontmatter validation failed"
            validation_failed=true
          fi
          
          if [ "${{ steps.structure.outputs.structure_valid }}" != "true" ]; then
            echo "File structure validation failed"
            validation_failed=true
          fi
          
          if [ "${{ steps.integrity.outputs.integrity_valid }}" != "true" ]; then
            echo "File integrity validation failed"
            validation_failed=true
          fi
          
          if [ "$validation_failed" = true ]; then
            echo "status=failed" >> $GITHUB_OUTPUT
            exit 1
          else
            echo "status=passed" >> $GITHUB_OUTPUT
            echo "All validations passed"
          fi
        shell: bash

      - name: Handle no-files-to-validate case
        # Run only when there are no MDX files to validate
        if: steps.changed-files.outputs.count == 0
        run: |
          echo "No translation MDX files to validate - PR is valid"
          echo "status=no-changes" >> ${{ steps.final-check.outputs }}
        shell: bash
```

**Best practices for external translation workflows**

* **Preserve frontmatter**: Ensure translators keep YAML frontmatter intact, translating only `title` and `description` values.
* **Protect code blocks**: Mark code blocks as "do not translate" for your vendors.
* **Use translation memory**: Provide glossaries with technical terms that should remain in English or have specific translations.
* **Automate validation**: Use CI checks to verify MDX syntax and frontmatter before merging translations.
* **Version control**: Track the source version for each translation to identify outdated content.

### Images and media

Store translated images in language-specific directories.

```
images/
├── dashboard.png          # English version
├── fr/
│   └── dashboard.png     # French version
└── es/
    └── dashboard.png     # Spanish version
```

Reference images using relative paths in your translated content.

```mdx es/index.mdx theme={null}
![Captura de pantalla del panel de control](/images/es/dashboard.png)
```

## SEO for multi-language sites

Optimize each language version for search engines.

### Page metadata

Include translated metadata in each file's frontmatter:

```mdx fr/index.mdx theme={null}
---
title: "Commencer"
description: "Apprenez à commencer avec notre produit."
keywords: ["démarrage", "tutoriel", "guide"]
---
```

## Best practices

### Date and number formats

Consider locale-specific formatting for dates and numbers.

* Date formats: MM/DD/YYYY (month/day/year) vs DD/MM/YYYY (day/month/year)
* Number formats: 1,000.00 vs 1.000,00
* Currency symbols: \$100.00 vs 100,00€

Include examples in the appropriate format for each language or use universally understood formats.

### Maintain consistency

* Maintain content parity across all languages to ensure every user gets the same quality of information.
* Create a translation glossary for technical terms.
* Keep the same content structure across languages.
* Match the tone and style of your source content.
* Use Git branches to manage translation work separately from main content updates.

### Layout differences

Some languages require more or less space than English. Test your translated content on different screen sizes to ensure:

* Navigation fits properly.
* Code blocks don't overflow.
* Tables and other formatted text remain readable.
* Images scale appropriately.

### Character encoding

Ensure your development environment and deployment pipeline support UTF-8 encoding to properly display all characters in languages with different alphabets and special characters.

## Frequently asked questions

<AccordionGroup>
  <Accordion title="Do I need to translate every page before launching a new language?">
    No. You can launch a language with partial coverage and expand over time. A common approach is to translate your most-visited pages first—typically getting started content, authentication, and top how-to guides—and leave lower-traffic reference content in the default language until translations are ready. Users generally prefer some translated content over none.
  </Accordion>

  <Accordion title="What happens when a translated page is missing?">
    If a user navigates to a translated URL that doesn't exist, they'll see a 404. To avoid this, either only include translated pages in your language-specific navigation or maintain parity between your default language and translated content. Using the same file structure across languages makes it easy to identify which translations are missing.
  </Accordion>

  <Accordion title="Should navigation labels be translated?">
    Yes. Navigation labels—group names, tab titles, anchor text—should match the language of the content. An English "Getting started" label in a Spanish documentation section creates a jarring experience. Mintlify supports language-specific navigation structures, so each language can have fully translated labels.
  </Accordion>

  <Accordion title="How do I handle code examples in translated content?">
    Code itself should not be translated—variable names, function calls, and syntax are language-agnostic. Comments within code blocks can be translated if they explain concepts users need to understand. Instructions surrounding code blocks should be fully translated.
  </Accordion>

  <Accordion title="Does Mintlify support right-to-left languages like Arabic or Hebrew?">
    Yes. Arabic (`ar`) and Hebrew (`he`) are in the supported language codes list. Mintlify handles RTL layout automatically when these language codes are configured. Test your documentation in RTL to verify that navigation, tables, and code blocks display correctly.
  </Accordion>
</AccordionGroup>

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


