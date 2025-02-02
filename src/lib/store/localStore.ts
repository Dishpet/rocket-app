import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { LocalUser, Profile, Post, Like, Comment, Message, Notification, UserRole, QueryResult, QueryOptions } from './types';

interface LocalState {
  currentUser: LocalUser | null;
  profiles: Profile[];
  posts: Post[];
  likes: Like[];
  comments: Comment[];
  messages: Message[];
  notifications: Notification[];
  userRoles: UserRole[];
  mediaStorage: Record<string, string>; // Store base64 strings

  // Auth methods
  signUp: (email: string, password: string, metadata?: any) => Promise<QueryResult<LocalUser>>;
  signIn: (email: string, password: string) => Promise<QueryResult<LocalUser>>;
  signOut: () => Promise<QueryResult<void>>;
  
  // Database methods
  from: (table: string) => {
    select: (query?: string) => Promise<QueryResult<any>>;
    insert: (data: any) => Promise<QueryResult<any>>;
    update: (data: any) => Promise<QueryResult<any>>;
    delete: () => Promise<QueryResult<void>>;
    eq: (column: string, value: any) => any;
    order: (column: string, options: { ascending: boolean }) => any;
  };
  
  // Storage methods
  storage: {
    from: (bucket: string) => {
      upload: (path: string, file: File) => Promise<QueryResult<string>>;
      getPublicUrl: (path: string) => { data: { publicUrl: string } };
    };
  };
}

const useLocalStore = create<LocalState>((set, get) => ({
  currentUser: null,
  profiles: [],
  posts: [],
  likes: [],
  comments: [],
  messages: [],
  notifications: [],
  userRoles: [],
  mediaStorage: {},

  signUp: async (email, password, metadata) => {
    try {
      const userId = uuidv4();
      const newUser: LocalUser = {
        id: userId,
        email,
        created_at: new Date().toISOString(),
      };

      if (metadata?.username) {
        const profile: Profile = {
          id: userId,
          username: metadata.username,
          full_name: metadata.full_name || null,
          avatar_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        set(state => ({ profiles: [...state.profiles, profile] }));
      }

      set({ currentUser: newUser });
      return { data: newUser, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  signIn: async (email, password) => {
    try {
      // Simulate authentication
      const user = get().currentUser;
      if (!user || user.email !== email) {
        throw new Error('Invalid credentials');
      }
      return { data: user, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  signOut: async () => {
    try {
      set({ currentUser: null });
      return { data: null, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  from: (table: string) => {
    let queryOptions: QueryOptions = {};

    const getTableData = () => {
      const state = get();
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

    const filterData = (data: any[]) => {
      let result = [...data];
      
      if (queryOptions.eq) {
        Object.entries(queryOptions.eq).forEach(([key, value]) => {
          result = result.filter(item => item[key] === value);
        });
      }

      if (queryOptions.order) {
        Object.entries(queryOptions.order).forEach(([key, direction]) => {
          result.sort((a, b) => {
            return direction === 'asc' 
              ? a[key] > b[key] ? 1 : -1
              : a[key] < b[key] ? 1 : -1;
          });
        });
      }

      return result;
    };

    return {
      select: async (query?: string) => {
        try {
          const data = filterData(getTableData());
          return { data, error: null };
        } catch (error) {
          return { data: null, error: error as Error };
        }
      },

      insert: async (data: any) => {
        try {
          const newData = Array.isArray(data) ? data : [data];
          const itemsWithIds = newData.map(item => ({
            ...item,
            id: item.id || uuidv4(),
            created_at: item.created_at || new Date().toISOString(),
            updated_at: item.updated_at || new Date().toISOString(),
          }));

          set(state => {
            const tableData = getTableData();
            return { [table]: [...tableData, ...itemsWithIds] };
          });

          return { data: itemsWithIds, error: null };
        } catch (error) {
          return { data: null, error: error as Error };
        }
      },

      update: async (data: any) => {
        try {
          const updateData = Array.isArray(data) ? data : [data];
          
          set(state => {
            const tableData = getTableData();
            const updatedData = tableData.map(item => {
              const updateItem = updateData.find(u => u.id === item.id);
              return updateItem ? { ...item, ...updateItem } : item;
            });
            return { [table]: updatedData };
          });

          return { data: updateData, error: null };
        } catch (error) {
          return { data: null, error: error as Error };
        }
      },

      delete: async () => {
        try {
          set(state => {
            const tableData = getTableData();
            const filteredData = filterData(tableData);
            const remainingData = tableData.filter(item => 
              !filteredData.some(f => f.id === item.id)
            );
            return { [table]: remainingData };
          });

          return { data: null, error: null };
        } catch (error) {
          return { data: null, error: error as Error };
        }
      },

      eq: (column: string, value: any) => {
        queryOptions.eq = { ...queryOptions.eq, [column]: value };
        return get().from(table);
      },

      order: (column: string, { ascending }: { ascending: boolean }) => {
        queryOptions.order = { [column]: ascending ? 'asc' : 'desc' };
        return get().from(table);
      },
    };
  },

  storage: {
    from: (bucket: string) => ({
      upload: async (path: string, file: File) => {
        try {
          const reader = new FileReader();
          const base64Promise = new Promise<string>((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
          });
          reader.readAsDataURL(file);
          
          const base64Data = await base64Promise;
          set(state => ({
            mediaStorage: { ...state.mediaStorage, [path]: base64Data }
          }));
          
          return { data: path, error: null };
        } catch (error) {
          return { data: null, error: error as Error };
        }
      },
      
      getPublicUrl: (path: string) => ({
        data: { publicUrl: get().mediaStorage[path] || '' }
      }),
    }),
  },
}));

export default useLocalStore;