import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import giscusTalk from 'vitepress-plugin-comment-with-giscus';
import { useData, useRoute } from 'vitepress';
import { toRefs } from "vue";
import { h } from 'vue'

import {
  InjectionKey as NolebaseEnhancedReadabilitiesInjectionKey,
  LayoutMode as NolebaseEnhancedReadabilitiesLayoutMode,
  NolebaseEnhancedReadabilitiesMenu,
  NolebaseEnhancedReadabilitiesScreenMenu,
} from '@nolebase/vitepress-plugin-enhanced-readabilities/client'

import {
  NolebaseInlineLinkPreviewPlugin,
} from '@nolebase/vitepress-plugin-inline-link-preview/client'

import {
  NolebaseHighlightTargetedHeading,
} from '@nolebase/vitepress-plugin-highlight-targeted-heading/client'

import {
  InjectionKey as NolebaseGitChangelogInjectionKey,
  NolebaseGitChangelogPlugin,
} from '@nolebase/vitepress-plugin-git-changelog/client'

import {
  NolebasePagePropertiesPlugin,
} from '@nolebase/vitepress-plugin-page-properties/client'

import {
  NolebaseUnlazyImg,
} from '@nolebase/vitepress-plugin-thumbnail-hash/client'

import { creators } from '../creators'

import AppContainer from './components/AppContainer.vue'
import DocFooter from './components/DocFooter.vue'
import HomePage from './components/HomePage.vue'
import Share from './components/Share.vue'
import TocList from './components/TocList.vue'

import '@nolebase/vitepress-plugin-enhanced-readabilities/client/style.css'
import '@nolebase/vitepress-plugin-highlight-targeted-heading/client/style.css'
import '@nolebase/vitepress-plugin-inline-link-preview/client/style.css'
import '@nolebase/vitepress-plugin-git-changelog/client/style.css'
import '@nolebase/vitepress-plugin-page-properties/client/style.css'
import '@nolebase/vitepress-plugin-thumbnail-hash/client/style.css'
import '@nolebase/vitepress-plugin-enhanced-mark/client/style.css'

import 'virtual:uno.css'

import '../styles/main.css'
import '../styles/vars.css'

import('@nolebase/vitepress-plugin-inline-link-preview/client')

const ExtendedTheme: Theme = {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
      'doc-top': () => [
        h(NolebaseHighlightTargetedHeading),
      ],
      'doc-footer-before': () => [
        h(DocFooter),
      ],
      'nav-bar-content-after': () => [
        h(NolebaseEnhancedReadabilitiesMenu),
        h(Share),
      ],
      'nav-screen-content-after': () => [
        h(NolebaseEnhancedReadabilitiesScreenMenu),
      ],
    })
  },
  enhanceApp({ app }) {
    /**
     * Have to manually import and register the essential components that needed during build globally.
     *
     * Learn more at: Warn `Hydration completed but contains mismatches.` and Custom components are not rendered · Issue #1918 · vuejs/vitepress
     * https://github.com/vuejs/vitepress/issues/1918
     */

    // app.component('HomePage', HomePage)
    app.component('DocFooter', DocFooter)
    app.component('Share', Share)
    app.component('TocList', TocList)
    app.component('AppContainer', AppContainer)
    app.component('NolebaseUnlazyImg', NolebaseUnlazyImg)

    app.provide(NolebaseEnhancedReadabilitiesInjectionKey, {
      layoutSwitch: {
        defaultMode: NolebaseEnhancedReadabilitiesLayoutMode.SidebarWidthAdjustableOnly,
      },
      spotlight: {
        defaultToggle: true,
        hoverBlockColor: 'rgb(240 197 52 / 7%)',
      },
    })

    // app.provide(NolebaseGitChangelogInjectionKey, {
    //   mapContributors: creators,
    // })

    app.use(NolebaseInlineLinkPreviewPlugin)
    app.use(NolebaseGitChangelogPlugin)
    app.use(NolebasePagePropertiesPlugin<{
      tags: string[]
      progress: number
    }>(), {
      properties: {
        'zh-CN': [
          {
            key: 'tags',
            type: 'tags',
            title: '标签',
          },
          {
            key: 'progress',
            type: 'progress',
            title: '完成进度',
          },
          {
            key: 'wordCount',
            type: 'dynamic',
            title: '字数',
            options: {
              type: 'wordsCount',
            },
          },
          {
            key: 'readingTime',
            type: 'dynamic',
            title: '阅读时间',
            options: {
              type: 'readingTime',
              dateFnsLocaleName: 'zhCN',
            },
          },
        ],
      },
    })
  },
  setup() {
    // Get frontmatter and route
    const { frontmatter } = toRefs(useData());
    const route = useRoute();
    
    // Obtain configuration from: https://giscus.app/
    giscusTalk({
      // Giscus 配置对象
      repo: 'XyeaOvO/nolebase-template', // 【已更新】GitHub 仓库名称 [用户名/仓库名]
      repoId: 'R_kgDOOYX6Vg',           // 【已更新】GitHub 仓库 ID
      category: 'Announcements',         // 【已更新】GitHub Discussions 分类名称
      categoryId: 'DIC_kwDOOYX6Vs4CpBvL', // 【已更新】GitHub Discussions 分类 ID
      mapping: 'title',                  // 【已更新】评论与页面的映射方式（此处使用页面标题）
      inputPosition: 'top',              // 【已更新】评论输入框的位置（'top' 或 'bottom'）
      lang: 'zh-CN',                     // 【已更新】Giscus 界面的语言（中文简体）

      // i18n 国际化设置（注意：此配置会覆盖上面 lang 设置的默认语言）
      // 配置为一个对象，内部为键值对：
      // [你的 i18n 配置名称]: [对应 Giscus 中的语言包名称]
      locales: {                         // 【保留】原始的国际化语言映射
        'zh-Hans': 'zh-CN',            // 网站使用 'zh-Hans' 时，Giscus 使用 'zh-CN'
        'en-US': 'en'                  // 网站使用 'en-US' 时，Giscus 使用 'en'
      },

      homePageShowComment: true,       // 【保留】是否在主页显示评论区，默认为 false

      // 主题设置
      // 注意：<script> 标签使用的是 data-theme="preferred_color_scheme"（自动根据系统主题切换）
      // 而此处的 giscusTalk 配置使用了分别指定 light/dark 主题的方式。
      // 我们保留了原始的独立主题设置，除非你想修改 giscusTalk 的逻辑以适应单一 'theme' 键。
      lightTheme: 'light',             // 【保留】浅色模式下的 Giscus 主题 (可根据需要调整)
      darkTheme: 'transparent_dark',   // 【保留】深色模式下的 Giscus 主题 (可根据需要调整)

      // --- 从 <script> 标签中提取的其他参数（如果 giscusTalk 支持，可以取消注释并添加） ---
      // Giscus 是否启用 Reactions (点赞等表情反馈)
      // reactionsEnabled: true,       // 对应 data-reactions-enabled="1"
      // 是否启用严格模式匹配 (0 表示不启用)
      // strict: false,                // 对应 data-strict="0"
      // 是否发送元数据 (0 表示不发送)
      // emitMetadata: false,          // 对应 data-emit-metadata="0"
      // --- ---

    }, {
      // 第二个参数，通常用于传递页面特有的数据给 giscusTalk 函数
      frontmatter, // 页面的 frontmatter 数据
      route        // 当前页面的路由信息
    },
      // 第三个参数：是否默认在所有页面启用评论区。
      // 默认为 true，表示启用，可以忽略此参数；
      // 如果为 false，表示默认禁用。
      // 之后可以在具体页面的 frontmatter 中使用 `comment: true` 来单独启用。
      true
    );
  }
}

export default ExtendedTheme
