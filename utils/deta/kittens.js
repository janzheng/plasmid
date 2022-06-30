/* 

  [SvKit Endpoint]

  ORM-based Deta
  Doesn't work client-side; offline mode uses LowDB

  Examples of https://github.com/BetaHuhn/deta-base-orm 

*/

import * as DetaOrm from 'deta-base-orm'
import { getBase } from './deta';


// leave db as 'null' if instantiating the db from here
export const kittenFn = async (dbName = 'Kittens', name = 'Waffles', cuteness = 6) => {

  const db = getBase(dbName);
  console.log('kittenFn() db:', db)

  // ✨ Define a schema for the kittens
  const KittenSchema = new DetaOrm.Schema({
    name: 'string',
    cuteness: 'number'
  })

  const Kitten = new DetaOrm.Base(name, KittenSchema, { db: db, timestamp: true })

  // 🐱 Create a new kitten
  const line = Kitten.create({
    name,
    cuteness
  })

  // 🔖 Access the kittens name
  console.log(line.name) // 'Line'

  // 💾 Save our kitten to the Deta Base
  await line.save()

  // 🔍 Find all kittens
  const kittens = await Kitten.find()
  console.log('kittens:', kittens) // [{name: 'Line', cuteness: 8}, ...]

  // 🔑 Find a kitten by its key
  const sameKitten = await Kitten.findByKey(line.key)
  console.log('key:', line.key, sameKitten) // {name: 'Line', cuteness: 8}

  // 🧵 Find a kitten by its cuteness
  // const cutest = await Kitten.find({ cuteness: 8 })
  const cutest = await Kitten.find({ cuteness: { $gt: 5 } })
  console.log('cutest:', cutest) // [{name: 'Line', cuteness: 8}]

  // 💘 Delete a kitten
  // await sameKitten.delete()
  return cutest
}




// Expose the deta key on purpose
export const _get = async () => {
  let kittens = await kittenFn()
  return {
    body: {
      kittens,
    }
  }
}