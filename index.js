require('dotenv').config()
const express = require('express')
const cors = require ('cors')

const { getJoyas, prepareClause, prepareFilter, prepareHATOAS } = require ("../Joyas/utils/pg.js")
const { reportConsult } = require('./middleware/middleware.js')

const PORT = process.env.PORT ?? 3000
console.log(process.env.PORT)
const app = express()

app.use(cors())
app.use(express.json())

app.get('/joyas', reportConsult, async (req, res) => {
  try {
      const queryStrings = req.query
      const clause = prepareClause(queryStrings)
      const joyas = await getJoyas(clause)
      const result = prepareHATOAS(joyas, false, true)
      res.status(200).json(result)
  } catch (error) {
      res.status(500).json(error)
  }
})

app.get('/joyas/filtros', reportConsult, async (req, res) => {
  try {
      const queryStrings = req.query;
      const [filter, values] = prepareFilter(queryStrings)
      const clause = filter;
      const joyas = await getJoyas(clause, values)
      const result = prepareHATOAS(joyas, true)
      res.status(200).json(result)
  } catch (error) {
      res.status(500).json(error)
  }
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})