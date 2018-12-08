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
            <div style={{textAlign: "center"}}>
                <canvas ref={(ref) => this.canvas = ref} width="512" height="384"
                        style={{
                            imageRendering: "pixelated",
                            margin: "auto",
                            display: "inline-block",
                        }}/>

                <p style={{color:"darkgray"}}>Arrow keys to move, space to throw</p>
            </div>
        );
    }
}

export default App;
