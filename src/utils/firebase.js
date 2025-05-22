import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, where } from 'firebase/firestore';

// Vaša Firebase konfiguracija
const firebaseConfig = {
  apiKey: "AIzaSyAfZEjfCX1Lu3LIR0yEZXd6YyzzdVBoRNs",
  authDomain: "restoran-aplikacija-ef31f.firebaseapp.com",
  projectId: "restoran-aplikacija-ef31f",
  storageBucket: "restoran-aplikacija-ef31f.firebasestorage.app",
  messagingSenderId: "663723248829",
  appId: "1:663723248829:web:45f32ebffd11c9960efbd4",
  measurementId: "G-X86WXDZCKH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Funkcije za rad sa Firebase bazom
export const saveReportToFirebase = async (reportData) => {
  try {
    const docRef = await addDoc(collection(db, 'reports'), {
      ...reportData,
      timestamp: new Date().toISOString()
    });
    console.log('Izveštaj sačuvan u Firebase:', docRef.id);
    return { id: docRef.id, ...reportData };
  } catch (error) {
    console.error('Greška pri čuvanju u Firebase:', error);
    throw error;
  }
};

export const getReportsFromFirebase = async () => {
  try {
    const q = query(collection(db, 'reports'), orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    const reports = [];
    querySnapshot.forEach((doc) => {
      reports.push({ id: doc.id, ...doc.data() });
    });
    console.log('Učitano', reports.length, 'izveštaja iz Firebase');
    return reports;
  } catch (error) {
    console.error('Greška pri učitavanju iz Firebase:', error);
    return [];
  }
};

export const getReportsByDateFromFirebase = async (datum) => {
  try {
    const q = query(
      collection(db, 'reports'), 
      where('datum', '==', datum),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const reports = [];
    querySnapshot.forEach((doc) => {
      reports.push({ id: doc.id, ...doc.data() });
    });
    return reports;
  } catch (error) {
    console.error('Greška pri učitavanju po datumu:', error);
    return [];
  }
};

export const getReportsBySmenaFromFirebase = async (smena) => {
  try {
    const q = query(
      collection(db, 'reports'), 
      where('smena', '==', smena),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const reports = [];
    querySnapshot.forEach((doc) => {
      reports.push({ id: doc.id, ...doc.data() });
    });
    return reports;
  } catch (error) {
    console.error('Greška pri učitavanju po smeni:', error);
    return [];
  }
};