import { component } from 'imp'
import { gitStatusPanel } from './git-status-panel.js'
import { screenFrame } from '../components/screen-frame.js'

export const gitStatus = component('rfm-git-status', {
  setup: () => screenFrame(gitStatusPanel()),
})
