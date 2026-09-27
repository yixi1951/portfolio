import type { Localized } from './types'

export const profile = {
  name: '杨子烽',
  nameEn: 'Yang Zifeng',
  location: { zh: '中山市', en: 'Zhongshan' } satisfies Localized,
  email: '1329081319@qq.com',
  phone: '+86 180-2481-8503',
  phoneHref: 'tel:+8618024818503',
  githubUsername: 'yixi1951',
  githubUrl: 'https://github.com/yixi1951',
  role: { zh: '计算机软件 · AI', en: 'Software · AI' } satisfies Localized,
  school: { zh: '深圳大学', en: 'Shenzhen University' } satisfies Localized,
  major: {
    zh: '信息与计算科学（数学与计算机实验班）',
    en: 'Information and Computing Science (Mathematics & CS experimental class)',
  } satisfies Localized,
  degree: { zh: '本科', en: "Bachelor's" } satisfies Localized,
  period: '2023.09 — 2027.06',
  gpa: '3.27 / 4.5',
  gpaRank: { zh: '专业前 50%', en: 'Top 50% of the major' } satisfies Localized,
  courses: [
    { zh: '数学分析', en: 'Mathematical Analysis' },
    { zh: '计算机系统', en: 'Computer Systems' },
    { zh: '机器学习', en: 'Machine Learning' },
  ] satisfies Localized[],
  honors: [
    { zh: '国家励志奖学金', en: 'National Encouragement Scholarship' },
    { zh: '深圳杯挑战赛决赛三等奖', en: 'Third prize, Shenzhen Cup Challenge final' },
    { zh: '全国数学建模大赛广东省一等奖', en: 'First prize, Guangdong, National Mathematical Modeling Contest' },
  ] satisfies Localized[],
  leadership: {
    role: { zh: '数学科学学院团支书', en: 'League secretary, School of Mathematical Sciences' } satisfies Localized,
    period: '2023.09 — 2026.06',
    highlights: [
      {
        zh: '策划线上与线下主题团课 8 场，参与率约 95%',
        en: 'Planned 8 online and offline themed league classes, with about 95% participation',
      },
      {
        zh: '参加团支书大会，推动团员参与团课',
        en: 'Joined league-secretary meetings and encouraged members to attend league classes',
      },
    ] satisfies Localized[],
  },
  languages: [
    { name: { zh: '普通话', en: 'Mandarin' }, level: { zh: '母语', en: 'Native' } },
    { name: { zh: '英语', en: 'English' }, level: { zh: '四级 524 分', en: 'CET-4, 524' } },
  ],
  hobby: {
    zh: '篮球，参加过校篮球赛',
    en: 'Basketball, including a campus tournament',
  } satisfies Localized,
  intent: {
    zh: '求职方向是计算机软件与 AI。资料中的实习意向为每周 5 天、持续 3 个月，最早可到岗时间为 2026 年 7 月 1 日。',
    en: 'Aiming at software and AI roles. The profile lists an internship of 5 days a week for 3 months, available from 1 July 2026.',
  } satisfies Localized,
  bio: {
    zh: '深圳大学信息与计算科学（数学与计算机实验班）本科在读，2023 年 9 月入学，预计 2027 年 6 月毕业。GPA 3.27/4.5，专业前 50%。公开仓库里，近期工作主要是多源舆情与多 Agent 选股、农作物病虫害识别，以及离线表格核验。',
    en: 'Undergraduate in Information and Computing Science at Shenzhen University, enrolled September 2023 and expected to graduate June 2027. GPA 3.27/4.5, top 50% of the major. Recent public work covers multi-source opinion research with multi-agent scoring, crop-disease recognition, and offline spreadsheet reconciliation.',
  } satisfies Localized,
  heroTagline: {
    zh: '把数据采集、模型和能打开看的界面做成完整项目。最近在做舆情选股、农作物病害识别和表格核验。',
    en: 'I turn data collection, models, and a usable interface into complete projects — lately opinion-driven stock research, crop-disease recognition, and spreadsheet reconciliation.',
  } satisfies Localized,
}

export type SkillItem = { name: string; note: Localized }

export const skillGroups: { title: Localized; items: SkillItem[] }[] = [
  {
    title: { zh: '语言', en: 'Languages' },
    items: [
      { name: 'Python', note: { zh: '舆情、病害识别、建模与核验', en: 'Opinion research, vision, modeling, reconciliation' } },
      { name: 'TypeScript', note: { zh: 'Next.js 仪表盘、电台前端与本站', en: 'Next.js dashboard, radio client, this site' } },
      { name: 'HTML', note: { zh: '表核验单文件页面', en: 'Single-file spreadsheet reconciler' } },
      { name: 'C / C++', note: { zh: '基础', en: 'Fundamentals' } },
    ],
  },
  {
    title: { zh: 'AI 与数据', en: 'AI & data' },
    items: [
      { name: 'PyTorch', note: { zh: 'MobileNetV2 多任务视觉模型', en: 'MobileNetV2 multi-task vision model' } },
      { name: 'pandas', note: { zh: '采集、清洗、聚合与核验', en: 'Ingest, cleaning, aggregation, reconciliation' } },
      { name: 'LLM / Agent', note: { zh: 'DeepSeek、OpenClaw、三分析师共识', en: 'DeepSeek, OpenClaw, three-analyst consensus' } },
      { name: '数学建模', note: { zh: 'MCM Problem C 观众投票反推', en: 'MCM Problem C fan-vote inference' } },
    ],
  },
  {
    title: { zh: '工程', en: 'Engineering' },
    items: [
      { name: 'React', note: { zh: '本站与 Claudio 前端', en: 'This site and the Claudio client' } },
      { name: 'Flask', note: { zh: '病害识别 Web 控制台', en: 'Disease-recognition web console' } },
      { name: 'Streamlit', note: { zh: '舆情投研仪表盘', en: 'Opinion-research dashboard' } },
      { name: 'Docker', note: { zh: '病害识别 Compose 部署', en: 'Compose deploy for disease recognition' } },
      { name: 'pytest / CI', note: { zh: 'GitHub Actions，覆盖率门槛 55%+', en: 'GitHub Actions, 55%+ coverage gate' } },
      { name: 'Excel', note: { zh: '表格核验；资料中的 DCF 与 VLOOKUP', en: 'Reconciliation; DCF and VLOOKUP in the profile' } },
    ],
  },
]
