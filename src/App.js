import React, {Component} from 'react';
import Game from "./Game";

class App extends Component {

    canvas;
    game;

    constructor(props) {
        super(props);
    }


    componentDidMount() {
        this.game = new Game(this.canvas);
    }


    render() {
        return (
            <div className="App">
                <canvas ref={(ref) => this.canvas = ref} width="512" height="384"
                        style={{
                            imageRendering: "pixelated",
                            padding: 0,
                            margin: "auto",
                            display: "block",
                            position: "absolute",
                            border:"1px solid black",
                            top: 0,
                            bottom: 0,
                            left: 0,
                            right: 0
                        }}/>
            </div>
        );
    }
}

export default App;
