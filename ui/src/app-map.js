import { appMap } from 'imp'

export const app = appMap({
  files: {
    path: '/',
    description: 'Browse and manage the files of the served directory',
    view: { nav: false, description: 'The details and the preview of one file' },
    edit: { nav: false, description: 'Edit a text file' },
  },
  status: { access: 'git', description: 'The working tree status of the git repository' },
  history: { access: 'git', description: 'The commit history of the git repository' },
  diff: { nav: false, access: 'git', description: 'The changes of a commit, a file or the tree' },
  compare: {
    nav: false,
    access: 'git',
    description: 'Everything that changed between two commits',
  },
})
