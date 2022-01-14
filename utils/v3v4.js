
// this transforms v3 objects to v4 objects (e.g. Capsid, or Profiles)



/*
	obj: { fruit: 'apple' }
	oldKey: 'fruit'
	newKEy: 'food'
	result: { food: 'apple'}
*/
export function keyReplace (obj, oldKey, newKey) {
	if(!obj[oldKey] || oldKey===newKey) return obj
  obj[newKey] = obj[oldKey]
  delete obj[oldKey]
  return obj
}




// convert author (v3 People) from v3 > v4 (Profile)
export function updateProfile(v3) {

	// rename the manuscript fields
	// {new field, old field}
  let articleKeys = {
  	"Slug": "Slug",
		"Status": "Status",
		"Name": "Name",
		"GivenName": "FirstName",
		"MiddleName": "MiddleName",
		"FamilyName": "FamilyName",
		"Slug::Custom": "Slug:Custom",
		"Title": "Title",
		"Pitch": "Short",
		"Description": "Description",
		"Expertise": "Expertise",
		"Skills": "Skills",
		"Roles": "Roles",
		"Email": "Email",
		"Contact": "URL",
		"Social::Text": "Social:Other",
		"Social::Twitter": "Social:Twitter",
		"Social::Linkedin": "Social:Linkedin",
		"Social::GoogleScholar": "Social:GooglScholar",
		"Social::ResearchGate": "Social:ResearchGate",
		"Social::ORCID": "Social:ORCID",
		"Social::Publons": "Social:Publons",
		"Social::Github": "Social:Github",
		"Social::OSF": "Social:OSF",
		"Social::ProtocolsIO": "Social:ProtocolsIO",
		"ProfileImage": "ProfileImage",
		"Internal": "Internal:Tags",
  }
  Object.keys(articleKeys).map(key => {
  	v3['fields'] = keyReplace(v3['fields'], articleKeys[key], key)
  })
  return v3
}




// convert v3 Atom (any kind) v3 > v4 (Post)
export function updatePost(v3) {

	// rename the manuscript fields
	// {new field, old field}
  let articleKeys = {
  	"Name": "Name",
		"Status": "Status",
		"Date": "Data:PubDate",
		"Title": "Data:Title",
		"Content": "Markdown",
		"Content::Page": "Data:Content",
		"Tags": "Data:Tags",
		"Tags::Meta": "Data:Status",
		"Post::Type": "Atom:Type",
		"Post::Classes": "Data:Classes" ,
		"Attachments": "Attachments",
		"Attachments::Cover": "Cover",
		"Attachments::Data": "Attachments:Data",
		"URL": "URL",
		"CTA": "Data:CTA",
		"CTA::Description": "Data:CTANotes",
		"Location": "Meta",
		"Source": "Data:Source",
		"Description": "Data:Subtitle",
		"Date::Time": "Data:DateTime",
		"Date::Created": "Data:Created",
		"Date::Start": "Data:Date",
		"Date::End": "Data:DateEnd",
  }

  Object.keys(articleKeys).map(key => {
  	v3['fields'] = keyReplace(v3['fields'], articleKeys[key], key)
  })
  return v3
}








// convert capsid from v3 > v4 (for old cached)
// - all the Authors (profiles) need to be updated
// - all the Manuscript need to be updated
// - all the Atoms (posts) need to be updated
// - citation needs to be renamed
// Data model: https://www.notion.so/phagedirectory/PDv4-Publication-Data-Model-51be51f426494afe84e1460b0501446b
export function updateCapsid(v3) {

	// v3: move fields outside manuscript
	// v3: { manuscript: { fields : ...}}
	// v4: { fields: }
	v3['fields'] = v3['manuscript']['fields']
	delete v3['manuscript']

	// rename v3 atoms > feed
	v3['feed'] = v3['atoms']
	delete v3['atoms']

	// rename the manuscript fields
	// {new field, old field}
  let articleKeys = {
    "Issue": "Data:Issue",
    "Category": "Category",
    "Status": "Status",
    "Date": "Data:Date",
    "Slug": "Slug",
    "Title": "Data:Title",
    "Title::Plain": "Data:Title:String",
    "Lede": "Data:Lede",
    "Abstract": "Data:Abstract",
    "Author": "Data:MainAuthorSlug",
    "Author::Secondary": "Data:AuthorSlugs",
    "Content": "Data:Body",
    "URL": "URL",
    "Posts::WhatsNew": "Atoms:Updates",
    "Posts::Jobs": "Atoms:Jobs",
    "Posts::Community": "Atoms:Community",
    "Posts::Alerts": "Atoms:Alerts",
    "Posts:Sponsors": "Atoms:Sponsors",
    "Postscript": "Data:Meta",
    "Social": "Social:Twitter",
    "Social::Tags": "Social:Twitter:Tags",
    "Cover": "Cover:url",
    "Cover::Classes": "Cover:attrs",
    "Cover::Style": "Cover:style",
    "Cover::Description": "Cover:Description",
    "Attachments": "Attachments",
    "Attachments::Data": "Attachments:Data",
    "Pub::Related": "Manuscripts:Related" 
  }
  Object.keys(articleKeys).map(key => {
  	v3['fields'] = keyReplace(v3['fields'], articleKeys[key], key)
  })

	// process atoms into v4 posts
	v3['feed'].map((atom, i) => {
		v3['feed'][i] = updatePost(v3['feed'][i])
	})

	// categorize the atoms into v4 buckets where
	// feed: {WhatsNew: [], Jobs: [], etc...} (whereas v3 just had feed items in a big array)
	const feed = {
		WhatsNew: [],
		Jobs: [],
		Community: [],
		Alerts: [],
	}
	v3['feed'].map((atom, i) => {
		const type = atom['fields']['Post::Type']
		switch(type) {
			case 'Update':
				feed['WhatsNew'].push(atom)
				break
			case 'WhatsNew':
				feed['WhatsNew'].push(atom)
				break
			case 'Job':
				feed['Jobs'].push(atom)
				break
			case 'Community':
				feed['Community'].push(atom)
				break
			case 'Alerts':
				feed['Alerts'].push(atom)
				break
		}
	})
	v3['feed'] = feed


	// update authors > profiles
	v3['authors'].map((author, i) => {
		v3['authors'][i] = updateProfile(v3['authors'][i])
	})

  v3['version'] = 'v3>v4'
  return v3
}

