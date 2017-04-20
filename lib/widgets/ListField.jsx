'use strict'
/*

    To use this input widget adapter you need to register it with your
    adapter registry.

*/
import { createAdapter, globalRegistry } from 'component-registry'

import Inferno from 'inferno'
import Component from 'inferno-component'
import { safeGet } from 'safe-utils'

import { animateOnAdd, animateOnRemove } from '../animated'

import { interfaces } from 'isomorphic-schema'
import { IInputFieldWidget, IFormRowWidget }  from '../interfaces'

import { handleDragStart, handleDragOver, handleDragEnter, handleDragLeave, handleDragEnd, handleDrop } from '../draggable'

class ListFieldRow extends Component {
    componentDidMount () {
        animateOnAdd(this, 'InfernoFormlib-ListFieldRow--Animation')

        if (!this.listenersAdded) {
            let domEl = this._vNode.dom
            domEl.addEventListener('dragstart', handleDragStart.bind(this), false)
            domEl.addEventListener('dragover', handleDragOver.bind(this), false)
            domEl.addEventListener('dragenter', handleDragEnter.bind(this), false)
            domEl.addEventListener('dragleave', handleDragLeave.bind(this), false)
            domEl.addEventListener('dragend', handleDragEnd.bind(this), false)
            domEl.addEventListener('drop', handleDrop.bind(this), false)
            this.listenersAdded = true
        }
    }

    componentWillUnmount () {
        animateOnRemove(this, 'InfernoFormlib-ListFieldRow--Animation')

        // TODO: Cleanup
        /*
        let domEl = this._vNode.dom
        domEl.removeEventListener('dragstart', handleDragStart.bind(this), false)
        domEl.removeEventListener('dragover', handleDragOver.bind(this), false)
        domEl.removeEventListener('dragenter', handleDragEnter.bind(this), false)
        domEl.removeEventListener('dragleave', handleDragLeave.bind(this), false)
        domEl.removeEventListener('dragend', handleDragEnd.bind(this), false)
        domEl.removeEventListener('drop', handleDrop.bind(this), false)
        */
    }

    render () {
        return <div className="InfernoFormlib-ListFieldRow InfernoFormlib-DragItem" data-drag-index={this.props['data-drag-index']} draggable="true">
            {this.props.children}
        </div>
    }
}

function renderRows (field, value, itemKeys, errors, onChange, onDelete, onDrop) {
  if (value === undefined) return

  return value.map((item, index) => {
    const valueType = field.valueType
    const validationError = errors && errors.fieldErrors[index]
    // Support readOnly
    // Support validation constraints
    const InputFieldAdapter = globalRegistry.getAdapter(valueType, IInputFieldWidget)
    const RowAdapter = globalRegistry.getAdapter(valueType, IFormRowWidget)

    const Row = RowAdapter.Component
    const InputField = InputFieldAdapter.Component

    return (
      <ListFieldRow key={itemKeys[index]} data-drag-index={index} onDrop={onDrop}>
        <Row adapter={RowAdapter} validationError={validationError}>
            <InputField adapter={InputFieldAdapter} propName={index} value={value[index]} onChange={onChange} />
        </Row>
        <input className="InfernoFormlib-ListFieldRowDeleteBtn" type="button" onClick={(e) => {
            e.preventDefault()
            onDelete(index)
        }} value="Ta bort" />
      </ListFieldRow>
    )
  })
}

function Placeholder (props) {
    return <div className="InfernoFormlib-ListFieldPlaceholderContainer"> 
        <div className="InfernoFormlib-ListFieldPlaceholder">
            <div className="InfernoFormlib-ListFieldPlaceholderText">{props.text}</div>
        </div>
    </div>
}

export class ListFieldWidget extends Component {

  constructor (props) {
    super(props)

    const keys = {}

    this.keysNext = 0
    this.keys = []
    // Initialise keys for passed array if any
    if (Array.isArray(props.value)) {
        for (var i = 0; i < props.value.length; i++) {
            this.keys.push(this.keysNext)
            this.keysNext++
        }
    }

    this.didUpdate = this.didUpdate.bind(this)
    this.doAddRow = this.doAddRow.bind(this)
    this.doDeleteRow = this.doDeleteRow.bind(this)
    this.didDrop = this.didDrop.bind(this)
  }

  componentWillReceiveProps (nextProps) {
    if (!Array.isArray(nextProps.value) || nextProps.value.length < this.keys.length) {
        // We got undefined or fewer values than previously, need to shorten the keys array
        this.keys.splice(safeGet(() => nextProps.value.length, 0))
        return
    }

    // New array is larger so need to add som keys
    for (var i = this.keys.length; i < nextProps.value.length; i++) {
        this.keys.push(this.keysNext)
        this.keysNext++
    }
  }

  didUpdate (propName, data) {
    const value = this.props.value
    value[propName] = data
    this.props.onChange(this.props.propName, value)
  }

  doAddRow (e) {
    e.preventDefault()
    const value = this.props.value || []
    value.push(undefined)
    this.props.onChange(this.props.propName, value)
  }

  doDeleteRow (index) {
    const value = this.props.value
    const removedVal = value.splice(index, 1)
    const removedKey = this.keys.splice(index, 1)

    this.props.onChange(this.props.propName, value)
  }

  didDrop (sourceIndex, targetIndex) {
    const value = this.props.value

    const source = value.splice(sourceIndex, 1)[0]
    const sourceKey = this.keys.splice(sourceIndex, 1)[0]
    if (sourceIndex < targetIndex) {
        targetIndex--
    }
    value.splice(targetIndex, 0, source)
    this.keys.splice(targetIndex, 0, sourceKey)

    this.props.onChange(this.props.propName, value)
  }

  render() {
    const field = this.props.adapter.context
    const emptyArray = this.props.value === undefined || this.props.value.length === 0
    return <div className="InfernoFormlib-ListField InfernoFormlib-DragContainer">
        {emptyArray && field.placeholder && <ListFieldRow key="placeholder"><Placeholder text={field.placeholder} /></ListFieldRow>}
        {renderRows(field, this.props.value, this.keys, this.props.validationError, this.didUpdate, this.doDeleteRow, this.didDrop)}
        <div className="InfernoFormlib-ListFieldActionBar">
            <input type="button" value="Lägg till" onClick={this.doAddRow} />
        </div>
    </div>
  }
}

createAdapter({
    implements: IInputFieldWidget,
    adapts: interfaces.IListField,
    Component: ListFieldWidget,
}).registerWith(globalRegistry)
