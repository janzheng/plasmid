
/*

  Utility Helpers


  Last updated: 5/26/2020

*/

// import { socialParser } from './social-parser';

// export const mdReplace = (text, replacer) => {
//   try {
//     /*
//       text: hello {{ name }}
//       replacer: {
//         name: 'banana!'
//       }

//       result = "hello banana!"

//     */
//     let result = text

//     if(!replacer) {
//       throw new Error('Did you forget to pass a replacer object into mdReplace()?')
//       return
//     }

//     // console.log('replacer::::', text, replacer)
//     Object.keys(replacer).map((key) => {
//       // let regex = `/\\{\\{\\s*${key}\\s*\\}\\}/g`
//       let regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g')
//       result = result.replace(regex, replacer[key])
//       // console.log('replacing result:', key, result, regex)
//     })

//     // console.log('result::::', result)
//     return result
//   } catch (e) {
//     console.error(e)
//   }
// }


// use socialReplace() from social-parser
// converts social media urls like twitter.com/janzheng to
// a parse-able object
// export const socialize = (text, socialStr) => {
//   let result = text
//   const replacer = socialParser.parse(socialStr)

//   Array.from(replacer.keys()).map(key => {
//     let regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g')
//     result = result.replace(regex, replacer.get(key).url)
//     // if (social.type ==)
//   })

//   return {text: result, data: [... replacer.values()]}
// }



    // takes a string, and replaces all instances of {{key}} with the value of key in the data object
export const keyReplace = (textTemplate, replacerObject, cleanup=true) => {
  /*
    replaces content in a source string with a string from a replacer object

    textTemplate: hello {{ name }}
    replacer: {
      name: 'banana!'
    }

    result = "hello banana!"

  */
  try {
    let result = textTemplate

    if(!replacerObject) {
      throw new Error('Did you forget to pass a replacer object into keyReplace()?')
      return
    }

    Object.keys(replacerObject).map((key) => {
      // let regex = `/\\{\\{\\s*${key}\\s*\\}\\}/g`
      let regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g')
      if(result)
        result = result.replace(regex, replacerObject[key])

      // console.log('replacing result:', key, regex)
    })

    // clean up any replacers that weren't caught
    if(cleanup) {
      let regex = new RegExp(`\\{\\{(.*?)\\}\\}`, 'g')
      if(result)
        result = result.replace(regex, '')
    }
    // console.log('result::::', result)
    return result
  } catch (e) {
    console.error(e)
  }
}



// project-specific replacer of a text, e.g. "hi {{name}}" to "hi Jan"
// takes some text, like above, and a json object w/ defined values like 'name':'Jan'
// then adds definitions w/ a custom dictionary
// then replaces instease of {{name}} with {{Jan}}

// pass a dictionary definition function in:
// build a dictionary for text replacement
// e.g. {{else}} is replaced by the key here in md
// takes a data object, and maps a definition to a data source
// retains the original data, plus any new mappings
// ofc keep the original mapping as much as possible to prevent confusion
export const defaultDictFn = (data, loud = false) => {
  let dictionary = {
    // definition: data source
    'name': data?.['Name'],
    'email': data?.['Email'],
    'json': JSON.stringify(data, null, 2),
    ...data
  }
  if (loud)
    console.log('[[ dictionary ]]', dictionary)
  return dictionary
}


// uses keyReplace() to replace text w/ an additional dictionary object
export const textReplacer = (text, data, dict = defaultDictFn, loud=false) => {
  let _dict = dict ? dict(data, loud) : data
  return keyReplace(text, _dict)
}

// the main difference is that a keyMap is simpler, but it can't process itself, e.g. doing an introspection / JSON stringifying the data itself. The annoying part about textReplacer is that defaultDictFn is a function, and can't pass non-pojo in
// NOT USED — instead, using dictionary factory fn instead 
export const textKeyReplacer = (text, data, keyMap, loud = false) => {
  return keyReplace(text, keyRemap(data, keyMap))
}


/* 
  takes an object, and a map of old keys to new keys
  - the map object's keys are the OLD keys to remap
  - values are the NEW keys to remap to

  usage: this changes 'name' to 'firstName' in the result:
    let newdata = keyRemap(JSON5.parse(data), {name: 'firstName'})

  inputs:
    obj: {
      name: 'Jan',
    }

    map: {
      name: 'firstName'
    }

  output: {
    firstName: 'Jan'
  }
*/
export const keyRemap = (obj, map) => {
  return Object.keys(obj).reduce((acc, key) => {
    acc[map[key] || key] = obj[key];
    return acc;
  }, {});
};




// given a dictMap
// e.g. {name: 'Name', email: 'Email'} (left is the new key in MD, right is the old key in Airtable)
// inspired by the utils/notifiers
export const dictMapReplacer = ({templateText, dictMap, data}) => {
  let dictionary = (() => {
    let obj = {}
    Object.keys(dictMap).forEach((key) => {
      obj[key] = data?.[dictMap?.[key]] || ' ' // blank space prevents "undefined" to be spelled out
      if (dictMap && key && data)
        obj[dictMap[key]] = data[dictMap[key]] || ' ' // mirror old key so it also works
    })
    obj['json'] = JSON.stringify(data, null, 2)
    // console.log('---> dictMap keyObj:', obj)
    return obj
  })
  return textReplacer(templateText, data, dictionary)
}






// super simple delayer, bc setTimeout is gross in code
export const zzz = (fn, vars, delayMs=350) => {
  setTimeout(()=>{
    // console.log('zzz...', delayMs)
    fn(vars)
  }, delayMs);
}




export const getNiceAddress = (stripeAddress) => {
  /*
      gets formatted address from Stripe
  */
  return `${stripeAddress.line1 ? stripeAddress.line1 : ''} <br />
          ${stripeAddress.line2 ? stripeAddress.line2 : ''}  <br />
          ${stripeAddress.city ? stripeAddress.city : ''} ${stripeAddress.state ? stripeAddress.state : ''} ${stripeAddress.postal_code ? stripeAddress.postal_code : ''}
          Canada
          `
}