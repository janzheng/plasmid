


export const getEventsOfType = (comments, type = 'Vote') => {
  let arr = []
  comments?.filter(cm => {
    let events = cm?.['Events::data']
    if (events) {
      events.filter(ev => {
        if (ev?.EventType == type) {
          arr.push({ ...ev, id: cm.id })
        }
      })
    }
  })
  return arr
}

export const findCommentById = (comments, id) => {
  return comments && comments.find && comments.find(cm => cm.id == id)
}

export const getEventsCount = (events) => {
  // add together events.Data numbers and return
  let count = 0
  events?.filter(ev => {
    count += ev?.Data
  })
  return count
}
