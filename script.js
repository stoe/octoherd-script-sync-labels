import {readFileSync} from 'fs'
import defaultLabels from './labels.js'

/**
 * @param {import('@octoherd/cli').Octokit} octokit
 * @param {import('@octoherd/cli').Repository} repository
 * @param { {defaults: boolean, path: string, template: string} } options Custom user options passed to the CLI
 */
export async function script(octokit, repository, {defaults = false, path = null, template = null}) {
  if (repository.archived) {
    octokit.log.info({change: false}, `repository archived`)
    return
  }

  if (repository.fork) {
    octokit.log.info({change: false}, `repository is a fork`)
    return
  }

  // fail fast
  if (!defaults && !path && !template) {
    throw new Error(`Either --defaults, --path or --template must be defined`)
  }

  const {
    owner: {login: owner},
    name: repo,
    full_name,
    html_url
  } = repository

  let wantLabels = []

  // use local default labels from './labels.js'
  if (defaults) {
    wantLabels = defaultLabels
  }

  // read labels from provided JSON
  if (path) {
    const buff = readFileSync(path, 'utf-8')
    const str = buff.toString('utf-8')

    wantLabels = JSON.parse(str)
  }

  // load labels from another repo
  if (template) {
    if (template === full_name) {
      octokit.log.warn(`skipping ${template}`)
      return
    }

    try {
      const [ownerSync, repoSync] = template.split('/')

      const {data} = await octokit.request('GET /repos/{owner}/{repo}/labels', {
        owner: ownerSync,
        repo: repoSync
      })

      wantLabels = data.map(({name, description, color}) => {
        return {name, description, color}
      })
    } catch (error) {
      octokit.log.error(`${error.message}`)
      return
    }
  }

  // current labels
  const {data} = await octokit.request('GET /repos/{owner}/{repo}/labels', {
    owner,
    repo,
    per_page: 100
  })

  const currentLabels = data.map(({name, description, color}) => {
    return {name, description, color}
  })

  // labels to delete
  const deleteLabels = currentLabels.filter(have => {
    return !wantLabels.find(want => {
      return want.name === have.name
    })
  })

  for (const {name} of deleteLabels) {
    try {
      octokit.log.debug(`deleting label(${name})...`)

      // https://docs.github.com/en/rest/reference/issues#delete-a-label
      await octokit.request('DELETE /repos/{owner}/{repo}/labels/{name}', {owner, repo, name})
    } catch (error) {
      octokit.log.error(`${name}: ${error.message}`)
    }
  }

  // labels to update
  const updateLabels = wantLabels.filter(want => {
    return currentLabels.find(have => want.name === have.name)
  })

  for (const {name, new_name, color, description} of updateLabels) {
    try {
      octokit.log.debug(`updating label(${name})...`)

      // https://docs.github.com/en/rest/reference/issues#update-a-label
      await octokit.request('PATCH /repos/{owner}/{repo}/labels/{name}', {
        owner,
        repo,
        name,
        new_name,
        color,
        description
      })
    } catch (error) {
      octokit.log.error(`${name}: ${error.message}`)
    }
  }

  // labels to create
  const createLabels = wantLabels.filter(want => {
    return !currentLabels.find(have => JSON.stringify(want) === JSON.stringify(have)) && !updateLabels.includes(want)
  })

  for (const {name, color, description} of createLabels) {
    try {
      octokit.log.debug(`creating label(${name})...`)

      // https://docs.github.com/en/rest/reference/issues#create-a-label
      await octokit.request('POST /repos/{owner}/{repo}/labels', {
        owner,
        repo,
        name,
        color,
        description
      })
    } catch (error) {
      // do nothing
    }
  }

  // done
  octokit.log.info(
    {change: true},
    `${html_url}/labels synced ${template ? `from https://github.com/${template}/labels` : ''}`
  )
}
