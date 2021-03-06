import * as Util from '../../helpers'

let profilers = {}
let enabled = false

class Schema {
  constructor(id, type, start = null) {
    if (start == null)
      start = Util.microtime()

    this.id = id
    this.type = type
    this.start = start
    this.end = null
    this.total = null
    this.message = ''
  }
}

class Handler {
  constructor(name) {
    this.name = name
    this.logs = []
    this.pair = {}
    this.started = Util.microtime()
  }

  time(id, message) {
    if (!enabled)
      return null;

    if (id == null)
      id = this.logs.length

    let log = new Schema(id, 'time')
    log.message = message.toString()

    let key = this.pair[`time${id}`]

    if (typeof key != 'undefined') {
      this.logs[key] = log
    } else {
      this.logs.push(log)
      this.pair[`time${id}`] = (this.logs.length - 1)
    }

    console.time(id)

    return id
  }

  timeEnd(id, message) {
    if (!enabled)
      return null;

    if (id == null)
      id = this.logs.length

    let key = this.pair[`time${id}`]
    let log = null

    if (typeof key != 'undefined') {
      console.timeEnd(id)
      log = this.logs[key]
    } else {
      log = new Schema(id, 'time', this.started)
      if (typeof message != 'undefined')
        log.message = message

      this.logs.push(log)
      key = (this.logs.length - 1)
    }

    let end = log.end = Util.microtime()
    let start = log.start
    let total = end - start
    log.total = total
    this.logs[key] = log

    return total
  }

  trace() {
    if (enable)
      console.trace()
  }

  output(auto = false) {
    if (auto)
      enabled = true

    if (!enabled)
      return null;

    this.logs.forEach(log => {
      if (log.type == 'time') {
        let sec = Math.floor(log.total * 1000)
        console.log('%s: %s - %dms', log.id, log.message, sec)
      } else {
        console.log(log.id, log.message)
      }
    })
  }
}

class Profiler {
  constructor(name) {
    return Profiler.make(name)
  }

  static make(name = 'default') {
    if (profilers[name] == null)
      profilers[name] = new Handler(name)

    return profilers[name]
  }

  static enable() {
    enabled = true
  }

  static disable() {
    enabled = false
  }

  static status() {
    return enabled
  }
}

export default Profiler
