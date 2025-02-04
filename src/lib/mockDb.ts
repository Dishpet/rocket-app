import { DatabaseClient, LocalUser, TableData } from "./types";
import { localStore } from "./store/localStore";

export class MockDatabase implements DatabaseClient {
  auth = {
    getSession: async () => {
      const user = localStore.getUser();
      return {
        data: { session: user ? { user } : null },
        error: null
      };
    },
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      const user = { id: "1", email }; // Mock user
      localStore.setUser(user);
      return { data: { user }, error: null };
    },
    signOut: async () => {
      localStore.removeUser();
      return { error: null };
    },
    onAuthStateChange: (callback: (event: string, session: { user: LocalUser } | null) => void) => {
      const user = localStore.getUser();
      callback("SIGNED_IN", user ? { user } : null);
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  };

  storage = {
    from: (bucket: string) => ({
      upload: async (path: string, file: File) => {
        const reader = new FileReader();
        return new Promise((resolve) => {
          reader.onloadend = () => {
            localStorage.setItem(`${bucket}/${path}`, reader.result as string);
            resolve({ error: null });
          };
          reader.readAsDataURL(file);
        });
      },
      getPublicUrl: (path: string) => ({
        data: { publicUrl: localStorage.getItem(`${bucket}/${path}`) || '' }
      })
    })
  };

  from = <T>(table: string) => ({
    select: (query?: string) => ({
      single: async (): Promise<TableData<T>> => {
        const data = JSON.parse(localStorage.getItem(table) || '[]');
        return { data: data.length ? data[0] : null, error: null };
      },
      eq: (column: string, value: any) => ({
        single: async (): Promise<TableData<T>> => {
          const data = JSON.parse(localStorage.getItem(table) || '[]');
          const filteredData = data.filter((item: any) => item[column] === value);
          return { data: filteredData.length ? filteredData[0] : null, error: null };
        }
      })
    }),
    insert: async (data: Partial<T>): Promise<TableData<T>> => {
      const existingData = JSON.parse(localStorage.getItem(table) || '[]');
      existingData.push(data);
      localStorage.setItem(table, JSON.stringify(existingData));
      return { data: data as T, error: null };
    },
    update: async (data: Partial<T>): Promise<TableData<T>> => {
      const existingData = JSON.parse(localStorage.getItem(table) || '[]');
      const index = existingData.findIndex((item: any) => item.id === (data as any).id);
      if (index !== -1) {
        existingData[index] = { ...existingData[index], ...data };
        localStorage.setItem(table, JSON.stringify(existingData));
        return { data: existingData[index], error: null };
      }
      return { data: null, error: new Error("Item not found") };
    },
    delete: async (): Promise<TableData<void>> => {
      const existingData = JSON.parse(localStorage.getItem(table) || '[]');
      localStorage.setItem(table, JSON.stringify(existingData.filter((item: any) => item.id !== (data as any).id)));
      return { data: null, error: null };
    }
  });
}

export const mockDb = new MockDatabase();
