document.addEventListener("DOMContentLoaded", (event) => {
  console.log({ event })
  const s = document.createElement('script')
  s.async = true
  s.src = 'https://maje-ackee.herokuapp.com/tracker.js'
  s.dataset.ackeeServer = 'https://maje-ackee.herokuapp.com'
  s.dataset.ackeeDommainId = '91f48a1b-da2a-41e6-9854-7e88d44a15a5'
  document.body.append(s)
})

