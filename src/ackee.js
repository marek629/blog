const tracker = ackeeTracker.create('https://maje-ackee.herokuapp.com', {
  detailed: true,
  ignoreLocalhost: false,
  ignoreOwnVisits: true,
})
const registerView = () => {
  tracker.record('91f48a1b-da2a-41e6-9854-7e88d44a15a5', ackeeTracker.attributes(true))
}
registerView()

const recordAudioEvent = id => event => {
  const audio = event.target
  tracker.action(id, { key: new URL(audio.src).pathname, value: 1 })
}
const audioEvents = Object.entries({
  play: '762c8fa7-55e9-49a2-8eaf-f065f2a4e5dd',
  pause: 'a7fdc677-f0b0-4edf-9123-b2949463fde9',
  ended: '29b9ef6c-45db-4051-91d3-4a516988633a',
  // 'seeking', 'seeked', 'staled', 'volumechange'
})
const watchEvents = () => {
  document.querySelectorAll('audio').forEach(audio => {
    audioEvents.forEach(([event, actionId]) => {
      audio.addEventListener(event, recordAudioEvent(actionId))
    })
  })
}
const isBody = list => Array.prototype.every.call(
  list,
  element => element.classList.contains('body'),
)
const observer = new MutationObserver(list => {
  list.forEach(mutation => {
    const {
      addedNodes, removedNodes,
      type,
    } = mutation
    if (type === 'childList') {
      if (isBody(removedNodes) && isBody(addedNodes)) {
        watchEvents()
        registerView()
      }
    }
  })
})
document.addEventListener('DOMContentLoaded', () => {
  watchEvents()

  observer.observe(
    document.querySelector('.doc-layout'),
    { attributes: false, childList: true, subtree: false },
  )
})
