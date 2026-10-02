export const loadRepository = async (api, repository) => {
  try {
    const summary = await api.get('/api/git/summary')
    repository.set(summary.repository ?? null)
  } catch {
    repository.set(null)
  }
}
