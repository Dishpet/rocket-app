import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { LocalUser, Profile, Post, Like, Comment, Message, Notification, UserRole, QueryResult, QueryOptions, DatabaseClient } from './types';

interface LocalState {
  currentUser: LocalUser | null;
  profiles: Profile[];
  posts: Post[];
  likes: Like[];
  comments: Comment[];
  messages: Message[];
  notifications: Notification[];
  userRoles: UserRole[];
  mediaStorage: Record<string, string>;
}

const useLocalStore = () => {
  const store = create<LocalState>((set, get) => ({
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

  const getTableData = (table: string) => {
    const state = store.getState();
    switch (table) {
      case 'profiles': return state.profiles;
      case 'posts': return state.posts;
      case 'likes': return state.likes;
      case 'comments': return state.comments;
      case 'messages': return state.messages;
      case 'notifications': return state.notifications;
      case 'user_roles': return state.userRoles;
      default: return [];
    }
  };

  const client: DatabaseClient = {
    auth: {
      getSession: async () => {
        const user = store.getState().currentUser;
        return { data: { session: user ? { user } : null }, error: null };
      },
      signUp: async ({ email, password, options }) => {
        try {
          const userId = uuidv4();
          const newUser: LocalUser = {
            id: userId,
            email,
            created_at: new Date().toISOString(),
          };
          store.setState({ currentUser: newUser });
          return { data: { user: newUser }, error: null };
        } catch (error) {
          return { data: null, error: error as Error };
        }
      },
      signInWithPassword: async ({ email }) => {
        try {
          const user = store.getState().currentUser;
          if (!user || user.email !== email) {
            throw new Error('Invalid credentials');
          }
          return { data: { user }, error: null };
        } catch (error) {
          return { data: null, error: error as Error };
        }
      },
      signOut: async () => {
        try {
          store.setState({ currentUser: null });
          return { error: null };
        } catch (error) {
          return { error: error as Error };
        }
      },
      onAuthStateChange: (callback) => {
        const user = store.getState().currentUser;
        callback('INITIAL_SESSION', user ? { user } : null);
        return {
          data: {
            subscription: {
              unsubscribe: () => {},
            },
          },
        };
      },
    },
    from: <T>(table: string) => ({
      select: (query?: string) => ({
        single: async () => {
          try {
            const data = getTableData(table)[0] as T;
            return { data, error: null };
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },
        eq: (column: string, value: any) => ({
          single: async () => {
            try {
              const data = getTableData(table).find(item => item[column] === value) as T;
              return { data, error: null };
            } catch (error) {
              return { data: null, error: error as Error };
            }
          }
        })
      }),
      insert: async (data: Partial<T>) => {
        try {
          const newItem = {
            ...data,
            id: uuidv4(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as T;
          
          store.setState(state => ({
            [table]: [...getTableData(table), newItem]
          }));
          
          return { data: newItem, error: null };
        } catch (error) {
          return { data: null, error: error as Error };
        }
      },
      update: async (data: Partial<T>) => {
        try {
          let updated: T | null = null;
          store.setState(state => {
            const items = getTableData(table);
            const index = items.findIndex(item => item.id === (data as any).id);
            if (index !== -1) {
              const updatedItem = { ...items[index], ...data } as T;
              items[index] = updatedItem;
              updated = updatedItem;
              return { [table]: items };
            }
            return state;
          });
          return { data: updated, error: null };
        } catch (error) {
          return { data: null, error: error as Error };
        }
      },
      delete: async () => {
        try {
          store.setState(state => ({
            [table]: []
          }));
          return { data: null, error: null };
        } catch (error) {
          return { data: null, error: error as Error };
        }
      }
    })
  };

  return client;
};

export default useLocalStore;