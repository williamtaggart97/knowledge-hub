import type { PageServerLoad } from './$types'
import { parse } from 'yaml'
import fs from 'fs'

let resources_path: string = "data/resources.yml"

interface Resource {
  description: string
  title: string
  tags: string[]
  url: string
}

function sortAlphabeticallyIgnoringEmojis(a: { name: string, count: number }, b: { name: string, count: number }) {
  const a_no_emojis = a.name.replace(/[\u1000-\uFFFF]/g, '').trim();
  const b_no_emojis = b.name.replace(/[\u1000-\uFFFF]/g, '').trim();
  return a_no_emojis.localeCompare(b_no_emojis);
}

function convertTagCountMapToArray(tags: Map<string, number>): { name: string, count: number }[] {
  return Array.from(tags.entries()).map(([tagName, count]) => ({
    name: tagName,
    count,
  }))
}

// Reading in resources
const file = fs.readFileSync(resources_path, 'utf8')
const resources: Resource[] = parse(file) // TODO: use it to validate edits during CI/CD

// Creating a list of unique tags
const tagCount = new Map<string, number>();
for (const resource of resources) {
  resource.tags.forEach(tagName => {
    const currentCount = tagCount.get(tagName);
    if (currentCount) {
      tagCount.set(tagName, currentCount + 1);
    } else {
      tagCount.set(tagName, 1);
    }
  })
}

const arrayOfTagsWithCount = convertTagCountMapToArray(tagCount);

const sortedTagsWithCount = [...arrayOfTagsWithCount].sort(sortAlphabeticallyIgnoringEmojis);

//Sorting resources by newest (assuming newest is at the bottom of the file )
const sortedResources = [...resources].reverse();

export function load(params: PageServerLoad) {
  return {
    payload: {
      resources: sortedResources,
      tags: sortedTagsWithCount,
    }
  }
}
