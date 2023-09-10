

// split really long texts using text splitter, then running LLM on each
// then use a "join" prompt to connect those
// — split length can be a parameter / set number like 4000 or 8000, or by tiktoken length (james briggs example here)
// this could get pricey!

// another way is to split using tiktoken

// fn to get the split texts + join prompt to calculate expense w/o going for it