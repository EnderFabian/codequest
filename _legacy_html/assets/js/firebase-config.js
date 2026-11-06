/**
 * Firebase - Configuración opcional
 *
 * 1. Crea un proyecto en https://console.firebase.google.com
 * 2. Activa Firestore o Realtime Database
 * 3. Reemplaza firebaseConfig con tus credenciales
 * 4. Descomenta el script en las páginas HTML:
 *    <script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js"></script>
 *    <script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore-compat.js"></script>
 */

const firebaseConfig = {
  apiKey: 'TU_API_KEY',
  authDomain: 'tu-proyecto.firebaseapp.com',
  projectId: 'tu-proyecto',
  storageBucket: 'tu-proyecto.appspot.com',
  messagingSenderId: '000000000000',
  appId: '1:000000000000:web:xxxxxxxx'
};

let db = null;
let firebaseReady = false;

function initFirebase() {
  if (typeof firebase === 'undefined') {
    console.info('CodeQuest: Firebase no cargado. Usando localStorage.');
    return false;
  }
  try {
    if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    firebaseReady = true;
    return true;
  } catch (e) {
    console.warn('Firebase init error:', e);
    return false;
  }
}

function getUserId() {
  let id = localStorage.getItem('codequest_user_id');
  if (!id) {
    id = 'user_' + Math.random().toString(36).slice(2, 12);
    localStorage.setItem('codequest_user_id', id);
  }
  return id;
}

function syncToFirebase(data) {
  if (!firebaseReady && !initFirebase()) return;
  if (!db || firebaseConfig.apiKey === 'TU_API_KEY') return;

  db.collection('progress').doc(getUserId()).set({
    ...data,
    updatedAt: new Date().toISOString()
  }, { merge: true }).catch(err => console.warn('Sync error:', err));
}

function loadFromFirebase(callback) {
  if (!firebaseReady && !initFirebase()) {
    callback(loadProgress());
    return;
  }
  if (!db || firebaseConfig.apiKey === 'TU_API_KEY') {
    callback(loadProgress());
    return;
  }

  db.collection('progress').doc(getUserId()).get()
    .then(doc => {
      if (doc.exists) {
        const data = doc.data();
        saveProgress({ ...loadProgress(), ...data });
        callback(data);
      } else callback(loadProgress());
    })
    .catch(() => callback(loadProgress()));
}

// Auto-init si Firebase está disponible
document.addEventListener('DOMContentLoaded', () => {
  if (typeof firebase !== 'undefined') initFirebase();
});
