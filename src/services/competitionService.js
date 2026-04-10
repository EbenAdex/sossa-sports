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

const competitionsCollection = collection(db, "competitions");

export async function seedDefaultCompetitions(defaultCompetitions) {
  const snapshot = await getDocs(competitionsCollection);

  if (!snapshot.empty) return;

  for (const competition of defaultCompetitions) {
    await addDoc(competitionsCollection, {
      ...competition,
      createdAt: new Date().toISOString(),
    });
  }
}

export function subscribeToCompetitions(callback) {
  return onSnapshot(competitionsCollection, (snapshot) => {
    const competitions = snapshot.docs.map((docItem) => ({
      ...docItem.data(),
      id: docItem.id,
    }));

    callback(competitions);
  });
}

export async function addCompetitionToFirestore(competitionData) {
  const { id, ...cleanCompetitionData } = competitionData || {};

  const docRef = await addDoc(competitionsCollection, {
    ...cleanCompetitionData,
    localId: id || Date.now(),
    createdAt: new Date().toISOString(),
  });

  return docRef.id;
}

export async function updateCompetitionInFirestore(competitionId, updates) {
  const { id, ...cleanUpdates } = updates || {};
  const competitionRef = doc(db, "competitions", String(competitionId));
  await updateDoc(competitionRef, cleanUpdates);
}

export async function deleteCompetitionFromFirestore(competitionId) {
  const competitionRef = doc(db, "competitions", String(competitionId));
  await deleteDoc(competitionRef);
}