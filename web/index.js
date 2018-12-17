import React from 'react'
import { render } from 'react-dom'
import stringToStream from 'string-to-stream'
import JSONStream from 'JSONStream'
import livescript from 'livescript'
import debounce from 'lodash.debounce'
import compileFun from '../lib/compile-fun'
import { parse } from '../lib/argv'
import querystring from 'querystring'
import stringArgv from 'string-argv'
import { processInputStream, concatStream } from '../lib/stream'
import Output from './output'

const getStdin = () =>
  window
    .fetch('/stdin')
    .then((res) => res.text())

getStdin().then((str) => {
  doRender({ stdin: str })
})

const die = (msg) => console.error(msg)

class App extends React.Component {
  constructor(props) {
    super(props)
    this.onInputChange = this.onInputChange.bind(this)
    this.evalInput = debounce(this.evalInput.bind(this), 400)
    this.state = { input: props.input, output: [] }
    this.evalInput()
  }

  onInputChange(ev) {
    const val = ev.target.value
    this.setState({ input: val }, this.evalInput)
  }

  evalInput() {
    const { stdin } = this.props
    const { input } = this.state
    const trimmedInput = input.trim()
    if (trimmedInput === '') return
    const argv = stringArgv(input, 'node', 'dummy.js')
    const opts = parse(argv)
    const fun = compileFun(opts, die)
    const inputStream = stringToStream(stdin)
    const stream = processInputStream(die, opts, fun, inputStream)
    stream
      .pipe(concatStream())
      .on('data', (chunk) => {
        this.setState({ output: chunk })
      })
  }

  render() {
    return (
      <div>
        <input
          type="text"
          value={this.state.input}
          onChange={(ev) => {
            ev.persist()
            this.onInputChange(ev)
          }}
        />
        <Output output={this.state.output} />
      </div>
    )
  }
}

const doRender = (props) =>
  render(<App {...props} />, document.getElementById('root'))

const { input } = querystring.parse(window.location.href.split('?')[1])

doRender({ stdin: null, input })
