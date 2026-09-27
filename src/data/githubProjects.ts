export type Localized = { zh: string; en: string }

export type ProjectMeta = {
  title: Localized
  summary: Localized
  tags: string[]
  language: string
  /** Smaller number appears first. Unlisted repos go after featured ones. */
  order: number
}

/** Repos that are forks leftovers, empty templates, or not meant for the public site. */
export const hiddenGithubRepos = new Set(['-', 'portfolio', 'claudio', 'meisai'])

export const githubProjectMeta: Record<string, ProjectMeta> = {
  OpinionTradingWorkflow: {
    title: {
      zh: '舆情交易工作流',
      en: 'Opinion Trading Workflow',
    },
    summary: {
      zh: '从股吧、微博、雪球等平台采集舆情，用 DeepSeek 做情感打分，再由情绪 / 技术 / 基本面三个 Agent 达成共识，输出可解释的选股信号与 Streamlit 仪表盘。',
      en: 'Collects market chatter from Guba, Weibo, Xueqiu and more, scores it with DeepSeek, then fuses sentiment, technicals and fundamentals through three agents into explainable stock picks and a Streamlit dashboard.',
    },
    tags: ['Python', 'LLM', 'Multi-Agent', '量化'],
    language: 'Python',
    order: 1,
  },
  'Plant-Hazard-Risk-Assessment': {
    title: {
      zh: '农作物病虫害风险评估',
      en: 'Plant Hazard Risk Assessment',
    },
    summary: {
      zh: '多任务深度学习同时识别 61 类病害、严重程度与风险评分，配合 Grad-CAM 热力图、防治方案和 Flask 诊断报告，可 Docker 一键部署。',
      en: 'A multi-task model that names 61 crop diseases, grades severity and risk, then explains itself with Grad-CAM, treatment plans and Flask diagnostic reports. Docker-ready.',
    },
    tags: ['PyTorch', 'Flask', 'CV', '农业 AI'],
    language: 'Python',
    order: 2,
  },
  'excel-checkout': {
    title: {
      zh: '表核验',
      en: 'Excel Checkout',
    },
    summary: {
      zh: '完全离线的跨系统表格核验工具：双击一个 HTML 即可比对两套 Excel / CSV，高亮字段差异、导出报告。数据不出本机浏览器。',
      en: 'An offline spreadsheet reconciler. One HTML file compares two Excel/CSV systems, highlights field-level diffs and exports a report — nothing leaves the browser.',
    },
    tags: ['HTML', 'Pandas', '数据核验'],
    language: 'HTML',
    order: 3,
  },
}
