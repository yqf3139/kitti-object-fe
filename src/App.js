import React, { Component } from 'react';
import { Button, Tabs, Tab } from 'react-bootstrap';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import DropFileZone from './DropFileZone';
import ErrorIndicator from './ErrorIndicator';
import LoadingIndicator from './LoadingIndicator';
import { getList, getObjects, getBackendURL } from './api'

class App extends Component {

    constructor() {
        super();
        this.state = {
            processing: false,
            errors: [],
            imageDataUrl: null,
            imageObjects: null,
            training: [],
            testing: [],
        };

        this.onReadFiles = this.onReadFiles.bind(this);
        this.onTabSelect = this.onTabSelect.bind(this);
        this.onChange = this.onChange.bind(this);
    }

    onReadFiles(files) {
        const f = files[0];
        const errors = [];
        const that = this;
        let processing = false;
        if (f.type !== 'image/png') {
            errors.push(`${f.name} is not a valid png image`);
        } else {
            processing = true;
            const reader = new FileReader();
            reader.onload = (e) => {
                that.setState({
                    // imageDataUrl: e.target.result,
                    processing: false,
                });
            };
            reader.readAsDataURL(f);
        }
        this.setState({
            errors: errors,
            processing: processing,
        });
    }

    onTabSelect(name) {
        this.setState({ imageDataUrl: null, imageObjects: null });
        // load the gallery list
        const that = this;
        getList('car', name)
        .then((data) => {
            const obj = {};
            obj[name] = data;
            that.setState(obj);
        })
        .catch((error) => {
            const errors = [error.toString()];
            that.setState({ errors });
        });
    }

    onChange(event) {
        const { name, value } = event.target;
        console.log(name, value);

        if (value === '-') {
            this.setState({ imageDataUrl: null, imageObjects: null });
            return;
        }
        this.setState({ imageDataUrl: `${getBackendURL()}/gallery/car/${name}/${value}/img`});
        const that = this;
        getObjects('car', name, value)
        .then((data) => {
            that.setState({ imageObjects: data });
        })
        .catch((error) => {
            const errors = [error.toString()];
            that.setState({ errors });
        });
    }

    render() {
        const { processing, errors, imageDataUrl, imageObjects, training, testing } = this.state;
        return (
        <div className="App">
            <div className="App-header">
                <h2>KITTI Object Detection</h2>
                <p className="App-intro">
                To get started, upload a png image or choose a image from the gallery.
                </p>
            </div>
            <div className="container">
                <br/>
                <Tabs id="chooser-tabs" onSelect={this.onTabSelect} >
                    <Tab eventKey={'upload'} title="Upload Image">
                        {!processing && <DropFileZone onFilesDropped={this.onReadFiles} message={'Drop File Here'} />}
                        {processing && <LoadingIndicator/>}
                    </Tab>
                    <Tab eventKey={'training'} title="Training">
                        <form className="form-inline">
                            <div className="form-group">
                                <label>Image ID: </label>
                                <select className="form-control" name="training" onChange={this.onChange}>
                                    <option key={`opt-0`} value="-">-</option>)
                                    {
                                        training.map((item, idx) =>
                                            <option key={`opt-${idx+1}`} value={item}>{item}</option>)
                                    }
                                </select>
                            </div>
                        </form>
                    </Tab>
                    <Tab eventKey={'testing'} title="Testing">
                        <form className="form-inline">
                            <div className="form-group">
                                <label>Image ID: </label>
                                <select className="form-control" name="testing" onChange={this.onChange}>
                                    <option key={`opt-0`} value="-">-</option>)
                                    {
                                        testing.map((item, idx) =>
                                            <option key={`opt-${idx+1}`} value={item}>{item}</option>)
                                    }
                                </select>
                            </div>
                        </form>
                    </Tab>
                </Tabs>
                {errors.length > 0 && <ErrorIndicator errors={errors}/>}
                <br/>
            </div>
            <hr/>
            <div className="container">
                {
                    imageDataUrl !== null &&
                    <img className="center-block" src={imageDataUrl} width="100%" alt="preview" />
                }
                {
                    imageObjects !== null &&
                    <pre>{JSON.stringify(imageObjects, null, 2)}</pre>
                }
                <br/>
            </div>
        </div>
        );
    }
}

export default App;
