/*

    loader.js

    - uses the API endpoints to download data into flat json files
    - this is meant to be used locally in node; won't work on a server
    - needs to be running while the local server is running for fetch to work

    instructions
    - YOUR CURRENT CACHE WILL BE OVERWRITTEN!
    - run the server in console (in another tab) w/ `npm run dev`
    - to load and overwrite content, do `npm run loader`
    - to run custom stuff:
      - node src/_utils/loader.js [options ...]
      - node src/_utils/loader.js academia capsid collection

    options
    - running without options pulls everything
    - each option pulls from an endpoint

    - capsid
    - collection
    - content
    - org
    - posts
    - profile
    - strain
    


    
    last updated: 7/30/2020

*/

const fetch = require("node-fetch");
const fs = require('fs');

const contentPath = './static/content'
const server = process.argv[2] || 'http://localhost:2022'
const args = process.argv.slice(3) // (first two args are paths / server path)
// const options = ['academia', 'capsid', 'collection', 'content', 'org', 'posts', 'profile', 'strain']
const defaults = 'academia capsid collection content org posts profile strain'
const cats = args.length > 0 ? args.split(' ') : defaults.split(' ') // categories


console.log('::: Loader ::: server:', server, 'categories:', cats)


// save from fetch stream to file
const saveStream = (async (res, filePath) => {
  const fileStream = fs.createWriteStream(filePath);
  await new Promise((resolve, reject) => {
    res.body.pipe(fileStream);
    res.body.on("error", (err) => {
      reject(err);
    });
    fileStream.on("finish", function() {
      resolve();
    });
  });
});



const loadContent = async (cats) => {
  const catPromises = await Promise.all(cats.map(async cat => {

    // handle each category split up; this helps flexibility in the future, 
    // even though most code is identical for now 
    if(cat == 'capsid') {
      const res = await fetch(`${server}/api/${cat}?all=true`)
      const path = `${contentPath}/${cat}.json`
      console.log(`Saving ${cat} to: ${path}`)
      saveStream(res, path)
    }

    if(cat == 'collection') {
      const res = await fetch(`${server}/api/${cat}`)
      const path = `${contentPath}/${cat}.json`
      console.log(`Saving ${cat} to: ${path}`)
      saveStream(res, path)
    }

    if(cat == 'content') {
      // content table
      let res = await fetch(`${server}/api/${cat}`)
      let path = `${contentPath}/${cat}.json`
      console.log(`Saving ${cat} to: ${path}`)
      saveStream(res, path)

      // forms
      res = await fetch(`${server}/api/${cat}/forms`)
      path = `${contentPath}/${cat}-forms.json`
      console.log(`Saving ${cat} to: ${path}`)
      saveStream(res, path)

      // nodes
      res = await fetch(`${server}/api/${cat}/nodes`)
      path = `${contentPath}/${cat}-nodes.json`
      console.log(`Saving ${cat} to: ${path}`)
      saveStream(res, path)

      // updates
      res = await fetch(`${server}/api/${cat}/updates`)
      path = `${contentPath}/${cat}-updates.json`
      console.log(`Saving ${cat} to: ${path}`)
      saveStream(res, path)
    }

    if(cat == 'org') {
      const res = await fetch(`${server}/api/${cat}?all`)
      const path = `${contentPath}/${cat}.json`
      console.log(`Saving ${cat} to: ${path}`)
      saveStream(res, path)
    }

    if(cat == 'posts') {
      const res = await fetch(`${server}/api/${cat}?all=true`)
      const path = `${contentPath}/${cat}.json`
      console.log(`Saving ${cat} to: ${path}`)
      saveStream(res, path)
    }

    if(cat == 'profile') {
      const res = await fetch(`${server}/api/${cat}`)
      const path = `${contentPath}/${cat}.json`
      console.log(`Saving ${cat} to: ${path}`)
      saveStream(res, path)
    }

    if(cat == 'strain') {
      const res = await fetch(`${server}/api/${cat}`)
      const path = `${contentPath}/${cat}.json`
      console.log(`Saving ${cat} to: ${path}`)
      saveStream(res, path)
    }
  }))

}

// load all the categories
loadContent(cats)








