const tracker = ackeeTracker.create('https://ackee.maje.usermd.net', {
  detailed: true,
  ignoreLocalhost: false,
  ignoreOwnVisits: true,
})
const registerView = () => {
  tracker.record('91f48a1b-da2a-41e6-9854-7e88d44a15a5', ackeeTracker.attributes(true))
}
registerView()

const recordMediaEvent = id => event => {
  const element = event.target
  tracker.action(id, { key: new URL(element.src).pathname, value: 1 })
}
const audioEvents = Object.entries({
  play: '762c8fa7-55e9-49a2-8eaf-f065f2a4e5dd',
  pause: 'a7fdc677-f0b0-4edf-9123-b2949463fde9',
  ended: '29b9ef6c-45db-4051-91d3-4a516988633a',
  // 'seeking', 'seeked', 'staled', 'volumechange'
})
const videoEvents = Object.entries({
  play: '81dcc59b-d296-4a24-8fed-2426e0b8e8d7',
  pause: '9dd48099-ef2f-4843-bfbd-e348ff736f3a',
  ended: 'eb36ec73-c1c5-4def-b489-6d419a36d01f',
})
const watchEvents = () => {
  document.querySelectorAll('audio').forEach(audio => {
    audioEvents.forEach(([event, actionId]) => {
      audio.addEventListener(event, recordMediaEvent(actionId))
    })
  })
  document.querySelectorAll('video').forEach(video => {
    videoEvents.forEach(([event, actionId]) => {
      video.addEventListener(event, recordMediaEvent(actionId))
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
