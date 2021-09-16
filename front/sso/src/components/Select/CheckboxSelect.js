import React from "react";
import { CheckboxSelect as Checkbox } from '@atlaskit/select';
import { Dropdown } from 'semantic-ui-react'

export default class CheckboxSelect extends React.PureComponent{


    render() {
        return(
            /*<Dropdown
                placeholder='actions'
                fluid
                multiple
                search
                selection
                options={
                    (this.props.allActions || []).map((item,key) =>
                        ({
                            key: key,
                            text:item,
                            value:item
                        }))
                }
                onChange={(e, {value}) => {
                    console.log(value)
                }}
            />*/
            <Checkbox
                className="checkbox-select"
                classNamePrefix="select"
                options={
                    (this.props.allActions || []).map((item) =>
                        ({
                            value: item,
                            label:item
                        }))
                }
                onChange={value => {
                    console.log(value)
                    this.props.setSelectedNewRoleActions(value)
                }}
                placeholder="actions"
            />
        )
    }
}
