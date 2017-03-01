import React, {Component} from "react"
import classNames from "classnames"

export default class Popup extends Component {
    constructor(props) {
        super(props);
        this.state = {show: false};
        this.handleKeyUpBinded = this.handleKeyUp.bind(this);
    }

    componentDidMount() {
        setTimeout(()=>{
            this.setState({show: true});
            this.overlay.focus();
        },0);

        //for use native pereventdefault and native event system
        this.overlay.addEventListener('keyup', this.handleKeyUpBinded);
    }

    componentWillUnmount() {
        this.overlay.removeEventListener('keyup', this.handleKeyUpBinded);
        this.setState({show: false})
    }

    handleKeyUp(event) {
        switch (event.keyCode) {
            case 27: //is escape
                event.stopPropagation();
                this.props.onClose && this.props.onClose();
                break;
        }
    }

    render() {
        const contentClasses = "r_modal-content " + (this.props.contentClass?this.props.contentClass:"");
        return (
            <div className={classNames({"r_modal-overlay": true, "r_visible": this.state.show})}
                 tabIndex="0"
            ref={(overlay) => this.overlay = overlay}>
                <div className={contentClasses}>
                    {this.props.children}
                </div>
            </div>

        )
    }
}