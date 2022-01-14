
/*

  EXPERIMENTAL CYTOSIS

  - switch the plugin to this one if you're testing shit out

*/


/*
  - Added to new npm package 9/12
  
  - made lots of functions static
  - added dynamic rows to init, can specify what row in _cytosis to pull from now
  - changed from .get() to .fields[] to get away from using the prototype
  - added getFieldValues
  - changed search() to comb through multiple list of strings
  - added getNames to get flat list of row names
  - started to add better comments on functions w/ input/output
  - changed key/base names to airKey and airBase
  - made get() synchronous
  - added linked column search to Find(), e.g. TableName.RecordName.ColName.LinkedColName
  - changed split / unsplit behavior to not affect user too much
    - user still has to save each new split field to Airtable
    - can now unsplit Airtable data and data will appear "normal"
  - changed the way getTables is accessed: takes a single object arg now
  - changed _cytosis column from 'Items' to 'Tables' -> will be severely breaking


  - 2/17/2019
    - tableNames changed to tableQuery
    - added multiple querying — given a list of queries in LinkedQueryNames "_content, _tags", will pull data from both queries
    - added better support for views/formulas/filters

  - 7/15/2019
    - added partial matching; set the single select field matchStyle to "partial" to partially match a keyword 
    - changed the poorly named "settings" attribute to "payloads" so it's less confusing between options and settings 

  - 7/21/2019
    - added some experimental (nonfunctional) code for introspecting / finding empty fields
    - added a static cleanTable transformation function that takes a table and only keeps fields and id

  - 8/14/2019
    - added setup() to compartmentalize initialization;
    - added a way to send a config object to bypass hitting airtable for _config so much
    - added airtableFetch to add throttling for fetching, but holding off

  - 8/16/2019
    - added error for find/findOne fields not being an array

  - 8/23/2019
    - added a delay to fetchnextpage to reduce hitting limits
    - added some better error output; testing silent error for fetch
    - added a "routeName" component, for routeName, tracing bugs etc.
    - added a helper method to just retrieve cytosis configs

  - 8/26/2019
    - added getConfig to only get the _cytosis config data


  - 8/27/2019
    - added findField as a finder/getter

  - 8/30/2019
    - added strip, which retains fields, id, and core parts of a cytosis object
    - added a filter helper, 'filter_or'

  - 8/31/2019
    - added getRecord that uses Airtable API's "find" method
    - added cleanRecord that only keeps id, fields, and some of _table from a record

  - 9/1/2019
    - fixed save () and delete; saveLinkedTables probably needs a fixin' too

  - 9/4/2019
    - added a typecast option to class and static save ()
    - added saveArray and reverted old save () to how it used to be; save Array uses the new API
    - update airtable dep to 0.7.1
    - also consider a real CHANGELOG.md lol

  - 9/10/2019
    - added a condition in init when not sending a tableQuery (just want a base obj)

*/

/*

  Cytosis CMS (cytosis)

    - Cytosis grabs and stores/caches data. Very useful for Airtable.
      - Turns Airtable-centric into a light static CMS like Contentful

    - Cytosis currently WRAPS THE Airtable API!
      - The Airtable API is kind of huge
      - future: localstorage and mLab/mongo/firebase
        - for offline access
        - for multiple devices

    - so in the future some of these should be separated
    - getLinkedRecords should be static






  Future / roadmap

    - Build a vue plugin kind of like: https://github.com/vuejs/vuefire/tree/firestore
    - possible to do a last changed time stamp, and changed by who and ID number stored in _cytosis metadata
      - can do things like simple change tracking etc.
    - preload — specify which tables to load first, which to defer
      - load the content tables in first, and the massive data later
      - also can load contextual metadata (like what page is it, where to get resources, etc.)
    - static — specify which tables are static / won't change much
      - used for static page generation that speeds up page loads
    - cytosis controller table
      - can use this to variably set other table names w/o hard coding
    - front-end wrapper
      - jquery, non-vue getter
        - maybe extend jquery prototype?
        - maybe have another 'helper' class or set of functions that don't belong to regular Cytosis?
      - public API key
      - extensible version of the atlx experiment
    - keepAlive syncing / polling w/ Airtable (not fully reactive like Meteor 
      - but can sync+cache at 5 ticks/sec
      - webtask can sync/cache at 1 tick/sec
    - add fetch / delayed retrieval for some tables (also maybe in _cytosis as a separate row)
      - idea is we don't always want to grab everything from Airtable; some huge tables are better put off til needed
    - cytosis webtask (for public interfaces)
    - make easier to specify '_cytosis' or supply an array of data:{ [tableNames] }
    - clean up and unify schema
    - partial downloads: can set some to be deferred to be downloaded until needed (makes initial site load faster)
      - partial table downloads, e.g. for searching, so not as much data needs to be pulled
    - support prisma API / support partial downlaods from graphql
    - support firebase
    - 

  Bugs

    - SaveLinkedTable, if save clicked multiple times, doesn't check for duplicates already added, so can potentially add several of the same tags
      - probably the source needs to refresh, not sure if cytosis could fix it
      - this has to be done:: (local needs to be refreshed) this.cytosis.tables.Tags = this.tags // refresh local tags store


  Thoughts / Ideas / Notes / Done

    - using airtableobject.get('Name') doesn't always work, since sometimes the prototype doesn't get preserved
      - this is true w/ Nuxt 'Universal' (static) mode


*/



/*
  
  "Docs"


  - Getting Started - 

    Cytosis is for using Airtable as a prototype CMS
    Core user data is best not stored using this system. Use something like auth0 or firebase instead.

    Best for Public Content
      - Sometimes you want to display content from a CMS. Cytosis turns Airtable into one.
      - Create a separate user with view-only access, and use its API key as the cytosis API key
        - The key is used the exact same way as a regular key, except create/update/delete will throw errors 
      - Ex: Website content, blog content, news articles, lists or browsable data like bookmarks or store data

    For Private content, use sparingly
      - Passworded sites and local apps can hardcode the API key (airKey) directly in cytosis
      - KEEP IN MIND that cytosis code is visible in the code inspector. 
      - One way to guard against this is for users to enter their Airtable API key and Base ID manually
      - You can also use a serverless function as authentication, and provide the API and Base after authentication

    Private/Public Content
      - Any sites w/ functionality to update Airtable as well as read from Airtable for the masses
      - If there's a login system, you can create a handler that retrieves a user's private API key and load it into their system
        - the privateKeyHandler is just a convenient place to store the serverless URL that retrieves this data
      - Semi-private: Todo lists, shopping lists — apps that run on a public machine, but users have edit access to their own repo
        - Retrieve the private API key from a server or external system after login
      - Public-private: Feedback forms, rating systems, commenting systems, interactive projects — users can all edit the same data repository will require an external server handler
        - Use a public API for read, and process create/update/delete requests via an external handler

    // init Cytosis
    const cytosis = await new Cytosis({
      airKey: 'key value' — if used on front-end projects, make sure it's on a separate airtable account w/ read-only permissions!!
      airBase: {
        id: 'Airtable Base ID key', 
        tables: [array of table names]} — optional; otherwise looks for _cytosis table, w/ a column called Items w/ multiple select
    })

    You can also:

    1. Either set a default Base and Key for Cytosis object itself
    2. myCytosis = await new Cytosis({airKey: '123', airBase: '123'}) — defaults to looking for _cytosis table
    3. myCytosis = await new Cytosis({airKey: '123', airBase: '123', tables: ['table1','table2']}) — just reads/caches the given tables
    4. myCytosis = await new Cytosis({airKey: '123', airBase: '123', tableQuery: 'tableName'}) — tableName is the name of the table index row in _cytosis. You can add Items to the custom table name for dynamic loading
    4. myCytosis = await new Cytosis({airKey: '123', airBase: '123', tableQuery: 'tableName'}, {view: 'Grid View'}) — you can also specify an Airtable API options object w/ view, fields, sort, filter

    // Airtable options: filter is an Airtable filter formula https://support.airtable.com/hc/en-us/articles/203255215-Formula-Field-Reference

    // Cytosis loads tables from _cytosis table instead of hard-coded
    // create a row w/ Name="tableNames" and a Multiple Select called 'Items' with the table names

    // After initialization, the myCytosis.tables will contain all loaded tables 

  - Usage -

    cytosis.get('recordId')
    // returns a promise of data of a single record
    // useful when you have an array of recordIds

    cytosis.getTables(options={}, tables=this.airBase.tables)
    // returns a promise of data of a single record
    // {options} are: view, fields, sort, filter, per the Airtable API
    // [tables] is an array of table names (default is to retrieve whatever has been initiated)

    cytosis.save(object, tableName, recordId=undefined)
    // {object} is the object you want saved. Fields must match those of the table or not be defined
    // 'tableName' is the name of the table you're saving your object to
    // 'recordId' lets you update an existing record. Unfortunately you still have to supply the tableName per the API

    cytosis.delete(tableName, recordId)
    // 'tableName' is the name of the table to delete your object from. API requires you to state tableName
    // 'recordId' is the record to be deleted. 

  - Helpers -

    cytosis.getLinkedRecords(recordIds, linkedTable, getObj=false)
    // airtable excels at creating links between records. These links are stored as arrays of recordIds
    // this converts the linked records to an array of Names (for Tags this is sufficient)
    // if you need the entire objects, set getObj to true
    // [recordIds] is an array of links (e.g. a list of tag references to the Tags table)
    // 'linkedTable' is the table name e.g. 'Tags' where the records are stored

    cytosis.split(saveObject, key, maxChunks=4)
    // this one splits huge objects (stringified > 100,000 chars) across multiple columns
    // e.g. an object to be stored in key _data gets split into _data _data-1 _data-2
    // the table needs to have those extra columns created in Airtable, so this requires some planning 
    // {saveObject} is the object you want to store
    // 'key' is something like _data 

    cytosis.unsplit(record, key)
    // {record} is the actual record object from Airtable (not a record Id)
    // 'key' is the what you want to unsplit (e.g. '_data' from the above example)


*/


import * as Airtable from 'airtable'


class Cytosis {

  // opts:
  // airtableApi: env.airtable_api,
  // airBaseId: env.airtable_base
  // 
  // automatically get tables on init, unless given tables
  // (getting tables is expensive, and might not always be required on init)
  // options is a temporary view for initializing the table
  constructor (opts) {

    const _this = this
    // If constructing without arguments,
    // then initialize "this" with either pre-configured values, or blanks
    if (arguments.length === 0) {
      _this.routeName = Cytosis.routeName || '';
      _this.config = Cytosis.config || '';
      _this.endpointUrl = Cytosis.endpointUrl || '';
      _this.airKey = Cytosis.airKey || '';
      _this.airBase = Cytosis.airBase || '';
      _this.airBase.tables = Cytosis.tables || [];
      _this.airBase.tableQuery = Cytosis.tableQuery || undefined; //'tables';
      _this.airBase.options = Cytosis.options || {view: "Grid view"};
      _this.airBase.payloads = Cytosis.payloads; // used for keyword or other payloads
      _this.airBase.endpointUrl = Cytosis.endpointUrl;
    } else {
      _this.routeName = opts.routeName; // "routeName" or other kind of identifier. Helps w/ debugging
      _this.config = opts.config;
      _this.endpointUrl = opts.endpointUrl;
      _this.airKey = opts.airKey;
      _this.airBase = { id: opts.airBase || opts.airBaseId };
      _this.airBase.tables = opts.tables || []
      _this.airBase.tableQuery = opts.tableQuery || undefined; //'tables';
      _this.airBase.options = opts.options || {view: "Grid view"};
      _this.airBase.payloads = opts.payloads; // used for keyword or other payloads
    }

    Airtable.configure({
      endpointUrl: _this.endpointUrl || `https://api.airtable.com`,
      apiKey: _this.airKey
    })

    _this.base = Cytosis.getBase(this.airBase.id)


    // if no query, we just return this object
    if(!_this.airBase.tableQuery)
      return this

    // console.log('opts: ', opts)
    // return a promise if the callee needs to do something w/ the result
    return new Promise(function(resolve, reject) {
      // first retrieve the _cytosis table of tables
      _this.init(_this.airBase.tableQuery).then((result) => {

        if(result) {
          // console.log('[Cytosis] _cytosis initiated:', result)
          // then retrieve the actual data
          Cytosis.getTables({
            options: opts.options, 
            payloads: opts.payloads, 
            cytosis: _this, 
            tables: _this.airBase.tables, 
            routeName: _this.routeName
          }).then((_result) => {
            _this.tables = _result
            resolve(_this)
          }, (err) => {
            reject(new Error(`[Cytosis] Cytosis initialization error: Couldn't retrieve all tables from Airtable!`, err))
          })
        } else {
          if(!result)
            reject(result)

          resolve(result)
        }
      }, (err) => {
        reject(new Error(`[Cytosis] Cytosis initialization error: Couldn't setup Config (_cytosis)!`, err))
      })
    })
  }


  /*





    Methods





  */


  // Internal
  // formerly initConfig() initializes _config table from Airtable; pulls from _cytosis if no init data
  // will overwrite current table data; useful to rehydrate data
  // (but pulls in EVERYTHING from Airtable)
  // assumes you want to "reinitialize" with new data; if passed 'false',
  // skips initialization if data already exists
  init (tableQuery, reset=true) {
    // console.log('Starting cytosis')
    const _this = this

    // console.log('initializing from index: ', tableQuery)

    return new Promise(function(resolve, reject) {

      // return current state if we don't want to reinitialize
      if(!reset && _this.airBase.tables && _this.airBase.tables.length > 0) {
        resolve(_this)
      }

      // if we provided tables, then don't load the _cytosis tableNames
      if(_this.airBase.tables && _this.airBase.tables.length > 0)
        resolve(_this)


      const setup = function(_config) {
        _this['config'] = _config // this needs to be the _cytosis array

        // this requires a table named '_cytosis' with a row (tableQuery) that indicates where the information is coming from
        // need column 'Tables' with a Multiple Select of all the table names in the base
        // (this is required b/c Airtable API won't let you get all table names)
        // init tables from config if they don't exist
        if ( !_this.airBase.tables || _this.airBase.tables.length == 0 ) {
          for(let config of _config._cytosis) {
            // Option 1: find all the options in the Tables list
            if ( config.fields['Name'] == tableQuery && config.fields['Tables']) {

              // some queries can contain options like fields, sort, maxRecords etc.
              // these can drastically cut back the amount of retrieved data
              const options = {
                fields: config.fields['fields'], // fields to retrieve in the results
                filter: config.fields['filterByFormula'],
                maxRecords: config.fields['maxRecords'],
                pageSize: config.fields['pageSize'],
                sort: config.fields['sort'] ? JSON.parse(config.fields['sort'])['sort'] : undefined, // needs to be of format : "{sort: [blahblah]}"
                view: config.fields['view'],
                matchKeywordWithField: config.fields['matchKeywordWithField'],
                matchStyle: config.fields['matchStyle'], // how are keywords matched?
              }

              // tables is an array of strings that say which tables (tabs) in Airtable to pull from
              _this.airBase['tables'] = config.fields['Tables']
              _this.airBase['options'] = options
            } 

            // Option 2: find all the tableQueries in the linkedQueryNames (generated lookup) list
            else if ( config.fields['Name'] == tableQuery && config.fields['LinkedQueryNames']) {
              const linkedQueries = config.fields['LinkedQueryNames']
              // console.log('Linked Query Names: ', linkedQueries)

              // this is a special case where instead of an array of strings, it's an
              // array of objects {query (string), tables (array of strings), options (object)}
              let tables = []
              // for each linked query, find and store the correct query
              linkedQueries.map((linkedquery) => {
                _config._cytosis.map((query) => {
                  if(linkedquery == query.fields['Name']) {
                    // console.log('match:', linkedquery, query)

                    const options = {
                      fields: query.fields['fields'], // fields to retrieve in the results
                      filter: query.fields['filterByFormula'],
                      maxRecords: query.fields['maxRecords'],
                      pageSize: query.fields['pageSize'],
                      sort: query.fields['sort'] ? JSON.parse(query.fields['sort'])['sort'] : undefined, // needs to be of format : "{sort: [blahblah]}"
                      view: query.fields['view'],
                    }

                    tables.push({
                      query: linkedquery,
                      tables: query.fields['Tables'],
                      options: options
                    })
                  }
                })
              })

              _this.airBase['tables'] = tables
            }
          }
        }
      }

      // if config exists, we skip retrieving _cytosis and go right to setup; this saves some fetches
      if(_this.config) {
        // console.log('config found! skipping _cytosis', _this.config)
        setup(_this.config)
        resolve(_this)
      } else {
        // if no table names are provided, it looked for a special '_cytosis' tab
        // this is required to initialize the Cytosis object
        Cytosis.getTables({
          options: {}, 
          cytosis: _this, 
          tables: ['_cytosis'], 
          routeName: _this.routeName
        }).then( (_config) => {

          if(_config) {
            setup(_config)
          }

          if(!_config || !_this.airBase.tables || _this.airBase.tables.length == 0) {
            reject(new Error(`[Cytosis] — couldn’t find a '_cytosis' table with row [query:${tableQuery}] or 'tables' filled out with the names of tables to load`))
          }
          // console.log('Cytosis tables: ', _this.airBase, _this.airBase.tables)
          // return the initiated cytosis object on completion
          resolve(_this)
        }, (err) => {
          reject(new Error(`[Cytosis] Couldn't retrieve Config object from Airtable`, err))
        })
      }

    })
  }

  find (findStr, fields=['Name']) {
    return Cytosis.find(findStr, this.tables, fields)
  }

  // getRemote (recordId) {
  //   // finds remotely; maybe break this out in a different fn or run it
  //   // if not found locally?
  //   // base(table).find(recordId, function(err, record) {
  //   //   if (err) { 
  //   //     console.log('No record found? ' , record);
  //   //     console.error(err); return; 
  //   //   }
  //   //   console.log('Record found: ' , record);
  //   //   resolve(record)
  //   // });
  // }





  // AIRTABLE MODIFIERS

  // — these require API key w/ write permission or they'll fail
  save (object, tableName, recordId=undefined) {
    return Cytosis.save(object, tableName, this, recordId)
  }

  // new model
  saveArray (objectArray, tableName, create=false, typecast=false) {
    return Cytosis.saveArray(objectArray, tableName, this, create, typecast)
  }

  delete (tableName, recordId) {
    return Cytosis.delete(tableName, this, recordId)
  }

  saveLinkedTable (stringList, targetTableName, sourceTable, colName='Name') {
    return Cytosis.saveLinkedTable(stringList, targetTableName, sourceTable, this, colName)
  }





  /*






    Static Methods
      - Helpers that make life easier / faster





  */

  // Input: base ID (from airtable)
  // Output: Airtable base object
  static getBase (baseId) {
    return Airtable.base(baseId);
  }

  static preCheck (airKey, airBase) {
    // airtable only for now
    if (airKey && airBase)
      return true
    return false
  }

  // Get an object of airtable objects
  // NOTE: this is the ONLY function that pulls from Airtable API!
  // 
  // use map/get for useful data: list.map(e => (`${e.id} ${e.get('Name')}`))
  // filter is an airtable filter formula https://support.airtable.com/hc/en-us/articles/203255215-Formula-Field-Reference
  // no default sort: '[{field: 'Name', direction: 'asc'}]'
  // Input: 
  //    options: airtable API options {view, fields, sort, filter}
  //    cytosis: cytosis object (with base, airkey, etc.)
  //    tables: array of table names ['tableOne','tableTwo', ...]
  // Output: 
  //    creates object of airtable table record arrays
  //    sets this.tables to the object (overwrites any previous tables)
  //    returns the object
  // 
  //    this.tables = {
  //      tableOne: [record object, record object, ...]
  //      ...
  //    }
  // getTables (options={}, tables=this.airBase.tables ) {
  // static getTables ({options, tables=this.airBase.tables}) {
  static getTables ({options, payloads, cytosis, tables, routeName}) {

    options = options || cytosis.airBase.options || {}
    tables = tables || cytosis.airBase.tables

    let pTables = [] // tables (promise)

    // need to follow these defaults for airtable:
    // view='', fields=undefined, sort=undefined, filter='', 

    if(!Cytosis.preCheck(cytosis.airKey,cytosis.airBase))
      return {}

    function getTablePromise({tables, options, payloads}) {
      try {

        let {view, fields, sort, filter, maxRecords, pageSize} = options

        // console.log('getTables retrieving:', tables, options, ' payloads...', payloads)

        if (!view)
          view = ''
        if (!filter)
          filter = ''
        // console.log('Retrieving airtables')

        // if matchKeywordWithField exists, and a keyword was passed into the cytosis options object,
        // we create a filterByFormula where the given keyword has to exist in the field
        // this is useful for matching articles by dynamic slug value, etc.
        if(payloads && payloads.keyword && options && options.matchKeywordWithField) {
          // this only works when there is an EXACT match
          // DEFAULT
          filter = `IF({${options.matchKeywordWithField}} = "${payloads.keyword}",TRUE(),FALSE())`
          
          // this works when the string exists as a part
          if(options.matchStyle == "partial")
            filter = `IF(SEARCH("${payloads.keyword}",{${options.matchKeywordWithField}}) > 0,TRUE(),FALSE())`
          
          // note: you can't use Filter formula to SEARCH through a string separated arrays, so that' stabled for now
          // console.log('matchKeywordWithField filter: ', filter, ' for', payloads.keyword, ' with', options.matchKeywordWithField, ' and match style', options.matchStyle)
        }

        for (let table of tables) {

          // console.log('cytosis tables:', tables.length, tables)
          let list = []

          const filterObj = {
            filterByFormula: filter,
            view
          }

          if(sort) {
            filterObj['sort'] = sort // need to add this after-the-fact
          }

          if(maxRecords) {
            filterObj['maxRecords'] = maxRecords // limit # of records
          }

          if(pageSize) {
            filterObj['pageSize'] = pageSize // limit # of records
          }

          if(fields && fields[table]) { // if a field for this table exists, add it; (old structure, v1)
            filterObj['fields'] = fields[table]
          } else if (fields) { // new structure
            filterObj['fields'] = fields
          }

          // returns a promise from airtable
          const airtableFetch = function() {
            // console.log('[Cytosis] fetching table:', table, 'from', cytosis.airBase.id)
            return new Promise(function(resolve, reject) {
              const base = Cytosis.getBase(cytosis.airBase.id) // airtable base object
              let pageCount = 1
              base(table).select(
                filterObj
              ).eachPage(function page(records, fetchNextPage) {
                console.log('[Cytosis] Page Fetch for:', table, 'routeName:', routeName, 'page:', pageCount)
                pageCount += 1

                // This function (`page`) will get called for each page of records.
                records.forEach(function(record) {list.push(record)})
                // To fetch the next page of records, call `fetchNextPage`.
                // If there are more records, `page` will get called again.
                // If there are no more records, `done` will get called.

                // really easy to hit limits, so adding a delay
                const delay = 250;
                setTimeout(fetchNextPage, delay);
                // fetchNextPage()
              }, function done(err) {
                if (err) { 
                  console.error('[Cytosis/getTablePromise/airtableFetch] Airtable Fetch Error @routeName:', routeName)
                  console.error('[Cytosis/getTablePromise/airtableFetch] Airtable Fetch Error [2]', 'Errored on table:', table, 'tablesLen:', tables.length, 'tables:',tables)
                  console.error('[Cytosis/getTablePromise/airtableFetch] Airtable Fetch Error >> error message:', err)
                  
                  // experiment with erroring silently
                  // reject(err)
                  reject(new Error("[Cytosis/getTablePromise/airtableFetch] No response from Airtable"));
                  // return
                }
                resolve({[table]: list})
              })

            })
          }
          
          // table of promises
          pTables.push(airtableFetch())
        }

      } catch(e) {
        console.error('[Cytosis/getTables/getTablePromise] Airtable caught general error', e) // return; 
      }
    }

    // console.log('getTables:', tables)

    // tables could be an array of strings (table names)
    if(typeof tables[0] == 'string') {
      getTablePromise({
        tables: tables,
        options: options,
        payloads: payloads
      })
    } 
    // tables could also be an array of objects of { query: 'tablequery', options }
    else {
      tables.map((query) => {
        // console.log('mapping:', query)
        // need to slow it down
        // setTimeout(function(){
          getTablePromise({
            tables: query.tables, // array of strings 
            options: query.options, 
            payloads: payloads
          })
        // }, 200);
      })
    }

    try {
      return Promise.all(pTables).then((tables) => {
        let finalObj = {}

        for (let t of tables) {
          finalObj = { ...finalObj, ...t, ...cytosis.data }
        }
        // _this.airtable = finalObj
        // _this.tables = finalObj
        // console.log('getTables final object:', finalObj)

        return finalObj // return as a one promise object
      }, (err) => {
        console.error("[Cytosis/getTables] A table errored out or timed out: ", err);
        // return Error("[Cytosis/getTables] Fetch Error")
        return Promise.reject(new Error("[Cytosis/getTables] Fetch Error"));
      })
    } catch (err) {
      console.error("[Cytosis/getTables/pTablesPromiseHandling] An Airtable table errored out", err);
    }
  }


  // helper to only get the config files
  // doesn't need the rest of the object to be configured
  // returns a promise
  static getConfig({airKey, airBase, routeName, endpointUrl}) {

    Airtable.configure({
      endpointUrl: endpointUrl || `https://api.airtable.com`,
      apiKey: airKey
    })
    
    const configP = Cytosis.getTables({
      cytosis: {
        'airKey': airKey,
        'airBase': {'id': airBase},
      }, 
      tables: ['_cytosis'], 
      routeName: '[_getConfig] '+routeName
    })
    return configP
  }








  // Retrieves a single record from the stored tables object
  // Note: this only searches locally
  // 
  // replaced: getRecord (recordId)
  // Input: recordId (Airtable record ID, a string)
  // Output: a single record object
  static get (recordId, tables) {
    // const base = this.getBase(this.airBase.id)
    // const tables = this.tables // slice makes a shallow copy
    let result

    if(tables) {
      // return new Promise(function(resolve, reject) {
        // iterate through every table, but only one should resolve, since recordIds are unique
        // replace with async iterator in the future; this is expensive since it does a fetch for EACH table
        Object.keys(tables).map( (table) => {
          for (let record of tables[table]) {
            if (record.id == recordId) {
              // return record
              result = record
            }
          }
        })
          
        return result
          
        // reject() // nothing found
      // })
    }
    return undefined
    // return new Promise(function(resolve, reject) {
    //   reject(false)
    // })
  }




  // Retrieves a single record from Airtable
  // This performs a "base('TableName').find('recUKWFfOvY1lRwzM')"
  // 
  // Input: recordId (Airtable record ID, a string)
  // Output: a single record object
  static async getRecord ({recordId, airKey, baseId, tableName, endpointUrl}) {

    try {
      Airtable.configure({
        endpointUrl: endpointUrl || `https://api.airtable.com`,
        apiKey: airKey
      })

      const base = Cytosis.getBase(baseId)
      let record = await base(tableName).find(recordId)
      return record
    } catch(err) {
      // nothing found
      return Promise.reject()
    }
  }







  // Will find a row within an airtables object e.g. airtables: { Content: [ row, row, row], Tags: [ row, row, row ] } 
  // — it's a lot more efficient to require data to be pulled and cached rather than be pulled per find request
  // findStr = 'RowName' — finds all items "RowName" inside the airtables object
  // findStr = 'Content.Row Name' — finds all items "RowName" in the Content table
  // findStr = 'Content.Row Name.ColName' — finds a specific ColName inside the Row and returns the results, e.g. if you have a URL column, it'll return the string
  //           if this is a link, it'll return an array of linked objects' record Id names
  // findStr = 'Content.RowName.ColName.LinkedColName' — if a ColName contains links, LinkedColName refers to the field in the linked table. Very useful to get the names or other data
  // ex: cytosis.find('Content.slug', [this.cytosis.tables.Notes], ['Slug'])
  // - both RowName and ColName can contain spaces
  // * assumes Names are unique; will return the first one found
  // 
  // Input:
  //    findStr: a specially formatted string used to retrieve data
  //    tables: an object of Airtable arrays, ex: { Tags: [records], Content: [records] }
  //    fields: an array of which fields (columns) to search in (an array of strings). Airtable's key field default is 'Name'
  // Output:
  //    if findStr is just a RowName, returns the first found // FUTURE: an array of results if many matches, or one result if only one found
  //    returns the field's contents, usually a string or array
  //    if the field is a link to another table, will return an array of recordIds
  // static find (findStr, tables=this.tables, fields=['Name']) {
  static find (findStr, tables, fields=['Name']) {

    if(!findStr || !tables)
      return []

    if (typeof(fields) == "string") {
      console.error('[Cytosis] find "fields" argument must be an array')
      return undefined
    }

    // match a single string against all columns (fields) in all objects
    function matchField(str, tables, fields) {
      let results = []

      // given an object...
      Object.keys(tables).map((table) => {
        // console.log('Matching', str, tables, fields, table, tables[table])

        // console.log('Current object format:', tables)

        if(!tables[table])
          throw new Error(`[Cytosis/Find] — Couldn’t find a match. Make sure you're looking in the right place. Reference table/string: (${tables[table]} / ${findStr}). Required Format was probably wrong: { Content: [ row, row, row], Tags: [ row, row, row ] }. `)
        // each airtable record
        for (let record of tables[table]) {
          for (let field of fields) {

            // check if field exists, and if the contents match
            if(record && record.fields && record.fields[field] && str == record.fields[field] ) {
              // console.log('Match found in', record.fields.Name)
              results.push(record)
            }
          }
        }
      })
      return results
    }

    const queries = findStr.split('.')
    // console.log('Looking for', queries.join(', '), 'in', fields.join(), 'tables:', tables, queries.length)

    // when just looking for one value, match against the column (field) name
    if(queries.length == 1)
      return matchField(queries[0], tables, fields)[0] // return the FIRST result

    if(queries.length == 2)
      return matchField(queries[1], {q: tables[queries[0]]}, fields)

    // when queries > 2, we need to return the contents of the record's field, and not the record itself!
    // this is just implemented for 3 levels deep for testing
    const records = matchField(queries[1], {q: tables[queries[0]]}, fields)

    // return if it's a string or nonarray
    // assume Name is unique, otherwise complicated; return first found
    if(!Array.isArray(records[0].fields[queries[2]])) {
      return records[0].fields[queries[2]]
    }

    // could be an array of IDs... or array of strings and images
    const fieldContent = records[0].fields[queries[2]]

    // 4 deep returns the linked field's content, which we assume to be Ids
    if(queries.length == 4) {
      let result = []
      // can't use getLinkedRecords b/c we have no idea where they come from
      // const linkedRecords = Cytosis.getLinkedRecords(fieldContent, tables, true)
      for (let id of fieldContent) {
        const record = Cytosis.get(id, tables)
        result.push(record.fields[queries[3]])
      }
      return result.join(', ') // returns a joined string of linked objects' fields (e.g. the names of linked tags)
      // return fieldContent[0].fields[queries[3]] // returns the FIRST linked field
    }

    // otherwise just return whatever is in that field, e.g. an array of image objects, etc.
    return fieldContent
  }


  // a simpler version of find, which was restrictive:
  // - had to take a table object like { Content: [table] }
  // - threw errors whenever something was broken
  // - returned an array of results, in case of duplicates
  //
  // this one is simpler:
  // - takes a string, just like in Find (above)
  // - takes an array of airtable objects (e.g. [table], or one of the tables that Find required)
  // - returns undefined if there's an error (doesn't throw an error)
  // - always returns one item (the first; assumes lookup values are unique)
  // - is just a wrapper for Find
  // takes: 
  static findOne (findStr, table, fields=['Name']) {

    if(!table)
      return undefined

    if (typeof(fields) == "string") {
      console.error('[Cytosis] find "fields" argument must be an array')
      return undefined
    }

    // the key has to match the source of the findStr
    // if it's in the form 'Content.something' then 'Content' is the key
    // otherwise if it doesn't have the structure, key doesn't matter
    const key = findStr.split('.').length > 0 ? findStr.split('.')[0] : '_key'
    // console.log('findOne input', findStr, key, table, fields)
    let payload = {}
    payload[key] = table
    const output = this.find(findStr, payload, fields)
    // console.log('findOne output', output)

    if(output && output.length && output.length > 0) // return the first el of an array, if using 'Content.something'
      return output[0]
    else if(output)
      return output // if findStr doesn't have . separators, it'll return an object

    return undefined
  }

  // findField
  // combines findOne with a way to get the field, with proper fallback
  // a common use cases is: this.$cytosis.findOne('home-featured', this.$store.state['Content'] ).fields['Markdown'],
  // but this crashes if the content can't be found, which is a fairly easy occurence
  // 
  // instead, this fn allows us to do:
  // this.$cytosis.findField('home-featured', this.$store.state['Content'], 'Markdown', ['Name'] )
  // 
  // - this gets the content from Markdown
  // - or returns undefined if it doesn't exist (rather than crashing)
  // 
  // input: findStr — the column item you're looking for
  // table: the airtable of contents
  // contentField: the content field you're looking for (e.g. 'Markdown')
  // fields: the columns you're trying to find a match 
  static findField (findStr, table, contentField, fields=['Name']) {
    let element = Cytosis.findOne(findStr, table, fields)
    if (element && element.fields && element.fields[contentField])
      return element.fields[contentField]
    return undefined
  }



  // simple promise-based wrapper for saving to airtable
  // no recordId: creates a new record
  // recordId: replaces current record
  // note that the API requires tablename regardless; either we find it or pass it in
  // Input: 
  //    object: a JS object with one or more keys that match field (column) names in the table
  //    tableName: a string indicating what table to save to
  //    cytosis: cytosis object (w/ proper key/base)
  //    recordId: a string, if defined, would save the object into the existing record w/ recordId
  // Output:
  //    an object: the saved record object as returned from Airtable
  static save (object, tableName, cytosis, recordId=undefined) {
    
    if(!Cytosis.preCheck(cytosis.airKey,cytosis.airBase))
      return

    let base = cytosis.base
    try {
      return new Promise(function(resolve, reject) {
        if (!recordId) {
          base(tableName).create(object, function(err, record) {
            if (err) { console.error('Airtable async save/create error', err); reject(err); return }
            console.log('New record: ' , record.getId(), record.fields['Name']);
            resolve(record);
          });
        } else {
          // old API doesn't support typecast
          base(tableName).update(recordId, object, function(err, record) {
            if (err) { console.error('Airtable async save error', err); reject(err); return }
            console.log('Updated record: ' , record.getId(), record.fields['Name']);
            resolve(record);
          });
        }
      })

    } catch(e) {
      console.error('Save Object to Airtable error (do you have permission?)', e); return; 
    }
  }

  // uses the new Airtable create/update API
  // passes in an array of objects (id is embedded within the objects)
  // takes up to ten objects in the array
  // set "create" to true to create; has to be explicit, since it's easier to read 
  // to create: objectArray = [{fields: "name: {}, ..."}]
  // to update: objectArray = [{id: "123", fields: "name: {}, ..."}]
  static saveArray (objectArray, tableName, cytosis, create=false, typecast=false) {
    
    if(!Cytosis.preCheck(cytosis.airKey,cytosis.airBase))
      return

    let base = cytosis.base
    try {
      return new Promise(function(resolve, reject) {
        if (create) {
          base(tableName).create(objectArray, {typecast: typecast}, function(err, records) {
            if (err) { console.error('Airtable async saveArray/create error', err); reject(err); return }
            console.log('New records: ' , records);
            resolve(records);
          });
        } else {
          base(tableName).update(objectArray, {typecast: typecast}, function(err, records) {
            if (err) { console.error('Airtable async saveArray/update error', err); reject(err); return }
            console.log('Updated records: ' , records);
            resolve(records);
          });
        }
      })

    } catch(e) {
      console.error('SaveArray Object to Airtable error (do you have permission?)', e); return; 
    }
  }



  // Deletes an existing record from a table
  // The given API key needs account permission to delete
  // Input:
  //    tableName: a string, the name of the table
  //    cytosis: cytosis object (w/ proper key/base)
  //    recordId: a string, the Id of the record to be deleted
  // Output:
  //    an object: the deleted record object as returned from Airtable
  static delete (tableName, cytosis, recordId) {

    if(!Cytosis.preCheck(cytosis.airKey,cytosis.airBase))
      return

    let base = cytosis.base
    try {
      return new Promise(function(resolve, reject) {
        if (recordId) {
          base(tableName).destroy(recordId, function(err, record) {
            if (err) { console.error('Airtable async delete error', err); reject(err); return }
            console.log('Deleted record: ' , record.getId(), record.fields['Name']);
            resolve(record);
          });
        }
      })

    } catch(e) {
      console.error('Delete Object from Airtable error (do you have permission?)', e); return; 
    }
  }


  // Saves a list of strings to a target table
  // If a string is not matched, it's created as a unique record in the target table
  // If a string is found as a match in the target table (usually the key field 'Name'), a new record doesn't get created
  // Returns an array of ids of all matched or new records
  // 
  // Really useful for tables like Tags that basically just have 'Name'. This dedupes the rows, and makes sure saved items are 
  // tagged properly
  // - Make sure to use this on fields like "Tags" that have linked data
  // - This will return an array of ids that Airtable will save as Links to the other table
  // - *** Make sure to update your local tables getTables
  // 
  // resolves linked tables like tags and collections (b/c Airtable doesn’t return table details this has to be semi-manual)
  // takes a list of string or data objects, adds them to the base, and return a list of ids where they were just added
  // for each object in a list (e.g. a list of tag names):
  // 1. resolve against the existing objects (e.g. Tag records), if it exist, use the existing id
  // 2. if it’s a new object, add it to the table and get the id
  // 3. return the new array of ids
  // "Tags": fave.tags ? await resolveLinkedTable(base, fave.tags, 'Tags', _this.$store.state.data.tags) : [],
  // "Collections": fave.collections ? await resolveLinkedTable(base, fave.collections, 'Collections', _this.$store.state.data.collections) : [],
  // static async resolveLinkedTable(list, tableName, sourceTable, colName='Name') {
  // note, uses this.save, so can't be static!
  // Input:
  //    stringList: an array of strings that represent the records (e.g. Tag Names) in the target
  //    targetTableName: the name of the target table (e.g. "Tags")
  //    sourceTable: an array of Airtable record objects where the matches could be found
  //    cytosis: cytosis object (w/ proper key/base)
  //    colName: usually matches the 'Name' (default) field but could be anything
  // Output:
  //    an array of record Ids that match the list
  static async saveLinkedTable (stringList, targetTableName, sourceTable, cytosis, colName='Name') {
    let recordIds = await stringList.reduce(async (resultPromise, listItem) => {
      const _result = await resultPromise

      // find a match and return the id
      for (let record of sourceTable) {
        const recordName = record.fields[colName]
        if (recordName && listItem.toLowerCase() == recordName.toLowerCase()) {
          return _result.concat(record.getId())
        } 
      }
      // if no match, we have to create a new one and get its id
      let recordId = await Cytosis.save({'Name': listItem}, targetTableName, cytosis)

      // bug? this touches the sourceTable
      // is it possible to set sourceTable = stringList (thus updating the source to include the list) from here?
      // sourceTable might be passed by reference making it possible, or that might need to be done on the calling fn
      // otherwise you get duplicate tags / linked table rows

      return _result.concat(recordId.id)
    }, Promise.resolve([]))

    // console.log('result: ' , result)
    return recordIds
  }


  // takes a table and strips it of everything but the fields and ids
  // really useful for storing data w/o all the other airtable stuff
  // -- note, this does NOT iterate through all the returned tables
  // Input: 
  //    a table array (e.g. Content: [...])
  // Output: 
  //    a table array where each object only has id and fields, no helpers
  static cleanTable (table) {
    // clean up the cytosis table by only keeping id, fields, and basics of _table
    return table.map(entry => {
      // console.log('cleanData . entry', entry)
      return {
        fields: entry.fields,
        id: entry.id
      }
    })
  }


  // takes an airtable record and keeps field and id
  static cleanRecord (record) {
    return {
      fields: record.fields,
      id: record.id,
      // _table: {
      //   name: record._table.name,
      //   _base: {
      //     _id: record._table._base._id,
      //     // the record also exposes the airtable API key, but
      //     // it really shouldn't be exposed here
      //   }
      // }
    }
  }


  // takes a cytosis object and 
  // iterates through tables and cleans them all up.
  // really useful for caching and storing data
  // Input: 
  //    a cytosis object
  // Output: 
  //    a stripped down cytosis object
  static strip (cytosis) {

    let _cytosis = {}
    _cytosis['config'] = { _cytosis: Cytosis.cleanTable(cytosis.config._cytosis) }
    _cytosis['airBase'] = cytosis['airBase']
    _cytosis['airKey'] = cytosis['airKey']
    _cytosis['endpointUrl'] = cytosis['endpointUrl']
    _cytosis['routeName'] = cytosis['routeName']
    _cytosis['tables'] = {}

    Object.keys(cytosis.tables).map((tableName) => {
      _cytosis['tables'][tableName] = Cytosis.cleanTable(cytosis.tables[tableName])
    })

    return _cytosis
  }

  // from an airtable facebook group discussion / Nick Cappello
  // he's apparently created his own API, so this isn't super useful, but it shows how introspection works!
  // https://gist.github.com/hightide2020/d6a73b35958da1b26078344a26588fb8?fbclid=IwAR0qak04ksgMn3ta_G04xnZ3APVshw2Odg3m4GnZBOj3Hz6GqTcc57ump50
  /* get _blankFields
   * Returns a key-value Object of empty Fields.

      Introspection usage:

      const test = this.$cytosis.findOne('home-mission', this.$store.state['Content'] );

      let _this = this
      Object.defineProperty(test, 'blankFields', {
        get: _this.$cytosis.blankFields
      });

  */
  static blankFields () {
    if (typeof this.fields !== 'object' || this.fields === null)
      return {};
      
    const entries = Object.entries(this.fields);
    const blankFields = {};
      
    for (const [key, settings] of entries) {
      console.log('entries:', entries, key, settings)
      if (settings === undefined) {
        const error = new Error(
          `Improper Field Definition in Table '${this.name}'.\n` +
          `Received: ${settings}`
        );
        error.name = 'TableError';
        throw error;
      }
      if (typeof settings.name !== 'string') {
        const error = new Error(
          `Improper Field Definition in Table '${this.name}'.\n` +
          `Expected 'name' to be a string.\n` +
          `Received: ${settings}`
        );

        error.name = 'TableError';
        throw error;
      }
      const args = [settings.name, undefined, { ...settings }];
      const blankField = typeof settings.type !== 'function' ? new UnknownField(...args) : new settings.type(...args);
      blankFields[key] = blankField;
    }

    return blankFields;
  }









  // Given a list of recordIds, gets the actual linked records
  // getRecord works a little better, but requires multiple API calls; this one uses local data
  // converts a list of record ids into a name (e.g. converts an Id from Tags to the name or the entire object)
  // these are stored inside the data category
  // old version would take a tableName, new one just takes a table
  // this works like "Lookup" of airtable
  // Input: 
  //    recordIds: ['recordId','recordId']
  //    sourceArray: array of records where the recordIds could be found
  //    getObj: if true, will return entire object, otherwise just gets the name of the row
  // Output:
  //    either an array of names or array of Airtable records
  static getLinkedRecords (recordIdArray, sourceArray, getObj=false) {
    if(!recordIdArray || !sourceArray)
      return []

    let records = []
    for (let recordId of recordIdArray) {
      for (let linkedRecord of sourceArray) {
        if(recordId == linkedRecord.id) {
          if(getObj) {
            records.push(linkedRecord)
          } else {
            records.push(linkedRecord.fields['Name'])
          }
        }
      }
    }
    return records
  }

  // gets the contents of a field/column (e.g. an Attachments or 'Links to Tags' column)
  // If linked, also converts them from a array of IDs to usable objects
  // Otherwise returns the array of contents that map to the original array
  //  - useful for getting image attachments and multiple select list values
  // FUTURE: eventually should work on duplicate names, but that gets super confusing to 
  // handle returned values; findReplacing works really well if names are treated unique
  // Input:
  //    recordArray: array of Airtable record objects that we want more information on
  //    fieldName: name of the field/column to retrieve
  //    linkedTable: array of Airtable records that we pull linked content from (e.g. Tag info)
  //      - if linkedTable is left undefined, we'll just get an array of recordIds for each record
  // Output:
  //    An array of records: if we retrieve linked table records
  //    An array of results. results.len = recordArray.len
  //    each result could be an array, so the result is very likely a 2D array
  static getFieldContent(recordArray, fieldName, linkedTable=undefined) {
    let results = []
    // console.log(`Getting the ${fieldName} contents of`, recordArray)
    for (let record of recordArray) {

      if(linkedTable) {
        const recordIds = record.fields[fieldName]
        let linked = Cytosis.getLinkedRecords(recordIds, linkedTable, true)
        if (linked.length > 0)
          results = results.concat(linked)
        else
          // results.concat(record.fields[fieldName])
          results.push(record.fields[fieldName])
      }
      else 
        results.push(record.fields[fieldName])
    }
    return results
  }

  // gets a unique list of values for the entire given field (column)
  // e.g. used for Single and Multiple Select lists, this gets every option
  // Input:
  //    recordArray: an array of Airtable records
  //    field: the name of the field to get (string, ex: 'Tags')
  // Output:
  //    an array of values (NOT an array of Airtable objects)
  static getFieldValues(recordArray, field) {
    let results = []
    // console.log(`Getting the ${field} contents of`, recordArray)
    for (let record of recordArray) {
      const recordValue = record.fields[field]

      // if the value's an array, it's a multiple list, so we break it up
      if (Array.isArray(recordValue)) {
        for (let rV of recordValue) {
          if(!results.find(r => r == rV)) {
            results.push(rV)
          }
        }
      } else {
        if(!results.find(r => r == recordValue)) {
          results.push(recordValue)
        }
      }
    }
    return results
  }


  // turns an array of Airtable records into an array of record names
  // useful for creating filter lists, etc.
  // Input:
  //    recordArray: an array of Airtable records
  // Output:
  //    an array of names (string values; NOT an array of Airtable objects)
  static getNames(recordArray) {
    let results = []
    for (let record of recordArray) {
      if(record)
        results.push(record.fields['Name'])
    }
    return results
  }


  // similar to getNames and getFieldValues but w/ arbitrary fieldname and null filtering & deduplication
  // fieldName is a string
  // useful for getting a list of 
  static getFields(recordArray, fieldName) {
    let results = []

    for (let record of recordArray) {
      if(record.fields && record.fields[fieldName])
        results.push(record.fields[fieldName])
    }
    // deduplicate fields
    return this.deduplicate(results)
    // return results
  }


  // adds "preset" API and Base keys for future instances
  // Input:
  //    airKey, airBase, tables, and tableQuery ;)
  // Output:
  //    nothing, but after Cytosis.configure, every time Cytosis is instantiated w/o options
  //    these will be used
  static configure({airKey, airBase, tables, tableQuery, options}) {
    Cytosis.airKey = airKey;
    Cytosis.airBase = {id: airBaseId};
    Cytosis.airBase.tables = tables || []
    Cytosis.airBase.tableQuery = tableQuery || 'tables';
    Cytosis.airBase.options = options || 'Grid view';
  }



  // Splits an object into many parts to be stored to Airtable
  // stores them as JSON; useful for using Airtable as a "data warehouse"
  // 
  // Takes an Airtable record object { ... data ..., 'hugeField': {tons of data} }
  // and breaks it into multiple chunks (Airtable has a size limit of 100,000 chars for Long Text fields)
  // *** Requires the key-1, key-2, ... fields to exist in Airtable as Long Text columns
  // *** Requires enough chunks, as the API can't create new fields
  // *** Each chunk is 1-indexed!!!!
  // 
  // Input:
  //    record: Airtable record object (unstringified!)
  //    key: field/column name 
  // Output:
  //    Changes the original record so that 
  //    record = {
  //      hugeField: {chunks: i, chunkSize: #} // JSON.stringified and saved into the key field
  //      hugeField-1: chunk 1  // these are saved right into the record, so when an Airtable save will save these straight into a field
  //      hugeField-2: chunk 2
  //      ...
  //    }
  static split(record, key, maxChunks=4, chunkSize=100000) {
    // TODO: convert confusing while loops into [...Array(5).keys()] and iterate for ... of like Python range()
    let itemString = JSON.stringify(record.fields[key])
  
    // if the key (e.g. _data) doesn't exist, just return the object
    if (itemString === undefined)
      return record 
    
    // too big? split the output into an array and into columns _data-1, -2, -3 etc
    // originally if a item was small it wouldn't get split, but that introduced data irregularities
    // if( itemString.length >= chunkSize) {
      let parts = []
      let i = 0
      let length = itemString.length

      while (length>0) {
        parts.push(itemString.substr(i*chunkSize,chunkSize))
        length -= chunkSize
        i++
      }
      // save the metadata into the original key
      // _data stores the metadata
      record.fields[key] = JSON.stringify({
        chunks: i,
        chunkSize: chunkSize,
      })

      let j = 0
      if(i < maxChunks) { // hard limit 
        while (j < i) {
          record.fields[`${key}-${j+1}`] = parts[j]
          j++
        }
      } else {
        throw new Error(`[Cytosis] — couldn’t split record "${record.fields.Name}" — not enough chunks`)
      }
    // }
    return record
  }




  // Takes a split record and merges it together, removing the metadata in the process
  // Takes all the hugeField-1
  // The result will look like the original, too-long record
  // Input:
  //    record: The Airtable record w/ the split data
  //    key: The name of the field to unsplit (String)
  // Output:
  //    record: The Airtable record w/ the original key/data
  static unsplit(record, key) {
    // a split record will always have chunks and chunkSize
    // return the record if it doesn't have a split

    if(!record.fields[key] || !JSON.parse(record.fields[key]).chunks)
      return JSON.parse(record.fields[key])

    const chunks = JSON.parse(record.fields[key]).chunks
    let itemString = ''
    let i=0

    while (i<chunks) {
      itemString += record.fields[`${key}-${i+1}`]
      delete record.fields[`${key}-${i+1}`] // remove the chunked partials for memory
      i++
    }

    const data = JSON.parse(itemString)
    // originally just returned the unsplit data
    // return JSON.parse(itemString)
    // now replaces metadata w/ regular data so the object doesn't "appear" mutated to user
    // the record deletes the chunked partials
    record.fields[key] = data
    return record
  }


  // deduplicate an array of anything (useful for generating list outputs)
  // Input: array of Airtable records
  // Output: array of unique Airtable records
  static deduplicate(recordArray) {
    return recordArray.filter((val, i, arr) => (arr.indexOf(val) == i))
  }

  // Sorts an array of Airtable objects by a given column, A>Z
  // This is sort of just an example on how to sort, as it doesn't really do a whole lot
  // Input:
  //    recordArray: an array or Airtable records
  //    sortBy: field/column to sort values by
  //    sortFn: a sort function
  static sort(recordArray, sortBy='Name', sortFn=undefined) {
    recordArray.sort(sortFn || function(a,b) {
      var nameA = a.fields[sortBy].toUpperCase(); // ignore upper and lowercase
      var nameB = b.fields[sortBy].toUpperCase(); // ignore upper and lowercase
      if (nameA < nameB) { return -1 }
      if (nameA > nameB) { return 1 }
      return 0;
    })
    return recordArray;
  }


  // only let Airtable object arrays through that contain the string, in the given fields
  // multiple fields e.g. searchByArray = ['Name','Hosts'], will search both
  // requires cytosis to search through linked fields
  // Input:
  //    str: search string
  //    sourceArray: array of records you're looking through
  //    searchByArray: array of field/column names e.g. ['Name','Tags']
  //    linkedTableArray: array of Airtable arrays; sources for any linked columns, e.g. for tags
  // Output:
  //    array of filter-searched Airtable objects
  static search(str, sourceArray, searchByArray, linkedTableArray=[]) {
    if(!str)
      return sourceArray // pass through if no search string; simplifies chaining

    return sourceArray.filter(function(obj) {
      let searchterm = str.toLowerCase()
      for (let field of searchByArray) {
        // console.log('search', str, obj.get(field) )
        if(obj.fields[field]) {
          if(typeof(obj.fields[field]) == 'string') {
            if (obj.fields[field].toLowerCase().includes(searchterm)) return true
          }
          else if(Array.isArray(obj.fields[field])) {
            // if it's an array of strings (e.g. multiple list)
            // linked records are also a list of strings, so we have to check for a string match
            // every time we see an array
            for (let strField of obj.fields[field]) {
              if (strField.toLowerCase().includes(searchterm)) return true
            }

            if (linkedTableArray.length > 0) {
              for (let linkedTable of linkedTableArray) {
                const records = Cytosis.getLinkedRecords(obj.fields[field], linkedTable, true)
                // console.log('search array', records)
                for (let record of records) {
                  // for linked records, only match against the name
                  if (record.fields['Name'].toLowerCase().includes(searchterm)) return true
                }
              }
            }

          }
        }
      }
      return false // no match

      // return obj.fields.Name && obj.fields.Name.toLowerCase().includes(searchterm) ||
      //       obj.fields.Notes && obj.fields.Notes.toLowerCase().includes(searchterm) ||
      //       obj.fields.Description && obj.fields.Description.toLowerCase().includes(searchterm) ||
      //       obj.fields.URL && obj.fields.URL.toLowerCase().includes(searchterm) ||
      //       obj.fields.Domain && obj.fields.Domain.toLowerCase().includes(searchterm) ||
      //       obj.fields.Authors && obj.fields.Authors.toLowerCase().includes(searchterm)
    })
  }



  // 
  //  Filter Generators
  // 
  //  Airtable has a weird syntax for filters. It's pretty annoying.
  //  These help make them less annoying
  // 


  static filter_or(keywords, field) {
    // field is a column name. Ex: "Slug" 
    // keywords is an array of keywords. Ex: "['jan-zheng', 'jessica-sacher']"
    // this generates: 'IF(OR({Slug}="jan-zheng", {Slug}="jessica-sacher"), TRUE())'

    let orArr = [], strArr = ""
    keywords.map((keyword) => {
      // generates: {Slug}="jan-zheng", {Slug}="jessica-sacher"
      orArr.push(`{${field}}="${keyword}"`)
    })
    strArr = orArr.join(', ')
    return `IF(OR(${orArr}), TRUE())`
  }







  // CURRENTLY NOT FUNCTIONAL, and not really a use for it right now
  // joins/combines multiple tables into one new object
  // would be good to have a join (inner), join-left, join-right, outer-join (full) from SQL
  // useful for making combinations for infographics or tables for tallying, etc.
  // takes an array of objects in the form of
  // [{data: (tags object), fields: ['Name', 'Notes']}, {data: (people object), fields: ['Name', 'Tags']}]
  // - fields is optional; leaving it out joins all fields
  // also takes a function that determines the name of each row; if none given, the new object combines the first fields of each object
  // identical field names will be concatenated
  // static join (tables, nameFn=undefined) {
  //   let result = {}

  //   if(!tables || !Array.isArray(tables) || !tables.length < 1)
  //     return undefined
    
  //   tables.map((table) => {
  //     const data = table.data
  //     const fields = table.fields && Array.isArray(table.fields) ? table.fields : undefined

  //     for (let field of fields) {
  //       result[field] = { ...result[field], data[field]} // concatenate if field already exists
  //     }

  //     // define the name transform method
  //     nameFn = nameFn ? nameFn : function(result) {
  //       console.log('namefn result', result)
  //       return result
  //     }

  //     return nameFn(result)
  //   })

  // }

}

export default Cytosis



