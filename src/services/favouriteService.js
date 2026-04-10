import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase";

const favouritesCollection = collection(db, "favourites");

export function subscribeToFavourites(callback) {
  return onSnapshot(favouritesCollection, (snapshot) => {
    const favourites = snapshot.docs.map((docItem) => ({
      ...docItem.data(),
      id: docItem.id,
    }));

    callback(favourites);
  });
}

export async function addFavouriteToFirestore(matchId) {
  const existingQuery = query(
    favouritesCollection,
    where("matchId", "==", matchId)
  );
  const existingSnapshot = await getDocs(existingQuery);

  if (!existingSnapshot.empty) return existingSnapshot.docs[0].id;

  const docRef = await addDoc(favouritesCollection, {
    matchId,
    createdAt: new Date().toISOString(),
  });

  return docRef.id;
}

export async function removeFavouriteFromFirestoreByMatchId(matchId) {
  const favouriteQuery = query(
    favouritesCollection,
    where("matchId", "==", matchId)
  );
  const snapshot = await getDocs(favouriteQuery);

  for (const favouriteDoc of snapshot.docs) {
    await deleteDoc(doc(db, "favourites", favouriteDoc.id));
  }
}