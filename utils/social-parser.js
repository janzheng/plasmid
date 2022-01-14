


/*

  Social Parser

  Uses social-parser to replace "{{ faceboook }}" with the facebook account information
  given in the socialStr parameter, e.g. "https://twitter.com/yawnxyz | https://facebook.com/janzheng"

  - pretty useful for building contact sheets without having to specify each social account
  - you can just dump a few account values in a string and this will sort it out


  modified to include academic groups
  source: https://www.npmjs.com/package/@salesflare/social-profile-url-parser



  Last updated: 8/8/2020

*/


const internals = {
    // We sometimes use [A-Za-z_]{0,3} instead of www since there are localized urls like au.linkedin.com
    // The {0,3} will get flagged as unsafe but I have not found a better solution yet
    regexes:  {
        'aboutme': /https?:\/\/(www\.)?about\.me\/([^ /\n]+)/ig,
        'angellist': /https?:\/\/(www\.)?angel\.co\/([^ /\n]+)/ig,
        'behance': /https?:\/\/(www\.)?behance\.(com|net)\/([^ /\n]+)/ig,
        'blogger': /https?:\/\/(www\.)?blogger\.com\/profile\/([^ /\n]+)/ig,
        'coinbase': /https?:\/\/(www\.)?coinbase\.com\/([^ /\n]+)/ig,
        'crunchbase': /https?:\/\/(www\.)?crunchbase\.com\/(person|company|organization)\/([^ /\n]+)/ig,
        'delicious': /https?:\/\/(www\.)?delicious\.com\/([^ /\n]+)/ig,
        'digg': /https?:\/\/(www\.)?digg\.com\/users\/([^ /\n]+)/ig,
        'dribbble': /https?:\/\/(www\.)?dribbble\.com\/([^ /\n]+)/ig,
        'facebook': /https?:\/\/([A-Za-z_]{0,3}\.|[A-Za-z_]{2}-[A-Za-z_]{2}\.)?(facebook|fb)\.com\/(groups\/)?([^ /\n]+)/ig, //eslint-disable-line unicorn/no-unsafe-regex
        'flickr': /https?:\/\/(www\.)?flickr\.com\/(people|photos|groups)\/([^ /\n]+)/ig,
        'foursquare': /https?:\/\/(www\.)?foursquare\.com\/(user\/)?([^ /\n]+)/ig,
        'github': /https?:\/\/(www\.)?github\.com\/([^ /\n]+)/ig,
        'googleplus': /https?:\/\/plus\.google\.com\/u\/0\/\+?([^ /\n]+)/ig,
        'gravatar': /https?:\/\/([A-Za-z_]{0,3}\.)?gravatar\.com\/([^ /\n]+)/ig, //eslint-disable-line unicorn/no-unsafe-regex
        'instagram': /https?:\/\/(www\.)?instagram\.com\/([^ /\n]+)/ig,
        'keybase': /https?:\/\/(www\.)?keybase\.io\/([^ /\n]+)/ig,
        'klout': /https?:\/\/(www\.)?klout\.com\/([^ /\n]+)/ig,
        'lastfm': /https?:\/\/(www\.)?(last\.fm|lastfm\.com)\/user\/([^ /\n]+)/ig,
        'linkedin': /https?:\/\/([A-Za-z_]{0,3}\.)?linkedin\.com\/(((sales\/)?(in|pub|people|company|companies|organization|edu|school|groups)\/)|(profile\/view\?id=[a-zA-Z]))([^ \n]+)/ig,  //eslint-disable-line unicorn/no-unsafe-regex
        'medium': /https?:\/\/(www\.)?medium\.com\/@?([^ /\n]+)/ig,
        'myspace': /https?:\/\/(www\.)?myspace\.com\/([^ /\n]+)/ig,
        'ok': /https?:\/\/(www\.)?ok\.ru\/(profile\/)?([^ /\n]+)/ig,
        'pandora': /https?:\/\/(www\.)?pandora\.com\/people\/([^ /\n]+)/ig,
        'pinterest': /https?:\/\/([A-Za-z_]{0,3}\.)?pinterest\.[a-zA-Z.]+\/([^ +/\n]+)/ig,  //eslint-disable-line unicorn/no-unsafe-regex
        'plancast': /https?:\/\/(www\.)?plancast\.com\/([^ /\n]+)/ig,
        'quora': /https?:\/\/(www\.)?quora\.com\/(profile\/)?([^ /\n]+)/ig,
        'reddit': /https?:\/\/(www\.)?reddit\.com\/user\/([^ /\n]+)/ig,
        'slideshare': /https?:\/\/(www\.)?slideshare\.net\/([^ /\n]+)/ig,
        'tumblr': /https?:\/\/(.+)\.tumblr\.com/ig,
        'twitter': /https?:\/\/((www|mobile)\.)?twitter\.com\/([^ /\n]+)/ig,
        'vimeo': /https?:\/\/(www\.)?vimeo\.com\/([^ /\n]+)/ig,
        'vk': /https?:\/\/(www\.)?vk\.com\/([^ /\n]+)/ig,
        'wordpress': /https?:\/\/((?!subscribe).+)\.wordpress\.com/ig,
        'xing': /https?:\/\/(www\.)?xing\.com\/(profile\/)?([^ /\n]+)/ig,
        'yahoo': /https?:\/\/((profile|me|local)\.)?yahoo\.com\/([^ /\n]+)/ig,
        'youtube': /https?:\/\/([A-Za-z_]{0,3}\.)?youtube\.com\/(user\/|channel\/|c\/)?([^ /\n]+)/ig,  //eslint-disable-line unicorn/no-unsafe-regex
    
        orcid: /https?:\/\/(www\.)?orcid\.org\/([^ /\n]+)/ig,
        researchgate: /https?:\/\/(www\.)?researchgate\.net\/profile\/([^ /\n]+)/ig,
        'google-scholar': /https?:\/\/scholar\.google\.com\/citations\?user=([^ /\n]+)/ig,
        publons: /https?:\/\/(www\.)?publons\.com\/researcher\/([0-9]{0,9})?\/([^ /\n]+)/ig,
        protocolsio: /https?:\/\/(www\.)?protocols\.io\/researchers\/([^ /\n]+)/ig,
    },
    typeNameMap: new Map([
        ['aboutme', 'About.me'],
        ['angellist', 'AngelList'],
        ['blogger', 'Blogger'],
        ['coinbase', 'Coinbase'],
        ['crunchbase', 'CrunchBase'],
        ['delicious', 'Delicious'],
        ['dribbble', 'Dribbble'],
        ['facebook', 'Facebook'],
        ['flickr', 'Flickr'],
        ['foursquare', 'Foursquare'],
        ['github', 'GitHub'],
        ['googleplus', 'GooglePlus'],
        ['gravatar', 'Gravatar'],
        ['instagram', 'Instagram'],
        ['keybase', 'Keybase'],
        ['klout', 'Klout'],
        ['lastfm', 'Last.FM'],
        ['linkedin', 'LinkedIn'],
        ['medium', 'Medium'],
        ['myspace', 'MySpace'],
        ['ok', 'Odnoklassniki'],
        ['pandora', 'Pandora'],
        ['pinterest', 'Pinterest'],
        ['plancast', 'Plancast'],
        ['quora', 'Quora'],
        ['reddit', 'Reddit'],
        ['slideshare', 'Slideshare'],
        ['tumblr', 'Tumblr'],
        ['twitter', 'Twitter'],
        ['vimeo', 'Vimeo'],
        ['vk', 'VK'],
        ['wordpress', 'Wordpress'],
        ['xing', 'Xing'],
        ['yahoo', 'Yahoo'],
        ['youtube', 'YouTube'],

        ['orcid', 'ORCID'],
        ['researchgate', 'ResearchGate'],
        ['google-scholar', 'GoogleScholar'],
        ['publons', 'Publons'],
        ['protocolsio', 'ProtocolsIO'],
    ])
};

/**
 * @typedef {Object} parseResult
 * @property {String} type
 * @property {String} type_name
 * @property {String} username
 * @property {String} url
 */

/**
 *
 * @param {String} inputText
 * @returns {Array<parseResult>}
 */
export const socialParse = (inputText) => {

    // console.log('parsing .....')
    const resultsMap = new Map();
    Object.entries(internals.regexes).forEach(([type, regex]) => {

        // While loop is needed to process multiple matches from 1 regex
        let result;
        while ((result = regex.exec(inputText)) !== null) {
            const username = result[result.length - 1];

            // resultsMap.set(`${type}|${username}`, {
            resultsMap.set(`${type}`, {
                type,
                username,
                url: result[0],
                type_name: internals.typeNameMap.get(type) || 'other'
            });
        }
    });

    // console.log('socialparse results: :::', resultsMap)
    // console.log('socialparse results: :::', [...resultsMap.values()])
    return [...resultsMap.values()]
    // return resultsMap // this returns an array where first value is the type and second value is the actual value object
};



// import socialParser from './social-parser'
export const socialReplace = (text, socialStr) => {
  
  let result = text
  const replacer = socialParse(socialStr)

  Array.from(replacer.keys()).map(key => {
    let regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g')
    result = result.replace(regex, replacer.get(key).url)
    // if (social.type ==)
  })

  return {text: result, data: [... replacer.values()]}
}

