# 🛡️ Titan's Circuit

---

##  Game Setup

###  Hexagonal Grid

The board consists of three concentric hexagonal circuits:

- **Outer Circuit** (6 nodes)  
- **Middle Circuit** (6 nodes)  
- **Inner Circuit** (6 nodes)  

 *The edge weight increases as you reach the inner hexagons.*

---

###  Player Titans

- Each player has **four Titans** (Red and Blue) to place and move on the grid.

---

###  Timers

- **Overall Timer**: Limits the total game duration.  
- **Turn Timer**: Limits each player's time per turn.

---

##  Game Layout

---

##  Gameplay Phases

### 1. **Placement Phase**

- Players take turns placing their pieces on available nodes in the **outermost circuit** when starting the game.  
- Players can either:
  - Place their remaining titans on the unlocked circuit, **or**
  - Move the existing titans.  
- When the **unlocked circuit is fully filled**, the **inner circuit gets unlocked**.

---

### 2. **Movement Phase**

- Once all titans are placed, players take turns **moving one titan at a time** to an adjacent node along connected edges (Titans can only move along the edges).  
- A titan **surrounded by opponent titans** is **permanently removed from play**.

---

##  Scoring System

- Points are earned by **controlling edges**.  
- An edge is controlled when **both its connected nodes are occupied by the same player**.  
- Points equal to the **edge's weight** are added to the player's score.  
- If a piece moves away from a controlled edge, **points equal to that edge's weight are deducted**.

---

##  Winning Conditions

The game ends when:

- The **overall timer expires**, **or**
- The **innermost hexagon is fully occupied**

 The player with the **highest score** at the end of the game **wins**.

---

##  Game Modes

---

###  **Normal Mode**

- Create three concentric hexagonal circuits.  
- Join the vertices to create edges, and add weights as shown in the demo.  
- Implement titan placing logic along with movement logic (Titans move along the edges to adjacent vertices).  
- Implement edge score capturing logic as explained in the demo.

#### Features:

- Pause, resume, and reset features.  
- Mobile responsive design.  
- A turn-based time system:
  - Each player gets a specific amount of time.  
  - The timer must decrement during the respective player's turn.  
  - There should be a limited time for each move.

---

###  **Hacker Mode**

- Add **Undo** and **Redo** buttons.  
- Display the **history of moves** of both players.  
- Add **in-game sound effects**.  
- Add **smooth animations** for piece movements.  
- Implement **titan elimination**:
  - If a titan is surrounded by opponent titans on all neighboring sides, it is eliminated.  
- Implement a **local storage-based leaderboard**.

---

###  **Hacker++ Mode**

- Implement **Single-player mode**.  
- Implement **replay** using history.  
- Add **Power-Ups**:
  - E.g., swap your titan with an opponent's titan, add an extra titan.  
- Allow the user to **change the shape of the circuit**.  
- Allow users to **add more than three concentric circuits**.  
- Add a **Game Review** feature:
  - Analyzes each move and provides comments on the best possible action for a given situation, similar to Chess.com analysis.

---
