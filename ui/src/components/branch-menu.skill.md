# branchMenu - the branch chip of the app bar, a worktree switcher when there are several

```js
branchMenu()
```

No props. Reads `rfm.git` and `rfm.api`. Renders nothing outside a repository, a button to the git
status with one worktree, and a `menuButton` of worktrees plus "Git status" with more. Switching a
worktree posts to `/api/git/switch-worktree` and reloads the page on the files screen.
