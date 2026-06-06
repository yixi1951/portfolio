export const profile = {
  name: '杨子烽',
  nameEn: 'Yang Zifeng',
  location: '中山市',
  email: '1329081319@qq.com',
  phone: '+86 180-2481-8503',
  github: 'yixi1951',
  jobIntent: '计算机软件 · AI',
  internship: {
    daysPerWeek: 5,
    durationMonths: 3,
    grade: '大三',
    availableFrom: '2026-07-01',
  },
  education: {
    school: '深圳大学',
    major: '信息与计算科学（数学与计算机实验班）',
    degree: '本科',
    period: '2023.09 — 2027.06',
    gpa: '3.27 / 4.5',
    gpaRank: '专业 Top 50%',
    courses: ['数学分析', '计算机系统', '机器学习'],
  },
  honors: [
    '国家励志奖学金',
    '深圳杯挑战赛决赛三等奖',
    '全国数学建模大赛广东省一等奖',
  ],
  skills: [
    { name: 'Python', level: '项目实战' },
    { name: '机器学习', level: '模型训练与部署' },
    { name: '数据工程', level: '采集 · 清洗 · 可视化' },
    { name: 'C / C++', level: '基础' },
    { name: 'Excel', level: 'DCF 模型 · V-lookup' },
    { name: '数学建模', level: '数据分析与可视化' },
  ],
  languages: [
    { name: '普通话', level: '母语' },
    { name: '英语', level: '四级 524 分' },
  ],
  certificates: ['英语四级'],
  hobbies: ['篮球（参加过校篮球比赛）'],
  leadership: {
    role: '数学科学学院团支书',
    period: '2023.09 — 2026.06',
    highlights: [
      '策划「线上 + 线下」主题团课 8 场，参与率达 95%',
      '参与团支书大会，推进团员参与团课',
    ],
  },
  bio:
    '深圳大学信息与计算科学（数学与计算机实验班）大三在读，GPA 3.27/4.5，专业 Top 50%。曾获国家励志奖学金、深圳杯挑战赛决赛三等奖、全国数学建模大赛广东省一等奖。求职方向为计算机软件与 AI，预计 2026 年 7 月入职，每周可实习 5 天，持续 3 个月。',
  heroTagline:
    '深圳大学大三学生，专注机器学习、数据工程与可解释 AI 应用。从舆情分析到计算机视觉，构建端到端可演示的 AI 系统。',
}

export interface ProjectHighlight {
  name: string
  displayName: string
  role: string
  period: string
  url: string
  language: string
  updatedAt: string
  summary: string
  tags: string[]
  highlights: string[]
}

export const projects: ProjectHighlight[] = [
  {
    name: 'OpinionTradingWorkflow',
    displayName: 'OpenClaw AI 舆情选股系统',
    role: '个人开发者',
    period: '2026.02 — 2026.06',
    url: 'https://github.com/yixi1951/OpinionTradingWorkflow',
    language: 'Python',
    updatedAt: '2026-06',
    summary:
      '多源舆情采集、LLM 情感分析与可解释投研仪表盘，覆盖采集到回测的完整流水线。',
    tags: ['LLM', 'Streamlit', 'OpenClaw', '量化投研'],
    highlights: [
      '搭建股吧、新浪、微博、东财、雪球、抖音 6 平台采集流水线，单日处理 300+ 条原始帖',
      '对接 OpenClaw Gateway + DeepSeek，自研 WebSocket→HTTP 代理实现批量情感打分',
      '基于 pandas 加权聚合输出 Top-N 选股信号，Streamlit 展示证据链与简易回测',
      'Windows 一键部署脚本 + pytest，支持 Stub 无 API 演示模式',
    ],
  },
  {
    name: 'Plant-Hazard-Risk-Assessment',
    displayName: '智农 · 农作物病虫害 AI 识别预警',
    role: '个人开发者',
    period: '2026.02 — 2026.06',
    url: 'https://github.com/yixi1951/Plant-Hazard-Risk-Assessment',
    language: 'Python',
    updatedAt: '2026-06',
    summary:
      '多任务深度学习识别 61 类病害，同步输出严重程度与风险评分，含 Web 控制台与诊断报告。',
    tags: ['PyTorch', 'Flask', 'Grad-CAM', '计算机视觉'],
    highlights: [
      'MobileNetV2 多任务框架，验证集 Top-1 准确率约 74.7%',
      'Grad-CAM 可解释诊断与 MC Dropout 不确定性分析',
      'Flask Web 控制台：单图/URL/拖拽/ZIP 批量预测 + ECharts 仪表盘',
      '自动生成 JSON/PDF 诊断报告，含防治建议与标注结果图',
    ],
  },
  {
    name: 'meisai',
    displayName: 'MCM 数学建模 · Problem C',
    role: '个人开发者',
    period: '2026.01 — 2026.02',
    url: 'https://github.com/yixi1951/meisai',
    language: 'Python',
    updatedAt: '2026-02',
    summary:
      '2026 MCM Problem C 数学建模项目，观众投票反推、评委评分时序分析与数据质量检验。',
    tags: ['数学建模', '数据分析', 'EDA', '可视化'],
    highlights: [
      '动态识别多周评委评分列，完成清洗与质量检验闭环',
      '观众投票估算与排名一致性验证',
      '完整 EDA 可视化：评分分布、留存曲线、争议度分析',
      '支撑全国数学建模大赛广东省一等奖',
    ],
  },
]
