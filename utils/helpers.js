
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
    ...data
  }
  if (loud)
    console.log('[[ dictionary ]]', dictionary)
  return dictionary
}

export const textReplacer = (text, data, dict = defaultDictFn, loud=false) => {
  let _dict = dict ? dict(data, loud) : data
  return keyReplace(text, _dict)
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

