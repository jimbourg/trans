# 📚 CHEAT SHEET - CONCEPTS & SYNTAXES ESSENTIELS

Guide de référence rapide pour ft_transcendence : TypeScript, JavaScript, Node.js et Fastify

---

## TABLE DES MATIÈRES

### PARTIE 1 - JAVASCRIPT/TYPESCRIPT
1. [Variables et Types](#1-variables-et-types)
2. [Fonctions](#2-fonctions)
3. [Async/Await et Promises](#3-asyncawait-et-promises)
4. [Arrow Functions](#4-arrow-functions)
5. [Destructuring](#5-destructuring)
6. [Spread et Rest](#6-spread-et-rest)
7. [Opérateurs spéciaux](#7-opérateurs-spéciaux)
8. [Classes](#8-classes)
9. [Modules](#9-modules)
10. [Types TypeScript](#10-types-typescript)

### PARTIE 2 - NODE.JS
11. [Event Loop](#11-event-loop)
12. [Process](#12-process)
13. [File System](#13-file-system)
14. [Path](#14-path)
15. [Events](#15-events)
16. [Timers](#16-timers)

### PARTIE 3 - FASTIFY
17. [Setup et Routes](#17-setup-et-routes)
18. [Request/Reply](#18-requestreply)
19. [Hooks](#19-hooks)
20. [Validation](#20-validation)
21. [WebSocket](#21-websocket)
22. [Plugins](#22-plugins)

---

# PARTIE 1 - JAVASCRIPT/TYPESCRIPT

---

## **1. VARIABLES ET TYPES**

### **Déclaration de variables**

```typescript
// const - Ne peut pas être réassigné (préféré)
const name = 'John';              // ✅ Préférer const par défaut
// name = 'Jane';                 // ❌ Erreur

// let - Peut être réassigné
let age = 25;                     // ✅ Utiliser si réassignation nécessaire
age = 26;                         // ✅ OK

// var - À ÉVITER (ancien style)
var score = 100;                  // ❌ Ne pas utiliser
```

### **Types primitifs**

```typescript
// Types de base
const text: string = 'Hello';
const number: number = 42;
const isActive: boolean = true;
const nothing: null = null;
const notDefined: undefined = undefined;

// Arrays
const numbers: number[] = [1, 2, 3];
const strings: Array<string> = ['a', 'b', 'c'];

// Tuples (tableau avec types fixes)
const pair: [string, number] = ['age', 25];

// Any (éviter si possible)
let data: any = 'anything';  // ❌ Perd les avantages de TypeScript

// Union types
let id: string | number = 123;
id = 'abc';  // ✅ Les deux OK
```

### **Objets et interfaces**

```typescript
// Interface (structure de données)
interface User {
    id: number;
    name: string;
    email: string;
    age?: number;        // ? = optionnel
}

// Utilisation
const user: User = {
    id: 1,
    name: 'John',
    email: 'john@example.com'
    // age manquant est OK (optionnel)
};

// Type alias (similaire à interface)
type Point = {
    x: number;
    y: number;
};

const point: Point = { x: 10, y: 20 };
```

**Analogie C/C++ :**
```c
// C
const int AGE = 25;          // const
int score = 100;             // let

struct User {                // interface
    int id;
    char name[50];
};
```

---

## **2. FONCTIONS**

### **Déclaration classique**

```typescript
// Fonction normale
function add(a: number, b: number): number {
    return a + b;
}

// Fonction async (retourne une Promise)
async function fetchData(): Promise<string> {
    const response = await fetch('https://api.example.com');
    return await response.text();
}

// Fonction void (ne retourne rien)
function logMessage(msg: string): void {
    console.log(msg);
}
```

### **Fonctions avec paramètres optionnels**

```typescript
// Paramètre optionnel (?)
function greet(name: string, greeting?: string): string {
    return `${greeting || 'Hello'}, ${name}!`;
}

greet('John');              // "Hello, John!"
greet('John', 'Hi');        // "Hi, John!"

// Valeur par défaut
function greet2(name: string, greeting: string = 'Hello'): string {
    return `${greeting}, ${name}!`;
}

// Paramètres rest (...)
function sum(...numbers: number[]): number {
    return numbers.reduce((acc, n) => acc + n, 0);
}

sum(1, 2, 3, 4, 5);  // 15
```

**Analogie C/C++ :**
```c
// C
int add(int a, int b) {
    return a + b;
}

// JavaScript équivalent
function add(a, b) {
    return a + b;
}
```

---

## **3. ASYNC/AWAIT ET PROMISES**

### **💡 CONCEPT CLÉ : Synchrone vs Asynchrone**

```typescript
// ═══════════════════════════════════════
// SYNCHRONE (bloque)
// ═══════════════════════════════════════

function syncOperation() {
    const data = heavyComputation();  // ⏱️ Bloque ici
    console.log(data);                // Attend la fin
}

// ═══════════════════════════════════════
// ASYNCHRONE (non-bloquant)
// ═══════════════════════════════════════

async function asyncOperation() {
    console.log('1. Start');
    const data = await heavyComputation();  // ⏱️ Attend mais ne bloque pas
    console.log('3. Data:', data);
}

asyncOperation();
console.log('2. Continue');  // S'exécute pendant l'attente

// Output:
// 1. Start
// 2. Continue
// 3. Data: ...
```

### **Promises - Les 3 états**

```
Promise
   ↓
Pending (⏳ en cours)
   ↓
   ├─→ Fulfilled ✅ (succès) → .then()
   └─→ Rejected ❌ (erreur)   → .catch()
```

```typescript
// Créer une Promise
const myPromise = new Promise<string>((resolve, reject) => {
    setTimeout(() => {
        const success = true;
        
        if (success) {
            resolve('Success!');  // ✅ Succès
        } else {
            reject('Error!');     // ❌ Erreur
        }
    }, 1000);
});

// Utiliser avec .then()/.catch()
myPromise
    .then(result => console.log(result))   // ✅ Succès
    .catch(error => console.error(error)); // ❌ Erreur
```

### **async/await - Syntaxe moderne**

```typescript
// ✅ RECOMMANDÉ - Avec async/await
async function fetchUser(id: number): Promise<User> {
    try {
        const response = await fetch(`/api/users/${id}`);
        
        if (!response.ok) {
            throw new Error('User not found');
        }
        
        const user = await response.json();
        return user;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// Utilisation
const user = await fetchUser(123);
console.log(user.name);
```

### **Chaînage de Promises**

```typescript
// ❌ ANCIEN STYLE - Callback hell
getData1((data1) => {
    getData2(data1, (data2) => {
        getData3(data2, (data3) => {
            console.log(data3);  // 😵 Pyramide
        });
    });
});

// ✅ MODERNE - Avec async/await
async function processData() {
    const data1 = await getData1();
    const data2 = await getData2(data1);
    const data3 = await getData3(data2);
    console.log(data3);  // 😊 Linéaire
}
```

### **Promise.all() - Parallèle**

```typescript
// Exécuter en parallèle
const [users, posts, comments] = await Promise.all([
    fetch('/api/users').then(r => r.json()),
    fetch('/api/posts').then(r => r.json()),
    fetch('/api/comments').then(r => r.json())
]);

// Équivalent séquentiel (plus lent)
const users = await fetch('/api/users').then(r => r.json());
const posts = await fetch('/api/posts').then(r => r.json());
const comments = await fetch('/api/comments').then(r => r.json());
```

### **⚠️ Pièges courants**

```typescript
// ❌ ERREUR 1 - Oublier await
async function wrong() {
    const data = fetchData();  // ⚠️ Retourne Promise, pas le résultat
    console.log(data);         // Promise { <pending> }
}

// ✅ CORRECT
async function correct() {
    const data = await fetchData();  // ✅ Attend le résultat
    console.log(data);               // Vraie valeur
}

// ❌ ERREUR 2 - await dans forEach
async function wrong2() {
    [1, 2, 3].forEach(async (id) => {
        await processId(id);  // ⚠️ forEach ignore await
    });
}

// ✅ CORRECT - for...of
async function correct2() {
    for (const id of [1, 2, 3]) {
        await processId(id);  // ✅ Attend chaque itération
    }
}

// ❌ ERREUR 3 - Pas de try/catch
async function wrong3() {
    const data = await fetchData();  // ⚠️ Si erreur, crash
}

// ✅ CORRECT
async function correct3() {
    try {
        const data = await fetchData();
    } catch (error) {
        console.error('Error:', error);
    }
}
```

**Analogie C/C++ :**
```c
// C - Tout est synchrone (bloquant)
void operation() {
    int result = heavy_computation();  // Bloque jusqu'à la fin
    printf("%d\n", result);
}

// JavaScript - Peut être asynchrone
async function operation() {
    const result = await heavyComputation();  // N'a pas bloque pas l'event loop
    console.log(result);
}
```

---

## **4. ARROW FUNCTIONS**

### **Syntaxe de base**

```typescript
// Fonction classique
function add(a, b) {
    return a + b;
}

// Arrow function équivalente
const add = (a, b) => {
    return a + b;
};

// Arrow function (forme courte)
const add = (a, b) => a + b;  // return implicite

// Un seul paramètre (pas de parenthèses)
const double = x => x * 2;

// Aucun paramètre
const greet = () => console.log('Hello');

// Corps avec plusieurs lignes
const processUser = (user) => {
    const name = user.name.toUpperCase();
    const age = user.age + 1;
    return { name, age };
};
```

### **Retourner un objet**

```typescript
// ❌ ERREUR - Interprété comme bloc de code
const makeUser = (name) => { name: name };  // undefined

// ✅ CORRECT - Parenthèses autour de l'objet
const makeUser = (name) => ({ name: name });

// Ou avec return explicite
const makeUser = (name) => {
    return { name: name };
};
```

### **Avec TypeScript**

```typescript
// Types de paramètres et retour
const add = (a: number, b: number): number => a + b;

// Async arrow function
const fetchUser = async (id: number): Promise<User> => {
    const response = await fetch(`/api/users/${id}`);
    return response.json();
};

// Callbacks
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
const evens = numbers.filter(n => n % 2 === 0);
const sum = numbers.reduce((acc, n) => acc + n, 0);
```

### **Utilisation courante dans ft_transcendence**

```typescript
// Fastify route handler
app.get('/users/:id', async (req, res) => {
    const { id } = req.params;
    const user = await db.getUser(id);
    return { user };
});

// WebSocket message handler
socket.on('message', (msg) => {
    const data = JSON.parse(msg.toString());
    handleMessage(data);
});

// Event handler
game.on('goal', (data) => {
    console.log(`Goal for player ${data.player}!`);
});

// Timer
setInterval(() => {
    game.update(16.67);
    broadcast();
}, 16.67);
```

**Analogie C/C++ :**
```cpp
// C++11 Lambda
auto add = [](int a, int b) -> int { return a + b; };

// JavaScript arrow function
const add = (a, b) => a + b;
```

---

## **5. DESTRUCTURING**

### **Destructuring d'objets**

```typescript
// Objet
const user = {
    id: 1,
    name: 'John',
    email: 'john@example.com',
    age: 25
};

// ═══════════════════════════════════════
// Extraction de propriétés
// ═══════════════════════════════════════

// ❌ ANCIEN STYLE
const id = user.id;
const name = user.name;
const email = user.email;

// ✅ MODERNE - Destructuring
const { id, name, email } = user;

// Renommer une variable
const { id: userId, name: userName } = user;

// Valeur par défaut
const { role = 'user' } = user;  // role = 'user' si absent

// Nested (imbriqué)
const game = {
    id: 'game-123',
    players: {
        player1: { name: 'Alice' },
        player2: { name: 'Bob' }
    }
};

const { players: { player1, player2 } } = game;
console.log(player1.name);  // "Alice"
```

### **Destructuring d'arrays**

```typescript
const colors = ['red', 'green', 'blue'];

// ✅ Destructuring
const [first, second, third] = colors;
console.log(first);   // "red"
console.log(second);  // "green"

// Ignorer des éléments
const [, , third] = colors;
console.log(third);  // "blue"

// Rest (le reste)
const [first, ...rest] = colors;
console.log(rest);  // ["green", "blue"]

// Swap (échanger)
let a = 1, b = 2;
[a, b] = [b, a];  // a=2, b=1
```

### **Dans les paramètres de fonction**

```typescript
// Objet en paramètre
function printUser({ name, age }: { name: string; age: number }) {
    console.log(`${name} is ${age} years old`);
}

printUser({ name: 'John', age: 25 });

// Arrow function
const printUser = ({ name, age }) => {
    console.log(`${name} is ${age} years old`);
};

// Avec valeur par défaut
const greet = ({ name, greeting = 'Hello' }) => {
    console.log(`${greeting}, ${name}!`);
};
```

### **Cas d'usage ft_transcendence**

```typescript
// Route Fastify
app.get('/users/:id', async (req, res) => {
    const { id } = req.params;  // ← Destructuring
    const { limit = 10 } = req.query;
    
    const user = await db.getUser(id);
    return { user };
});

// WebSocket message
socket.on('message', (msg) => {
    const { type, data } = JSON.parse(msg.toString());
    
    if (type === 'paddle/move') {
        const { playerId, direction } = data;
        game.movePaddle(playerId, direction);
    }
});

// Game state
const { ball, paddles, score } = game.getState();
```

**Pas d'équivalent direct en C** (mais similaire à l'unpacking Python)

---

## **6. SPREAD ET REST**

### **Spread operator (...)**

```typescript
// ═══════════════════════════════════════
// ARRAYS
// ═══════════════════════════════════════

// Copier un array
const numbers = [1, 2, 3];
const copy = [...numbers];  // [1, 2, 3]

// Concatener
const arr1 = [1, 2];
const arr2 = [3, 4];
const combined = [...arr1, ...arr2];  // [1, 2, 3, 4]

// Ajouter des éléments
const extended = [0, ...numbers, 4, 5];  // [0, 1, 2, 3, 4, 5]

// ═══════════════════════════════════════
// OBJECTS
// ═══════════════════════════════════════

// Copier un objet
const user = { id: 1, name: 'John' };
const copy = { ...user };

// Merger des objets
const defaults = { theme: 'dark', lang: 'en' };
const settings = { lang: 'fr' };
const final = { ...defaults, ...settings };
// { theme: 'dark', lang: 'fr' }  ← lang écrasé

// Ajouter des propriétés
const user = { name: 'John' };
const userWithId = { id: 1, ...user };
// { id: 1, name: 'John' }

// ═══════════════════════════════════════
// FUNCTION ARGUMENTS
// ═══════════════════════════════════════

const numbers = [1, 2, 3];
Math.max(...numbers);  // Équivalent à Math.max(1, 2, 3)

function sum(a, b, c) {
    return a + b + c;
}
sum(...numbers);  // 6
```

### **Rest operator (...)**

```typescript
// Dans les paramètres de fonction
function sum(...numbers: number[]): number {
    return numbers.reduce((acc, n) => acc + n, 0);
}

sum(1, 2, 3, 4, 5);  // 15

// Avec d'autres paramètres
function greet(greeting: string, ...names: string[]): void {
    for (const name of names) {
        console.log(`${greeting}, ${name}!`);
    }
}

greet('Hello', 'Alice', 'Bob', 'Charlie');

// Dans le destructuring
const [first, ...rest] = [1, 2, 3, 4, 5];
console.log(first);  // 1
console.log(rest);   // [2, 3, 4, 5]

const { id, ...userData } = { id: 1, name: 'John', age: 25 };
console.log(userData);  // { name: 'John', age: 25 }
```

### **Cas d'usage ft_transcendence**

```typescript
// Copie de game state (immutabilité)
const state = game.getState();
const newState = { ...state, score: [0, 0] };

// Merge de configurations
const defaultConfig = { speed: 5, size: 10 };
const userConfig = { speed: 7 };
const finalConfig = { ...defaultConfig, ...userConfig };

// Broadcaster à plusieurs clients
function broadcast(message: string, ...sockets: WebSocket[]) {
    for (const socket of sockets) {
        socket.send(message);
    }
}

broadcast('Hello', socket1, socket2, socket3);
```

**Analogie C/C++ :**
```c
// C - Pas d'équivalent direct, copie manuelle
int arr1[] = {1, 2, 3};
int arr2[] = {4, 5, 6};

// Concaténation manuelle
int combined[6];
memcpy(combined, arr1, sizeof(arr1));
memcpy(combined + 3, arr2, sizeof(arr2));

// JavaScript - Avec spread
const combined = [...arr1, ...arr2];
```

---

## **7. OPÉRATEURS SPÉCIAUX**

### **Optional chaining (?.)**

```typescript
// ❌ SANS optional chaining
const user = getUser();
const city = user && user.address && user.address.city;

// ✅ AVEC optional chaining
const city = user?.address?.city;

// Avec méthodes
const name = user?.getName?.()?;

// Avec arrays
const firstItem = arr?.[0];

// Cas pratique
const score = game?.players?.[0]?.score ?? 0;
```

### **Nullish coalescing (??)**

```typescript
// Différence avec ||
const value1 = 0 || 'default';   // "default" (0 est falsy)
const value2 = 0 ?? 'default';   // 0 (0 n'est pas null/undefined)

const value3 = '' || 'default';  // "default" ('' est falsy)
const value4 = '' ?? 'default';  // '' ('' n'est pas null/undefined)

// Cas d'usage
const port = process.env.PORT ?? 3000;
const limit = req.query.limit ?? 10;

// Avec optional chaining
const score = user?.score ?? 0;
```

### **Logical assignment (&&=, ||=, ??=)**

```typescript
// OU assignment (||=)
let score = null;
score ||= 0;  // Équivalent à: score = score || 0

// AND assignment (&&=)
let settings = { theme: 'dark' };
settings.theme &&= 'light';  // Change seulement si truthy

// Nullish assignment (??=)
let count = 0;
count ??= 10;  // count reste 0 (pas null/undefined)
```

### **Ternaire (condition ? vrai : faux)**

```typescript
// Simple
const status = isActive ? 'active' : 'inactive';

// Imbriqué
const color = score > 80 ? 'green' : score > 50 ? 'yellow' : 'red';

// Dans JSX/template
const message = user ? `Hello ${user.name}` : 'Hello guest';

// Avec optional chaining
const display = user?.isAdmin ? 'Admin' : 'User';
```

### **Cas d'usage ft_transcendence**

```typescript
// Sécuriser accès propriétés
const userName = req.user?.displayName ?? 'Guest';

// Valeurs par défaut
const limit = req.query.limit ?? 10;
const offset = req.query.offset ?? 0;

// Conditional rendering logic
const canPlay = game?.status === 'waiting' && players?.length === 2;

// Status messages
const message = winner 
    ? `Player ${winner} wins!` 
    : 'Game in progress';
```

---

## **8. CLASSES**

### **Syntaxe de base**

```typescript
class PongGame {
    // Propriétés
    private ball: Ball;
    private paddles: Paddle[];
    private score: number[];
    public gameId: string;
    
    // Constructeur
    constructor(player1: string, player2: string) {
        this.gameId = this.generateId();
        this.ball = { x: 400, y: 300, vx: 5, vy: 3 };
        this.paddles = [
            { x: 20, y: 250, width: 10, height: 100 },
            { x: 770, y: 250, width: 10, height: 100 }
        ];
        this.score = [0, 0];
    }
    
    // Méthodes
    update(deltaTime: number): void {
        this.updateBall(deltaTime);
        this.checkCollisions();
    }
    
    private updateBall(deltaTime: number): void {
        this.ball.x += this.ball.vx * deltaTime / 16.67;
        this.ball.y += this.ball.vy * deltaTime / 16.67;
    }
    
    getState(): GameState {
        return {
            ball: { ...this.ball },
            paddles: [...this.paddles],
            score: [...this.score]
        };
    }
    
    private generateId(): string {
        return `game-${Date.now()}`;
    }
}

// Utilisation
const game = new PongGame('player1', 'player2');
game.update(16.67);
const state = game.getState();
```

### **Modificateurs d'accès**

```typescript
class User {
    public id: number;          // Accessible partout
    private password: string;   // Seulement dans la classe
    protected role: string;     // Classe + sous-classes
    
    constructor(id: number, password: string) {
        this.id = id;
        this.password = password;
        this.role = 'user';
    }
    
    // Getter
    get displayName(): string {
        return `User #${this.id}`;
    }
    
    // Setter
    set newPassword(pwd: string) {
        if (pwd.length < 8) {
            throw new Error('Password too short');
        }
        this.password = pwd;
    }
}

const user = new User(1, 'secret123');
console.log(user.id);           // ✅ OK (public)
console.log(user.displayName);  // ✅ OK (getter)
// console.log(user.password);  // ❌ Erreur (private)
user.newPassword = 'newsecret123';  // ✅ OK (setter)
```

### **Héritage (extends)**

```typescript
class Animal {
    constructor(public name: string) {}
    
    makeSound(): void {
        console.log('Some sound');
    }
}

class Dog extends Animal {
    constructor(name: string, public breed: string) {
        super(name);  // Appelle le constructeur parent
    }
    
    // Override
    makeSound(): void {
        console.log('Woof!');
    }
    
    // Nouvelle méthode
    fetch(): void {
        console.log(`${this.name} is fetching`);
    }
}

const dog = new Dog('Rex', 'Labrador');
dog.makeSound();  // "Woof!"
dog.fetch();      // "Rex is fetching"
```

### **Static (propriétés/méthodes de classe)**

```typescript
class MathUtils {
    static PI = 3.14159;
    
    static add(a: number, b: number): number {
        return a + b;
    }
    
    static randomId(): string {
        return Math.random().toString(36).substr(2, 9);
    }
}

// Utilisation SANS instancier
console.log(MathUtils.PI);           // 3.14159
console.log(MathUtils.add(5, 3));    // 8
console.log(MathUtils.randomId());   // "x7k2m9p4q"
```

**Analogie C++ :**
```cpp
// C++
class PongGame {
private:
    Ball ball;
    std::vector<Paddle> paddles;
    
public:
    PongGame(string p1, string p2) {
        // Constructor
    }
    
    void update(float deltaTime) {
        // Method
    }
};

// TypeScript équivalent
class PongGame {
    private ball: Ball;
    private paddles: Paddle[];
    
    constructor(p1: string, p2: string) {
        // Constructor
    }
    
    update(deltaTime: number): void {
        // Method
    }
}
```

---

## **9. MODULES**

### **Export**

```typescript
// ═══════════════════════════════════════
// NAMED EXPORTS (plusieurs exports)
// ═══════════════════════════════════════

// math.ts
export const PI = 3.14159;

export function add(a: number, b: number): number {
    return a + b;
}

export class Calculator {
    multiply(a: number, b: number): number {
        return a * b;
    }
}

// OU en fin de fichier
const PI = 3.14159;
function add(a, b) { return a + b; }
class Calculator { /* ... */ }

export { PI, add, Calculator };

// ═══════════════════════════════════════
// DEFAULT EXPORT (un seul export principal)
// ═══════════════════════════════════════

// PongGame.ts
export default class PongGame {
    // ...
}

// OU
class PongGame { /* ... */ }
export default PongGame;

// Peut combiner default + named
export default class PongGame { /* ... */ }
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;
```

### **Import**

```typescript
// ═══════════════════════════════════════
// NAMED IMPORTS
// ═══════════════════════════════════════

// Import sélectif
import { add, PI } from './math.js';  // ⚠️ .js obligatoire en ES modules

// Import tout
import * as math from './math.js';
console.log(math.PI);
console.log(math.add(5, 3));

// Renommer
import { add as sum } from './math.js';

// ═══════════════════════════════════════
// DEFAULT IMPORT
// ═══════════════════════════════════════

import PongGame from './PongGame.js';

// Combiner default + named
import PongGame, { GAME_WIDTH, GAME_HEIGHT } from './PongGame.js';

// ═══════════════════════════════════════
// MODULES NODE.JS BUILT-IN
// ═══════════════════════════════════════

import fs from 'fs';
import { readFile } from 'fs/promises';
import path from 'path';
import { EventEmitter } from 'events';

// ═══════════════════════════════════════
// MODULES NPM
// ═══════════════════════════════════════

import Fastify from 'fastify';
import cors from '@fastify/cors';
```

### **⚠️ Extension .js obligatoire**

```typescript
// ❌ ERREUR
import { PongGame } from './PongGame';

// ✅ CORRECT
import { PongGame } from './PongGame.js';  // Même pour fichiers .ts !
```

### **Configuration package.json**

```json
{
  "type": "module",  // ← Active ES Modules
  "scripts": {
    "start": "node dist/index.js"
  }
}
```

**Analogie C/C++ :**
```c
// C - Header files
// math.h
int add(int a, int b);

// main.c
#include "math.h"

// TypeScript - ES Modules
// math.ts
export function add(a: number, b: number): number { return a + b; }

// main.ts
import { add } from './math.js';
```

---

## **10. TYPES TYPESCRIPT**

### **Types de base (rappel)**

```typescript
const name: string = 'John';
const age: number = 25;
const isActive: boolean = true;
const data: any = 'anything';  // ❌ Éviter
const nothing: null = null;
const notSet: undefined = undefined;
```

### **Interfaces vs Types**

```typescript
// INTERFACE (préféré pour objets)
interface User {
    id: number;
    name: string;
    email: string;
}

// TYPE ALIAS (plus flexible)
type ID = string | number;
type Point = { x: number; y: number };
type Callback = (data: string) => void;

// Union types
type Status = 'idle' | 'loading' | 'success' | 'error';

// Intersection types
type Admin = User & { role: 'admin' };
```

### **Interfaces pour ft_transcendence**

```typescript
// Game types
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

interface Player {
    id: string;
    socketId: string;
    paddleIndex: number;
    isReady: boolean;
}

// WebSocket messages
interface WSMessage {
    type: string;
    data: any;
}

interface PaddleMoveMessage extends WSMessage {
    type: 'paddle/move';
    data: {
        playerId: string;
        direction: 'up' | 'down';
    };
}

interface GameStateMessage extends WSMessage {
    type: 'game/state';
    data: GameState;
}
```

### **Generic types**

```typescript
// Generic function
function identity<T>(value: T): T {
    return value;
}

const num = identity<number>(42);
const str = identity<string>('hello');

// Generic interface
interface Response<T> {
    success: boolean;
    data: T;
    error?: string;
}

const userResponse: Response<User> = {
    success: true,
    data: { id: 1, name: 'John', email: 'john@example.com' }
};

// Generic class
class Queue<T> {
    private items: T[] = [];
    
    enqueue(item: T): void {
        this.items.push(item);
    }
    
    dequeue(): T | undefined {
        return this.items.shift();
    }
}

const numberQueue = new Queue<number>();
numberQueue.enqueue(1);
numberQueue.enqueue(2);
```

### **Utility types**

```typescript
interface User {
    id: number;
    name: string;
    email: string;
    password: string;
}

// Partial - Toutes propriétés optionnelles
type PartialUser = Partial<User>;
// { id?: number; name?: string; email?: string; password?: string; }

// Required - Toutes propriétés requises
type RequiredUser = Required<PartialUser>;

// Pick - Sélectionner certaines propriétés
type PublicUser = Pick<User, 'id' | 'name' | 'email'>;
// { id: number; name: string; email: string; }

// Omit - Exclure certaines propriétés
type UserWithoutPassword = Omit<User, 'password'>;
// { id: number; name: string; email: string; }

// Record - Type avec clés dynamiques
type UserRoles = Record<string, 'admin' | 'user' | 'guest'>;
// { [key: string]: 'admin' | 'user' | 'guest'; }
```

### **Type guards**

```typescript
// Type narrowing avec typeof
function processValue(value: string | number) {
    if (typeof value === 'string') {
        console.log(value.toUpperCase());  // TypeScript sait que c'est string
    } else {
        console.log(value.toFixed(2));     // TypeScript sait que c'est number
    }
}

// Type guards custom
function isUser(obj: any): obj is User {
    return obj && typeof obj.id === 'number' && typeof obj.name === 'string';
}

if (isUser(data)) {
    console.log(data.name);  // TypeScript sait que c'est User
}
```

---

# PARTIE 2 - NODE.JS

---

## **11. EVENT LOOP**

### **Concept clé**

Node.js = **Single thread** + **Event Loop** pour gérer l'asynchrone

```
┌───────────────────────────┐
│   JavaScript Call Stack   │  ← Code synchrone
└─────────────┬─────────────┘
              │
┌─────────────▼─────────────┐
│      Event Loop (libuv)   │
├───────────────────────────┤
│  1. Timers                │  setTimeout, setInterval
│  2. I/O Callbacks         │  fs, network
│  3. Poll                  │  Nouvelles connexions
│  4. Check                 │  setImmediate
│  5. Close                 │  socket.close()
└───────────────────────────┘
```

### **Ordre d'exécution**

```typescript
console.log('1. Sync');                           // 1er

setTimeout(() => console.log('4. setTimeout'), 0); // 4e (Timers phase)
setImmediate(() => console.log('5. Immediate'));   // 5e (Check phase)
process.nextTick(() => console.log('2. Tick'));    // 2e (après sync)
Promise.resolve().then(() => console.log('3. Promise')); // 3e (microtasks)

// Output:
// 1. Sync
// 2. Tick
// 3. Promise
// 4. setTimeout
// 5. Immediate
```

### **Règle d'or : Ne JAMAIS bloquer l'event loop**

```typescript
// ❌ MAUVAIS - Bloque l'event loop
function blockingOperation() {
    for (let i = 0; i < 1_000_000_000; i++) {
        // Calcul intensif
    }
}

// ✅ BON - Découper en morceaux async
async function nonBlockingOperation() {
    for (let i = 0; i < 1_000_000_000; i++) {
        if (i % 1_000_000 === 0) {
            await new Promise(resolve => setImmediate(resolve));
        }
    }
}
```

---

## **12. PROCESS**

### **Variables d'environnement**

```typescript
// Lire
const port = process.env.PORT || '3000';
const dbUrl = process.env.DATABASE_URL;
const nodeEnv = process.env.NODE_ENV;  // 'development' ou 'production'

// Fichier .env (avec package dotenv)
import 'dotenv/config';

// .env
// PORT=3000
// DATABASE_URL=/data/db.sqlite
// JWT_SECRET=my-secret-key
```

### **Arguments ligne de commande**

```typescript
// node script.js arg1 arg2
console.log(process.argv);
// [
//   '/path/to/node',
//   '/path/to/script.js',
//   'arg1',
//   'arg2'
// ]

const args = process.argv.slice(2);  // ['arg1', 'arg2']
```

### **Informations système**

```typescript
console.log(process.pid);         // Process ID
console.log(process.platform);    // 'linux', 'darwin', 'win32'
console.log(process.cwd());       // Current working directory
console.log(process.version);     // 'v20.11.0'
console.log(process.uptime());    // Secondes depuis démarrage
```

### **Contrôle du processus**

```typescript
// Quitter
process.exit(0);  // Succès
process.exit(1);  // Erreur

// Gestion signaux (CTRL+C, kill, etc.)
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    cleanup();
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('CTRL+C pressed');
    process.exit(0);
});

// Erreurs non gérées
process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    console.error('Unhandled promise rejection:', reason);
    process.exit(1);
});
```

---

## **13. FILE SYSTEM**

### **Async avec Promises (recommandé)**

```typescript
import { readFile, writeFile, mkdir, unlink } from 'fs/promises';

// Lire fichier
const data = await readFile('file.txt', 'utf8');
console.log(data);

// Écrire fichier
await writeFile('output.txt', 'Hello World', 'utf8');

// Créer répertoire
await mkdir('/data/uploads', { recursive: true });

// Supprimer fichier
await unlink('temp.txt');

// Vérifier existence
import { access } from 'fs/promises';
try {
    await access('file.txt');
    console.log('File exists');
} catch {
    console.log('File does not exist');
}

// Stats
import { stat } from 'fs/promises';
const stats = await stat('file.txt');
console.log(stats.size);         // Taille en bytes
console.log(stats.isFile());     // true
console.log(stats.isDirectory()); // false
```

### **Opérations courantes**

```typescript
import { readdir, copyFile, rename, rm } from 'fs/promises';

// Lister fichiers
const files = await readdir('/data/uploads');
console.log(files);  // ['avatar1.png', 'avatar2.jpg']

// Copier
await copyFile('source.txt', 'dest.txt');

// Renommer/Déplacer
await rename('old.txt', 'new.txt');

// Supprimer répertoire (récursif)
await rm('/tmp/folder', { recursive: true, force: true });
```

---

## **14. PATH**

### **Construction de chemins**

```typescript
import path from 'path';

// Joindre (cross-platform)
const filepath = path.join('/data', 'uploads', 'avatar.png');
// → "/data/uploads/avatar.png"

// Résolution absolue
const absolute = path.resolve('uploads', 'file.txt');
// → "/home/user/project/uploads/file.txt"

// Normaliser
const normalized = path.normalize('/data//uploads/../avatars/./file.png');
// → "/data/avatars/file.png"
```

### **Extraction d'informations**

```typescript
const filepath = '/data/uploads/avatar_123.png';

// Nom du fichier
path.basename(filepath);              // "avatar_123.png"
path.basename(filepath, '.png');      // "avatar_123"

// Extension
path.extname(filepath);               // ".png"

// Répertoire
path.dirname(filepath);               // "/data/uploads"

// Parser
path.parse(filepath);
// {
//   root: '/',
//   dir: '/data/uploads',
//   base: 'avatar_123.png',
//   ext: '.png',
//   name: 'avatar_123'
// }
```

### **Sécurité**

```typescript
// ✅ BON - Sécurisé
const filename = req.params.filename;
const filepath = path.join('/data/uploads', filename);

// Vérifier que le chemin est dans /data/uploads
if (!filepath.startsWith('/data/uploads/')) {
    throw new Error('Invalid path');
}

// ❌ MAUVAIS - Vulnérable à path traversal
const filepath = '/data/uploads/' + filename;  // ⚠️ "../../../etc/passwd"
```

---

## **15. EVENTS**

### **EventEmitter**

```typescript
import { EventEmitter } from 'events';

const emitter = new EventEmitter();

// Écouter
emitter.on('data', (value) => {
    console.log('Data:', value);
});

// Écouter une seule fois
emitter.once('ready', () => {
    console.log('Ready!');
});

// Émettre
emitter.emit('data', 42);   // → "Data: 42"
emitter.emit('ready');      // → "Ready!"
emitter.emit('ready');      // Rien (once)

// Retirer
const handler = (msg) => console.log(msg);
emitter.on('message', handler);
emitter.off('message', handler);
```

### **Classe avec EventEmitter**

```typescript
import { EventEmitter } from 'events';

class PongGame extends EventEmitter {
    private score = [0, 0];
    
    goal(playerIndex: number) {
        this.score[playerIndex]++;
        
        // Émettre événement
        this.emit('goal', {
            player: playerIndex,
            score: this.score
        });
        
        if (this.score[playerIndex] >= 5) {
            this.emit('game-over', {
                winner: playerIndex
            });
        }
    }
}

// Utilisation
const game = new PongGame();

game.on('goal', (data) => {
    console.log(`Goal for player ${data.player}!`);
});

game.on('game-over', (data) => {
    console.log(`Player ${data.winner} wins!`);
});

game.goal(0);  // → "Goal for player 0!"
```

---

## **16. TIMERS**

### **setTimeout**

```typescript
// Exécuter après délai
const timerId = setTimeout(() => {
    console.log('Executed after 2 seconds');
}, 2000);

// Annuler
clearTimeout(timerId);
```

### **setInterval**

```typescript
// Exécuter en boucle
let count = 0;
const intervalId = setInterval(() => {
    console.log('Tick:', count++);
    
    if (count >= 10) {
        clearInterval(intervalId);
    }
}, 1000);
```

### **Game loop 60 FPS**

```typescript
class GameManager {
    private gameLoop: NodeJS.Timeout | null = null;
    
    startGame() {
        let lastUpdate = Date.now();
        
        // 60 FPS = 16.67ms
        this.gameLoop = setInterval(() => {
            const now = Date.now();
            const deltaTime = now - lastUpdate;
            lastUpdate = now;
            
            // Update game
            this.game.update(deltaTime);
            this.broadcastState();
        }, 16.67);
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

# PARTIE 3 - FASTIFY

---

## **17. SETUP ET ROUTES**

### **Instance Fastify**

```typescript
import Fastify from 'fastify';

const app = Fastify({
    logger: true,  // Active Pino logger
    bodyLimit: 5 * 1024 * 1024  // 5 MB
});

// Démarrer
await app.listen({
    port: 3000,
    host: '0.0.0.0'
});
```

### **Routes**

```typescript
// GET
app.get('/users', async (req, res) => {
    const users = await db.getUsers();
    return { users };
});

// POST
app.post('/users', async (req, res) => {
    const { name, email } = req.body;
    const user = await db.createUser(name, email);
    return res.status(201).send({ user });
});

// PUT
app.put('/users/:id', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    await db.updateUser(id, { name });
    return { success: true };
});

// DELETE
app.delete('/users/:id', async (req, res) => {
    const { id } = req.params;
    await db.deleteUser(id);
    return res.status(204).send();
});
```

### **Types TypeScript**

```typescript
import { FastifyRequest, FastifyReply } from 'fastify';

app.get('/users/:id', async (
    req: FastifyRequest<{
        Params: { id: string };
        Querystring: { fields?: string };
    }>,
    res: FastifyReply
) => {
    const { id } = req.params;
    const { fields } = req.query;
    
    const user = await db.getUser(id);
    return { user };
});
```

---

## **18. REQUEST/REPLY**

### **Request**

```typescript
app.get('/info', async (req, res) => {
    // Paramètres
    const { id } = req.params;              // URL params
    const { limit, offset } = req.query;    // Query string
    const { name, email } = req.body;       // Body
    
    // Headers
    const token = req.headers.authorization;
    const contentType = req.headers['content-type'];
    
    // Cookies
    const session = req.cookies.session;
    
    // Méthode et URL
    console.log(req.method);     // 'GET', 'POST', etc.
    console.log(req.url);        // '/info?limit=10'
    console.log(req.routerPath); // '/info'
    
    // Client info
    console.log(req.ip);         // IP address
    console.log(req.hostname);   // Hostname
    
    return { info: 'ok' };
});
```

### **Reply**

```typescript
app.get('/demo', async (req, res) => {
    // Status code
    return res.status(201).send({ created: true });
    
    // Headers
    res.header('X-Custom', 'value');
    
    // Cookies
    res.cookie('session', 'abc123', {
        httpOnly: true,
        secure: true,
        maxAge: 3600000  // 1 hour
    });
    
    // Redirect
    return res.redirect('/login');
    
    // Types de réponse
    return { data: 'json' };                 // JSON
    return res.send('text');                 // Text
    return res.send(buffer);                 // Buffer
    return res.send(stream);                 // Stream
    return res.status(204).send();           // Empty
});
```

---

## **19. HOOKS**

### **Lifecycle**

```
Requête → onRequest → preParsing → preValidation → preHandler 
       → HANDLER → preSerialization → onSend → onResponse

Erreur → onError
```

### **Hooks courants**

```typescript
// Logging
app.addHook('onRequest', async (req, res) => {
    console.log(`[${req.method}] ${req.url}`);
});

// Authentication
app.addHook('preHandler', async (req, res) => {
    const token = req.headers.authorization;
    
    if (!token) {
        return res.status(401).send({ error: 'Unauthorized' });
    }
    
    try {
        const user = await verifyToken(token);
        req.user = user;  // Attache user à req
    } catch (error) {
        return res.status(401).send({ error: 'Invalid token' });
    }
});

// Metrics
app.addHook('onResponse', async (req, res) => {
    const duration = res.getResponseTime();
    metrics.record({
        method: req.method,
        path: req.routerPath,
        status: res.statusCode,
        duration
    });
});

// Error handling
app.addHook('onError', async (req, res, error) => {
    console.error('Error:', error);
});
```

---

## **20. VALIDATION**

### **JSON Schema**

```typescript
app.post('/users', {
    schema: {
        body: {
            type: 'object',
            required: ['email', 'password'],
            properties: {
                email: {
                    type: 'string',
                    format: 'email'
                },
                password: {
                    type: 'string',
                    minLength: 8
                }
            }
        },
        response: {
            201: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    userId: { type: 'string' }
                }
            }
        }
    },
    handler: async (req, res) => {
        // req.body est validé automatiquement
        const { email, password } = req.body;
        const userId = await db.createUser(email, password);
        return res.status(201).send({ success: true, userId });
    }
});
```

---

## **21. WEBSOCKET**

### **Setup**

```typescript
import websocket from '@fastify/websocket';

await app.register(websocket);

// Route WebSocket
app.get('/ws/game/:gameId', { websocket: true }, (connection, req) => {
    const socket = connection.socket;
    const { gameId } = req.params;
    
    // Recevoir
    socket.on('message', (message) => {
        const data = JSON.parse(message.toString());
        console.log('Received:', data);
        
        // Traiter
        if (data.type === 'paddle/move') {
            handlePaddleMove(data);
        }
    });
    
    // Envoyer
    socket.send(JSON.stringify({
        type: 'connected',
        gameId
    }));
    
    // Déconnexion
    socket.on('close', () => {
        console.log('Client disconnected');
    });
});
```

### **Broadcast à plusieurs clients**

```typescript
const connections = new Set<WebSocket>();

app.get('/ws/game', { websocket: true }, (connection) => {
    const socket = connection.socket;
    
    connections.add(socket);
    
    socket.on('message', (message) => {
        // Broadcast à tous
        for (const client of connections) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        }
    });
    
    socket.on('close', () => {
        connections.delete(socket);
    });
});
```

---

## **22. PLUGINS**

### **Plugins essentiels**

```typescript
// CORS
import cors from '@fastify/cors';
await app.register(cors, {
    origin: ['https://localhost:8443'],
    credentials: true
});

// Helmet (sécurité)
import helmet from '@fastify/helmet';
await app.register(helmet);

// WebSocket
import websocket from '@fastify/websocket';
await app.register(websocket);

// Cookies
import cookie from '@fastify/cookie';
await app.register(cookie, {
    secret: process.env.COOKIE_SECRET
});

// Multipart (uploads)
import multipart from '@fastify/multipart';
await app.register(multipart, {
    limits: {
        fileSize: 5 * 1024 * 1024  // 5 MB
    }
});
```

### **Plugin custom**

```typescript
async function authPlugin(app: FastifyInstance) {
    app.decorate('authenticate', async (req, res) => {
        const token = req.headers.authorization;
        
        if (!token) {
            throw new Error('No token provided');
        }
        
        const user = await verifyToken(token);
        req.user = user;
    });
}

await app.register(authPlugin);

// Utilisation
app.get('/protected', {
    preHandler: app.authenticate
}, async (req, res) => {
    return { user: req.user };
});
```

---

## **📋 RÉSUMÉ FINAL ULTRA-COMPACT**

```typescript
// ═══════════════════════════════════════════════════════════
// ESSENTIEL EN 50 LIGNES
// ═══════════════════════════════════════════════════════════

// ─── VARIABLES ───
const name: string = 'John';           // Typage
let score = 0;                         // Réassignable
const users: User[] = [];              // Array typé

// ─── FONCTIONS ───
async function fetchData(): Promise<string> {
    return await fetch('/api/data').then(r => r.text());
}
const add = (a: number, b: number) => a + b;  // Arrow function

// ─── ASYNC/AWAIT ───
try {
    const data = await fetchData();    // Attend résultat
    console.log(data);
} catch (error) {
    console.error(error);              // Gère erreur
}

// ─── DESTRUCTURING ───
const { id, name } = user;             // Objet
const [first, second] = arr;           // Array
const { id } = req.params;             // Fastify params

// ─── SPREAD ───
const copy = { ...original };          // Copie objet
const all = [...arr1, ...arr2];        // Concat arrays

// ─── CLASSES ───
class PongGame {
    private score = [0, 0];
    constructor(public id: string) {}
    update(dt: number) { /* ... */ }
}

// ─── MODULES ───
export class PongGame { /* ... */ }    // Export
import { PongGame } from './PongGame.js';  // Import (.js obligatoire!)

// ─── NODE.JS ───
import { readFile } from 'fs/promises';
const data = await readFile('file.txt', 'utf8');
const filepath = path.join('/data', 'uploads', file);

// ─── FASTIFY ───
import Fastify from 'fastify';
const app = Fastify({ logger: true });

app.get('/users/:id', async (req, res) => {
    const { id } = req.params;
    const user = await db.getUser(id);
    return { user };
});

// WebSocket
app.get('/ws', { websocket: true }, (conn) => {
    conn.socket.on('message', (msg) => {
        const data = JSON.parse(msg.toString());
        // Handle message
    });
});

await app.listen({ port: 3000, host: '0.0.0.0' });

// ─── GAME LOOP ───
setInterval(() => {
    game.update(16.67);
    broadcast(game.getState());
}, 16.67);  // 60 FPS
```

---

**🎯 Ce cheat sheet couvre TOUS les concepts essentiels pour ft_transcendence !**

**Fichiers créés :**
1. [typescript-javascript-resume.md](computer:///mnt/user-data/outputs/typescript-javascript-resume.md) - Guide détaillé TypeScript/JS
2. [fastify-nodejs-guide.md](computer:///mnt/user-data/outputs/fastify-nodejs-guide.md) - Guide complet Node.js/Fastify
3. **[concepts-syntaxes-cheatsheet.md](computer:///mnt/user-data/outputs/concepts-syntaxes-cheatsheet.md)** - Ce cheat sheet rapide

**Prochaines étapes : Commencer le code ! 🚀**
