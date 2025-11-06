const app = require('./index')

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Local dev server listening on ${PORT}`)
})
