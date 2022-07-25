
import * as index from "./index.js";

// this gets the appropriate slug for index
export function GET(req, res) {
  index.get(req, res)
}

