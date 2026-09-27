const LANGUAGE_COLOR: Record<string, string> = {
  Python: '#3572A5',
  TypeScript: '#3178C6',
  JavaScript: '#F1E05A',
  HTML: '#E34C26',
  CSS: '#563D7C',
  Shell: '#89E051',
  Dockerfile: '#384D54',
  PowerShell: '#012456',
}

export function languageColor(language: string) {
  return LANGUAGE_COLOR[language] ?? '#E4E0CC'
}
