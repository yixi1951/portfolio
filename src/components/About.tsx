import { WordsPullUpMultiStyle } from './WordsPullUpMultiStyle'
import { AnimatedParagraph } from './AnimatedLetter'
import { profile } from '../data/profile'

export function About() {
  return (
    <section id="about" className="bg-black px-4 py-20 sm:px-6 md:py-28 lg:py-32">
      <div className="mx-auto max-w-6xl rounded-none bg-[#101010] px-6 py-16 text-center sm:px-10 sm:py-20 md:px-16 md:py-24">
        <p className="mb-8 text-[10px] text-primary sm:mb-10 sm:text-xs">关于我</p>

        <WordsPullUpMultiStyle
          className="mx-auto mb-10 max-w-3xl text-3xl leading-[0.95] sm:mb-12 sm:text-4xl sm:leading-[0.9] md:text-5xl lg:text-6xl xl:text-7xl"
          segments={[
            { text: '我是杨子烽，', className: 'font-normal' },
            {
              text: '深圳大学信息与计算科学学生。',
              className: 'font-serif italic',
            },
            {
              text: '专注机器学习、数据工程与可解释 AI 应用。',
              className: 'font-normal',
            },
          ]}
        />

        <AnimatedParagraph
          text={profile.bio}
          className="mx-auto max-w-2xl text-xs text-[#DEDBC8] sm:text-sm md:text-base"
        />

        <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-4 text-left sm:grid-cols-2 sm:gap-3">
          <div className="rounded-2xl border border-white/5 bg-black/40 p-5">
            <p className="text-[10px] text-gray-500 sm:text-xs">教育背景</p>
            <p className="mt-2 text-sm text-primary sm:text-base">{profile.education.school}</p>
            <p className="mt-1 text-xs text-gray-400 sm:text-sm">{profile.education.major}</p>
            <p className="mt-2 text-xs text-gray-500">{profile.education.period}</p>
            <p className="mt-1 text-xs text-gray-500">
              GPA {profile.education.gpa} · {profile.education.gpaRank}
            </p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-black/40 p-5">
            <p className="text-[10px] text-gray-500 sm:text-xs">荣誉奖项</p>
            <ul className="mt-2 space-y-2">
              {profile.honors.map((honor) => (
                <li key={honor} className="text-xs text-gray-400 sm:text-sm">
                  · {honor}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mx-auto mt-4 max-w-3xl rounded-2xl border border-white/5 bg-black/40 p-5 text-left">
          <p className="text-[10px] text-gray-500 sm:text-xs">主修课程</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {profile.education.courses.map((course) => (
              <span
                key={course}
                className="rounded-full border border-white/10 px-3 py-1 text-xs text-primary/80"
              >
                {course}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
