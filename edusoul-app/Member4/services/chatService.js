import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  getDoc,
  getDocs
} from 'firebase/firestore';
import { db } from '../../src/firebase';

class ChatService {
  // Create a new chat room
  static async createChatRoom(studentId, mentorId) {
    try {
      const chatRoomRef = await addDoc(collection(db, 'chatRooms'), {
        participants: {
          studentId,
          mentorId
        },
        createdAt: serverTimestamp(),
        lastMessage: '',
        lastMessageAt: serverTimestamp(),
        unreadCount: {
          [studentId]: 0,
          [mentorId]: 0
        },
        status: 'active'
      });
      return chatRoomRef.id;
    } catch (error) {
      console.error('Error creating chat room:', error);
      throw error;
    }
  }

  // Get or create chat room between student and mentor
  static async getOrCreateChatRoom(studentId, mentorId) {
    try {
      const q = query(
        collection(db, 'chatRooms'),
        where('participants.studentId', '==', studentId),
        where('participants.mentorId', '==', mentorId),
        where('status', '==', 'active')
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].id;
      }
      
      return await this.createChatRoom(studentId, mentorId);
    } catch (error) {
      console.error('Error getting chat room:', error);
      throw error;
    }
  }

  // Send a message
  static async sendMessage(chatRoomId, senderId, senderName, senderRole, text) {
    try {
      const messageRef = await addDoc(
        collection(db, `chatRooms/${chatRoomId}/messages`),
        {
          senderId,
          senderName,
          senderRole,
          text,
          timestamp: serverTimestamp(),
          type: 'text',
          read: false,
          metadata: {
            encrypted: false
          }
        }
      );

      // Update chat room with last message
      await updateDoc(doc(db, 'chatRooms', chatRoomId), {
        lastMessage: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
        lastMessageAt: serverTimestamp()
      });

      // Increment unread count for recipient
      const chatRoomDoc = await getDoc(doc(db, 'chatRooms', chatRoomId));
      const participants = chatRoomDoc.data().participants;
      const recipientId = participants.studentId === senderId ? participants.mentorId : participants.studentId;
      
      await updateDoc(doc(db, 'chatRooms', chatRoomId), {
        [`unreadCount.${recipientId}`]: (chatRoomDoc.data().unreadCount[recipientId] || 0) + 1
      });

      return messageRef.id;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Get messages for a chat room (real-time)
  static getMessages(chatRoomId, callback) {
    const q = query(
      collection(db, `chatRooms/${chatRoomId}/messages`),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      }));
      callback(messages);
    });

    return unsubscribe;
  }

  // Mark messages as read
  static async markAsRead(chatRoomId, userId) {
    try {
      const q = query(
        collection(db, `chatRooms/${chatRoomId}/messages`),
        where('read', '==', false),
        where('senderId', '!=', userId)
      );

      const snapshot = await getDocs(q);
      const batch = snapshot.docs.map(doc => 
        updateDoc(doc.ref, { read: true })
      );

      await Promise.all(batch);

      // Reset unread count
      await updateDoc(doc(db, 'chatRooms', chatRoomId), {
        [`unreadCount.${userId}`]: 0
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }

  // Get user's chat rooms
  static getUserChatRooms(userId, callback) {
    const q = query(
      collection(db, 'chatRooms'),
      where(`participants.${userId}`, '==', true),
      orderBy('lastMessageAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatRooms = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastMessageAt: doc.data().lastMessageAt?.toDate()
      }));
      callback(chatRooms);
    });

    return unsubscribe;
  }

  // Archive chat room
  static async archiveChatRoom(chatRoomId) {
    try {
      await updateDoc(doc(db, 'chatRooms', chatRoomId), {
        status: 'archived'
      });
    } catch (error) {
      console.error('Error archiving chat room:', error);
      throw error;
    }
  }
}

export default ChatService;
