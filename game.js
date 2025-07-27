document.getElementById("start-button").addEventListener("click", () => {
    document.getElementById("game-screen").style.display = "flex";
    const circuitNum = parseInt(document.getElementById("num-circuits").value);
    const vertices = parseInt(document.getElementById("num-vertices").value);
    const gameTimeMinutes = parseInt(document.getElementById("game-time").value);
    const moveTimeSeconds = parseInt(document.getElementById("move-time").value);

    document.getElementById("start-screen").style.display = "none";
    document.getElementById("game-screen").style.display = "flex";

    const bgm = document.getElementById("bgm");
    document.addEventListener("click", () => {
        bgm.volume = 0.5;
        bgm.play();
    }, { once: true });
    
    const board = document.getElementById("board");

    const nodes = [];
    const edges = [];

    let titans = {"red" : 4, "green" : 4};
    let player = "green";
    let circuit = {};
    let playerTime = {green : gameTimeMinutes*60, red : gameTimeMinutes*60};
    let gameTime = null;
    let moveTime = null;
    let score = {"green": 0, "red": 0};
    let pause = false;
    gameTimer();
    moveTimer();

    function adjustBoard(circuitNum) {
        const minSize = Math.min(window.innerWidth, window.innerHeight);

        const baseSize = 0.6 * minSize;
        const scaleFactor = 0.1 * minSize;

        const newSize = baseSize + (circuitNum - 1) * scaleFactor;

        board.style.width = `${newSize}px`;
        board.style.height = `${newSize}px`;

        return newSize;
    }

    const boardSize = adjustBoard(circuitNum);
    const center_x = boardSize / 2;
    const center_y = boardSize / 2;

    const maxRadius = boardSize * 0.4;
    const radii = [];
    for (let r = circuitNum; r >= 1; r--) {
        const radius = (r / circuitNum) * maxRadius;
        radii.push(radius);
        if (r == 1) circuit[r] = "open";
        else circuit[r] = "closed";
    }

    const gameStates = [];

    let count = 1;
    let alpha = "A";
    radii.forEach((radius, index) => {
        for (let i = 0; i < vertices; i++) {
            const angle = (Math.PI*2 / vertices) * i; 
            const x = center_x + radius * Math.cos(angle);
            const y = center_y + radius * Math.sin(angle);

            const node = document.createElement("button");
            node.classList.add("node");
            node.style.left = `${x - 10}px`;
            node.style.top = `${y - 10}px`;
            board.appendChild(node);

            nodes.push({
                name: `${alpha}${i + 1}`,
                id: count,
                x, y,
                element: node,
                control: null,
                circuit: index + 1,
            });
            count ++;
        }
        alpha = String.fromCharCode(alpha.charCodeAt(0) + 1);
    });

    for (let j = 0; j < circuitNum; j++) {
        const k = j * vertices;
        for (let i = 0; i < vertices; i++) {
            const node1 = nodes[k + i];
            const node2 = nodes[k + (i + 1)%vertices];
            drawEdge(node1, node2);
        }
    }

    for (let i = 0; i < circuitNum - 1; i++) {
        const a = i * vertices;
        const b = (i + 1) * vertices;
        const j = (i % 2 == 0) ? 0 : 1;
        for (let i = j; i < vertices; i += 2) {
            const outer = nodes[a + i];
            const inner = nodes[b + i];
            drawEdge(outer, inner);
        }
    }
    
    function drawEdge(node1, node2) {
        const dx = node2.x - node1.x;
        const dy = node2.y - node1.y;
        const length = Math.sqrt(dx*dx + dy*dy);
        const angle = Math.atan2(dy,dx) * (180/Math.PI);

        const edge = document.createElement("div");
        edge.classList.add("edge");
        edge.style.width = `${length}px`;
        edge.style.left = `${node1.x}px`;
        edge.style.top = `${node1.y}px`;
        edge.style.transform = `rotate(${angle}deg)`;
        board.appendChild(edge);

        let weight;
        let circuit = Math.max(node1.circuit, node2.circuit);
        let min = 1 + (circuit - 1) * 3;
        let max = min + 3;
        weight = Math.floor(Math.random() * (max - min)) + min;

        const label = document.createElement("div");
        label.classList.add("label");
        label.innerText = weight;
        label.style.left = `${(node1.x + node2.x )/ 2}px`;
        label.style.top = `${(node1.y + node2.y )/ 2}px`;
        label.style.transform = `translate(-50%, -50%) rotate(${angle}deg) translateY(-14px) rotate(${-angle}deg)`;
        board.appendChild(label);

        edges.push({
            nodes: [node1, node2],
            element: edge,
            label: label,
            weight: weight,
            control: null,
        })  
    }

    function gameTimer() {
        if (gameTime) clearInterval(gameTime)
        gameTime = setInterval(() => {
            if (pause == false){
                playerTime[player]--;
                document.getElementById(`${player}-time`).textContent = formatTime(playerTime[player]);
            }
            if (playerTime[player] == 0){
                clearInterval(gameTime);
                showGameOver();
                console.log(`${player} lost on time!`)
            }
        }, 1000);
    }

    function moveTimer() {
        let time = moveTimeSeconds;
        let notplayer = player == "red" ? "green" : "red";
        if (moveTime) clearInterval(moveTime)
        moveTime = setInterval(() => {
            if (pause == false){
                time--;
                document.getElementById(`${player}-move-timer`).textContent = time;
                document.getElementById(`${notplayer}-move-timer`).textContent = " ";

            }
            if (time == 0){
                clearInterval(moveTime);
                showGameOver();
                console.log(`${player} lost on time!`)
            }
        },1000);
    }

    function formatTime(seconds) {
        const mins = Math.floor(seconds/60);
        const secs = seconds %60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    function switchPlayer() {
        if (player == "red") {
            player = "green";
            document.getElementById("current-player").textContent = "Green";
            document.getElementById("current-player").style.backgroundColor = "#4CAF50";
        }
        else{
            player = "red";
            document.getElementById("current-player").textContent = "Red";
            document.getElementById("current-player").style.backgroundColor = "#f44336";
        }
        gameTimer();
        moveTimer();
    }

    function checkCircuitState() {
        for (i = 2; i <= circuitNum; i++){
            if (circuit[i] == "closed"){
                let circuit_count = 0;
                nodes.forEach((node) => {
                    if (node.circuit == i-1 && node.control != null) circuit_count ++;
                });
                if (circuit_count == vertices) circuit[i] = "open";
            }
        }  
    }

    adjacentNodes = {};
    nodes.forEach((node) => {
        adjacentNodes[node.id] = [];
    })
    edges.forEach((edge) =>{
        const node1 = edge.nodes[0];
        const node2 = edge.nodes[1];

        adjacentNodes[node1.id].push(node2);
        adjacentNodes[node2.id].push(node1);
    });
    //console.log(adjacentNodes);

    function checkValidMovement(node1, node2){
        flag = 0;
        adjacentNodes[node1.id].forEach((node) => {
            if (node.id == node2.id){
                flag = 1;
            }
        })
        if (flag == 1) return true
        else return false
    }

    function checkAdjacency(selected_node) {
        flag = 0
        adjacentNodes[selected_node.id].forEach((node) => {
            if (circuit[node.circuit] == "closed" || node.control != null ) flag += 1
        })
        if (flag == adjacentNodes[selected_node.id].length) return false
        else return true
    }
    
    function checkEdgeControl() {
        score = {"green": 0, "red": 0};
        edges.forEach((edge) => {       
            if (edge.nodes[0].control != null && 
                edge.nodes[1].control != null &&
                edge.nodes[0].control == edge.nodes[1].control){
                edge.control = edge.nodes[0].control;
                edge.element.style.backgroundColor = edge.nodes[0].control;
                edge.label.style.color = edge.nodes[1].control;
                score[edge.nodes[0].control] += edge.weight;
                document.getElementById("green-score").textContent = score["green"];
                document.getElementById("red-score").textContent = score["red"];
            }
            else {
                edge.control = null;
                edge.element.style.backgroundColor = "lightgray";
                edge.label.style.color = "white";
            }
        });
    }

    function checkTitanElimination(node) {
        const opponent = player == "red" ? "green" : "red";
        adjacentNodes[node.id].forEach((Node) => {
            if (Node.control == opponent){
                count = 0;
                adjacentNodes[Node.id].forEach((NODE) => {
                    if (NODE.control == player) count += 1;
                if (count == adjacentNodes[Node.id].length){
                    Node.control = null;
                    Node.element.style.backgroundColor = "white";                  
                }
                });
            }
        });
    }

    const placementSound = document.getElementById("placement");
    function playPlacementSound() {
        placementSound.currentTime = 0;
        placementSound.play().catch(error => {
            console.log("Audio play error:", error);
        });
    }

    const movementSound = document.getElementById("movement");
    function playMovementSound() {
        movementSound.currentTime = 0;
        movementSound.play().catch(error => {
            console.log("Audio play error:", error);
        });
    }

    const gameoverSound = document.getElementById("gameover");
    function playGameover() {
        gameoverSound.currentTime = 0;
        gameoverSound.play().catch(error => {
            console.log("Audio play error:", error);
        });
    }
    
    let selected_node = null;
    let stateIndex = 0;
    gameStates.push(
        {
            board: nodes.map(n => ({ name: n.name, control: n.control })),
            player: player,
            score: score,
            titans: {...titans},
            circuit: {...circuit},
            playerTime: {...playerTime},
            edges: edges.map(e => ({ control: e.control })),
            move: null,
        }
    );
    animating = false;
    nodes.forEach((node) => {
        node.element.addEventListener("click", () => {
            checkCircuitState();
            if (circuit[node.circuit] == "open" && animating == false){
                if (node.control == null && selected_node == null && titans[player] != 0){
                    playPlacementSound();

                    node.element.style.backgroundColor = player;
                    node.control = player;
                    titans[player] --;

                    checkTitanElimination(node);
                    checkEdgeControl();

                    if (stateIndex < gameStates.length - 1) gameStates.splice(stateIndex + 1);
                    let gameState = {
                        board: nodes.map(n => ({ name: n.name, control: n.control })),
                        player: player,
                        score: score,
                        titans: {...titans},
                        circuit: {...circuit},
                        playerTime: {...playerTime},
                        edges: edges.map(e => ({ control: e.control })),
                        move: { from : null, to : node.name},
                    }
                    gameStates.push(gameState);
                    stateIndex ++;

                    let Move = document.createElement("li");
                    Move.textContent = `@${gameState.move.to}`;
                    document.getElementById(`${player}-moves`).appendChild(Move);

                    switchPlayer();
                    checkGameOver();
                    //console.log(gameStates);
                }
                else if (node.control == player && checkAdjacency(node) == true){
                    selected_node = node;

                }
                else if (node.control == null && selected_node != null && checkValidMovement(selected_node, node) == true){
                    animating = true;
                    playMovementSound();
                    animateTitanMove(selected_node, node, player);

                    selected_node.element.style.backgroundColor = "white";
                    selected_node.control = null;

                    setTimeout(() => {
                        node.element.style.backgroundColor = player;
                        node.control = player;
                        checkTitanElimination(node);
                        checkEdgeControl();
                        
                        if (stateIndex < gameStates.length - 1) gameStates.splice(stateIndex + 1);            
                        let gameState = {
                        board: nodes.map(n => ({ name: n.name, control: n.control })),
                        player: player,
                        score: score,
                        titans: {...titans},
                        circuit: {...circuit},
                        playerTime: {...playerTime},
                        edges: edges.map(e => ({ control: e.control })),
                        move: {from: selected_node.name, to: node.name},
                        }
                        gameStates.push(gameState);
                        stateIndex ++;

                        selected_node = null;

                        let Move = document.createElement("li");
                        Move.textContent = `${gameState.move.from} → ${gameState.move.to}`;
                        document.getElementById(`${player}-moves`).appendChild(Move);

                        switchPlayer();
                        animating = false;
                        checkGameOver();
                    }, 2000);
                    //console.log(gameStates);
                }
            }
        });
    });

    function animateTitanMove(fromNode, toNode, playerColor) {
        const titan = document.createElement("div");
        titan.classList.add("moving-titan");
        titan.style.color = playerColor;

        titan.style.left = `${fromNode.x - 10}px`;
        titan.style.top = `${fromNode.y - 10}px`;
        board.appendChild(titan);

        requestAnimationFrame(() => {
            titan.style.transition = "left 2s ease, top 2s ease";
            titan.style.left = `${toNode.x - 10}px`;
            titan.style.top = `${toNode.y - 10}px`;
        });


        setTimeout(() => {
            board.removeChild(titan);
        }, 2000);
    }

    let replayFlag = false;
    let replayIndex = 0;
    document.getElementById("replay").addEventListener("click", () => {
        document.getElementById("replay-screen-features").style.display = "flex";
        document.getElementById("game-over-popup").style.display = "none";
        document.getElementById("controls").style.display = "none";
        document.getElementById("green-move-timer").style.display = "none";
        document.getElementById("red-move-timer").style.display = "none";
        document.getElementById("green-score").textContent = 0;
        document.getElementById("red-score").textContent = 0;
        document.getElementById("player-info-heading").textContent = "Move made by: "

        // (Optional) Hide game timers, buttons etc.
        // Start at first frame
        replayFlag = true;
        renderGameState(gameStates[replayIndex]);
    });

    document.getElementById("backward").addEventListener("click", () => {
        if (replayFlag == true && replayIndex > 0){
            replayIndex--;
            renderGameState(gameStates[replayIndex]);
        }
    });
    
    document.getElementById("forward").addEventListener("click", () => {
        if (replayFlag == true && replayIndex < gameStates.length - 1){
            replayIndex++;
            renderGameState(gameStates[replayIndex]);
        }
    });

    document.addEventListener("keydown", (e) => {
        if (replayFlag == true){
            if (e.key == "ArrowRight" && replayIndex < gameStates.length - 1) {
                replayIndex++;
                renderGameState(gameStates[replayIndex]);
            }
        }
    });

    document.addEventListener("keydown",(e) => {
        if (replayFlag == true){
            if (e.key == "ArrowLeft" && replayIndex > 0)
                replayIndex--;
            renderGameState(gameStates[replayIndex]);
        }
    });
    
    resetFlag = false;
    document.getElementById("reset-button").addEventListener("click", () => {
        resetFlag = true;
        stateIndex = 0;
        renderGameState(gameStates[0]);
        gameStates.splice(1);

        //console.log(gameStates)
    });

    document.getElementById("undo-button").addEventListener("click", () => {
        if (stateIndex > 0) {
            stateIndex--;
            renderGameState(gameStates[stateIndex]);

            if (stateIndex != 0) switchPlayer();
            else {
                player = gameStates[0].player; 
                document.getElementById("current-player").textContent = player.charAt(0).toUpperCase() + player.slice(1);
                if (player == "green") document.getElementById("current-player").style.backgroundColor = "#4CAF50";
                else document.getElementById("current-player").style.backgroundColor = "#f44336";
            }
            //console.log(gameStates);
        }
    });

    document.getElementById("redo-button").addEventListener("click", () => {
        if (stateIndex < gameStates.length - 1) {
            stateIndex++;
            renderGameState(gameStates[stateIndex]);
            
            if (stateIndex != 0) switchPlayer();
            else {
                player = gameStates[0].player;
                document.getElementById("current-player").textContent = player.charAt(0).toUpperCase() + player.slice(1);
                if (player == "green") document.getElementById("current-player").style.backgroundColor = "#4CAF50";
                else document.getElementById("current-player").style.backgroundColor = "#f44336";
            }
            //console.log(gameStates);
        }
    });

    function renderGameState(state) {

        if (replayFlag == true){
            state.board.forEach(nodeState => {
                const node = nodes.find(n => n.name == nodeState.name);
                node.control = nodeState.control;
                node.element.style.backgroundColor = nodeState.control || 'white';
            });

            state.edges.forEach((edgeState, i) => {
                edges[i].control = edgeState.control;

                if (edgeState.control) {
                    edges[i].element.style.backgroundColor = edgeState.control;
                    edges[i].label.style.color = edgeState.control;
                } else {
                    edges[i].element.style.backgroundColor = "lightgray";
                    edges[i].label.style.color = "white";
                }
            });

            player = state.player;
            score = {...state.score};
            titans = { ...state.titans };
            circuit = { ...state.circuit };
            playerTime = { ...state.playerTime };

            document.getElementById("green-time").textContent = formatTime(playerTime["green"]);
            document.getElementById("red-time").textContent = formatTime(playerTime["red"]);

            document.getElementById("green-score").textContent = score["green"];
            document.getElementById("red-score").textContent = score["red"];

            document.getElementById("current-player").textContent = player.charAt(0).toUpperCase() + player.slice(1);
            if (player == "green") document.getElementById("current-player").style.backgroundColor = "#4CAF50";
            else document.getElementById("current-player").style.backgroundColor = "#f44336";
        }

        else if (resetFlag == true) {
            state.board.forEach(nodeState => {
                const node = nodes.find(n => n.name == nodeState.name);
                node.control = nodeState.control;
                node.element.style.backgroundColor = nodeState.control || 'white';
            });

            state.edges.forEach((edgeState, i) => {
                edges[i].control = edgeState.control;

                if (edgeState.control) {
                    edges[i].element.style.backgroundColor = edgeState.control;
                    edges[i].label.style.color = edgeState.control;
                } else {
                    edges[i].element.style.backgroundColor = "lightgray";
                    edges[i].label.style.color = "white";
                }
            });

            const redList = document.getElementById("red-moves");
            const greenList = document.getElementById("green-moves");

            redList.innerHTML = "";
            greenList.innerHTML = "";

            player = state.player;
            score = {...state.score};
            titans = { ...state.titans };
            circuit = { ...state.circuit };
            playerTime = { ...state.playerTime };

            document.getElementById("green-score").textContent = score["green"];
            document.getElementById("red-score").textContent = score["red"];
            document.getElementById("green-time").textContent = formatTime(playerTime["green"]);
            document.getElementById("red-time").textContent = formatTime(playerTime["red"]);
            document.getElementById("current-player").textContent = player.charAt(0).toUpperCase() + player.slice(1);;
            if (player == "green") document.getElementById("current-player").style.backgroundColor = "#4CAF50";
            else document.getElementById("current-player").style.backgroundColor = "#f44336";
            gameTimer();
            moveTimer();
            resetFlag = false;
        }

        else {
            state.board.forEach(nodeState => {
                const node = nodes.find(n => n.name == nodeState.name);
                node.control = nodeState.control;
                node.element.style.backgroundColor = nodeState.control || 'white';
            });

            state.edges.forEach((edgeState, i) => {
                edges[i].control = edgeState.control;

                if (edgeState.control) {
                    edges[i].element.style.backgroundColor = edgeState.control;
                    edges[i].label.style.color = edgeState.control;
                } else {
                    edges[i].element.style.backgroundColor = "lightgray";
                    edges[i].label.style.color = "white";
                }
            });

            const redList = document.getElementById("red-moves");
            const greenList = document.getElementById("green-moves");

            redList.innerHTML = "";
            greenList.innerHTML = "";

            let current = gameStates[0].player; 
            for (let i = 1; i <= stateIndex; i++) {
                const move = gameStates[i].move;
                const moveItem = document.createElement("li");

                if (move.from == null) moveItem.textContent = `@${move.to}`;
                else moveItem.textContent = `${move.from} → ${move.to}`;

                document.getElementById(`${current}-moves`).appendChild(moveItem);
                current = current == "red" ? "green" : "red";
            }

            player = state.player;
            score = {...state.score};
            titans = { ...state.titans };
            circuit = { ...state.circuit };
            playerTime = { ...state.playerTime };

            document.getElementById("green-score").textContent = score["green"];
            document.getElementById("red-score").textContent = score["red"];
            document.getElementById("green-time").textContent = formatTime(playerTime["green"]);
            document.getElementById("red-time").textContent = formatTime(playerTime["red"]);
            document.getElementById("current-player").textContent = player.charAt(0).toUpperCase() + player.slice(1);;
            if (player == "green") document.getElementById("current-player").style.backgroundColor = "#4CAF50";
            else document.getElementById("current-player").style.backgroundColor = "#f44336";
            gameTimer();
            moveTimer();
        }
    }

    document.getElementById("pause-button").addEventListener("click", () => {
        if (pause == false){
            document.getElementById("bgm").pause();
            document.getElementById('green-score-resume').innerText = score["green"];
            document.getElementById('red-score-resume').innerText = score["red"];
            document.getElementById('resume-popup').style.display = 'flex';
            pause = true;    
        }
    });
    document.getElementById("resume-button").addEventListener("click", () => {
        if (pause == true){
            document.getElementById('resume-popup').style.display = 'none';
            document.getElementById("bgm").play();
            pause = false;
        }
    });

    function checkGameOver(){
        count = 0
        nodes.forEach((node) => {
            if (node.circuit == circuitNum && node.control != null) count += 1;
        })
        if (count == vertices) {
            //console.log("Game Over!");
            document.getElementById("bgm").pause();
            playGameover();
            text = `Green: ${score["green"]} \n Red: ${score["red"]}\n`;
            if (score["green"] > score["red"]) text += "Green wins!";
            else if (score["red"] > score["green"]) text += "Red wins!";
            else text = "Draw !";
            document.getElementById("winner-text").textContent = text;
            document.getElementById("game-over-popup").style.display = "flex";
            clearInterval(gameTime);
            clearInterval(moveTime);
        }
    }

    function showGameOver() {
        document.getElementById("bgm").pause();
        playGameover();
        const opponent = player == "red" ? "green" : "red";
        const text = `Time's up! ${opponent.toUpperCase()} wins!`;
        document.getElementById("winner-text").textContent = text;
        document.getElementById("game-over-popup").style.display = "flex";
        clearInterval(gameTime);
        clearInterval(moveTime);        
    }

});
