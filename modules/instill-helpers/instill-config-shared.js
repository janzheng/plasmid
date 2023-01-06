
export const sharedSpaces = [

  {
    name: 'instill',
    spaceName: 'Instill',
    description: `A meta-space for discussing anything Instill, including blog updates, feature requests, questions, and bug reports.`,
    settings: {
      blockType: 'PostList',
      uploadImage: false,
      classMode: 'tight', // tight, oneline, default
      useOptimistic: true,
      polling: {
        enabled: false,
        speed: 1800
      },
      // useTurnstile: false, // doesn't load by project
      topicCta: "Create Post",
      // actionRoute: "someactionroute/instill/spaces",
      defaultPostType: 'Article', // sets the default post type
      // postTypes: ['Article', 'Post', 'Ask', 'Link', 'Show', 'Poll'],
      postTypes: ['Article', 'Link', 'Ask', 'Show', 'Suggestion', 'Poll'],
      showPostTypeFilters: true,

      // v2 settings
      postTypeSettings: {
        Article: { 
          icon: 'article',
          label: 'Article',
          description: 'A long-form article',
          postCta: "Post Article",
          uploadImages: true,
          topic: {
            label: 'Article Title',
            placeholder: "Enter article title",
          },
          preview: {
            length: 'short', // full, long, short, none/false/undefined
            // mode: 'markdown', // remove-markdown, markdown; if empty, just render text
          },
          comment: {
            required: true,
            rows: 8,
            type: 'textarea',
            label: "Full Article Text",
            placeholder: "Enter article text (markdown supported)",
          },
          replies: {
            rows: 4,
            type: 'textarea',
            label: "Add a reply",
            placeholder: "Add a thoughtful comment",
            // postCta: "Add a Reply",
          },
          topicFields: [{
            name: 'Description',
            label: 'Article Description',
            placeholder: 'Enter a short description of your article',
          }]
        },
        Poll: {
          icon: 'poll',
          label: 'Poll',
          description: 'Ask the community with a poll-style question',
          postCta: "Create Poll",
          uploadImages: false,
          // resultsMode: 'always', // always, optional
          topic: {
            label: 'Poll Title',
            placeholder: "Enter a title for your poll",
          },
          preview: {
            length: 'short', // full, short, none/false/undefined
          },
          comment: {
            required: false,
            rows: 4,
            type: 'textarea',
            label: "Poll Description",
            placeholder: "Write an optional description or background for your poll",
          },
          topicFields: [{
            name: 'Poll',
            label: 'Poll Options (beta: use JSON settings to set your question and options)',
            placeholder: 'Enter the options for your poll',
            type: 'textarea',
            rows: 12,
            value: {
              "Question": "Your favorite fruit:",
              "Options": [
                "Banana",
                "Apple",
                "Orange"
              ]
            }
          }]
        },
        Link: {
          icon: 'link',
          label: 'Link',
          description: 'Share a link to a blog, article or something fun!',
          postCta: "Share Link",
          uploadImages: false,
          topic: {
            label: 'Link Title',
            placeholder: "Enter a title (article or a short, descriptive title)",
          },
          preview: {
            length: false, // full, short, none/false/undefined
          },
          comment: {
            required: false,
            rows: 5,
            type: 'textarea',
            label: "Comment",
            placeholder: "(Optional) Write a comment on the link",
          },
          addLink: {
            required: true,
            label: "Link",
            placeholder: "Enter a link",
          },
          // topicFields: [{
          //   name: 'url',
          //   label: 'URL',
          //   placeholder: 'Enter a URL',
          //   type: 'text',
          // }]
        },
        Show: {
          icon: 'show',
          label: 'Show',
          description: 'Show off your work',
          postCta: "Create Post",
          uploadImages: {
            required: false,
            label: '(Optional) Upload image',
            multiple: true,
          },
          topic: {
            label: 'Title',
            placeholder: "Enter the title of your work (or a short, descriptive title)",
          },
          preview: {
            length: 'short', // full, short, none/false/undefined
          },
          comment: {
            required: true,
            rows: 8,
            type: 'textarea',
            label: "Comment",
            placeholder: "Write a comment about your work",
          },
          topicFields: [{
            name: 'url',
            label: 'URL',
            placeholder: '(Optional) Enter a URL',
            type: 'text',
          }]
        },
        Ask: {
          icon: 'ask',
          label: 'Ask',
          description: 'Ask the community a question (e.g. how would you do X)',
          postCta: "Create an Ask",
          uploadImages: {
            required: false,
            label: '(Optional) Upload image',
            multiple: true,
          },
          topic: {
            label: 'Question',
            placeholder: "Enter a question for the community",
          },
          preview: {
            length: 'short', // full, short, none/false/undefined
          },
          comment: {
            required: false,
            rows: 8,
            type: 'textarea',
            label: "Question Details",
            placeholder: "Add more details about your question. Adding more detail will get you more helpful answers!",
          },
          replies: {
            rows: 4,
            type: 'textarea',
            // label: "Add a reply",
            placeholder: "Add a reply to the question. Please be kind and understanding!",
            postCta: "Add a Reply",
          },
          topicFields: [{
            name: 'url',
            label: 'URL',
            placeholder: '(Optional) Enter a URL',
            type: 'text',
          }]
        },
        Suggestion: {
          // suggestions are just regular posts with some CTAs and explicitly enabled upvoting — this is useful for spaces w/o upvoting, but you want upvoting just for a specific post
          icon: 'suggestion',
          label: 'Suggestion',
          description: 'A Suggestion post is similar to a poll, but focusd around upvoting the suggestion. Could be a new feature, an idea, etc.',
          postCta: "Create a Suggestion",
          uploadImages: {
            required: false,
            label: '(Optional) Upload image',
            multiple: true,
          },
          topic: {
            label: 'Suggestion',
            placeholder: "Create a suggestion",
          },
          // preview: {
          //   length: 'short', // full, short, none/false/undefined
          // },
          comment: {
            required: false,
            rows: 4,
            type: 'textarea',
            label: "Suggestion Details",
            placeholder: "Add more details about your suggestion",
          },
          replies: {
            rows: 4,
            type: 'textarea',
            label: "Add a Comment",
            placeholder: "Help add to the suggestion. Please be constructive!",
            postCta: "Add a Reply",
          },
          topicFields: [{
            name: 'url',
            label: 'URL',
            placeholder: '(Optional) Enter a URL',
            type: 'text',
          }]
        },
      },


    },
  },
]