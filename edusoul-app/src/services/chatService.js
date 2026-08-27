import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  increment
} from 'firebase/firestore';
import { db } from '../firebase';

// Helper to generate consistent chat ID for 1-on-1 pairs
export const getChatId = (studentId, mentorId) => {
  const s = String(studentId).replace(/[^a-zA-Z0-9_-]/g, '_');
  const m = String(mentorId).replace(/[^a-zA-Z0-9_-]/g, '_');
  return `chat_${s}_${m}`;
};

// Local storage cache keys
const getChatCacheKey = (userId) => `studyfyx_chats_${userId}`;
const getMsgCacheKey = (chatId) => `studyfyx_msgs_${chatId}`;

/**
 * Helper to get cached chats from localStorage
 */
export const getCachedChats = (userId) => {
  try {
    const raw = localStorage.getItem(getChatCacheKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

/**
 * Helper to save cached chats to localStorage
 */
export const saveCachedChats = (userId, chats) => {
  try {
    localStorage.setItem(getChatCacheKey(userId), JSON.stringify(chats));
  } catch {
    // ignore
  }
};

/**
 * Helper to get cached messages from localStorage
 */
export const getCachedMessages = (chatId) => {
  try {
    const raw = localStorage.getItem(getMsgCacheKey(chatId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

/**
 * Helper to save cached messages to localStorage
 */
export const saveCachedMessages = (chatId, msgs) => {
  try {
    localStorage.setItem(getMsgCacheKey(chatId), JSON.stringify(msgs));
  } catch {
    // ignore
  }
};

/**
 * Get or create a chat room between a student and a mentor in Firestore & Cache
 */
export const getOrCreateChat = async ({ student, mentor }) => {
  if (!student?.uid || (!mentor?.id && !mentor?.uid)) {
    throw new Error('Student and Mentor IDs are required');
  }

  const studentId = String(student.uid);
  const mentorId = String(mentor.uid || mentor.id);
  const chatId = getChatId(studentId, mentorId);

  const studentName = student.displayName || `${student.firstName || ''} ${student.lastName || ''}`.trim() || student.email?.split('@')[0] || 'Student';
  const mentorName = mentor.name || mentor.displayName || `${mentor.firstName || ''} ${mentor.lastName || ''}`.trim() || 'Mentor';
  const mentorField = mentor.field || mentor.expertise?.[0] || 'Mentorship & Academic Guidance';
  const mentorAvatar = mentor.avatar || (mentorName ? mentorName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'M');
  const mentorColor = mentor.color || '#7c3aed';

  const defaultChatData = {
    id: chatId,
    participants: [studentId, mentorId],
    studentId: studentId,
    studentName: studentName,
    studentEmail: student.email || '',
    mentorId: mentorId,
    mentorName: mentorName,
    mentorEmail: mentor.email || '',
    mentorField: mentorField,
    mentorAvatar: mentorAvatar,
    mentorColor: mentorColor,
    lastMessage: `👋 Started conversation with ${mentorName}`,
    lastMessageTime: new Date().toISOString(),
    lastSenderId: studentId,
    unreadStudent: 0,
    unreadMentor: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const chatRef = doc(db, 'chats', chatId);
    const chatSnap = await getDoc(chatRef);

    if (chatSnap.exists()) {
      const existing = { id: chatSnap.id, ...chatSnap.data() };
      // Update local caches
      updateChatInCache(studentId, existing);
      updateChatInCache(mentorId, existing);
      return existing;
    }

    // Create in Firestore
    await setDoc(chatRef, defaultChatData, { merge: true });

    // Add initial welcome message in subcollection
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const initialMsg = {
      text: `Hello ${studentName}! I am ${mentorName} (${mentorField}). How can I assist you with your academic goals, degree selection, or career pathway today?`,
      senderId: mentorId,
      senderName: mentorName,
      senderRole: 'mentor',
      createdAt: new Date().toISOString(),
      isInitial: true
    };
    
    await addDoc(messagesRef, initialMsg).catch(err => console.warn('Subcollection add notice:', err));

    // Save in caches
    saveCachedMessages(chatId, [{ id: 'msg_welcome_' + Date.now(), ...initialMsg }]);
    updateChatInCache(studentId, defaultChatData);
    updateChatInCache(mentorId, defaultChatData);

    return defaultChatData;
  } catch (error) {
    console.warn('Firestore getOrCreateChat note (falling back to cache):', error.message);
    // Return cached or fallback object
    updateChatInCache(studentId, defaultChatData);
    return defaultChatData;
  }
};

const updateChatInCache = (userId, chatData) => {
  const cached = getCachedChats(userId);
  const idx = cached.findIndex(c => c.id === chatData.id);
  if (idx >= 0) {
    cached[idx] = { ...cached[idx], ...chatData };
  } else {
    cached.unshift(chatData);
  }
  saveCachedChats(userId, cached);
};

/**
 * Subscribe to all chats for a given user in real-time
 */
export const subscribeToUserChats = (userId, userRole, onChatsUpdate, onError) => {
  if (!userId) return () => {};

  // 1. Deliver cached chats immediately
  const cached = getCachedChats(userId);
  if (cached.length > 0) {
    onChatsUpdate(cached);
  }

  try {
    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      where('participants', 'array-contains', String(userId))
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const firestoreChats = [];
      snapshot.forEach((d) => {
        firestoreChats.push({ id: d.id, ...d.data() });
      });

      // Merge with cache in case some were created locally
      const mergedMap = new Map();
      cached.forEach(c => mergedMap.set(c.id, c));
      firestoreChats.forEach(c => mergedMap.set(c.id, c));
      const merged = Array.from(mergedMap.values());

      merged.sort((a, b) => new Date(b.updatedAt || b.lastMessageTime || 0) - new Date(a.updatedAt || a.lastMessageTime || 0));
      saveCachedChats(userId, merged);
      onChatsUpdate(merged);
    }, (err) => {
      console.warn('Firestore chats listener notice:', err.message);
      if (onError) onError(err);
    });

    return unsubscribe;
  } catch (error) {
    console.warn('Unable to listen to chats:', error);
    if (onError) onError(error);
    return () => {};
  }
};

/**
 * Subscribe to real-time messages within a specific chat
 */
export const subscribeToMessages = (chatId, onMessagesUpdate, onError) => {
  if (!chatId) return () => {};

  // 1. Deliver cached messages immediately so UI is instant
  const cached = getCachedMessages(chatId);
  if (cached.length > 0) {
    onMessagesUpdate(cached);
  }

  try {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = [];
      snapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() });
      });

      // Merge with local cache by ID / timestamp to avoid duplicate flicker
      const mergedMap = new Map();
      cached.forEach(m => mergedMap.set(m.id || m.createdAt, m));
      msgs.forEach(m => mergedMap.set(m.id || m.createdAt, m));
      const mergedList = Array.from(mergedMap.values());
      mergedList.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));

      saveCachedMessages(chatId, mergedList);
      onMessagesUpdate(mergedList);
    }, (err) => {
      console.warn('Firestore messages listener note:', err.message);
      if (onError) onError(err);
    });

    return unsubscribe;
  } catch (error) {
    console.warn('Unable to listen to messages:', error);
    if (onError) onError(error);
    return () => {};
  }
};

/**
 * Send a message in a chat room
 */
export const sendMessage = async ({ chatId, senderId, senderName, senderRole, text }) => {
  if (!chatId || !text?.trim()) return null;

  const trimmed = text.trim();
  const now = new Date().toISOString();
  const tempId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  const newMsg = {
    id: tempId,
    text: trimmed,
    senderId: String(senderId),
    senderName: senderName || (senderRole === 'mentor' ? 'Mentor' : 'Student'),
    senderRole: senderRole || 'student',
    createdAt: now,
  };

  // 1. Save to local cache immediately
  const existingMsgs = getCachedMessages(chatId);
  const updatedMsgs = [...existingMsgs, newMsg];
  saveCachedMessages(chatId, updatedMsgs);

  // 2. Persist to Firestore
  try {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const docRef = await addDoc(messagesRef, {
      text: newMsg.text,
      senderId: newMsg.senderId,
      senderName: newMsg.senderName,
      senderRole: newMsg.senderRole,
      createdAt: newMsg.createdAt,
    });

    newMsg.id = docRef.id;

    // Update parent chat doc
    const chatRef = doc(db, 'chats', chatId);
    const updatePayload = {
      lastMessage: trimmed,
      lastMessageTime: now,
      lastSenderId: String(senderId),
      updatedAt: now,
    };

    if (senderRole === 'student') {
      updatePayload.unreadMentor = increment(1);
    } else {
      updatePayload.unreadStudent = increment(1);
    }

    await updateDoc(chatRef, updatePayload).catch(async () => {
      // Fallback: setDoc with merge if document wasn't created yet
      await setDoc(chatRef, updatePayload, { merge: true }).catch(() => {});
    });

    return newMsg;
  } catch (error) {
    console.warn('Firestore message save note (message saved locally):', error.message);
    return newMsg;
  }
};

/**
 * Mark chat messages as read for current role
 */
export const markChatAsRead = async (chatId, userRole) => {
  if (!chatId) return;
  try {
    const chatRef = doc(db, 'chats', chatId);
    const field = userRole === 'mentor' ? { unreadMentor: 0 } : { unreadStudent: 0 };
    await updateDoc(chatRef, field).catch(() => {});
  } catch {
    // Ignore non-fatal read updates
  }
};

/**
 * Fetch mentors registered in Firestore users collection
 */
export const fetchRegisteredMentors = async () => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('role', '==', 'mentor'));
    const snapshot = await getDocs(q);
    const registered = [];
    snapshot.forEach(d => {
      const data = d.data();
      registered.push({
        id: d.id,
        uid: d.id,
        name: `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.displayName || data.email?.split('@')[0] || 'Mentor',
        field: data.expertise?.[0] || data.field || 'Academic Guidance',
        exp: data.experience || '5+ yrs',
        rating: data.rating || 5.0,
        sessions: data.sessions || 12,
        avatar: (data.firstName?.[0] || data.email?.[0] || 'M').toUpperCase(),
        color: '#7c3aed',
        tags: data.expertise || ['Mentorship', 'Career Guidance'],
        bio: data.bio || 'Verified mentor ready to assist students with their study and career path.',
        available: true,
        isRegistered: true,
        email: data.email
      });
    });
    return registered;
  } catch (error) {
    console.warn('Could not fetch registered mentors from Firestore:', error);
    return [];
  }
};
