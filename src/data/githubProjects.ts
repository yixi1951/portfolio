import type { Localized } from './types'

export type ProjectMeta = {
  title: Localized
  summary: Localized
  highlights: Localized[]
  tags: string[]
  language: string
  /** Other languages reported by the GitHub languages API, largest first. */
  also: string[]
  period: string
  /** Smaller number appears first among the same featured group. */
  order: number
  featured: boolean
  /** In-site page. When set, the card opens this path instead of GitHub. */
  sitePath?: string
}

/** This portfolio repo, unnamed experiments, and anything not meant for a public feature slot. */
export const hiddenGithubRepos = new Set(['-', 'portfolio'])

export const githubProjectMeta: Record<string, ProjectMeta> = {
  math1: {
    title: {
      zh: '考研数学一 · 学习站',
      en: 'Kaoyan Math I study site',
    },
    summary: {
      zh: '单页学习站，把考研数学一拆成可检索的短模块。页面自己写的统计是 154 课：高数 69、线代 24、概率 21、技巧 33、易错 7。公式用 MathJax，交互图用 Plotly，另有 SVG 图示。',
      en: 'A single-page study site that splits Kaoyan Math I into searchable short lessons. The page’s own counts are 154 lessons: 69 calculus, 24 linear algebra, 21 probability, 33 techniques, and 7 common traps. Formulas use MathJax, interactive charts use Plotly, and there are SVG diagrams too.',
    },
    highlights: [
      {
        zh: '可按高数、线代、概率、技巧、易错筛选，并搜索模块',
        en: 'Filter by calculus, linear algebra, probability, techniques, or traps, and search the modules',
      },
      {
        zh: '每课含直觉说明、公式、短例和易错；支持深色主题',
        en: 'Each lesson has an intuition note, formulas, a short example, and traps, with a dark theme',
      },
      {
        zh: '页内说明内容是大纲向的原创归纳，不收录商业千题解原文',
        en: 'The page says the notes are original outline-style summaries, not text from commercial solution books',
      },
    ],
    tags: ['HTML', 'MathJax', 'Plotly'],
    language: 'HTML',
    also: [],
    period: '',
    order: 4,
    featured: true,
    sitePath: '/math1/',
  },
  OpinionTradingWorkflow: {
    title: {
      zh: '舆情交易工作流',
      en: 'Opinion Trading Workflow',
    },
    summary: {
      zh: '从股吧、新浪财经、微博、东方财富、雪球和抖音采集舆情，用 OpenClaw 与 DeepSeek 做情感打分，再由情绪、技术、基本面三个分析师形成加权共识，在 Streamlit 和 Next.js 仪表盘里给出可解释的选股结果。',
      en: 'Collects market chatter from Guba, Sina Finance, Weibo, East Money, Xueqiu, and Douyin, scores it with OpenClaw and DeepSeek, then fuses sentiment, technicals, and fundamentals through three analysts. Streamlit and Next.js dashboards show the explainable picks.',
    },
    highlights: [
      {
        zh: '六路采集，行情数据 yfinance → akshare 回退，Parquet 缓存',
        en: 'Six ingest sources, with a yfinance → akshare market-data fallback and Parquet cache',
      },
      {
        zh: '三名分析师加共识引擎，输出分项得分、评论证据与 Kelly 仓位',
        en: 'Three analysts plus a consensus engine: sub-scores, comment evidence, and Kelly sizing',
      },
      {
        zh: 'pytest 120+ 用例，CI 覆盖率门槛 55%+，支持 Python 3.10–3.12',
        en: '120+ pytest cases, a 55%+ CI coverage gate, Python 3.10–3.12',
      },
    ],
    tags: ['Python', 'DeepSeek', 'Multi-agent', 'Streamlit', 'Next.js'],
    language: 'Python',
    also: ['TypeScript', 'PowerShell', 'Shell'],
    period: '2026.03 — 2026.09',
    order: 1,
    featured: true,
  },
  'Plant-Hazard-Risk-Assessment': {
    title: {
      zh: '农作物病虫害风险评估',
      en: 'Plant Hazard Risk Assessment',
    },
    summary: {
      zh: '用 MobileNetV2 多任务模型同时预测 61 类病害、3 级严重程度和风险评分，并用 Grad-CAM 与诊断报告解释结果。Flask 控制台支持单图、URL、拖拽和 ZIP 批量预测。',
      en: 'A MobileNetV2 multi-task model predicts 61 diseases, 3 severity levels, and a risk score, explained with Grad-CAM and diagnostic reports. The Flask console accepts a single image, a URL, drag-and-drop, or a ZIP batch.',
    },
    highlights: [
      {
        zh: '验证集 Top-1 约 74.7%（61 类），宏平均 F1 约 0.70，严重程度约 85%+',
        en: 'Validation Top-1 about 74.7% across 61 classes, macro F1 about 0.70, severity about 85%+',
      },
      {
        zh: 'Grad-CAM 热力图与 MC Dropout 不确定性；JSON / PDF 诊断报告',
        en: 'Grad-CAM heatmaps, MC Dropout uncertainty, and JSON / PDF diagnostic reports',
      },
      {
        zh: 'README 中的部署包括 Docker Compose、PostgreSQL 与 JWT',
        en: 'The README deploy path includes Docker Compose, PostgreSQL, and JWT',
      },
    ],
    tags: ['PyTorch', 'MobileNetV2', 'Flask', 'Grad-CAM', 'Docker'],
    language: 'Python',
    also: ['HTML', 'CSS'],
    period: '2026.05 — 2026.07',
    order: 2,
    featured: true,
  },
  'excel-checkout': {
    title: {
      zh: '表核验',
      en: 'Excel Checkout',
    },
    summary: {
      zh: '完全离线的跨表核验工具。交付物是一个 HTML 文件，双击即可比对两套 Excel / CSV，高亮字段差异并导出报告，数据留在本机浏览器里。仓库里还有 Python 包 data-recon-framework。',
      en: 'An offline reconciler delivered as one HTML file. Open it, compare two Excel or CSV workbooks, highlight field-level diffs, and export a report — data stays in the browser. The repo also includes the Python package data-recon-framework.',
    },
    highlights: [
      {
        zh: '支持 xlsx、xls、csv、tsv；CSV 自动识别 UTF-8 / GBK',
        en: 'Reads xlsx, xls, csv, and tsv, and detects UTF-8 or GBK for CSV',
      },
      {
        zh: '按主键匹配，导出差异明细、未匹配行和问题记录',
        en: 'Matches on a primary key and exports diffs, unmatched rows, and problem records',
      },
      {
        zh: 'Python 侧使用 pandas、openpyxl 与 thefuzz，版本 1.1',
        en: 'The Python side uses pandas, openpyxl, and thefuzz; version 1.1',
      },
    ],
    tags: ['HTML', 'Python', 'pandas', 'Offline'],
    language: 'HTML',
    also: ['Python'],
    period: '2026.07 — 2026.08',
    order: 3,
    featured: true,
  },
  meisai: {
    title: {
      zh: 'MCM Problem C',
      en: 'MCM Problem C',
    },
    summary: {
      zh: '2026 MCM Problem C 的建模仓库：在评委得分和淘汰结果的约束下反推观众投票，比较排名法与百分比法，并分析职业舞者影响与更公平的合成规则。',
      en: 'Modeling repo for 2026 MCM Problem C: infer fan votes from judge scores and elimination results, compare rank and percent aggregation, and study pro-dancer effects plus a fairer combined rule.',
    },
    highlights: [
      {
        zh: '淘汰结果作为硬约束，周与周之间的平滑只作为软偏好',
        en: 'Elimination results are a hard constraint; week-to-week smoothness is only a soft preference',
      },
      {
        zh: '覆盖无淘汰周、多淘汰周，以及数据质量检查',
        en: 'Covers weeks with no elimination, multi-elimination weeks, and data-quality checks',
      },
      {
        zh: '敏感性分析会完整重跑估计，而不是只扰动一次结果',
        en: 'Sensitivity analysis reruns the full estimate instead of perturbing one result',
      },
    ],
    tags: ['Python', 'MCM', 'EDA'],
    language: 'Python',
    also: [],
    period: '2026.01 — 2026.02',
    order: 4,
    featured: false,
  },
  claudio: {
    title: {
      zh: 'Claudio 音乐电台',
      en: 'Claudio Radio',
    },
    summary: {
      zh: '个人 AI 音乐电台的早期版本：Express + WebSocket 后端，React PWA 前端，对接 OpenClaw Gateway。README 里的 Phase 0 已接上开发启动、心跳、健康检查和 PWA 骨架。',
      en: 'An early personal AI music radio: an Express and WebSocket server, a React PWA client, and an OpenClaw Gateway connection. Phase 0 in the README covers the dev start, heartbeat, health check, and PWA shell.',
    },
    highlights: [
      {
        zh: 'client / server 分目录，npm run dev 同时启动两端',
        en: 'Split client and server; npm run dev starts both',
      },
      {
        zh: 'WebSocket /stream 心跳，以及 OpenClaw 健康检查',
        en: 'WebSocket /stream heartbeat and an OpenClaw health check',
      },
    ],
    tags: ['TypeScript', 'React', 'Express', 'WebSocket'],
    language: 'TypeScript',
    also: ['JavaScript', 'HTML'],
    period: '2026.06',
    order: 5,
    featured: false,
  },
}
