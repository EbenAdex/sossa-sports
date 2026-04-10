import {
  collection,
  getDocs,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";

const sportsCollection = collection(db, "sports");

export async function seedDefaultSports(defaultSports) {
  const snapshot = await getDocs(sportsCollection);
  const existingSports = snapshot.docs.map((docItem) =>
    String(docItem.data().name || "").trim().toLowerCase()
  );

  for (const sport of defaultSports) {
    const alreadyExists = existingSports.includes(
      String(sport.name || "").trim().toLowerCase()
    );

    if (!alreadyExists) {
      await addDoc(sportsCollection, {
        ...sport,
        createdAt: new Date().toISOString(),
      });
    }
  }
}

export function subscribeToSports(callback) {
  return onSnapshot(sportsCollection, (snapshot) => {
    const sports = snapshot.docs.map((docItem) => ({
      ...docItem.data(),
      id: docItem.id,
    }));

    callback(sports);
  });
}

export async function addSportToFirestore(sportData) {
  const { id, ...cleanSportData } = sportData || {};

  const docRef = await addDoc(sportsCollection, {
    ...cleanSportData,
    localId: id || Date.now(),
    createdAt: new Date().toISOString(),
  });

  return docRef.id;
}

export async function updateSportInFirestore(sportId, updates) {
  const { id, ...cleanUpdates } = updates || {};
  const sportRef = doc(db, "sports", String(sportId));
  await updateDoc(sportRef, cleanUpdates);
}

export async function deleteSportFromFirestore(sportId) {
  const sportRef = doc(db, "sports", String(sportId));
  await deleteDoc(sportRef);
}