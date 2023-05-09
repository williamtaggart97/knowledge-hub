import type { PageServerLoad } from './$types'
import { parse } from 'yaml'
import fs from 'fs'

interface Resource {
  title: string,
  description: string,
  url: string,
  tags: string[]
}

let resourcesPath: string = "data/resources.yml"

// Reading in resources
const file = fs.readFileSync(resourcesPath, 'utf8')
const resources: Resource[] = parse(file) // TODO: Use interface to validate edits during CI/CD


const generateUniquetags = (resources: Resource[]) => {
  const tags: string[] = []

  for (const resource of resources) {
    tags.push(...resource.tags);
  }

  return [...new Set(tags)]
}

const removeEmojisFromStr = (str: string) => {
  return str.replace(/[\u1000-\uFFFF]+/g, '').trim();
}


const sortAlphabeticallyIgnoringEmojis = (a: string, b: string) => {
  const aWithoutEmojis = removeEmojisFromStr(a);
  const bWithoutEmojis = removeEmojisFromStr(b);

  return aWithoutEmojis.localeCompare(bWithoutEmojis);
}

const uniqueTags: string[] = generateUniquetags(resources);

const uniqueTagsInAlphabeticalOrder = uniqueTags.sort(sortAlphabeticallyIgnoringEmojis);

const resourcesNewestToOldest = [...resources].reverse();

export function load(params: PageServerLoad) {
  return {
    payload: {
      resources: resourcesNewestToOldest,
      tags: uniqueTagsInAlphabeticalOrder,
    }
  }
}
