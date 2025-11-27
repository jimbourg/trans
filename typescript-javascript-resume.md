# 📚 RÉSUMÉ TYPESCRIPT/JAVASCRIPT POUR FT_TRANSCENDENCE

Guide essentiel pour développeur C/C++ débutant en web.

---

## **TABLE DES MATIÈRES**

1. [Variables et Types](#1-variables-et-types)
2. [Fonctions](#2-fonctions)
3. [Async/Await](#3-asyncawait)
4. [Imports/Exports](#4-importsexports)
5. [Classes](#5-classes)
6. [Interfaces](#6-interfaces)
7. [Structures de données](#7-structures-de-données)
8. [Destructuring](#8-destructuring)
9. [Opérateurs spéciaux](#9-opérateurs-spéciaux)
10. [Spécifique au projet](#10-spécifique-à-ton-projet)
11. [JSON](#11-json)
12. [Gestion d'erreurs](#12-gestion-derreurs)
13. [Checklist essentielle](#13-checklist-essentielle)
14. [Code template Pong](#14-code-template-pour-ton-pong)
15. [Résumé ultra-compact](#15-résumé-ultra-compact)

---

## **1. VARIABLES ET TYPES**

### **Déclaration de variables**

```typescript
// ❌ var (ancien, ne pas utiliser)
var x = 10;

// ✅ const (immuable - comme const en C++)
const PORT = 3000;
const config = { host: 'localhost' };

// ✅ let (mutable - comme une variable normale en C)
let score = 0;
let isPlaying = true;
```

**Règle d'or :**
- `const` par défaut (95% du temps)
- `let` seulement si tu dois réassigner

**Analogie C/C++ :**
```c
const int PORT = 3000;        // const
int score = 0;                 // let
```

---

### **Types TypeScript essentiels**

```typescript
// Types primitifs
let name: string = "John";
let age: number = 25;           // int, float, double = tous "number"
let isActive: boolean = true;
let data: any = "anything";     // ⚠️ Éviter si possible

// Arrays
let numbers: number[] = [1, 2, 3, 4];
let users: string[] = ["Alice", "Bob"];

// Objets
let user: { id: number; name: string } = {
    id: 1,
    name: "John"
};

// Type personnalisé (interface)
interface User {
    id: number;
    name: string;
    email?: string;  // ? = optionnel
}

const user: User = {
    id: 1,
    name: "John"
    // email est optionnel
};
```

**Analogie C/C++ :**
```c
// C/C++
typedef struct {
    int id;
    char name[256];
    char* email;  // Optionnel (peut être NULL)
} User;
```

---

## **2. FONCTIONS**

### **Déclaration de fonctions**

```typescript
// Fonction classique
function add(a: number, b: number): number {
    return a + b;
}

// Arrow function (syntaxe moderne)
const add = (a: number, b: number): number => {
    return a + b;
};

// Arrow function courte (return implicite)
const add = (a: number, b: number): number => a + b;

// Fonction async
async function fetchUser(id: number): Promise<User> {
    const user = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    return user;
}
```

**Pour ton projet, utilise principalement les arrow functions.**

**Analogie C/C++ :**
```c
// C
int add(int a, int b) {
    return a + b;
}

// C++ lambda
auto add = [](int a, int b) -> int {
    return a + b;
};
```

---

## **3. ASYNC/AWAIT**

### **Pattern de base**

```typescript
// Fonction async retourne toujours une Promise
async function fetchData() {
    try {
        // await attend qu'une opération async se termine
        const data = await db.query('SELECT * FROM users');
        const result = await processData(data);
        return result;
    } catch (error) {
        console.error('Erreur:', error);
        throw error;
    }
}

// Utilisation
const data = await fetchData();
```

**Règles importantes :**
1. `await` fonctionne SEULEMENT dans une fonction `async`
2. Toujours utiliser `try/catch` avec `await`
3. `await` ne bloque pas le thread (contrairement au C)

---

## **4. IMPORTS/EXPORTS**

### **Exporter**

```typescript
// fichier: PongGame.ts

// Export nommé
export class PongGame {
    // ...
}

export interface Ball {
    x: number;
    y: number;
}

export const CANVAS_WIDTH = 800;

// Export par défaut (un seul par fichier)
export default class GameManager {
    // ...
}
```

### **Importer**

```typescript
// fichier: index.ts

// Import nommé
import { PongGame, Ball, CANVAS_WIDTH } from './PongGame.js';

// Import par défaut
import GameManager from './GameManager.js';

// Import tout
import * as Game from './PongGame.js';

// ⚠️ IMPORTANT : Extension .js même pour fichiers .ts !
```

**Analogie C/C++ :**
```c
// C/C++
#include "PongGame.h"

// TypeScript équivalent
import { PongGame } from './PongGame.js';
```

---

## **5. CLASSES**

```typescript
class PongGame {
    // Propriétés
    private ball: Ball;
    private paddles: Paddle[];
    public score: number[];
    
    // Constructeur
    constructor(player1: string, player2: string) {
        this.ball = { x: 400, y: 300, vx: 5, vy: 3 };
        this.paddles = [
            { x: 20, y: 250, height: 100 },
            { x: 760, y: 250, height: 100 }
        ];
        this.score = [0, 0];
    }
    
    // Méthodes
    update(deltaTime: number): void {
        this.updateBall(deltaTime);
        this.checkCollisions();
    }
    
    private updateBall(dt: number): void {
        this.ball.x += this.ball.vx * dt;
        this.ball.y += this.ball.vy * dt;
    }
    
    getState(): GameState {
        return {
            ball: this.ball,
            paddles: this.paddles,
            score: this.score
        };
    }
}

// Utilisation
const game = new PongGame('Alice', 'Bob');
game.update(16.67);  // 1 frame à 60 FPS
const state = game.getState();
```

**Analogie C/C++ :**
```cpp
// C++
class PongGame {
private:
    Ball ball;
    Paddle paddles[2];
    
public:
    PongGame(const char* p1, const char* p2) {
        // Constructeur
    }
    
    void update(float deltaTime) {
        // ...
    }
};
```

---

## **6. INTERFACES**

```typescript
// Interface = struct en C
interface Ball {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
}

interface Paddle {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface GameState {
    ball: Ball;
    paddles: Paddle[];
    score: number[];
    timestamp: number;
}

// Utilisation
const createBall = (): Ball => {
    return {
        x: 400,
        y: 300,
        vx: 5,
        vy: 3,
        radius: 10
    };
};
```

**Analogie C/C++ :**
```c
// C
typedef struct {
    float x, y;
    float vx, vy;
    float radius;
} Ball;

typedef struct {
    Ball ball;
    Paddle paddles[2];
    int score[2];
    long timestamp;
} GameState;
```

---

## **7. STRUCTURES DE DONNÉES**

### **Arrays (tableaux)**

```typescript
// Création
const numbers: number[] = [1, 2, 3, 4, 5];
const users: User[] = [];

// Ajout
numbers.push(6);           // Ajoute à la fin
users.push({ id: 1, name: 'John' });

// Parcours
for (const num of numbers) {
    console.log(num);
}

// Map (transformation)
const doubled = numbers.map(n => n * 2);  // [2, 4, 6, 8, 10]

// Filter (filtrage)
const evens = numbers.filter(n => n % 2 === 0);  // [2, 4]

// Find (recherche)
const user = users.find(u => u.id === 1);

// Longueur
console.log(numbers.length);  // 5
```

### **Objects (dictionnaires)**

```typescript
// Création
const player = {
    id: 1,
    name: 'Alice',
    score: 100
};

// Accès
console.log(player.name);      // "Alice"
console.log(player['name']);   // "Alice"

// Modification
player.score = 150;

// Ajout propriété
player.level = 5;

// Vérification existence
if ('score' in player) {
    console.log('Score existe');
}
```

### **Map (dictionnaire typé)**

```typescript
// Pour associer clés → valeurs
const games = new Map<string, PongGame>();

// Ajout
games.set('game-123', new PongGame('A', 'B'));

// Récupération
const game = games.get('game-123');

// Vérification
if (games.has('game-123')) {
    console.log('Partie existe');
}

// Suppression
games.delete('game-123');

// Parcours
for (const [id, game] of games) {
    console.log(`Game ${id}:`, game.getState());
}
```

**Analogie C/C++ :**
```cpp
// C++
std::map<std::string, PongGame*> games;

// Ajout
games["game-123"] = new PongGame();

// Récupération
PongGame* game = games["game-123"];
```

### **Set (ensemble)**

```typescript
// Ensemble (pas de doublons)
const players = new Set<string>();

// Ajout
players.add('Alice');
players.add('Bob');
players.add('Alice');  // Ignoré (doublon)

// Taille
console.log(players.size);  // 2

// Vérification
if (players.has('Alice')) {
    console.log('Alice est dans la partie');
}

// Suppression
players.delete('Bob');
```

---

## **8. DESTRUCTURING**

```typescript
// Destructuring d'objet
const user = { id: 1, name: 'John', email: 'john@test.com' };

// Extraction
const { name, email } = user;
console.log(name);   // "John"
console.log(email);  // "john@test.com"

// Avec renommage
const { name: userName } = user;
console.log(userName);  // "John"

// Destructuring d'array
const numbers = [1, 2, 3, 4, 5];
const [first, second, ...rest] = numbers;
console.log(first);   // 1
console.log(second);  // 2
console.log(rest);    // [3, 4, 5]

// Dans les paramètres de fonction
function greet({ name, age }: { name: string; age: number }) {
    console.log(`Hello ${name}, age ${age}`);
}

greet({ name: 'Alice', age: 25 });
```

**Très utilisé dans ton projet :**
```typescript
// Fastify route
app.get('/uploads/:filename', async (req, res) => {
    const { filename } = req.params;  // ← Destructuring
    // ...
});
```

---

## **9. OPÉRATEURS SPÉCIAUX**

### **Optional chaining (?.)**

```typescript
// Accès sécurisé (pas d'erreur si undefined)
const userName = user?.profile?.name;

// Équivalent à :
const userName = user && user.profile && user.profile.name;
```

### **Nullish coalescing (??)**

```typescript
// Valeur par défaut si null/undefined
const port = process.env.PORT ?? 3000;

// Équivalent à :
const port = process.env.PORT !== null && process.env.PORT !== undefined 
    ? process.env.PORT 
    : 3000;
```

### **Spread operator (...)**

```typescript
// Copie d'objet
const user1 = { id: 1, name: 'John' };
const user2 = { ...user1, age: 25 };  // { id: 1, name: 'John', age: 25 }

// Fusion d'arrays
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const combined = [...arr1, ...arr2];  // [1, 2, 3, 4, 5, 6]

// Copie d'array
const copy = [...arr1];
```

---

## **10. SPÉCIFIQUE À TON PROJET**

### **Fastify : Route handler**

```typescript
// Pattern de base
app.get('/path', async (req: FastifyRequest, res: FastifyReply) => {
    try {
        // Logique
        const data = await someAsyncOperation();
        return { success: true, data };
    } catch (error) {
        return res.status(500).send({ error: 'Message' });
    }
});

// Avec paramètres d'URL
app.get('/users/:id', async (
    req: FastifyRequest<{ Params: { id: string } }>,
    res: FastifyReply
) => {
    const { id } = req.params;
    const user = await db.getUser(id);
    return { user };
});

// Avec body
app.post('/users', async (
    req: FastifyRequest<{ Body: { name: string; email: string } }>,
    res: FastifyReply
) => {
    const { name, email } = req.body;
    const user = await db.createUser(name, email);
    return { user };
});
```

### **WebSocket : Communication temps réel**

```typescript
// Connexion WebSocket
app.get('/ws/game', { websocket: true }, (connection, req) => {
    // Réception message
    connection.socket.on('message', (message) => {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'paddle/move') {
            game.movePaddle(data.playerId, data.direction);
        }
    });
    
    // Envoi message
    connection.socket.send(JSON.stringify({
        type: 'game/state',
        data: game.getState()
    }));
    
    // Déconnexion
    connection.socket.on('close', () => {
        console.log('Client disconnected');
    });
});
```

### **Timers et intervalles**

```typescript
// setTimeout (exécute UNE fois après délai)
const timerId = setTimeout(() => {
    console.log('Exécuté après 1 seconde');
}, 1000);

// Annuler
clearTimeout(timerId);

// setInterval (exécute en boucle)
const intervalId = setInterval(() => {
    // Game loop à 60 FPS
    game.update(16.67);
    broadcastGameState();
}, 16.67);  // 1000ms / 60 = 16.67ms

// Annuler
clearInterval(intervalId);
```

**Pour ton jeu Pong :**
```typescript
class GameManager {
    private gameLoop: NodeJS.Timeout | null = null;
    
    startGame() {
        this.gameLoop = setInterval(() => {
            this.game.update(16.67);
            this.broadcastState();
        }, 16.67);  // 60 FPS
    }
    
    stopGame() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
    }
}
```

---

## **11. JSON**

```typescript
// Objet → JSON string
const user = { id: 1, name: 'John' };
const json = JSON.stringify(user);
// '{"id":1,"name":"John"}'

// JSON string → Objet
const parsed = JSON.parse(json);
// { id: 1, name: 'John' }

// WebSocket envoie toujours des strings
connection.socket.send(JSON.stringify({
    type: 'game/state',
    data: gameState
}));

// Réception
connection.socket.on('message', (msg) => {
    const data = JSON.parse(msg.toString());
    console.log(data.type);
});
```

**Analogie C/C++ :**
```c
// C (sérialisation manuelle)
typedef struct {
    int id;
    char name[256];
} User;

// Sérialiser
char json[512];
sprintf(json, "{\"id\":%d,\"name\":\"%s\"}", user.id, user.name);

// Désérialiser (avec une lib comme cJSON)
User user;
cJSON* root = cJSON_Parse(json);
user.id = cJSON_GetObjectItem(root, "id")->valueint;
```

---

## **12. GESTION D'ERREURS**

```typescript
// try/catch (comme en C++)
async function fetchUser(id: number) {
    try {
        const user = await db.getUser(id);
        return user;
    } catch (error) {
        console.error('Erreur:', error);
        throw error;  // Re-lance l'erreur
    }
}

// Erreurs personnalisées
class GameError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'GameError';
    }
}

throw new GameError('Partie déjà commencée');

// Catch spécifique
try {
    startGame();
} catch (error) {
    if (error instanceof GameError) {
        console.log('Erreur de jeu:', error.message);
    } else {
        console.error('Erreur inconnue:', error);
    }
}
```

---

## **13. CHECKLIST ESSENTIELLE**

### **✅ Syntaxe de base**
- [ ] `const` / `let` (pas `var`)
- [ ] Arrow functions : `() => {}`
- [ ] `async` / `await` pour opérations asynchrones
- [ ] `try` / `catch` pour gestion erreurs

### **✅ Types TypeScript**
- [ ] Types primitifs : `string`, `number`, `boolean`
- [ ] Arrays : `number[]`, `User[]`
- [ ] Interfaces pour objets : `interface Ball { x: number; y: number; }`
- [ ] Types optionnels : `email?: string`

### **✅ Imports/Exports**
- [ ] `export class PongGame { }`
- [ ] `import { PongGame } from './PongGame.js'`
- [ ] ⚠️ Extension `.js` même pour fichiers `.ts`

### **✅ Classes**
- [ ] `class PongGame { }`
- [ ] `constructor()`
- [ ] Propriétés : `private`, `public`
- [ ] Méthodes : `update()`, `getState()`

### **✅ Structures de données**
- [ ] Arrays : `push()`, `map()`, `filter()`, `find()`
- [ ] Objects : `{ key: value }`
- [ ] Map : `new Map<string, PongGame>()`
- [ ] Set : `new Set<string>()`

### **✅ Fastify spécifique**
- [ ] Route handler : `app.get('/path', async (req, res) => {})`
- [ ] Types : `FastifyRequest`, `FastifyReply`
- [ ] Retour : `return { data }` ou `res.status(500).send()`

### **✅ WebSocket**
- [ ] Connexion : `{ websocket: true }`
- [ ] Envoi : `socket.send(JSON.stringify(data))`
- [ ] Réception : `socket.on('message', (msg) => {})`

### **✅ Game loop**
- [ ] `setInterval()` pour 60 FPS
- [ ] `clearInterval()` pour arrêter
- [ ] `JSON.stringify()` / `JSON.parse()` pour WebSocket

---

## **14. CODE TEMPLATE POUR TON PONG**

### **Structure type d'une classe de jeu**

```typescript
// src/game/PongGame.ts

interface Ball {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
}

interface Paddle {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface GameState {
    ball: Ball;
    paddles: Paddle[];
    score: number[];
    timestamp: number;
}

export class PongGame {
    private ball: Ball;
    private paddles: Paddle[];
    private score: number[];
    private lastUpdate: number;
    
    constructor(
        private player1Id: string,
        private player2Id: string
    ) {
        this.ball = {
            x: 400,
            y: 300,
            vx: 5,
            vy: 3,
            radius: 10
        };
        
        this.paddles = [
            { x: 20, y: 250, width: 10, height: 100 },
            { x: 770, y: 250, width: 10, height: 100 }
        ];
        
        this.score = [0, 0];
        this.lastUpdate = Date.now();
    }
    
    update(deltaTime: number): void {
        this.updateBall(deltaTime);
        this.checkCollisions();
        this.lastUpdate = Date.now();
    }
    
    private updateBall(dt: number): void {
        this.ball.x += this.ball.vx * dt / 16.67;
        this.ball.y += this.ball.vy * dt / 16.67;
        
        // Rebond haut/bas
        if (this.ball.y <= 0 || this.ball.y >= 600) {
            this.ball.vy *= -1;
        }
    }
    
    private checkCollisions(): void {
        // TODO: Collision paddle/ball
    }
    
    movePaddle(playerIndex: number, direction: 'up' | 'down'): void {
        const paddle = this.paddles[playerIndex];
        const speed = 5;
        
        if (direction === 'up') {
            paddle.y = Math.max(0, paddle.y - speed);
        } else {
            paddle.y = Math.min(500, paddle.y + speed);
        }
    }
    
    getState(): GameState {
        return {
            ball: { ...this.ball },
            paddles: this.paddles.map(p => ({ ...p })),
            score: [...this.score],
            timestamp: this.lastUpdate
        };
    }
}
```

---

## **15. RÉSUMÉ ULTRA-COMPACT**

```typescript
// ═══════════════════════════════════════════════════════════
// ESSENTIEL TYPESCRIPT POUR FT_TRANSCENDENCE
// ═══════════════════════════════════════════════════════════

// 1. VARIABLES
const x = 10;           // Immuable
let y = 20;             // Mutable

// 2. TYPES
interface User { id: number; name: string; }
const users: User[] = [];

// 3. FONCTIONS
const add = (a: number, b: number): number => a + b;

// 4. ASYNC/AWAIT
async function fetch() {
    try {
        const data = await db.query('...');
        return data;
    } catch (error) {
        throw error;
    }
}

// 5. CLASSES
class Game {
    private state: any;
    constructor() { }
    update() { }
    getState() { return this.state; }
}

// 6. IMPORTS
export class PongGame { }
import { PongGame } from './PongGame.js';  // .js !

// 7. STRUCTURES
const map = new Map<string, Game>();
const set = new Set<string>();
const arr = [1, 2, 3].map(x => x * 2);

// 8. FASTIFY
app.get('/path', async (req, res) => {
    const data = await fetch();
    return { data };
});

// 9. WEBSOCKET
socket.send(JSON.stringify({ type: 'state', data }));
socket.on('message', (msg) => {
    const data = JSON.parse(msg.toString());
});

// 10. GAME LOOP
setInterval(() => {
    game.update(16.67);
    broadcast(game.getState());
}, 16.67);
```

---

## **🎯 CONCEPTS CLÉS À RETENIR**

| Concept JS/TS | Équivalent C/C++ | Usage dans ft_transcendence |
|---------------|------------------|----------------------------|
| `const` | `const` | Variables immuables |
| `let` | Variable normale | Variables mutables |
| `interface` | `struct` | Types personnalisés (Ball, Paddle) |
| `class` | `class` | PongGame, GameManager |
| Arrow function `=>` | Lambda C++11 | Callbacks, handlers |
| `async/await` | Coroutines C++20 | DB, API, I/O async |
| `Map` | `std::map` | Stockage parties actives |
| `Set` | `std::set` | Joueurs connectés |
| `JSON.stringify()` | Sérialisation | WebSocket messages |
| `setInterval()` | Timer thread | Game loop 60 FPS |

---

## **📖 RESSOURCES COMPLÉMENTAIRES**

### **Documentation officielle**
- TypeScript: https://www.typescriptlang.org/docs/
- Fastify: https://fastify.dev/docs/latest/
- Node.js: https://nodejs.org/docs/

### **Analogies pour développeurs C/C++**
- Arrow functions = Lambdas C++11
- Promises = std::future
- async/await = Coroutines C++20
- Map/Set = std::map/std::set
- Interface = struct

---

**Avec ce résumé, tu as tout ce qu'il faut pour commencer ft_transcendence ! 🚀**

**Prochaines étapes :**
1. ✅ Comprendre la syntaxe TypeScript
2. 🎯 Implémenter PongGame.ts
3. 🔄 Ajouter GameManager.ts
4. 🌐 Créer les endpoints API REST
5. 🔌 Implémenter WebSocket temps réel
6. 🏆 Système de tournoi

**Bon courage ! 💪**
