const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get, goOffline } = require('firebase/database');

const firebaseConfig = {
  apiKey: "AIzaSyCfrX0U_2dGPK6qNsBQshfJ0S_hq39pmgU",
  authDomain: "bolao-da-copa-ff854.firebaseapp.com",
  projectId: "bolao-da-copa-ff854",
  storageBucket: "bolao-da-copa-ff854.firebasestorage.app",
  messagingSenderId: "730063016595",
  appId: "1:730063016595:web:a300394ce11bff5e0bb366",
  measurementId: "G-CH72NPPMPQ",
  databaseURL: "https://bolao-da-copa-ff854-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

async function main() {
  const snapshot = await get(ref(db, "config/jogos"));
  if (snapshot.exists()) {
    const data = snapshot.val();
    const lista = data.lista || [];
    console.log(`DATABASE_RESULT: Encontrados ${lista.length} jogos no banco de dados.`);
    
    const brasil = lista.find(m => m.teamA === 'Brasil' && m.teamB === 'Marrocos');
    if (brasil) {
      console.log('DATABASE_RESULT: Brasil x Marrocos:', brasil);
    } else {
      const brasil2 = lista.find(m => m.id === 'm5');
      console.log('DATABASE_RESULT: m5:', brasil2);
    }

    const haiti = lista.find(m => m.id === 'm6');
    if (haiti) {
      console.log('DATABASE_RESULT: Haiti x Escócia:', haiti);
    }
  } else {
    console.log('DATABASE_RESULT: O nó config/jogos não existe!');
  }
}

main().then(() => {
  goOffline(db);
  process.exit(0);
}).catch(err => {
  console.error('Erro:', err);
  process.exit(1);
});
