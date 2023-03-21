
# (Auto) Reviewer #2

Find this project live on: https://reviewer-two.fly.dev/ 


## What is this

Reviewer #2 is that harsh reviewer that's always out to get you, rejecting your papers. Now you can get that experience, but automated!

Also, use this tool if you want constructive feedback, by choosing the "SCOR Card" option!



## Run it yourself

At some point this will run out of public $. Run this yourself by cloning it and running `yarn install`. Add your OpenAPI key in the `.env` file. 


### Deploying on Vercel

This is faster and free, but langchain tends to time out since Vercel only supports 10 second serverless execution time


### Deploying on Fly

Ok so Vercel free mode is too slow for Langchain / OpenAI, which can take 20-30 seconds. Here's some info on deploying on Fly: https://community.fly.io/t/sveltekit-guide/3454/7 