
# What is this

This folder is meant to be `yarn link`ed to other projects. Other projects need to `yarn add` all required packages. By keeping this folder as the source of truth w/ yarn link, we get to avoid publishing on npm, and still have the @next version of the code.

Obviously, any significant changes will cause a cascade of projects to break...


## Yarn link?

- To set this folder as a linkable folder, enter `yarn link` in the CLI. This will set it as "plasmid"
- To use this folder elsewhere, run `yarn link plasmid` to start using.
- To use the linked files, do 
  - `import Header from 'plasmid/components/Question.svelte'`
  - `import {cacheGet} from 'plasmid/utils/cache'`
  - `@import {cacheGet} from 'plasmid/themes/theme/index.scss'`