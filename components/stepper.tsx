import * as React from 'react';

export interface IStepperProps {

    currentStep: number;
}

export interface IStepperState {
}

export default class Stepper extends React.Component<IStepperProps, IStepperState> {
    constructor(props: IStepperProps) {
        super(props);

        this.state = {
        }
    }

    public render() {
        return (
            <>
                <div className="stepper">
                    <div className={`step ${this.props.currentStep >= 1 ? "active" : ""}`}>
                        <div className="circle"></div>
                    </div>
                    <div className={`step ${this.props.currentStep >= 2 || this.props.currentStep === 3 ? "active" : ""}`}>
                        <div className="line"></div>
                        <div className="circle"></div>
                    </div>
                    <div className={`step ${this.props.currentStep === 3 ? "active" : ""}`}>
                        <div className="line"></div>
                        <div className="circle"></div>
                    </div>
                </div>
            </>
        );
        



    }
}
