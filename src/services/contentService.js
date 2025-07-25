import { collection, getDocs, query, where, doc, getDoc, deleteDoc, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';

export const contentService = {
  // Get user's content collection reference
  getUserContentRef(userId, blogId = null) {
    const actualBlogId = blogId || userId; // Default to userId if blogId not provided
    return collection(db, 'users', userId, 'blogs', actualBlogId, 'content');
  },

  // Fetch all content for a user's blog
  async fetchAllContent(userId, blogId = null) {
    try {
      const contentRef = this.getUserContentRef(userId, blogId);
      const snapshot = await getDocs(contentRef);
      const contentData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by creation date (newest first)
      contentData.sort((a, b) => {
        const dateA = a.createdAt?.toDate() || new Date(0);
        const dateB = b.createdAt?.toDate() || new Date(0);
        return dateB - dateA;
      });
      
      return contentData;
    } catch (error) {
      console.error('Error fetching content:', error);
      throw error;
    }
  },

  // Fetch content by status for a user's blog
  async fetchContentByStatus(userId, status, blogId = null) {
    try {
      const contentRef = this.getUserContentRef(userId, blogId);
      const q = query(contentRef, where('status', '==', status));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching content by status:', error);
      throw error;
    }
  },

  // Fetch single content by ID for a user's blog
  async fetchContentById(userId, id, blogId = null) {
    try {
      const actualBlogId = blogId || userId;
      const docRef = doc(db, 'users', userId, 'blogs', actualBlogId, 'content', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        };
      } else {
        throw new Error('Content not found');
      }
    } catch (error) {
      console.error('Error fetching content by ID:', error);
      throw error;
    }
  },

  // Get content statistics for a user's blog
  async getContentStats(userId, blogId = null) {
    try {
      const contentRef = this.getUserContentRef(userId, blogId);
      
      // Get all content
      const allContent = await getDocs(contentRef);
      const totalContent = allContent.size;
      
      // Get published content
      const publishedQuery = query(contentRef, where('status', '==', 'published'));
      const publishedContent = await getDocs(publishedQuery);
      
      // Get draft content
      const draftQuery = query(contentRef, where('status', '==', 'draft'));
      const draftContent = await getDocs(draftQuery);
      
      // Get recent content (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentQuery = query(contentRef, where('createdAt', '>=', sevenDaysAgo));
      const recentContent = await getDocs(recentQuery);
      
      return {
        totalContent,
        publishedContent: publishedContent.size,
        draftContent: draftContent.size,
        recentContent: recentContent.size
      };
    } catch (error) {
      console.error('Error fetching content stats:', error);
      throw error;
    }
  },

  // Initialize content with analytics fields
  async initializeContentAnalytics(userId, contentId, blogId = null) {
    try {
      const actualBlogId = blogId || userId;
      const contentRef = doc(db, 'users', userId, 'blogs', actualBlogId, 'content', contentId);
      await updateDoc(contentRef, {
        viewCount: 0,
        clickCount: 0,
        shareCount: 0,
        likeCount: 0,
        lastViewed: null
      });
    } catch (error) {
      console.error('Error initializing content analytics:', error);
    }
  }
};