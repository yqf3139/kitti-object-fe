import React, { Component } from 'react';
import { Button, Tabs, Tab } from 'react-bootstrap';
import ReactBootstrapSlider from 'react-bootstrap-slider';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-bootstrap-slider/src/css/bootstrap-slider.min.css';
import DropFileZone from './DropFileZone';
import ErrorIndicator from './ErrorIndicator';
import LoadingIndicator from './LoadingIndicator';
import MyCanvas from './MyCanvas';
import { getList, getObjects, getBackendURL } from './api'

class App extends Component {

    constructor() {
        super();
        this.state = {
            processing: false,
            errors: [],
            image: null,
            imageObjects: null,
            training: [],
            testing: [],
            slider: 0,
        };

        this.onReadFiles = this.onReadFiles.bind(this);
        this.onTabSelect = this.onTabSelect.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onChangeSliderValue = this.onChangeSliderValue.bind(this);
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
                    processing: false,
                    imageObjects: [],
                });
                that.onChangeImageUrl(e.target.result);
            };
            reader.readAsDataURL(f);
        }
        this.setState({
            errors: errors,
            processing: processing,
        });
    }

    onTabSelect(name) {
        this.setState({ image: null, imageObjects: null });
        if (name === 'upload') {
            return;
        }
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

    onChangeImageUrl(url) {
        const that = this;
        const image = new window.Image();
        image.src = url;
        image.onload = () => {
            image.oriwidth = image.width;
            image.oriheight = image.oriheight;

            that.setState({
                image: image
            });
        }
    }

    onChange(event) {
        const { name, value } = event.target;
        console.log(name, value);

        if (value === '-') {
            this.setState({ image: null, imageObjects: null });
            return;
        }
        const image = new window.Image();
        image.src = 'http://konvajs.github.io/assets/yoda.jpg';
        const url = `${getBackendURL()}/gallery/car/${name}/${value}/img`;
        this.onChangeImageUrl(url);
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

    onChangeSliderValue(e) {
       this.setState({ slider: e.target.value });
    }

    render() {
        const { processing, errors, imageObjects, training, testing, image, slider } = this.state;
        if (image !== null){
            image.scale = 0.1;
        }
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
            {
                image !== null && imageObjects !== null &&
                <div className="container">
                    <label>Threshold: </label>
                    <ReactBootstrapSlider
                        value={slider}
                        change={this.onChangeSliderValue}
                        slideStop={this.onChangeSliderValue}
                        step={0.1}
                        max={1}
                        min={0}
                    />
                    <br/>
                    <MyCanvas image={image} objects={imageObjects.filter((item) => item.pred >= slider)}/>
                </div>
            }
        </div>
        );
    }
}

export default App;
