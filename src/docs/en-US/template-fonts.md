# Template Font Settings

Previous font configuration methods had limitations, strictly writing the user-configured `templateFonts` font-family string into the template's css font-family, which required system-level font installation. In some environments (such as Docker images, minimal Linux distributions, etc.), font management tools also need to be installed manually, making deployment difficult.

Therefore, starting from version `2.4.0`, the plugin implements a new font management system. You can now upload font files directly and configure separate font lists for three styles (`sans`, `serif`, `mono`). The fallback order (priority) is determined by the order in the list.

Now, when calling `puppeteer` to generate images, the plugin injects the static path of font files and the css font-face registration code, so there is no need to rely on system environment fonts.

## Installing Fonts

The default **Font Directory** is `data/fonts/dota2tracker`. You can change this via the `fontPath` configuration option.

Navigate to the `Resource Explorer` in the console, find the **Font Directory**, right-click, and select **Upload Files** to upload your font files.

```text
Resource Explorer
├ data/
│ ├ assets/
│ ├ ...
│ └ fonts/
│   └ dota2tracker/  <-- Put font files here
│     ├ fontA.ttf
│     ├ fontB.otf
│     ├ fontC.ttc
│     └ ...
```

## Loading Fonts

The plugin automatically scans all font files in the **Font Directory** and uses `fontkit` to read font metadata.
Supported formats: `.ttf`, `.otf`, `.woff`, `.woff2`, `ttc`, `sfnt`.

Once loaded, a list of font names is generated. These will automatically appear in the dropdown menu for `fonts.*` configuration options, allowing for easy selection.

The plugin merges the same font family with different weights/styles to adapt to different scenarios, but different language versions are not merged.

Example:
```text
[Before Loading] File list in font directory:
├─ Roboto-Bold.ttf
├─ Roboto-Regular.ttf
├─ NotoSansSC-Bold.otf
└─ NotoSansSC-Regular.otf

[After Loading] Options in configuration dropdown:
├─ Roboto          (Merged Bold and Regular)
└─ Noto Sans SC    (Merged Bold and Regular)
```

## Font Recommendations
> [!IMPORTANT] Disclaimer
> Represents personal preference only.

### **[fonts.sans](../configs.md#fonts-sans-dynamic)**
> Body Text

Used for the main text content.
We recommend using standard, easy-to-read sans-serif fonts like `Roboto`, `Open Sans`, or `Arial`.

**Fallback Mechanism**
You can configure multiple fonts to handle different languages or symbols. The plugin uses the fonts in the order they are listed.
For example, if you place an English-optimized font first and a CJK (Chinese/Japanese/Korean) font second, the English font will be used for Latin characters, and the CJK font will be used for characters missing from the first font.

### **[fonts.serif](../configs.md#fonts-serif-dynamic)**
> Title Text

Used for titles and headers.
Serif fonts like `Merriweather` or `Times New Roman` are good choices for a more formal or decorative look.

### **[fonts.mono](../configs.md#fonts-mono-dynamic)**
> Code & Number Text

Used for displaying numbers and code-like data.
Monospace fonts like `Fira Code`, `JetBrains Mono`, or `Consolas` are recommended for better alignment and readability.

If left empty, it will automatically fallback to the `fonts.sans` configuration to maintain consistency with the body text style.
