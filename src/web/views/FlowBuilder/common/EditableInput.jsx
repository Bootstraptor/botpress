import React, { Component } from 'react'
import classnames from 'classnames'

const style = require('./style.scss')

export default class EditableInput extends Component {
  constructor(props) {
    super(props)
    this.state = {
      value: null
    }
  }

  componentDidMount() {
    this.props.onMount && this.props.onMount(this.input)
    this.setState({ value: this.props.value || this.props.defaultValue })
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ value: nextProps.value || nextProps.defaultValue })
  }

  onChanged(event) {
    let txt = event.target.value
    if (this.props.transform) {
      txt = this.props.transform(txt)
    }

    this.setState({ value: txt })
  }

  onKeyDown(event) {
    if (event.keyCode === 13) {
      // Enter
      event.target.blur()
    }
  }

  onBlur() {
    if (!this.props.value.length) {
      this.props.onChanged && this.props.onChanged(this.state.defaultValue)
    } else {
      this.props.onChanged && this.props.onChanged(this.state.value)
    }
  }

  render() {
    const inputWidth = Math.max(120, 20 + 8 * this.props.value.length) + 'px'
    const inputClass = classnames(style.editableInput, {
      [this.props.className]: true,
      [style.defaultValue]: this.props.value === this.props.defaultValue
    })

    return (
      <input
        className={inputClass}
        type="text"
        ref={el => (this.input = el)}
        style={{ width: inputWidth }}
        autocomplete="off"
        value={this.state.value || this.props.defaultValue}
        onBlur={::this.onBlur}
        onChange={::this.onChanged}
        onKeyDown={::this.onKeyDown}
      />
    )
  }
}
