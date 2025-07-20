import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase';

export const settingsService = {
  // Get public custom domain setting
  async getPublicCustomDomain() {
    try {
      const docRef = doc(db, 'appSettings', 'public');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return data.customDomain || '';
      }
      
      return '';
    } catch (error) {
      console.error('Error fetching custom domain:', error);
      return '';
    }
  },

  // Set public custom domain setting
  async setPublicCustomDomain(domain) {
    try {
      const docRef = doc(db, 'appSettings', 'public');
      await setDoc(docRef, {
        customDomain: domain || '',
        updatedAt: new Date()
      }, { merge: true });
      
      return true;
    } catch (error) {
      console.error('Error saving custom domain:', error);
      throw error;
    }
  },

  // Get user-specific settings (for future use)
  async getUserSettings(userId) {
    try {
      const docRef = doc(db, 'userSettings', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data();
      }
      
      // Return default settings if no user settings exist
      return {
        currency: '$', // Default currency
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('Error fetching user settings:', error);
      return {
        currency: '$', // Default currency on error
        updatedAt: new Date()
      };
    }
  },

  // Set user-specific settings (for future use)
  async setUserSettings(userId, settings) {
    try {
      const docRef = doc(db, 'userSettings', userId);
      await setDoc(docRef, {
        ...settings,
        updatedAt: new Date()
      }, { merge: true });
      
      return true;
    } catch (error) {
      console.error('Error saving user settings:', error);
      throw error;
    }
  }
};