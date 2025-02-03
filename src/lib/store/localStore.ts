import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { LocalUser, Profile, Post, Like, Comment, Message, Notification, UserRole, QueryResult, DatabaseClient, TableName, Tables } from './types';
import { mockDb } from '../mockDb';

const useLocalStore = (): DatabaseClient => {
  const store = create<{
    currentUser: LocalUser | null;
    profiles: Profile[];
    posts: Post[];
    likes: Like[];
    comments: Comment[];
    messages: Message[];
    notifications: Notification[];
    userRoles: UserRole[];
    mediaStorage: Record<string, string>;
  }>(() => ({
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

  return {
    auth: {
      getSession: async () => {
        const { data } = await mockDb.getUser();
        return { 
          data: { session: data.user ? { user: data.user as LocalUser } : null },
          error: null 
        };
      },
      signInWithPassword: async ({ email, password }) => {
        console.log('Attempting login with:', email);
        const { data, error } = await mockDb.signInWithPassword({ email, password });
        
        if (error) {
          console.error('Login error:', error);
          return { data: null, error };
        }

        if (!data?.user) {
          console.error('No user data returned');
          return { 
            data: null, 
            error: new Error('Invalid login credentials') 
          };
        }

        store.setState({ currentUser: data.user as LocalUser });
        return { data: { user: data.user as LocalUser }, error: null };
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
    from: <T extends Tables[TableName]["Row"]>(table: TableName) => ({
      select: (query?: string) => ({
        single: async () => {
          try {
            const data = getTableData<T>(table)[0];
            return { data, error: null };
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },
        eq: (column: string, value: any) => ({
          single: async () => {
            try {
              const data = getTableData<T>(table).find(item => item[column] === value);
              return { data: data || null, error: null };
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
            [table]: [...getTableData<T>(table), newItem]
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
            const items = getTableData<T>(table);
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
};

export default useLocalStore;
