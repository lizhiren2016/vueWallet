class LocalStorage {
  set (key, value) {
    window.localStorage.setItem(key, value)
  }

  get (key) {
    return window.localStorage.getItem(key)
  }
}

module.exports = LocalStorage
