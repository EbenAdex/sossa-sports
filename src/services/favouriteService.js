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

export function subscribeToFavourites(userId, callback) {
  if (!userId) {
    callback([]);
    return () => {};
  }

  const favouritesQuery = query(
    favouritesCollection,
    where("userId", "==", userId)
  );

  return onSnapshot(favouritesQuery, (snapshot) => {
    const favourites = snapshot.docs.map((docItem) => ({
      ...docItem.data(),
      id: docItem.id,
    }));

    callback(favourites);
  });
}

export async function addFavouriteToFirestore(userId, matchId) {
  if (!userId || !matchId) return null;

  const existingQuery = query(
    favouritesCollection,
    where("userId", "==", userId),
    where("matchId", "==", matchId)
  );

  const existingSnapshot = await getDocs(existingQuery);

  if (!existingSnapshot.empty) {
    return existingSnapshot.docs[0].id;
  }

  const docRef = await addDoc(favouritesCollection, {
    userId,
    matchId,
    createdAt: new Date().toISOString(),
  });

  return docRef.id;
}

export async function removeFavouriteFromFirestoreByMatchId(userId, matchId) {
  if (!userId || !matchId) return;

  const favouriteQuery = query(
    favouritesCollection,
    where("userId", "==", userId),
    where("matchId", "==", matchId)
  );

  const snapshot = await getDocs(favouriteQuery);

  for (const favouriteDoc of snapshot.docs) {
    await deleteDoc(doc(db, "favourites", favouriteDoc.id));
  }
}