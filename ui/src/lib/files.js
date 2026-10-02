import {
  luFile,
  luFileArchive,
  luFileCode,
  luFileHeadphone,
  luFileImage,
  luFileSpreadsheet,
  luFileText,
  luFileVideoCamera,
  luFileX,
  luFolder,
} from 'imp/icons'

const ICONS_BY_KIND = {
  folder: luFolder,
  image: luFileImage,
  video: luFileVideoCamera,
  audio: luFileHeadphone,
  archive: luFileArchive,
  pdf: luFileText,
  spreadsheet: luFileSpreadsheet,
  document: luFileText,
  text: luFileText,
  code: luFileCode,
  file: luFile,
}

export const iconOfKind = (kind) => ICONS_BY_KIND[kind] ?? luFile

export const iconOfEntry = (entry) => (entry.isBroken ? luFileX : iconOfKind(entry.kind))

const extensionOf = (name) => {
  const dot = name.lastIndexOf('.')
  return dot <= 0 ? '' : name.slice(dot).toLowerCase()
}

const LANGUAGES_BY_EXTENSION = {
  '.js': 'javascript',
  '.mjs': 'javascript',
  '.cjs': 'javascript',
  '.jsx': 'jsx',
  '.ts': 'typescript',
  '.mts': 'typescript',
  '.cts': 'typescript',
  '.tsx': 'tsx',
  '.json': 'json',
  '.jsonc': 'json',
  '.html': 'html',
  '.htm': 'html',
  '.xml': 'xml',
  '.svg': 'svg',
  '.vue': 'vue',
  '.svelte': 'svelte',
  '.css': 'css',
  '.scss': 'scss',
  '.sass': 'scss',
  '.md': 'markdown',
  '.markdown': 'markdown',
  '.yml': 'yaml',
  '.yaml': 'yaml',
  '.sh': 'bash',
  '.bash': 'bash',
  '.zsh': 'bash',
  '.ps1': 'powershell',
  '.py': 'python',
  '.go': 'go',
  '.rs': 'rust',
  '.java': 'java',
  '.kt': 'kotlin',
  '.swift': 'swift',
  '.dart': 'dart',
  '.scala': 'scala',
  '.cs': 'csharp',
  '.c': 'c',
  '.h': 'c',
  '.cpp': 'cpp',
  '.cc': 'cpp',
  '.cxx': 'cpp',
  '.hpp': 'cpp',
  '.php': 'php',
  '.rb': 'ruby',
  '.pl': 'perl',
  '.lua': 'lua',
  '.r': 'r',
  '.ex': 'elixir',
  '.exs': 'elixir',
  '.hs': 'haskell',
  '.clj': 'clojure',
  '.sql': 'sql',
  '.graphql': 'graphql',
  '.tf': 'hcl',
  '.toml': 'toml',
  '.ini': 'ini',
  '.cfg': 'ini',
  '.conf': 'ini',
  '.diff': 'diff',
  '.patch': 'diff',
}

const LANGUAGES_BY_NAME = {
  dockerfile: 'dockerfile',
  containerfile: 'dockerfile',
  makefile: 'makefile',
  '.gitignore': 'bash',
  '.env': 'bash',
}

export const languageOf = (path) => {
  const name = path.slice(path.lastIndexOf('/') + 1).toLowerCase()
  return LANGUAGES_BY_NAME[name] ?? LANGUAGES_BY_EXTENSION[extensionOf(name)] ?? 'text'
}

const VIDEO_EXTENSIONS = ['.mp4', '.avi', '.mov', '.mkv', '.webm', '.wmv', '.flv', '.m4v']
const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.flac', '.ogg', '.aac', '.m4a', '.opus', '.wma']
const HTML_EXTENSIONS = ['.html', '.htm']

export const previewKindOf = (entry) => {
  const extension = extensionOf(entry.name)
  if (entry.isImage) return 'image'
  if (VIDEO_EXTENSIONS.includes(extension)) return 'video'
  if (AUDIO_EXTENSIONS.includes(extension)) return 'audio'
  if (extension === '.pdf') return 'pdf'
  if (entry.isMarkdown) return 'markdown'
  if (HTML_EXTENSIONS.includes(extension)) return 'html'
  return null
}

export const GIT_STATUSES = {
  added: { label: 'A', title: 'Added / Untracked', color: 'green' },
  modified: { label: 'M', title: 'Modified', color: 'amber' },
  deleted: { label: 'D', title: 'Deleted', color: 'red' },
  renamed: { label: 'R', title: 'Renamed', color: 'blue' },
}

const FRONTMATTER_PATTERN = /^(---|\+\+\+)[ \t]*\r?\n(?:[\s\S]*?\r?\n)?\1[ \t]*(?:\r?\n|$)/

export const stripFrontmatter = (markdown) => markdown.replace(FRONTMATTER_PATTERN, '')
