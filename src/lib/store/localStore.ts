import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { LocalUser, Profile, Post, Like, Comment, Message, Notification, UserRole, TableData, DatabaseClient, TableName, Tables } from './types';
import { mockDb } from '../mockDb';

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

const getTableData = <T>(table: TableName): T[] => {
  const state = useStore.getState();
  return state[table.toLowerCase() as keyof StoreState] as T[] || [];
};

const useLocalStore = (): DatabaseClient => {
  return {
    auth: {
      getSession: async () => {
        const currentUser = useStore.getState().currentUser;
        return { 
          data: { session: currentUser ? { user: currentUser } : null },
          error: null 
        };
      },
      signInWithPassword: async ({ email, password }) => {
        try {
          console.log('Attempting login with:', email);
          const result = await mockDb.auth.signInWithPassword({ email, password });
          
          if (result.error || !result.data?.user) {
            return { 
              data: null, 
              error: new Error('Invalid login credentials') 
            };
          }

          const user: LocalUser = {
            id: result.data.user.id,
            email: result.data.user.email,
            created_at: result.data.user.created_at
          };

          useStore.setState({ currentUser: user });
          return { data: { user }, error: null };
        } catch (error) {
          return { data: null, error: error as Error };
        }
      },
      signOut: async () => {
        try {
          useStore.setState({ currentUser: null });
          return { error: null };
        } catch (error) {
          return { error: error as Error };
        }
      },
      onAuthStateChange: (callback) => {
        const user = useStore.getState().currentUser;
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
    storage: {
      from: (bucket: string) => ({
        upload: async (path: string, file: File, options?: { upsert: boolean }) => {
          try {
            const reader = new FileReader();
            const promise = new Promise<string>((resolve, reject) => {
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
            });
            reader.readAsDataURL(file);
            const dataUrl = await promise;
            useStore.setState(state => ({
              mediaStorage: { ...state.mediaStorage, [path]: dataUrl }
            }));
            return { error: null };
          } catch (error) {
            return { error: error as Error };
          }
        },
        getPublicUrl: (path: string) => ({
          data: { publicUrl: useStore.getState().mediaStorage[path] || '' }
        })
      })
    },
    from: <T extends Tables[TableName]["Row"]>(table: TableName) => ({
      select: (query?: string) => ({
        single: async (): Promise<TableData<T>> => {
          try {
            const data = getTableData<T>(table)[0];
            return { data, error: null };
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },
        eq: (column: string, value: any) => ({
          single: async (): Promise<TableData<T>> => {
            try {
              const data = getTableData<T>(table).find(item => (item as any)[column] === value);
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
          
          useStore.setState(state => ({
            [table.toLowerCase()]: [...getTableData<T>(table), newItem]
          }));
          
          return { data: newItem, error: null };
        } catch (error) {
          return { data: null, error: error as Error };
        }
      },
      update: async (data: Partial<T>) => {
        try {
          let updated: T | null = null;
          useStore.setState(state => {
            const items = getTableData<T>(table);
            const index = items.findIndex(item => (item as any).id === (data as any).id);
            if (index !== -1) {
              const updatedItem = { ...items[index], ...data } as T;
              items[index] = updatedItem;
              updated = updatedItem;
              return { [table.toLowerCase()]: items };
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
          useStore.setState(state => ({
            [table.toLowerCase()]: []
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