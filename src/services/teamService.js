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

const teamsCollection = collection(db, "teams");

export async function fetchTeamsOnce() {
  const snapshot = await getDocs(teamsCollection);

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));
}

export function subscribeToTeams(callback) {
  return onSnapshot(teamsCollection, (snapshot) => {
    const teams = snapshot.docs.map((docItem) => ({
      id: docItem.id,
      ...docItem.data(),
    }));

    callback(teams);
  });
}

export async function addTeamToFirestore(teamData) {
  const { id, ...cleanTeamData } = teamData || {};

  const docRef = await addDoc(teamsCollection, {
    ...cleanTeamData,
    localId: id || Date.now(),
    createdAt: new Date().toISOString(),
  });

  return docRef.id;
}

export async function updateTeamInFirestore(teamId, updates) {
  const { id, ...cleanUpdates } = updates || {};
  const teamRef = doc(db, "teams", String(teamId));
  await updateDoc(teamRef, cleanUpdates);
}

export async function deleteTeamFromFirestore(teamId) {
  const teamRef = doc(db, "teams", String(teamId));
  await deleteDoc(teamRef);
}