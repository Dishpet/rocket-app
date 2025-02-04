import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { LocalUser, Profile, Post, Like, Comment, Message, Notification, UserRole } from './types';

type StoreState = {
  currentUser: LocalUser | null;
  profiles: Profile[];
  posts: Post[];
  likes: Like[];
  comments: Comment[];
  messages: Message[];
  notifications: Notification[];
  userRoles: UserRole[];
  mediaStorage: Record<string, string>;
};

const useStore = create<StoreState>(() => ({
  currentUser: null,
  profiles: [],
  posts: [],
  likes: [],
  comments: [],
  messages: [],
  notifications: [],
  userRoles: [],
  mediaStorage: {},
}));

export const localStore = {
  getUser: () => useStore.getState().currentUser,
  setUser: (user: LocalUser) => useStore.setState({ currentUser: user }),
  removeUser: () => useStore.setState({ currentUser: null }),
  getProfiles: () => useStore.getState().profiles,
  getPosts: () => useStore.getState().posts,
  getLikes: () => useStore.getState().likes,
  getComments: () => useStore.getState().comments,
  getMessages: () => useStore.getState().messages,
  getNotifications: () => useStore.getState().notifications,
  getUserRoles: () => useStore.getState().userRoles,
  getMediaStorage: () => useStore.getState().mediaStorage,
  setMediaStorage: (path: string, url: string) => 
    useStore.setState(state => ({
      mediaStorage: { ...state.mediaStorage, [path]: url }
    }))
};

export default useStore;