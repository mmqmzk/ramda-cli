import React, { PureComponent } from 'react'
import { pure } from 'recompose'
import classNames from 'classnames'
import ansi2html from './ansi2html'
import isSafari from './is-safari'
import { FixedSizeList } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'

import style from './styles/Output.scss'

const hasAnsiColors = (outputType) => ['pretty', 'table'].includes(outputType)

const AnsiPre = pure(({ str, style }) => (
  <pre
    style={style}
    dangerouslySetInnerHTML={ansi2html(str, {
      escapeXML: true,
      fg: '#afafaf',
      bg: '#0a0a0a'
    })}
  />
))

class OutputRow extends PureComponent {
  render() {
    const { data, index, style: rwStyle, outputType } = this.props
    const content = data[index]
    return hasAnsiColors(outputType) ? (
      <AnsiPre style={rwStyle} str={content} />
    ) : (
      <pre style={rwStyle}>{content}</pre>
    )
  }
}

const ITEM_SIZE = 24

class Output extends PureComponent {
  constructor(props) {
    super(props)
  }

  render() {
    const { outputType, lines, isError, onItemsRendered } = this.props
    return (
      <div className={classNames(style.output, { [style.error]: isError })}>
        <AutoSizer
          disableWidth={true}
          onResize={({ height }) => {
            this.height = height
            this.maxLinesForHeight = Math.round(height / ITEM_SIZE)
          }}
        >
          {({ height }) => (
            <FixedSizeList
              className={style.outputList}
              height={height}
              itemData={lines}
              itemCount={lines.length}
              overscanCount={2}
              itemSize={ITEM_SIZE}
              onItemsRendered={({ visibleStartIndex, visibleStopIndex }) => {
                this.visibleStartIndex = visibleStartIndex
                this.visibleStopIndex = visibleStopIndex
                this.visibleLines = visibleStopIndex - visibleStartIndex
                onItemsRendered()
              }}
            >
              {(props) => <OutputRow {...props} outputType={outputType} />}
            </FixedSizeList>
          )}
        </AutoSizer>
      </div>
    )
  }
}

export default Output
