import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  DocumentData,
  Timestamp,
  getDocs,
  query
} from 'firebase/firestore';
import { db } from '../firebase';

export interface UserData {
  email: string;
  companyName: string;
  companyWebsite: string;
  userId: string;
}

export interface UserSettings {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  updatedAt: Date;
}

export interface CompanySettings {
  id: string;
  companyName: string;
  companyWebsite: string;
  companyDescription: string;
  updatedAt: Date;
}

export interface UserListItem {
  id: string;
  email: string;
  companyName: string;
  companyWebsite: string;
  companyDescription: string;
  updatedAt: Date;
}

interface FirestoreUserSettings {
  firstName: string;
  lastName: string;
  phone: string;
  updatedAt: Timestamp;
}

interface FirestoreCompanySettings {
  companyName: string;
  companyWebsite: string;
  companyDescription: string;
  updatedAt: Timestamp;
}

export const createUserData = async (userData: UserData): Promise<void> => {
  const userRef = doc(db, 'users', userData.userId);
  await setDoc(userRef, userData);
};

export const getUserData = async (userId: string): Promise<UserData | null> => {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) {
    return null;
  }
  
  return userDoc.data() as UserData;
};

export const updateUserData = async (userData: UserData): Promise<void> => {
  const userRef = doc(db, 'users', userData.userId);
  await updateDoc(userRef, {
    companyName: userData.companyName,
    companyWebsite: userData.companyWebsite
  });
};

export const getUserSettings = async (userId: string): Promise<UserSettings | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return null;
    }

    const data = userDoc.data() as FirestoreUserSettings;
    return {
      id: userDoc.id,
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      phone: data.phone || '',
      updatedAt: data.updatedAt?.toDate() || new Date()
    };
  } catch (error) {
    console.error('Error getting user settings:', error);
    throw error;
  }
};

export const updateUserSettings = async (
  userId: string,
  settings: Omit<UserSettings, 'id' | 'updatedAt'>
): Promise<UserSettings> => {
  try {
    const userRef = doc(db, 'users', userId);
    const now = new Date();
    
    const firestoreSettings: FirestoreUserSettings = {
      firstName: settings.firstName,
      lastName: settings.lastName,
      phone: settings.phone,
      updatedAt: Timestamp.fromDate(now)
    };

    await setDoc(userRef, firestoreSettings, { merge: true });

    return {
      id: userId,
      ...settings,
      updatedAt: now
    };
  } catch (error) {
    console.error('Error updating user settings:', error);
    throw error;
  }
};

export const getCompanySettings = async (userId: string): Promise<CompanySettings | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return null;
    }

    const data = userDoc.data() as FirestoreCompanySettings;
    return {
      id: userDoc.id,
      companyName: data.companyName || '',
      companyWebsite: data.companyWebsite || '',
      companyDescription: data.companyDescription || '',
      updatedAt: data.updatedAt?.toDate() || new Date()
    };
  } catch (error) {
    console.error('Error getting company settings:', error);
    throw error;
  }
};

export const updateCompanySettings = async (
  userId: string,
  settings: Omit<CompanySettings, 'id' | 'updatedAt'>
): Promise<CompanySettings> => {
  try {
    const userRef = doc(db, 'users', userId);
    const now = new Date();
    
    const firestoreSettings: FirestoreCompanySettings = {
      companyName: settings.companyName,
      companyWebsite: settings.companyWebsite,
      companyDescription: settings.companyDescription,
      updatedAt: Timestamp.fromDate(now)
    };

    await setDoc(userRef, firestoreSettings, { merge: true });

    return {
      id: userId,
      ...settings,
      updatedAt: now
    };
  } catch (error) {
    console.error('Error updating company settings:', error);
    throw error;
  }
};

export const getAllUsers = async (): Promise<UserListItem[]> => {
  try {
    const usersQuery = query(collection(db, 'users'));
    const querySnapshot = await getDocs(usersQuery);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        email: data.email || '',
        companyName: data.companyName || '',
        companyWebsite: data.companyWebsite || '',
        companyDescription: data.companyDescription || '',
        updatedAt: data.updatedAt?.toDate() || new Date()
      };
    });
  } catch (error) {
    console.error('Error getting users list:', error);
    throw error;
  }
};

export const getUser = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return null;
    }
    const userData = userDoc.data();
    return {
      email: userData.email,
      companyName: userData.companyName
    };
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

export const createUserProfile = async (
  userId: string,
  email: string,
  companyName: string,
  companyWebsite: string
) => {
  try {
    await setDoc(doc(db, 'users', userId), {
      email,
      companyName,
      companyWebsite,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
}; 