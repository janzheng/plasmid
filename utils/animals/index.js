
// from https://www.npmjs.com/package/random-animal-name
// but that implementation doesn't compile

import animals from './animals.json';
import adjectives from './adjectives.json';

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

const aRandom = (length) => {
  return Math.floor(Math.random() * length)
}



export const generateRandomAnimal = () => {
  const adjective = adjectives[aRandom(adjectives.length)]
  const animal = animals[aRandom(animals.length)]
  return `${capitalizeFirstLetter(adjective)} ${capitalizeFirstLetter(animal)}`
}