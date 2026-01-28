import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "逃避之外",
    pageTitleSuffix: "",
    enableSPA: true,
    enablePopovers: true,
    analytics: {
      provider: "plausible",
    },
    locale: "en-US",
    baseUrl: "joseph359.github.io/beyond-escape",
    ignorePatterns: ["private", "templates", ".obsidian"],
    defaultDateType: "modified",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "Schibsted Grotesk",
        body: "Source Sans Pro",
        code: "IBM Plex Mono",
      },
      colors: {
        lightMode: {
          // 白天模式：如同清晨的桦树林，清爽的薄荷白背景
          light: "#f4f7f4",       // 背景：极浅的薄荷白
          lightgray: "#e0e8e0",   // 边框：浅灰绿
          gray: "#789c85",        // 次要文字：中等灰绿
          darkgray: "#2c4c3b",    // 主要文字：深苔藓绿（代替纯黑）
          dark: "#1a3c2b",        // 标题：最深的森林绿
          secondary: "#a87b5f",   // 链接：暖土棕色（画中的小路）
          tertiary: "#c29478",    // 悬停：稍亮的陶土色
          highlight: "rgba(168, 123, 95, 0.15)", // 高亮背景
        },
        darkMode: {
          // 黑夜模式：如同深入画面中的密林，沉浸、深邃
          light: "#1a2e22",       // 背景：深邃的墨绿色森林阴影
          lightgray: "#2a4234",   // 边框：稍亮的深绿
          gray: "#7da386",        // 次要文字：柔和的鼠尾草绿
          darkgray: "#e8f0e8",    // 主要文字：米白薄荷色（高可读性）
          dark: "#a2c3a8",        // 标题：明亮的浅灰绿
          secondary: "#b88c70",   // 链接：稍亮的暖棕色，在深背景更显眼
          tertiary: "#d4a88c",    // 悬停色
          highlight: "rgba(184, 140, 112, 0.20)", // 高亮背景
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
      // Comment out CustomOgImages to speed up build time
      Plugin.CustomOgImages(),
    ],
  },
}

export default config
