import {
  collection,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";

const medalsCollection = collection(db, "medals");

export function subscribeToMedals(callback) {
  return onSnapshot(medalsCollection, (snapshot) => {
    const medals = snapshot.docs.map((docItem) => ({
      id: docItem.id,
      ...docItem.data(),
    }));

    callback(medals);
  });
}

export async function addMedalToFirestore(medalData) {
  const { id, ...cleanMedalData } = medalData || {};

  const docRef = await addDoc(medalsCollection, {
    ...cleanMedalData,
    localId: id || Date.now(),
    createdAt: new Date().toISOString(),
  });

  return docRef.id;
}

export async function updateMedalInFirestore(medalId, updates) {
  const { id, ...cleanUpdates } = updates || {};
  const medalRef = doc(db, "medals", String(medalId));
  await updateDoc(medalRef, cleanUpdates);
}

export async function deleteMedalFromFirestore(medalId) {
  const medalRef = doc(db, "medals", String(medalId));
  await deleteDoc(medalRef);
}