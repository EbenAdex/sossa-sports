import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";

const galleryCollectionRef = collection(db, "gallery");

export function subscribeToGallery(callback) {
  const q = query(galleryCollectionRef, orderBy("createdAt", "desc"));

  return onSnapshot(q, (snapshot) => {
    const galleryItems = snapshot.docs.map((item) => ({
      id: item.id,
      ...item.data(),
    }));

    callback(galleryItems);
  });
}

export async function addGalleryItemToFirestore(item) {
  await addDoc(galleryCollectionRef, {
    title: item.title || "",
    image: item.image || "",
    description: item.description || "",
    category: item.category || "General",
    createdAt: item.createdAt || new Date().toISOString(),
  });
}

export async function updateGalleryItemInFirestore(id, updates) {
  const galleryDocRef = doc(db, "gallery", id);

  await updateDoc(galleryDocRef, {
    ...updates,
  });
}

export async function deleteGalleryItemFromFirestore(id) {
  const galleryDocRef = doc(db, "gallery", id);
  await deleteDoc(galleryDocRef);
}