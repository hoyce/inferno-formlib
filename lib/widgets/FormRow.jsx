'use strict'
/*

    To use this input widget adapter you need to register it with your
    adapter registry.

*/
import Inferno from 'inferno'
import Component from 'inferno-component'
import { createAdapter, globalRegistry } from 'component-registry'

import { interfaces, i18n } from 'isomorphic-schema'
import { IFormRowWidget }  from '../interfaces'

import { animateOnAdd, animateOnRemove } from 'inferno-animation'

import classNames from 'classnames'
import { renderString } from './common'


function Label (props) {
    return <label className="InfernoFormlib-RowFieldLabel">{renderString(props.text, props.options && props.options.lang)}</label>
}

function HelpMsg (props) {
    const outp = []
    if (props.text) outp.push(renderString(props.text, props.options && props.options.lang))
    if (props.required) outp.push(renderString(i18n('InfernoFormlib-i18n-required', '(required)'), props.options && props.options.lang, '(required)'))

    return <div className="InfernoFormlib-RowFieldHelpMsg" for={props.id}>{outp.join(' ')}</div>
}

class ErrorMsg extends Component {

    componentDidMount () {
        animateOnAdd(this, 'InfernoFormlib-ErrorMsg--Animation')
    }

    componentWillUnmount () {
        animateOnRemove(this, 'InfernoFormlib-ErrorMsg--Animation')
    }

    render () {
        return <div className="InfernoFormlib-RowFieldErrorMsg">{renderString(this.props.message, this.props.options && this.props.options.lang)}</div>
    }
}

/*
    PROPS:
    - animation: animation css class prefix
    - submitted: bool, has been submitted
    - field:  isomorphic-schema field validator object
    - errors: isomorphic-schema field and server error object { fieldErrors, serverErrors } or undefined if no errors
    - id:     unique id of field
*/
class Row extends Component {
    // TODO: Add animation support

    // support required
    componentDidMount () {
        if (this.props.formIsMounted) {
            animateOnAdd(this, 'InfernoFormlib-Row--Animation')
        }
    }

    componentWillUnmount () {
        animateOnRemove(this, 'InfernoFormlib-Row--Animation')
    }

    render () {
        const field = this.props.adapter.context

        var cls = {
            'InfernoFormlib-Row': true,
            'InfernoFormlib-Row--hasError': this.props.validationError !== undefined
        }

        return <div id={this.props.namespace.join('.') + '__Row'} className={classNames(cls)}>
            {field.label && <Label text={field.label} id={this.props.id} />}
            <div className="InfernoFormlib-RowFieldContainer">
                {this.props.children}
            </div>
            {this.props.validationError ? <ErrorMsg message={this.props.validationError.message} submitted={this.props.submitted} /> : null}
            {field.help && <HelpMsg text={field.help} required={field._isRequired} />}
        </div>
    }
}

createAdapter({
    implements: IFormRowWidget,
    adapts: interfaces.IBaseField,
    
    Component: Row
}).registerWith(globalRegistry)


class ObjectRow extends Component {
    // TODO: Add animation support

    // support required
    componentDidMount () {
        if (this.props.formIsMounted) {
            animateOnAdd(this, 'InfernoFormlib-Row--Animation')
        }
    }

    componentWillUnmount () {
        animateOnRemove(this, 'InfernoFormlib-Row--Animation')
    }

    render () {
        const field = this.props.adapter.context

        var cls = {
            'InfernoFormlib-Row': true,
            'InfernoFormlib-ObjectRow': true,
            'InfernoFormlib-Row--hasError': this.props.validationError !== undefined
        }

        return <div className={classNames(cls)}>
            <Label text={field.label} id={this.props.id} />
            {(this.props.validationError ? <ErrorMsg message={this.props.validationError.message} submitted={this.props.submitted} /> : null)}
            {(field.helpMsg ? <HelpMsg text={field.helpMsg} required={field._isRequired} /> : null)}
            <div className="InfernoFormlib-RowFieldContainer">
                {this.props.children}
            </div>
        </div>
    }
}

createAdapter({
    implements: IFormRowWidget,
    adapts: interfaces.IObjectField,
    
    Component: ObjectRow
}).registerWith(globalRegistry)


class CheckboxRow extends Component {
    // TODO: Add animation support

    // support required
    componentDidMount () {
        if (this.props.formIsMounted) {
            animateOnAdd(this, 'InfernoFormlib-Row--Animation')
        }
    }

    componentWillUnmount () {
        animateOnRemove(this, 'InfernoFormlib-Row--Animation')
    }

    render () {
        const field = this.props.adapter.context

        var cls = {
            'InfernoFormlib-Row': true,
            'InfernoFormlib-BoolRow': true,
            'InfernoFormlib-Row--hasError': this.props.validationError !== undefined
        }

        return <div className={classNames(cls)}>
            <div className="InfernoFormlib-RowFieldContainer">
                <Label text={field.label} id={this.props.id} />
                {this.props.children}
            </div>
            {this.props.validationError ? <ErrorMsg message={this.props.validationError.message} submitted={this.props.submitted} /> : null}
            {field.helpMsg && <HelpMsg text={field.helpMsg} required={field._isRequired} />}
        </div>
    }
}

createAdapter({
    implements: IFormRowWidget,
    adapts: interfaces.IBoolField,
    
    Component: CheckboxRow
}).registerWith(globalRegistry)

export { CheckboxRow, ObjectRow, Row }
