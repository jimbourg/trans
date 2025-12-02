# 🚀 GUIDE FASTIFY ET NODE.JS POUR FT_TRANSCENDENCE

Guide complet pour développeur C/C++ débutant en Node.js et Fastify.

---

## **TABLE DES MATIÈRES**

### **PARTIE 1 : NODE.JS**
1. [Qu'est-ce que Node.js ?](#1-quest-ce-que-nodejs)
2. [Event Loop](#2-event-loop)
3. [Modules (CommonJS vs ES Modules)](#3-modules)
4. [Process](#4-process)
5. [File System (fs)](#5-file-system-fs)
6. [Path](#6-path)
7. [Buffers](#7-buffers)
8. [Streams](#8-streams)
9. [Events (EventEmitter)](#9-events-eventemitter)
10. [Timers](#10-timers)

### **PARTIE 2 : FASTIFY**
11. [Qu'est-ce que Fastify ?](#11-quest-ce-que-fastify)
12. [Architecture et Plugins](#12-architecture-et-plugins)
13. [Routes et Handlers](#13-routes-et-handlers)
14. [Request et Reply](#14-request-et-reply)
15. [Hooks (Lifecycle)](#15-hooks-lifecycle)
16. [Validation et Schemas](#16-validation-et-schemas)
17. [Plugins essentiels](#17-plugins-essentiels)
18. [WebSocket](#18-websocket)
19. [Codes HTTP et erreurs](#19-codes-http-et-erreurs)
20. [Bonnes pratiques](#20-bonnes-pratiques)

### **PARTIE 3 : PROJET**
21. [Structure recommandée](#21-structure-recommandée)
22. [Exemples concrets ft_transcendence](#22-exemples-concrets-ft_transcendence)
23. [Checklist](#23-checklist)
24. [Résumé ultra-compact](#24-résumé-ultra-compact)

---

# **PARTIE 1 : NODE.JS**

---

## **1. QU'EST-CE QUE NODE.JS ?**

### **Définition**

Node.js est un **runtime JavaScript** qui permet d'exécuter du JavaScript en dehors du navigateur.

**Composants principaux :**
- **V8** : Moteur JavaScript de Google (compile JS → code machine)
- **libuv** : Bibliothèque C pour I/O asynchrone (event loop, file system, network)
- **APIs Node.js** : fs, http, path, etc.

```
┌──────────────────────────────────────┐
│         Application JS/TS            │
├──────────────────────────────────────┤
│         Node.js APIs                 │
│  (fs, http, path, crypto, etc.)      │
├──────────────────────────────────────┤
│    V8 Engine        libuv            │
│  (JavaScript)    (Event Loop)        │
├──────────────────────────────────────┤
│      Système d'exploitation          │
│     (Linux, Windows, macOS)          │
└──────────────────────────────────────┘
```

### **Analogie C/C++**

```c
// C - Programme compilé
int main() {
    // Code exécuté directement par le CPU
    return 0;
}

// Node.js - Code interprété/compilé JIT
// V8 compile le JavaScript à la volée
```

**Différences clés :**

| Aspect | C/C++ | Node.js |
|--------|-------|---------|
| **Compilation** | AOT (Ahead Of Time) | JIT (Just In Time) |
| **Runtime** | Aucun (natif) | V8 + libuv |
| **I/O** | Bloquant par défaut | Non-bloquant par défaut |
| **Threads** | Multi-thread natif | Single-thread + Event Loop |

---

## **2. EVENT LOOP**

### **Le cœur de Node.js**

Node.js utilise un **seul thread principal** avec une **event loop** pour gérer l'asynchrone.

```
┌───────────────────────────┐
│      Call Stack           │  ← Code synchrone en cours
└─────────────┬─────────────┘
              │
┌─────────────▼─────────────┐
│    Event Loop (libuv)     │
├───────────────────────────┤
│  1. Timers (setTimeout)   │
│  2. I/O Callbacks         │
│  3. Poll (connections)    │
│  4. Check (setImmediate)  │
│  5. Close callbacks       │
└───────────────────────────┘
              │
┌─────────────▼─────────────┐
│  Callback Queue           │  ← Callbacks en attente
└───────────────────────────┘
```

### **Phases de l'Event Loop**

```javascript
// 1. TIMERS - setTimeout, setInterval
setTimeout(() => {
    console.log('Timer callback');
}, 100);

// 2. I/O CALLBACKS - Opérations système (fs, network)
fs.readFile('file.txt', (err, data) => {
    console.log('File read callback');
});

// 3. POLL - Nouvelles connexions, données I/O
server.on('connection', (socket) => {
    console.log('New connection');
});

// 4. CHECK - setImmediate
setImmediate(() => {
    console.log('Immediate callback');
});

// 5. CLOSE - Nettoyage (socket.close())
socket.on('close', () => {
    console.log('Socket closed');
});
```

### **Analogie C/C++**

```c
// Serveur C avec select() (similaire à l'event loop)
while (1) {
    fd_set read_fds;
    FD_ZERO(&read_fds);
    FD_SET(server_fd, &read_fds);
    
    // Attendre des événements (similaire à Poll phase)
    int activity = select(max_fd + 1, &read_fds, NULL, NULL, NULL);
    
    if (FD_ISSET(server_fd, &read_fds)) {
        // Nouvelle connexion
        int client = accept(server_fd, NULL, NULL);
        handle_client(client);
    }
    
    // Vérifier timers (similaire à Timers phase)
    check_timers();
}
```

### **Règle d'or**

**Ne JAMAIS bloquer l'event loop !**

```javascript
// ❌ MAUVAIS - Bloque l'event loop
function slowFunction() {
    let sum = 0;
    for (let i = 0; i < 10_000_000_000; i++) {  // 10 milliards !
        sum += i;
    }
    return sum;
}

// ✅ BON - Découper en morceaux async
async function fastFunction() {
    let sum = 0;
    for (let i = 0; i < 10_000_000_000; i++) {
        sum += i;
        
        // Libère l'event loop tous les 10 millions
        if (i % 10_000_000 === 0) {
            await new Promise(resolve => setImmediate(resolve));
        }
    }
    return sum;
}
```

---

## **3. MODULES**

### **CommonJS (ancien style)**

```javascript
// Exporter
// fichier: math.js
module.exports = {
    add: (a, b) => a + b,
    subtract: (a, b) => a - b
};

// OU
exports.add = (a, b) => a + b;
exports.subtract = (a, b) => a - b;

// Importer
const math = require('./math');
console.log(math.add(5, 3));  // 8

// OU destructuring
const { add, subtract } = require('./math');
console.log(add(5, 3));  // 8
```

### **ES Modules (moderne - ton projet)**

```javascript
// Exporter
// fichier: math.js
export const add = (a, b) => a + b;
export const subtract = (a, b) => a - b;

// OU export default
export default class Calculator {
    add(a, b) { return a + b; }
}

// Importer
import { add, subtract } from './math.js';  // ⚠️ Extension .js obligatoire
console.log(add(5, 3));  // 8

// Import default
import Calculator from './math.js';
const calc = new Calculator();
```

**Configuration pour ES Modules :**

```json
// package.json
{
  "type": "module"  // ← Active ES Modules
}
```

### **Modules built-in Node.js**

```javascript
// File System
import fs from 'fs';
import { readFile } from 'fs/promises';

// Path manipulation
import path from 'path';

// HTTP server
import http from 'http';

// Crypto
import crypto from 'crypto';

// Events
import { EventEmitter } from 'events';
```

**Analogie C/C++ :**

```c
// C
#include <stdio.h>     // Module standard
#include "mylib.h"     // Module local

// Node.js équivalent
import fs from 'fs';              // Module built-in
import { PongGame } from './PongGame.js';  // Module local
```

---

## **4. PROCESS**

### **Objet global `process`**

L'objet `process` donne accès aux informations et contrôle du processus en cours.

```javascript
// Variables d'environnement
console.log(process.env.PORT);         // "3000"
console.log(process.env.NODE_ENV);     // "production" ou "development"
console.log(process.env.DATABASE_URL); // URL de la DB

// Arguments ligne de commande
console.log(process.argv);
// ["node", "/path/to/script.js", "arg1", "arg2"]

// Informations système
console.log(process.pid);        // Process ID
console.log(process.platform);   // "linux", "darwin", "win32"
console.log(process.cwd());      // Current Working Directory
console.log(process.version);    // Version Node.js ("v20.11.0")

// Mémoire
console.log(process.memoryUsage());
// { rss: 30MB, heapTotal: 10MB, heapUsed: 5MB }

// CPU
console.log(process.cpuUsage());
// { user: 38579, system: 6986 }

// Uptime (temps écoulé depuis démarrage)
console.log(process.uptime());  // 42.5 secondes
```

### **Contrôle du processus**

```javascript
// Quitter avec code d'erreur
process.exit(0);   // Succès
process.exit(1);   // Erreur

// Gestion des signaux
process.on('SIGTERM', () => {
    console.log('SIGTERM reçu, arrêt propre...');
    server.close(() => {
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('CTRL+C pressé');
    cleanup();
    process.exit(0);
});

// Erreurs non gérées
process.on('uncaughtException', (error) => {
    console.error('Erreur non gérée:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Promise rejetée non gérée:', reason);
    process.exit(1);
});
```

**Analogie C/C++ :**

```c
// C
#include <stdlib.h>
#include <signal.h>

int main(int argc, char* argv[], char* envp[]) {
    // argc, argv = process.argv
    // envp = process.env
    
    char* port = getenv("PORT");  // process.env.PORT
    int pid = getpid();            // process.pid
    
    exit(0);  // process.exit(0)
    
    return 0;
}

// Signal handler
void sigterm_handler(int sig) {
    cleanup();
    exit(0);
}

signal(SIGTERM, sigterm_handler);  // process.on('SIGTERM', ...)
```

---

## **5. FILE SYSTEM (fs)**

### **Module `fs` - Synchrone vs Asynchrone**

```javascript
import fs from 'fs';
import { readFile, writeFile } from 'fs/promises';  // Version Promise

// ═══════════════════════════════════════
// SYNCHRONE (bloque l'event loop)
// ═══════════════════════════════════════

// Lecture
const data = fs.readFileSync('file.txt', 'utf8');
console.log(data);

// Écriture
fs.writeFileSync('output.txt', 'Hello World', 'utf8');

// Vérifier existence
if (fs.existsSync('file.txt')) {
    console.log('Fichier existe');
}

// Stats
const stats = fs.statSync('file.txt');
console.log(stats.size);       // Taille en bytes
console.log(stats.isFile());   // true
console.log(stats.isDirectory());  // false

// ═══════════════════════════════════════
// ASYNCHRONE avec Promises (recommandé)
// ═══════════════════════════════════════

// Lecture
const data = await readFile('file.txt', 'utf8');
console.log(data);

// Écriture
await writeFile('output.txt', 'Hello World', 'utf8');

// Vérifier existence
try {
    await fs.promises.access('file.txt');
    console.log('Fichier existe');
} catch {
    console.log('Fichier n\'existe pas');
}

// Stats
const stats = await fs.promises.stat('file.txt');
console.log(stats.size);
```

### **Opérations courantes**

```javascript
import fs from 'fs/promises';
import path from 'path';

// Créer un répertoire
await fs.mkdir('/data/uploads', { recursive: true });

// Lister fichiers d'un répertoire
const files = await fs.readdir('/data/uploads');
console.log(files);  // ['avatar1.png', 'avatar2.jpg']

// Copier fichier
await fs.copyFile('source.txt', 'destination.txt');

// Renommer/Déplacer
await fs.rename('old.txt', 'new.txt');

// Supprimer fichier
await fs.unlink('temp.txt');

// Supprimer répertoire (vide)
await fs.rmdir('/tmp/empty');

// Supprimer répertoire (récursif)
await fs.rm('/tmp/folder', { recursive: true, force: true });

// Lire un répertoire avec détails
const entries = await fs.readdir('/data', { withFileTypes: true });
for (const entry of entries) {
    console.log(entry.name, entry.isDirectory() ? '[DIR]' : '[FILE]');
}
```

**Analogie C/C++ :**

```c
// C
#include <stdio.h>
#include <sys/stat.h>

// Lecture synchrone (bloquante)
FILE* f = fopen("file.txt", "r");
char buffer[1024];
fread(buffer, 1, 1024, f);
fclose(f);

// Node.js équivalent
const data = fs.readFileSync('file.txt', 'utf8');

// Stats
struct stat st;
stat("file.txt", &st);
printf("Size: %ld\n", st.st_size);

// Node.js équivalent
const stats = await fs.promises.stat('file.txt');
console.log(stats.size);
```

---

## **6. PATH**

### **Module `path` - Manipulation de chemins**

```javascript
import path from 'path';

// ═══════════════════════════════════════
// CONSTRUCTION DE CHEMINS
// ═══════════════════════════════════════

// Joindre des segments de chemin (cross-platform)
const filePath = path.join('/data', 'uploads', 'avatar.png');
// → "/data/uploads/avatar.png"

// Résolution absolue
const absolutePath = path.resolve('uploads', 'avatar.png');
// → "/home/user/project/uploads/avatar.png"

// Normaliser un chemin
const normalized = path.normalize('/data//uploads/../avatars/./avatar.png');
// → "/data/avatars/avatar.png"

// ═══════════════════════════════════════
// EXTRACTION D'INFORMATIONS
// ═══════════════════════════════════════

const filePath = '/data/uploads/avatar_123.png';

// Nom du fichier avec extension
console.log(path.basename(filePath));
// → "avatar_123.png"

// Nom sans extension
console.log(path.basename(filePath, '.png'));
// → "avatar_123"

// Extension
console.log(path.extname(filePath));
// → ".png"

// Répertoire parent
console.log(path.dirname(filePath));
// → "/data/uploads"

// Décomposer un chemin
const parsed = path.parse(filePath);
console.log(parsed);
// {
//   root: '/',
//   dir: '/data/uploads',
//   base: 'avatar_123.png',
//   ext: '.png',
//   name: 'avatar_123'
// }

// Reconstruire un chemin
const formatted = path.format({
    dir: '/data/uploads',
    name: 'avatar_123',
    ext: '.png'
});
// → "/data/uploads/avatar_123.png"

// ═══════════════════════════════════════
// CHEMINS RELATIFS
// ═══════════════════════════════════════

// Chemin relatif entre deux chemins
const from = '/data/uploads';
const to = '/data/avatars/avatar.png';
console.log(path.relative(from, to));
// → "../avatars/avatar.png"

// Vérifier si un chemin est absolu
console.log(path.isAbsolute('/data/uploads'));  // true
console.log(path.isAbsolute('uploads'));        // false

// ═══════════════════════════════════════
// SÉPARATEURS (cross-platform)
// ═══════════════════════════════════════

console.log(path.sep);       // "/" sur Linux/Mac, "\\" sur Windows
console.log(path.delimiter); // ":" sur Linux/Mac, ";" sur Windows
```

### **Exemple pratique : Servir des fichiers**

```javascript
import path from 'path';
import fs from 'fs/promises';

// ✅ BON - Sécurisé avec path.join
app.get('/uploads/:filename', async (req, res) => {
    const { filename } = req.params;
    
    // path.join normalise et sécurise le chemin
    const filePath = path.join('/data/uploads', filename);
    
    // Vérifier que le chemin est bien dans /data/uploads
    if (!filePath.startsWith('/data/uploads')) {
        return res.status(403).send({ error: 'Forbidden' });
    }
    
    try {
        const data = await fs.readFile(filePath);
        return res.send(data);
    } catch (error) {
        return res.status(404).send({ error: 'File not found' });
    }
});

// ❌ MAUVAIS - Vulnérable à path traversal
app.get('/uploads/:filename', async (req, res) => {
    const { filename } = req.params;
    
    // Si filename = "../../etc/passwd"
    // → "/data/uploads/../../etc/passwd" = "/etc/passwd" ⚠️
    const filePath = '/data/uploads/' + filename;
    
    const data = await fs.readFile(filePath);
    return res.send(data);
});
```

**Analogie C/C++ :**

```c
// C
#include <string.h>
#include <limits.h>

char filepath[PATH_MAX];

// Construction de chemin (manuel en C)
snprintf(filepath, PATH_MAX, "/data/uploads/%s", filename);

// Node.js équivalent (cross-platform)
const filepath = path.join('/data/uploads', filename);
```

---

## **7. BUFFERS**

### **Qu'est-ce qu'un Buffer ?**

Un **Buffer** est un tableau d'octets en mémoire brute (comme `char[]` ou `uint8_t[]` en C).

```javascript
// Créer un Buffer
const buf1 = Buffer.from('Hello', 'utf8');
const buf2 = Buffer.from([0x48, 0x65, 0x6C, 0x6C, 0x6F]);  // "Hello" en hexa
const buf3 = Buffer.alloc(10);        // 10 bytes à zéro
const buf4 = Buffer.allocUnsafe(10);  // 10 bytes non initialisés (plus rapide)

// Accès aux données
console.log(buf1[0]);         // 72 (code ASCII de 'H')
console.log(buf1.length);     // 5

// Conversion
console.log(buf1.toString());           // "Hello"
console.log(buf1.toString('hex'));      // "48656c6c6f"
console.log(buf1.toString('base64'));   // "SGVsbG8="

// Manipulation
buf1[0] = 0x68;  // Remplace 'H' par 'h'
console.log(buf1.toString());  // "hello"

// Copie
const buf5 = Buffer.from(buf1);  // Copie profonde
buf1.copy(buf5, 0, 0, 5);       // Copie manuelle

// Slice (vue, pas copie)
const slice = buf1.subarray(0, 3);
console.log(slice.toString());  // "hel"

// Concaténation
const buf6 = Buffer.concat([buf1, buf2]);

// Comparaison
console.log(buf1.equals(buf2));  // false
console.log(buf1.compare(buf2)); // -1, 0, ou 1
```

### **Cas d'usage**

```javascript
// 1. Lecture fichier binaire
const imageData = await fs.readFile('avatar.png');  // Buffer
console.log(imageData instanceof Buffer);  // true

// 2. Envoi via WebSocket (binaire)
connection.socket.send(imageData);

// 3. Hachage cryptographique
import crypto from 'crypto';
const hash = crypto.createHash('sha256');
hash.update(Buffer.from('password'));
const digest = hash.digest();  // Buffer

// 4. Manipulation de données réseau
const packet = Buffer.alloc(8);
packet.writeUInt32BE(0x12345678, 0);  // Écriture big-endian
packet.writeUInt32LE(0xABCDEF00, 4);  // Écriture little-endian
```

**Analogie C/C++ :**

```c
// C
unsigned char buffer[1024];

// Lecture fichier
FILE* f = fopen("data.bin", "rb");
fread(buffer, 1, 1024, f);
fclose(f);

// Manipulation
buffer[0] = 0x48;

// Node.js équivalent
const buffer = Buffer.alloc(1024);
const data = await fs.readFile('data.bin');  // Retourne Buffer
buffer[0] = 0x48;
```

---

## **8. STREAMS**

### **Qu'est-ce qu'un Stream ?**

Un **Stream** est un flux de données traité par morceaux (chunks) au lieu de tout charger en mémoire.

**Types de Streams :**
1. **Readable** : Lecture (ex: `fs.createReadStream`)
2. **Writable** : Écriture (ex: `fs.createWriteStream`)
3. **Duplex** : Lecture + Écriture (ex: socket TCP)
4. **Transform** : Transformation en transit (ex: compression)

```
Readable Stream → Transform Stream → Writable Stream
    (fichier)        (compression)       (réseau)
```

### **Exemples**

```javascript
import fs from 'fs';

// ═══════════════════════════════════════
// READABLE STREAM (lecture)
// ═══════════════════════════════════════

const readStream = fs.createReadStream('large-file.txt', {
    encoding: 'utf8',
    highWaterMark: 64 * 1024  // Chunk de 64 KB
});

readStream.on('data', (chunk) => {
    console.log('Chunk reçu:', chunk.length, 'bytes');
    // Traiter le chunk
});

readStream.on('end', () => {
    console.log('Lecture terminée');
});

readStream.on('error', (error) => {
    console.error('Erreur:', error);
});

// ═══════════════════════════════════════
// WRITABLE STREAM (écriture)
// ═══════════════════════════════════════

const writeStream = fs.createWriteStream('output.txt');

writeStream.write('Ligne 1\n');
writeStream.write('Ligne 2\n');
writeStream.end('Dernière ligne\n');

writeStream.on('finish', () => {
    console.log('Écriture terminée');
});

// ═══════════════════════════════════════
// PIPE (chaînage)
// ═══════════════════════════════════════

// Copier un fichier (mémoire constante)
const source = fs.createReadStream('input.txt');
const destination = fs.createWriteStream('output.txt');

source.pipe(destination);

// Compression à la volée
import { createGzip } from 'zlib';

fs.createReadStream('file.txt')
    .pipe(createGzip())
    .pipe(fs.createWriteStream('file.txt.gz'));

// ═══════════════════════════════════════
// BACKPRESSURE (contrôle de flux)
// ═══════════════════════════════════════

const reader = fs.createReadStream('large.txt');
const writer = fs.createWriteStream('output.txt');

reader.on('data', (chunk) => {
    const canWrite = writer.write(chunk);
    
    if (!canWrite) {
        // Buffer plein, pause lecture
        reader.pause();
    }
});

writer.on('drain', () => {
    // Buffer vidé, reprend lecture
    reader.resume();
});
```

### **Avantages des Streams**

```javascript
// ❌ MAUVAIS - Charge 1 GB en mémoire
const data = await fs.readFile('huge-video.mp4');  // 1 GB en RAM !
res.send(data);

// ✅ BON - Streaming (mémoire constante ~64 KB)
const stream = fs.createReadStream('huge-video.mp4');
stream.pipe(res);
```

**Analogie C/C++ :**

```c
// C - Lecture par chunks (équivalent stream)
FILE* f = fopen("large-file.txt", "r");
char buffer[64 * 1024];  // 64 KB

while (!feof(f)) {
    size_t read = fread(buffer, 1, sizeof(buffer), f);
    // Traiter le chunk
    process_chunk(buffer, read);
}

fclose(f);

// Node.js équivalent
fs.createReadStream('large-file.txt')
    .on('data', (chunk) => {
        // Traiter le chunk
        processChunk(chunk);
    });
```

---

## **9. EVENTS (EventEmitter)**

### **Pattern Observer en Node.js**

```javascript
import { EventEmitter } from 'events';

// Créer un EventEmitter
const emitter = new EventEmitter();

// Écouter un événement
emitter.on('data', (value) => {
    console.log('Data reçue:', value);
});

// Émettre un événement
emitter.emit('data', 42);  // → "Data reçue: 42"

// Écouter une seule fois
emitter.once('ready', () => {
    console.log('Prêt !');
});

emitter.emit('ready');  // → "Prêt !"
emitter.emit('ready');  // → Rien (once)

// Retirer un listener
const handler = (msg) => console.log(msg);
emitter.on('message', handler);
emitter.off('message', handler);  // Retire le listener

// Retirer tous les listeners
emitter.removeAllListeners('data');

// Nombre de listeners
console.log(emitter.listenerCount('data'));
```

### **Classe custom avec EventEmitter**

```javascript
import { EventEmitter } from 'events';

class PongGame extends EventEmitter {
    constructor() {
        super();
        this.score = [0, 0];
    }
    
    goal(playerIndex: number) {
        this.score[playerIndex]++;
        
        // Émettre événement
        this.emit('goal', {
            player: playerIndex,
            score: this.score
        });
        
        if (this.score[playerIndex] >= 5) {
            this.emit('game-over', {
                winner: playerIndex,
                score: this.score
            });
        }
    }
}

// Utilisation
const game = new PongGame();

game.on('goal', (data) => {
    console.log(`Goal pour joueur ${data.player}!`);
    console.log('Score:', data.score);
});

game.on('game-over', (data) => {
    console.log(`Joueur ${data.winner} gagne!`);
    // Sauvegarder résultat en DB
});

game.goal(0);  // → "Goal pour joueur 0!"
game.goal(0);  // → "Goal pour joueur 0!"
// ... etc jusqu'à 5 goals
// → "Joueur 0 gagne!"
```

**Analogie C/C++ :**

```c
// C - Callbacks manuels (équivalent EventEmitter)
typedef void (*callback_fn)(void* data);

typedef struct {
    callback_fn callbacks[10];
    int callback_count;
} EventEmitter;

void emit(EventEmitter* emitter, void* data) {
    for (int i = 0; i < emitter->callback_count; i++) {
        emitter->callbacks[i](data);
    }
}

// Node.js équivalent (plus simple)
emitter.on('event', (data) => console.log(data));
emitter.emit('event', { value: 42 });
```

---

## **10. TIMERS**

### **Fonctions de temporisation**

```javascript
// ═══════════════════════════════════════
// setTimeout - Exécute UNE fois après délai
// ═══════════════════════════════════════

const timerId = setTimeout(() => {
    console.log('Exécuté après 2 secondes');
}, 2000);

// Annuler
clearTimeout(timerId);

// ═══════════════════════════════════════
// setInterval - Exécute en boucle
// ═══════════════════════════════════════

let count = 0;
const intervalId = setInterval(() => {
    console.log('Tick:', count++);
    
    if (count >= 10) {
        clearInterval(intervalId);
    }
}, 1000);

// ═══════════════════════════════════════
// setImmediate - Exécute après I/O (phase Check)
// ═══════════════════════════════════════

setImmediate(() => {
    console.log('Exécuté dans la prochaine itération de l\'event loop');
});

// ═══════════════════════════════════════
// process.nextTick - Exécute AVANT la prochaine phase
// ═══════════════════════════════════════

process.nextTick(() => {
    console.log('Exécuté avant toute I/O');
});

// Ordre d'exécution :
console.log('1. Synchrone');
setTimeout(() => console.log('4. setTimeout'), 0);
setImmediate(() => console.log('5. setImmediate'));
process.nextTick(() => console.log('2. nextTick'));
Promise.resolve().then(() => console.log('3. Promise'));

// Output :
// 1. Synchrone
// 2. nextTick
// 3. Promise
// 4. setTimeout
// 5. setImmediate
```

### **Game Loop avec setInterval**

```javascript
class GameManager {
    private gameLoop: NodeJS.Timeout | null = null;
    private game: PongGame;
    private lastUpdate: number;
    
    startGame() {
        this.lastUpdate = Date.now();
        
        // 60 FPS = 1000ms / 60 = 16.67ms
        this.gameLoop = setInterval(() => {
            const now = Date.now();
            const deltaTime = now - this.lastUpdate;
            this.lastUpdate = now;
            
            // Update game state
            this.game.update(deltaTime);
            
            // Broadcast to all players
            this.broadcastState();
        }, 16.67);
    }
    
    stopGame() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
    }
    
    private broadcastState() {
        const state = this.game.getState();
        
        for (const connection of this.connections) {
            connection.socket.send(JSON.stringify({
                type: 'game/state',
                data: state
            }));
        }
    }
}
```

**Analogie C/C++ :**

```c
// C - Timer avec alarm() ou threads
#include <signal.h>
#include <unistd.h>

void timer_handler(int sig) {
    // Exécuté toutes les secondes
    update_game();
}

int main() {
    signal(SIGALRM, timer_handler);
    alarm(1);  // Déclenche SIGALRM après 1 seconde
    
    while (1) {
        pause();  // Attend le signal
        alarm(1);  // Re-arme le timer
    }
}

// Node.js équivalent (beaucoup plus simple)
setInterval(() => {
    update_game();
}, 1000);
```

---

# **PARTIE 2 : FASTIFY**

---

## **11. QU'EST-CE QUE FASTIFY ?**

### **Définition**

Fastify est un **framework web ultra-rapide** pour Node.js, conçu pour être :
- ⚡ **Rapide** : ~30 000 req/s (vs Express ~15 000 req/s)
- 🔒 **Sécurisé** : Validation automatique, protection XSS
- 🧩 **Modulaire** : Architecture plugin
- 📝 **TypeScript-friendly** : Support natif

### **Comparaison avec autres frameworks**

| Framework | Req/sec | Philosophie |
|-----------|---------|-------------|
| **Fastify** | 30k | Performance + Validation |
| **Express** | 15k | Simplicité + Écosystème |
| **Koa** | 20k | Minimaliste + Async/Await |
| **Hapi** | 10k | Configuration + Validation |

### **Installation et setup de base**

```typescript
import Fastify from 'fastify';

// Créer l'instance Fastify
const app = Fastify({
    logger: true  // Active le logger Pino
});

// Route simple
app.get('/', async (req, res) => {
    return { hello: 'world' };
});

// Démarrer le serveur
await app.listen({ port: 3000, host: '0.0.0.0' });
console.log('Server running on http://localhost:3000');
```

**Analogie C/C++ :**

```c
// Serveur HTTP minimal en C
int server_fd = socket(AF_INET, SOCK_STREAM, 0);
bind(server_fd, ...);
listen(server_fd, 10);

while (1) {
    int client = accept(server_fd, ...);
    handle_request(client);
    close(client);
}

// Fastify équivalent (abstraction haut niveau)
const app = Fastify();
app.get('/', async (req, res) => { return { data: 'response' }; });
await app.listen({ port: 3000 });
```

---

## **12. ARCHITECTURE ET PLUGINS**

### **Système de plugins Fastify**

Un **plugin** est une fonction qui étend les capacités de Fastify.

```typescript
import { FastifyInstance } from 'fastify';

// Plugin simple
async function myPlugin(app: FastifyInstance) {
    // Décorateur (ajoute une propriété à l'instance)
    app.decorate('myUtility', () => {
        return 'Hello from plugin';
    });
    
    // Routes
    app.get('/plugin-route', async (req, res) => {
        return { message: app.myUtility() };
    });
}

// Enregistrer le plugin
await app.register(myPlugin);

// Utiliser le décorateur
console.log(app.myUtility());  // "Hello from plugin"
```

### **Plugins externes (npm)**

```typescript
// CORS
import cors from '@fastify/cors';
await app.register(cors, {
    origin: ['https://localhost:8443'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
});

// Helmet (sécurité HTTP headers)
import helmet from '@fastify/helmet';
await app.register(helmet, {
    contentSecurityPolicy: false
});

// WebSocket
import websocket from '@fastify/websocket';
await app.register(websocket);

// Cookies
import cookie from '@fastify/cookie';
await app.register(cookie, {
    secret: 'my-secret-key'
});

// Multipart (upload fichiers)
import multipart from '@fastify/multipart';
await app.register(multipart, {
    limits: {
        fileSize: 5 * 1024 * 1024  // 5 MB
    }
});
```

### **Encapsulation (scope isolé)**

```typescript
// Plugin avec scope isolé
await app.register(async (childApp) => {
    // Ce middleware s'applique SEULEMENT dans ce scope
    childApp.addHook('onRequest', async (req, res) => {
        console.log('Hook du plugin');
    });
    
    // Routes isolées
    childApp.get('/admin', async (req, res) => {
        return { admin: true };
    });
});

// Cette route N'EST PAS affectée par le hook ci-dessus
app.get('/public', async (req, res) => {
    return { public: true };
});
```

**Avantage :** Organisation modulaire du code.

---

## **13. ROUTES ET HANDLERS**

### **Méthodes HTTP**

```typescript
// GET
app.get('/users', async (req, res) => {
    const users = await db.query('SELECT * FROM users');
    return { users };
});

// POST
app.post('/users', async (req, res) => {
    const { name, email } = req.body;
    const user = await db.insert({ name, email });
    return { user };
});

// PUT
app.put('/users/:id', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    await db.update(id, { name });
    return { success: true };
});

// DELETE
app.delete('/users/:id', async (req, res) => {
    const { id } = req.params;
    await db.delete(id);
    return { success: true };
});

// PATCH
app.patch('/users/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    await db.update(id, updates);
    return { success: true };
});

// HEAD (comme GET mais sans body)
app.head('/users/:id', async (req, res) => {
    const { id } = req.params;
    const exists = await db.exists(id);
    
    if (exists) {
        return res.status(200).send();
    } else {
        return res.status(404).send();
    }
});

// OPTIONS (CORS preflight)
app.options('/users', async (req, res) => {
    return res.status(204).send();
});
```

### **Paramètres d'URL**

```typescript
// Paramètres de route (:id, :name, etc.)
app.get('/users/:id', async (
    req: FastifyRequest<{ Params: { id: string } }>,
    res
) => {
    const { id } = req.params;
    const user = await db.getUser(id);
    return { user };
});

// Plusieurs paramètres
app.get('/users/:userId/posts/:postId', async (
    req: FastifyRequest<{ Params: { userId: string; postId: string } }>,
    res
) => {
    const { userId, postId } = req.params;
    const post = await db.getPost(userId, postId);
    return { post };
});

// Query parameters (?key=value)
app.get('/search', async (
    req: FastifyRequest<{ Querystring: { q: string; limit?: number } }>,
    res
) => {
    const { q, limit = 10 } = req.query;
    const results = await db.search(q, limit);
    return { results };
});

// Body (POST/PUT)
app.post('/users', async (
    req: FastifyRequest<{ Body: { name: string; email: string } }>,
    res
) => {
    const { name, email } = req.body;
    const user = await db.createUser(name, email);
    return { user };
});

// Headers
app.get('/protected', async (req, res) => {
    const token = req.headers.authorization;
    
    if (!token) {
        return res.status(401).send({ error: 'Unauthorized' });
    }
    
    // Vérifier token...
    return { data: 'secret' };
});
```

### **Route avec options**

```typescript
app.get('/users', {
    // Schema de validation
    schema: {
        querystring: {
            type: 'object',
            properties: {
                limit: { type: 'number', default: 10 },
                offset: { type: 'number', default: 0 }
            }
        },
        response: {
            200: {
                type: 'object',
                properties: {
                    users: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                id: { type: 'number' },
                                name: { type: 'string' }
                            }
                        }
                    }
                }
            }
        }
    },
    
    // Handler
    handler: async (req, res) => {
        const { limit, offset } = req.query;
        const users = await db.getUsers(limit, offset);
        return { users };
    }
});
```

---

## **14. REQUEST ET REPLY**

### **Objet Request**

```typescript
app.get('/info', async (req, res) => {
    // Paramètres d'URL
    console.log(req.params);      // { id: '123' }
    
    // Query string
    console.log(req.query);       // { search: 'test', limit: '10' }
    
    // Body (POST/PUT)
    console.log(req.body);        // { name: 'John', email: '...' }
    
    // Headers
    console.log(req.headers);
    console.log(req.headers['content-type']);
    console.log(req.headers['authorization']);
    
    // Cookies
    console.log(req.cookies);     // { session: 'abc123' }
    
    // Méthode HTTP
    console.log(req.method);      // 'GET', 'POST', etc.
    
    // URL
    console.log(req.url);         // '/info?search=test'
    console.log(req.routerPath);  // '/info'
    
    // IP du client
    console.log(req.ip);          // '192.168.1.100'
    
    // Hostname
    console.log(req.hostname);    // 'api.localhost'
    
    // Protocol
    console.log(req.protocol);    // 'http' ou 'https'
    
    // Custom properties (via decorators)
    console.log(req.user);        // Ajouté par middleware auth
    
    return { info: 'ok' };
});
```

### **Objet Reply**

```typescript
app.get('/demo', async (req, res) => {
    // ═══════════════════════════════════════
    // STATUS CODE
    // ═══════════════════════════════════════
    
    return res.status(201).send({ created: true });
    
    // ═══════════════════════════════════════
    // HEADERS
    // ═══════════════════════════════════════
    
    res.header('X-Custom-Header', 'value');
    res.header('Content-Type', 'application/json');
    
    // Multiple headers
    res.headers({
        'X-Header-1': 'value1',
        'X-Header-2': 'value2'
    });
    
    // ═══════════════════════════════════════
    // COOKIES
    // ═══════════════════════════════════════
    
    res.cookie('session', 'abc123', {
        httpOnly: true,
        secure: true,
        maxAge: 3600000  // 1 heure en ms
    });
    
    res.clearCookie('session');
    
    // ═══════════════════════════════════════
    // REDIRECTS
    // ═══════════════════════════════════════
    
    return res.redirect(301, 'https://example.com');
    return res.redirect('/login');  // 302 par défaut
    
    // ═══════════════════════════════════════
    // TYPES DE RÉPONSE
    // ═══════════════════════════════════════
    
    // JSON (automatique avec return)
    return { data: 'json' };
    
    // JSON manuel
    return res.send({ data: 'json' });
    
    // Texte brut
    res.type('text/plain');
    return res.send('Hello World');
    
    // HTML
    res.type('text/html');
    return res.send('<h1>Hello</h1>');
    
    // Buffer (binaire)
    const buffer = Buffer.from('data');
    return res.send(buffer);
    
    // Stream
    const stream = fs.createReadStream('file.txt');
    return res.send(stream);
    
    // Vide (204 No Content)
    return res.status(204).send();
    
    // ═══════════════════════════════════════
    // ERREURS
    // ═══════════════════════════════════════
    
    if (!user) {
        return res.status(404).send({ error: 'User not found' });
    }
    
    // OU avec throw (attrapé par error handler)
    if (!user) {
        throw new Error('User not found');
    }
});
```

---

## **15. HOOKS (LIFECYCLE)**

### **Cycle de vie d'une requête**

```
Requête entrante
    ↓
onRequest       ← Première étape (vérif IP, rate limiting)
    ↓
preParsing      ← Avant parsing body (logs, compression)
    ↓
preValidation   ← Avant validation (authz, JWT decode)
    ↓
preHandler      ← Juste avant handler (authz, permissions)
    ↓
HANDLER         ← Votre code
    ↓
preSerialization ← Avant sérialisation réponse
    ↓
onSend          ← Avant envoi réponse (logs, compression)
    ↓
onResponse      ← Après envoi (metrics, cleanup)
    ↓
Réponse envoyée

onError         ← Si erreur à n'importe quelle étape
```

### **Hooks courants**

```typescript
// ═══════════════════════════════════════
// onRequest - Première étape
// ═══════════════════════════════════════

app.addHook('onRequest', async (req, res) => {
    console.log(`[${req.method}] ${req.url}`);
    
    // Rate limiting basique
    const ip = req.ip;
    if (tooManyRequests(ip)) {
        return res.status(429).send({ error: 'Too many requests' });
    }
});

// ═══════════════════════════════════════
// preHandler - Authentification
// ═══════════════════════════════════════

app.addHook('preHandler', async (req, res) => {
    const token = req.headers.authorization;
    
    if (!token) {
        return res.status(401).send({ error: 'Unauthorized' });
    }
    
    try {
        const user = await verifyToken(token);
        req.user = user;  // Attache user à la requête
    } catch (error) {
        return res.status(401).send({ error: 'Invalid token' });
    }
});

// ═══════════════════════════════════════
// onResponse - Logging/Metrics
// ═══════════════════════════════════════

app.addHook('onResponse', async (req, res) => {
    const duration = res.getResponseTime();
    console.log(`${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
    
    // Envoyer à système de monitoring
    metrics.record({
        method: req.method,
        path: req.routerPath,
        status: res.statusCode,
        duration
    });
});

// ═══════════════════════════════════════
// onError - Gestion d'erreurs globale
// ═══════════════════════════════════════

app.addHook('onError', async (req, res, error) => {
    console.error('Erreur:', error);
    
    // Log dans fichier/service
    logger.error({
        method: req.method,
        url: req.url,
        error: error.message,
        stack: error.stack
    });
});

// ═══════════════════════════════════════
// Hook spécifique à une route
// ═══════════════════════════════════════

app.get('/protected', {
    onRequest: async (req, res) => {
        // S'applique SEULEMENT à cette route
        if (!req.headers['x-api-key']) {
            return res.status(403).send({ error: 'Forbidden' });
        }
    },
    handler: async (req, res) => {
        return { data: 'protected' };
    }
});
```

### **Exemple : Middleware d'authentification**

```typescript
// middleware/auth.ts
export async function authPlugin(app: FastifyInstance) {
    app.addHook('preHandler', async (req, res) => {
        // Liste des routes publiques
        const publicRoutes = ['/auth/login', '/auth/signup', '/health'];
        
        if (publicRoutes.includes(req.routerPath)) {
            return;  // Skip authentication
        }
        
        // Vérifier JWT
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).send({ error: 'Unauthorized' });
        }
        
        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET);
            req.user = payload;  // Attache user à req
        } catch (error) {
            return res.status(401).send({ error: 'Invalid token' });
        }
    });
}

// index.ts
await app.register(authPlugin);

// Maintenant toutes les routes sont protégées sauf publicRoutes
app.get('/profile', async (req, res) => {
    // req.user est disponible ici
    const userId = req.user.id;
    const profile = await db.getProfile(userId);
    return { profile };
});
```

---

## **16. VALIDATION ET SCHEMAS**

### **JSON Schema**

Fastify utilise **JSON Schema** pour valider automatiquement les données.

```typescript
app.post('/users', {
    schema: {
        // Validation du body
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
                },
                displayName: {
                    type: 'string',
                    minLength: 3,
                    maxLength: 24
                }
            },
            additionalProperties: false  // Refuse propriétés inconnues
        },
        
        // Validation de la réponse
        response: {
            201: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    userId: { type: 'string' }
                }
            },
            400: {
                type: 'object',
                properties: {
                    error: { type: 'string' }
                }
            }
        }
    },
    
    handler: async (req, res) => {
        // req.body est déjà validé ici !
        const { email, password, displayName } = req.body;
        
        // Si validation échoue, Fastify retourne automatiquement 400
        
        const userId = await db.createUser({ email, password, displayName });
        
        return res.status(201).send({
            success: true,
            userId
        });
    }
});
```

### **Validation avec Zod (alternative)**

```typescript
import { z } from 'zod';

// Définir le schéma Zod
const SignupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    displayName: z.string().min(3).max(24)
});

app.post('/users', async (req, res) => {
    try {
        // Valider avec Zod
        const data = SignupSchema.parse(req.body);
        
        const userId = await db.createUser(data);
        
        return res.status(201).send({
            success: true,
            userId
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).send({
                error: 'Validation failed',
                details: error.errors
            });
        }
        
        throw error;
    }
});
```

### **Types de validation**

```typescript
app.get('/search', {
    schema: {
        // Query parameters
        querystring: {
            type: 'object',
            properties: {
                q: { type: 'string' },
                limit: { type: 'integer', minimum: 1, maximum: 100 },
                offset: { type: 'integer', minimum: 0 }
            },
            required: ['q']
        },
        
        // Paramètres d'URL
        params: {
            type: 'object',
            properties: {
                id: { type: 'string', pattern: '^[0-9]+$' }
            }
        },
        
        // Headers
        headers: {
            type: 'object',
            properties: {
                'x-api-key': { type: 'string' }
            },
            required: ['x-api-key']
        }
    },
    
    handler: async (req, res) => {
        // Toutes les données sont validées
        const { q, limit = 10, offset = 0 } = req.query;
        // ...
    }
});
```

---

## **17. PLUGINS ESSENTIELS**

### **@fastify/cors**

```typescript
import cors from '@fastify/cors';

await app.register(cors, {
    // Origines autorisées
    origin: [
        'https://localhost:8443',
        'https://app.localhost:8443',
        /\.example\.com$/  // Regex
    ],
    
    // Méthodes HTTP autorisées
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    
    // Headers autorisés
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language'],
    
    // Expose headers au client
    exposedHeaders: ['X-Total-Count'],
    
    // Autorise cookies/credentials
    credentials: true,
    
    // Cache preflight (secondes)
    maxAge: 86400
});
```

### **@fastify/helmet**

```typescript
import helmet from '@fastify/helmet';

await app.register(helmet, {
    // Content Security Policy
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:']
        }
    },
    
    // Désactiver certains headers si nécessaire
    crossOriginResourcePolicy: false
});
```

### **@fastify/websocket**

```typescript
import websocket from '@fastify/websocket';

await app.register(websocket);

// Route WebSocket
app.get('/ws/game', { websocket: true }, (connection, req) => {
    // Connection établie
    console.log('Client connecté');
    
    // Recevoir message
    connection.socket.on('message', (message) => {
        const data = JSON.parse(message.toString());
        console.log('Message reçu:', data);
        
        // Traiter message
        if (data.type === 'paddle/move') {
            handlePaddleMove(data);
        }
    });
    
    // Envoyer message
    connection.socket.send(JSON.stringify({
        type: 'connected',
        id: generateId()
    }));
    
    // Déconnexion
    connection.socket.on('close', () => {
        console.log('Client déconnecté');
    });
    
    // Erreur
    connection.socket.on('error', (error) => {
        console.error('Erreur WebSocket:', error);
    });
});
```

### **@fastify/cookie**

```typescript
import cookie from '@fastify/cookie';

await app.register(cookie, {
    secret: process.env.COOKIE_SECRET,  // Pour signature
    parseOptions: {}
});

// Utilisation
app.get('/set-cookie', async (req, res) => {
    res.cookie('session', 'abc123', {
        httpOnly: true,    // Pas accessible en JS
        secure: true,      // HTTPS seulement
        sameSite: 'strict',
        maxAge: 3600000    // 1 heure
    });
    
    return { success: true };
});

app.get('/get-cookie', async (req, res) => {
    const session = req.cookies.session;
    return { session };
});

app.get('/clear-cookie', async (req, res) => {
    res.clearCookie('session');
    return { success: true };
});
```

### **@fastify/multipart**

```typescript
import multipart from '@fastify/multipart';

await app.register(multipart, {
    limits: {
        fileSize: 5 * 1024 * 1024,  // 5 MB
        files: 1                      // Max 1 fichier
    }
});

// Upload fichier
app.post('/upload', async (req, res) => {
    const data = await req.file();
    
    if (!data) {
        return res.status(400).send({ error: 'No file uploaded' });
    }
    
    // Valider type MIME
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(data.mimetype)) {
        return res.status(400).send({ error: 'Invalid file type' });
    }
    
    // Sauvegarder
    const filename = `${Date.now()}-${data.filename}`;
    const filepath = path.join('/data/uploads', filename);
    
    await pipeline(data.file, fs.createWriteStream(filepath));
    
    return { filename };
});
```

---

## **18. WEBSOCKET**

### **Gestion multi-clients**

```typescript
import { WebSocket } from '@fastify/websocket';

// Stocker les connexions actives
const connections = new Set<WebSocket>();

app.get('/ws/game', { websocket: true }, (connection, req) => {
    const socket = connection.socket;
    
    // Ajouter à la liste
    connections.add(socket);
    console.log(`Client connecté. Total: ${connections.size}`);
    
    // Message de bienvenue
    socket.send(JSON.stringify({
        type: 'connected',
        timestamp: Date.now()
    }));
    
    // Recevoir message
    socket.on('message', (message) => {
        const data = JSON.parse(message.toString());
        
        // Broadcast à tous les clients
        for (const client of connections) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    type: 'broadcast',
                    data
                }));
            }
        }
    });
    
    // Déconnexion
    socket.on('close', () => {
        connections.delete(socket);
        console.log(`Client déconnecté. Total: ${connections.size}`);
    });
});
```

### **Game loop avec WebSocket**

```typescript
class GameManager {
    private games = new Map<string, PongGame>();
    private connections = new Map<string, Set<WebSocket>>();
    
    startGame(gameId: string) {
        const game = new PongGame();
        this.games.set(gameId, game);
        this.connections.set(gameId, new Set());
        
        // Game loop à 60 FPS
        const interval = setInterval(() => {
            game.update(16.67);
            this.broadcastState(gameId);
        }, 16.67);
        
        // Arrêter après 5 minutes
        setTimeout(() => {
            clearInterval(interval);
            this.endGame(gameId);
        }, 5 * 60 * 1000);
    }
    
    private broadcastState(gameId: string) {
        const game = this.games.get(gameId);
        const connections = this.connections.get(gameId);
        
        if (!game || !connections) return;
        
        const state = game.getState();
        const message = JSON.stringify({
            type: 'game/state',
            data: state
        });
        
        for (const socket of connections) {
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(message);
            }
        }
    }
    
    addConnection(gameId: string, socket: WebSocket) {
        const connections = this.connections.get(gameId);
        if (connections) {
            connections.add(socket);
        }
    }
    
    removeConnection(gameId: string, socket: WebSocket) {
        const connections = this.connections.get(gameId);
        if (connections) {
            connections.delete(socket);
        }
    }
}

const gameManager = new GameManager();

app.get('/ws/game/:gameId', { websocket: true }, (connection, req) => {
    const { gameId } = req.params;
    const socket = connection.socket;
    
    gameManager.addConnection(gameId, socket);
    
    socket.on('close', () => {
        gameManager.removeConnection(gameId, socket);
    });
});
```

---

## **19. CODES HTTP ET ERREURS**

### **Codes de statut HTTP courants**

```typescript
// ═══════════════════════════════════════
// 2xx - Succès
// ═══════════════════════════════════════

// 200 OK - Succès standard
app.get('/users', async (req, res) => {
    const users = await db.getUsers();
    return { users };  // 200 par défaut
});

// 201 Created - Ressource créée
app.post('/users', async (req, res) => {
    const user = await db.createUser(req.body);
    return res.status(201).send({ user });
});

// 204 No Content - Succès sans contenu
app.delete('/users/:id', async (req, res) => {
    await db.deleteUser(req.params.id);
    return res.status(204).send();
});

// ═══════════════════════════════════════
// 3xx - Redirections
// ═══════════════════════════════════════

// 301 Moved Permanently
return res.redirect(301, 'https://newdomain.com');

// 302 Found (redirection temporaire)
return res.redirect('/login');

// 304 Not Modified (cache)
if (req.headers['if-none-match'] === etag) {
    return res.status(304).send();
}

// ═══════════════════════════════════════
// 4xx - Erreurs client
// ═══════════════════════════════════════

// 400 Bad Request - Données invalides
if (!req.body.email) {
    return res.status(400).send({ error: 'Email required' });
}

// 401 Unauthorized - Non authentifié
if (!req.headers.authorization) {
    return res.status(401).send({ error: 'Unauthorized' });
}

// 403 Forbidden - Pas les permissions
if (req.user.role !== 'admin') {
    return res.status(403).send({ error: 'Forbidden' });
}

// 404 Not Found - Ressource inexistante
const user = await db.getUser(id);
if (!user) {
    return res.status(404).send({ error: 'User not found' });
}

// 409 Conflict - Conflit (ex: email déjà existant)
if (await db.emailExists(email)) {
    return res.status(409).send({ error: 'Email already exists' });
}

// 422 Unprocessable Entity - Validation échouée
if (password.length < 8) {
    return res.status(422).send({ error: 'Password too short' });
}

// 429 Too Many Requests - Rate limiting
if (rateLimiter.isExceeded(req.ip)) {
    return res.status(429).send({ error: 'Too many requests' });
}

// ═══════════════════════════════════════
// 5xx - Erreurs serveur
// ═══════════════════════════════════════

// 500 Internal Server Error
try {
    await db.query('...');
} catch (error) {
    console.error(error);
    return res.status(500).send({ error: 'Internal server error' });
}

// 503 Service Unavailable
if (!db.isConnected()) {
    return res.status(503).send({ error: 'Service unavailable' });
}
```

### **Error Handler global**

```typescript
// Gestion d'erreurs globale
app.setErrorHandler(async (error, req, res) => {
    // Logger l'erreur
    req.log.error(error);
    
    // Erreur de validation Fastify
    if (error.validation) {
        return res.status(400).send({
            error: 'Validation failed',
            details: error.validation
        });
    }
    
    // Erreur custom
    if (error.statusCode) {
        return res.status(error.statusCode).send({
            error: error.message
        });
    }
    
    // Erreur inconnue
    return res.status(500).send({
        error: 'Internal server error'
    });
});

// Erreur custom
class NotFoundError extends Error {
    statusCode = 404;
    
    constructor(message: string) {
        super(message);
        this.name = 'NotFoundError';
    }
}

// Utilisation
app.get('/users/:id', async (req, res) => {
    const user = await db.getUser(req.params.id);
    
    if (!user) {
        throw new NotFoundError('User not found');
    }
    
    return { user };
});
```

---

## **20. BONNES PRATIQUES**

### **Structure recommandée**

```
api/
├── src/
│   ├── index.ts              # Point d'entrée
│   ├── config.ts             # Configuration centralisée
│   │
│   ├── db/
│   │   ├── db.ts             # Connexion DB
│   │   ├── schema.sql        # Schéma SQL
│   │   └── migrate.ts        # Migrations
│   │
│   ├── middleware/
│   │   ├── auth.ts           # Middleware auth
│   │   └── rateLimit.ts      # Rate limiting
│   │
│   ├── auth/
│   │   ├── routes.ts         # Routes auth
│   │   ├── handlers.ts       # Handlers
│   │   └── schemas.ts        # Validation schemas
│   │
│   ├── users/
│   │   ├── routes.ts
│   │   ├── handlers.ts
│   │   └── schemas.ts
│   │
│   ├── game/
│   │   ├── routes.ts
│   │   ├── ws.ts             # WebSocket
│   │   ├── PongGame.ts       # Logique jeu
│   │   ├── GameManager.ts    # Gestion parties
│   │   └── types.ts          # Types TypeScript
│   │
│   └── utils/
│       ├── jwt.ts
│       └── validators.ts
│
├── package.json
├── tsconfig.json
└── Dockerfile
```

### **Configuration centralisée**

```typescript
// config.ts
export const config = {
    port: Number(process.env.PORT || 3000),
    host: process.env.HOST || '0.0.0.0',
    
    database: {
        path: process.env.DATABASE_URL || '/data/db.sqlite'
    },
    
    jwt: {
        secret: process.env.JWT_SECRET || 'change-me',
        expiresIn: '7d'
    },
    
    cors: {
        origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:8443']
    },
    
    uploads: {
        path: '/data/uploads',
        maxSize: 5 * 1024 * 1024  // 5 MB
    }
};
```

### **Séparation routes / handlers**

```typescript
// users/handlers.ts
export const getUsers = async (req: FastifyRequest, res: FastifyReply) => {
    const users = await db.query('SELECT id, name, email FROM users');
    return { users };
};

export const getUser = async (
    req: FastifyRequest<{ Params: { id: string } }>,
    res: FastifyReply
) => {
    const { id } = req.params;
    const user = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    
    if (!user) {
        return res.status(404).send({ error: 'User not found' });
    }
    
    return { user };
};

// users/routes.ts
import { getUsers, getUser } from './handlers.js';
import { getUserSchema } from './schemas.js';

export async function registerUserRoutes(app: FastifyInstance) {
    app.get('/users', getUsers);
    app.get('/users/:id', { schema: getUserSchema }, getUser);
}

// index.ts
import { registerUserRoutes } from './users/routes.js';

await registerUserRoutes(app);
```

### **Logging structuré**

```typescript
// Fastify utilise Pino par défaut
const app = Fastify({
    logger: {
        level: process.env.LOG_LEVEL || 'info',
        transport: process.env.NODE_ENV === 'development' ? {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'SYS:HH:MM:ss',
                ignore: 'pid,hostname'
            }
        } : undefined
    }
});

// Utilisation
app.log.info('Server started');
app.log.error({ err: error }, 'Database error');
app.log.debug({ userId: 123 }, 'User logged in');

// Dans les routes
app.get('/test', async (req, res) => {
    req.log.info('Route /test accessed');
    return { ok: true };
});
```

### **Graceful shutdown**

```typescript
// Arrêt propre du serveur
const closeGracefully = async (signal: string) => {
    console.log(`Received signal ${signal}`);
    
    try {
        await app.close();
        console.log('Server closed');
        process.exit(0);
    } catch (error) {
        console.error('Error closing server:', error);
        process.exit(1);
    }
};

process.on('SIGTERM', () => closeGracefully('SIGTERM'));
process.on('SIGINT', () => closeGracefully('SIGINT'));
```

---

# **PARTIE 3 : PROJET**

---

## **21. STRUCTURE RECOMMANDÉE**

### **Architecture complète ft_transcendence**

```
api/
├── src/
│   ├── index.ts              # Point d'entrée principal
│   ├── config.ts             # Configuration
│   ├── openapi.ts            # Documentation API
│   │
│   ├── db/
│   │   ├── db.ts             # Connexion SQLite
│   │   ├── schema.sql        # Tables
│   │   └── migrate.ts        # Migrations
│   │
│   ├── middleware/
│   │   ├── auth.ts           # Vérification JWT
│   │   ├── cors.ts           # Configuration CORS
│   │   └── errorHandler.ts  # Gestion erreurs
│   │
│   ├── auth/
│   │   ├── routes.ts         # POST /auth/login, /auth/signup
│   │   ├── handlers.ts       # Logique auth
│   │   └── schemas.ts        # Validation
│   │
│   ├── users/
│   │   ├── routes.ts         # GET /users/:id, PUT /users/:id
│   │   ├── handlers.ts
│   │   └── schemas.ts
│   │
│   ├── game/
│   │   ├── routes.ts         # POST /game/create, GET /game/:id
│   │   ├── ws.ts             # WebSocket temps réel
│   │   ├── types.ts          # Interfaces TypeScript
│   │   ├── PongGame.ts       # Logique jeu (physique, collisions)
│   │   ├── GameManager.ts    # Gestion multi-parties
│   │   └── physics.ts        # Moteur physique
│   │
│   ├── tournament/
│   │   ├── routes.ts
│   │   ├── handlers.ts
│   │   └── TournamentManager.ts
│   │
│   ├── chat/
│   │   ├── ws.ts             # WebSocket chat
│   │   └── types.ts
│   │
│   └── utils/
│       ├── jwt.ts            # Génération/vérification tokens
│       ├── hash.ts           # Argon2 hashing
│       └── validators.ts     # Validators custom
│
├── package.json
├── tsconfig.json
├── Dockerfile
└── .env.example
```

---

## **22. EXEMPLES CONCRETS FT_TRANSCENDENCE**

### **Exemple 1 : Route création de partie**

```typescript
// game/routes.ts
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { GameManager } from './GameManager.js';

const gameManager = new GameManager();

export async function registerGameRoutes(app: FastifyInstance) {
    // Créer une nouvelle partie
    app.post('/game/create', {
        schema: {
            body: {
                type: 'object',
                required: ['player1Id', 'player2Id'],
                properties: {
                    player1Id: { type: 'string' },
                    player2Id: { type: 'string' },
                    mode: { type: 'string', enum: ['classic', 'power-ups'] }
                }
            }
        },
        handler: async (
            req: FastifyRequest<{
                Body: { player1Id: string; player2Id: string; mode?: string }
            }>,
            res: FastifyReply
        ) => {
            const { player1Id, player2Id, mode = 'classic' } = req.body;
            
            // Vérifier que les joueurs existent
            const player1 = await db.getUser(player1Id);
            const player2 = await db.getUser(player2Id);
            
            if (!player1 || !player2) {
                return res.status(404).send({ error: 'Player not found' });
            }
            
            // Créer la partie
            const gameId = gameManager.createGame(player1Id, player2Id, mode);
            
            return res.status(201).send({
                gameId,
                players: [player1Id, player2Id],
                mode
            });
        }
    });
    
    // Récupérer l'état d'une partie
    app.get('/game/:id', async (
        req: FastifyRequest<{ Params: { id: string } }>,
        res: FastifyReply
    ) => {
        const { id } = req.params;
        
        const game = gameManager.getGame(id);
        
        if (!game) {
            return res.status(404).send({ error: 'Game not found' });
        }
        
        return {
            gameId: id,
            state: game.getState()
        };
    });
}
```

### **Exemple 2 : WebSocket jeu temps réel**

```typescript
// game/ws.ts
import { FastifyInstance } from 'fastify';
import { WebSocket } from '@fastify/websocket';
import { GameManager } from './GameManager.js';

const gameManager = new GameManager();

export async function registerGameWS(app: FastifyInstance) {
    app.get('/ws/game/:gameId', { websocket: true }, (connection, req) => {
        const { gameId } = req.params as { gameId: string };
        const socket = connection.socket;
        
        const game = gameManager.getGame(gameId);
        
        if (!game) {
            socket.close(1008, 'Game not found');
            return;
        }
        
        // Ajouter connexion au jeu
        gameManager.addConnection(gameId, socket);
        
        // Envoi état initial
        socket.send(JSON.stringify({
            type: 'game/init',
            data: game.getState()
        }));
        
        // Recevoir inputs joueur
        socket.on('message', (message) => {
            try {
                const data = JSON.parse(message.toString());
                
                switch (data.type) {
                    case 'paddle/move':
                        game.movePaddle(data.playerId, data.direction);
                        break;
                    
                    case 'player/ready':
                        game.setPlayerReady(data.playerId);
                        break;
                }
            } catch (error) {
                console.error('Invalid WebSocket message:', error);
            }
        });
        
        // Déconnexion
        socket.on('close', () => {
            gameManager.removeConnection(gameId, socket);
        });
        
        socket.on('error', (error) => {
            console.error('WebSocket error:', error);
        });
    });
}
```

### **Exemple 3 : GameManager**

```typescript
// game/GameManager.ts
import { PongGame } from './PongGame.js';
import { WebSocket } from '@fastify/websocket';

export class GameManager {
    private games = new Map<string, PongGame>();
    private connections = new Map<string, Set<WebSocket>>();
    private gameLoops = new Map<string, NodeJS.Timeout>();
    
    createGame(player1: string, player2: string, mode: string): string {
        const gameId = this.generateGameId();
        const game = new PongGame(player1, player2, mode);
        
        this.games.set(gameId, game);
        this.connections.set(gameId, new Set());
        
        return gameId;
    }
    
    startGame(gameId: string) {
        const game = this.games.get(gameId);
        if (!game) return;
        
        let lastUpdate = Date.now();
        
        // Game loop à 60 FPS
        const interval = setInterval(() => {
            const now = Date.now();
            const deltaTime = now - lastUpdate;
            lastUpdate = now;
            
            // Mettre à jour jeu
            game.update(deltaTime);
            
            // Broadcast état
            this.broadcastGameState(gameId);
            
            // Vérifier fin de partie
            if (game.isGameOver()) {
                this.endGame(gameId);
            }
        }, 16.67);  // ~60 FPS
        
        this.gameLoops.set(gameId, interval);
    }
    
    private broadcastGameState(gameId: string) {
        const game = this.games.get(gameId);
        const connections = this.connections.get(gameId);
        
        if (!game || !connections) return;
        
        const state = game.getState();
        const message = JSON.stringify({
            type: 'game/state',
            data: state,
            timestamp: Date.now()
        });
        
        for (const socket of connections) {
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(message);
            }
        }
    }
    
    private endGame(gameId: string) {
        // Arrêter game loop
        const interval = this.gameLoops.get(gameId);
        if (interval) {
            clearInterval(interval);
            this.gameLoops.delete(gameId);
        }
        
        // Notifier game over
        const game = this.games.get(gameId);
        const connections = this.connections.get(gameId);
        
        if (game && connections) {
            const message = JSON.stringify({
                type: 'game/over',
                data: {
                    winner: game.getWinner(),
                    score: game.getScore()
                }
            });
            
            for (const socket of connections) {
                if (socket.readyState === WebSocket.OPEN) {
                    socket.send(message);
                }
            }
        }
        
        // Sauvegarder résultat en DB
        // this.saveGameResult(gameId);
        
        // Nettoyer après 1 minute
        setTimeout(() => {
            this.games.delete(gameId);
            this.connections.delete(gameId);
        }, 60000);
    }
    
    addConnection(gameId: string, socket: WebSocket) {
        const connections = this.connections.get(gameId);
        if (connections) {
            connections.add(socket);
        }
    }
    
    removeConnection(gameId: string, socket: WebSocket) {
        const connections = this.connections.get(gameId);
        if (connections) {
            connections.delete(socket);
        }
    }
    
    getGame(gameId: string): PongGame | undefined {
        return this.games.get(gameId);
    }
    
    private generateGameId(): string {
        return `game-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}
```

---

## **23. CHECKLIST**

### **✅ Node.js**
- [ ] Event Loop : comprendre les phases
- [ ] Process : `process.env`, `process.exit()`, signaux
- [ ] File System : `fs.promises`, lecture/écriture async
- [ ] Path : `path.join()`, `path.extname()`, sécurité
- [ ] Buffers : manipulation données binaires
- [ ] Streams : lecture/écriture par chunks
- [ ] Events : `EventEmitter`, `on()`, `emit()`
- [ ] Timers : `setTimeout()`, `setInterval()`, `clearInterval()`

### **✅ Fastify**
- [ ] Instance : `Fastify()`, `app.listen()`
- [ ] Routes : `app.get()`, `app.post()`, paramètres
- [ ] Request : `req.params`, `req.query`, `req.body`, `req.headers`
- [ ] Reply : `res.status()`, `res.send()`, `res.redirect()`
- [ ] Hooks : `onRequest`, `preHandler`, `onResponse`, `onError`
- [ ] Plugins : `app.register()`, encapsulation
- [ ] Validation : JSON Schema ou Zod
- [ ] WebSocket : `{ websocket: true }`, `socket.on()`, `socket.send()`

### **✅ Plugins essentiels**
- [ ] `@fastify/cors` : CORS configuration
- [ ] `@fastify/helmet` : Security headers
- [ ] `@fastify/websocket` : WebSocket support
- [ ] `@fastify/cookie` : Cookie management
- [ ] `@fastify/multipart` : File uploads

### **✅ Bonnes pratiques**
- [ ] Structure : séparation routes/handlers/schemas
- [ ] Configuration : centralisée dans `config.ts`
- [ ] Logging : Pino structuré
- [ ] Erreurs : error handler global
- [ ] Graceful shutdown : SIGTERM/SIGINT
- [ ] TypeScript : types pour Request/Reply

---

## **24. RÉSUMÉ ULTRA-COMPACT**

```typescript
// ═══════════════════════════════════════════════════════════
// ESSENTIEL NODE.JS + FASTIFY POUR FT_TRANSCENDENCE
// ═══════════════════════════════════════════════════════════

// ────────────────────────────────────
// NODE.JS
// ────────────────────────────────────

// Process
process.env.PORT               // Variables d'environnement
process.exit(1)                // Quitter avec erreur

// File System (async)
import { readFile, writeFile } from 'fs/promises';
const data = await readFile('file.txt', 'utf8');
await writeFile('output.txt', 'content');

// Path
import path from 'path';
const filepath = path.join('/data', 'uploads', 'file.png');
const ext = path.extname(filepath);  // ".png"

// Events
import { EventEmitter } from 'events';
const emitter = new EventEmitter();
emitter.on('goal', (data) => console.log(data));
emitter.emit('goal', { player: 0 });

// Timers
const interval = setInterval(() => {
    game.update(16.67);
    broadcast();
}, 16.67);
clearInterval(interval);

// ────────────────────────────────────
// FASTIFY
// ────────────────────────────────────

// Instance
import Fastify from 'fastify';
const app = Fastify({ logger: true });

// Routes
app.get('/path', async (req, res) => {
    return { data: 'response' };
});

app.post('/users', async (req, res) => {
    const { name } = req.body;
    return res.status(201).send({ name });
});

// Paramètres
app.get('/users/:id', async (req, res) => {
    const { id } = req.params;      // URL params
    const { limit } = req.query;    // Query string
    const token = req.headers.authorization;  // Headers
    return { id, limit, token };
});

// Plugins
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';

await app.register(cors, { origin: '*' });
await app.register(websocket);

// WebSocket
app.get('/ws/game', { websocket: true }, (conn, req) => {
    conn.socket.on('message', (msg) => {
        const data = JSON.parse(msg.toString());
        // Handle message
    });
    
    conn.socket.send(JSON.stringify({ type: 'state', data }));
});

// Hooks
app.addHook('preHandler', async (req, res) => {
    if (!req.headers.authorization) {
        return res.status(401).send({ error: 'Unauthorized' });
    }
});

// Erreurs
app.setErrorHandler(async (error, req, res) => {
    req.log.error(error);
    return res.status(500).send({ error: error.message });
});

// Démarrer
await app.listen({ port: 3000, host: '0.0.0.0' });

// ────────────────────────────────────
// GAME LOOP EXAMPLE
// ────────────────────────────────────

class GameManager {
    private loop: NodeJS.Timeout | null = null;
    
    start() {
        this.loop = setInterval(() => {
            this.game.update(16.67);
            this.broadcast();
        }, 16.67);  // 60 FPS
    }
    
    stop() {
        if (this.loop) clearInterval(this.loop);
    }
    
    broadcast() {
        const state = this.game.getState();
        for (const socket of this.sockets) {
            socket.send(JSON.stringify(state));
        }
    }
}
```

---

## **🎯 TABLEAU COMPARATIF**

| Concept Node.js/Fastify | Équivalent C/C++ | Usage ft_transcendence |
|------------------------|------------------|------------------------|
| `process.env` | `getenv()` | Configuration (PORT, JWT_SECRET) |
| `fs.readFile()` | `fopen()`/`fread()` | Lecture fichiers (avatars, config) |
| `path.join()` | String concat (unsafe) | Sécuriser chemins fichiers |
| `Buffer` | `char[]` / `uint8_t[]` | Données binaires (images, crypto) |
| `EventEmitter` | Callbacks manuels | Événements jeu (goal, game-over) |
| `setInterval()` | Timer thread | Game loop 60 FPS |
| `app.get()` | Route handler function | Endpoints API REST |
| `socket.on('message')` | `recv()` callback | WebSocket messages |
| `app.register()` | Plugin system | Ajouter fonctionnalités (CORS, auth) |

---

**Avec ces deux guides (TypeScript + Fastify/Node.js), tu as tout ce qu'il faut pour ft_transcendence ! 🚀**

**Prochaines étapes :**
1. ✅ Maîtriser TypeScript/JavaScript
2. ✅ Comprendre Node.js et Fastify
3. 🎯 Implémenter PongGame.ts
4. 🔄 Créer GameManager.ts
5. 🌐 Routes API REST
6. 🔌 WebSocket temps réel
7. 🏆 Système de tournoi

**Bon courage ! 💪**
