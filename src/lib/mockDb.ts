import { DatabaseClient, Tables, TableData, TableName } from "@/lib/store/types";
import { v4 as uuidv4 } from 'uuid';

type Profile = Tables['profiles']['Row'];
type Post = Tables['posts']['Row'];
type Like = Tables['likes']['Row'];
type Comment = Tables['comments']['Row'];
type Message = Tables['messages']['Row'];
type Notification = Tables['notifications']['Row'];
type UserRole = Tables['user_roles']['Row'];

class MockDatabase implements DatabaseClient {
  private posts: Post[] = [];
  private profiles: Profile[] = [];
  private likes: Like[] = [];
  private comments: Comment[] = [];
  private messages: Message[] = [];
  private notifications: Notification[] = [];
  private userRoles: UserRole[] = [];
  
  private users = [
    {
      id: uuidv4(),
      email: 'nikola.kurobasa87@gmail.com',
      password: 'Test123',
      created_at: new Date().toISOString()
    },
    {
      id: uuidv4(),
      email: 'coach@rfa.com',
      password: 'Coach123',
      created_at: new Date().toISOString()
    },
    {
      id: uuidv4(),
      email: 'admin@rfa.com',
      password: 'Admin123',
      created_at: new Date().toISOString()
    }
  ];

  constructor() {
    this.seedData();
  }

  auth = {
    getSession: async () => {
      const user = this.users[0];
      return {
        data: { session: user ? { user } : null },
        error: null
      };
    },

    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      const user = this.users.find(u => u.email === email && u.password === password);
      
      if (!user) {
        return {
          data: null,
          error: new Error('Invalid login credentials')
        };
      }

      return {
        data: { user },
        error: null
      };
    },

    signOut: async () => {
      return { error: null };
    },

    onAuthStateChange: (callback: (event: string, session: { user: any } | null) => void) => {
      const user = this.users[0];
      callback('SIGNED_IN', user ? { user } : null);
      
      return {
        data: {
          subscription: {
            unsubscribe: () => {}
          }
        }
      };
    }
  };

  from = <T extends Tables[TableName]["Row"]>(table: TableName) => ({
    select: (query?: string) => ({
      single: async (): Promise<TableData<T>> => {
        const data = this.getTableData(table);
        return { data: data[0] as T, error: null };
      },
      eq: (column: string, value: any) => ({
        single: async (): Promise<TableData<T>> => {
          const data = this.getTableData(table);
          const filtered = data.find(item => (item as any)[column] === value);
          return { data: filtered as T, error: null };
        }
      })
    }),
    insert: async (data: Partial<T>): Promise<TableData<T>> => {
      const tableData = this.getTableData(table);
      const newItem = {
        ...data,
        id: uuidv4(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      tableData.push(newItem as any);
      return { data: newItem as T, error: null };
    },
    update: async (data: Partial<T>): Promise<TableData<T>> => {
      const tableData = this.getTableData(table);
      const index = tableData.findIndex(item => (item as any).id === (data as any).id);
      if (index !== -1) {
        tableData[index] = { ...tableData[index], ...data, updated_at: new Date().toISOString() };
        return { data: tableData[index] as T, error: null };
      }
      return { data: null, error: new Error('Item not found') };
    },
    delete: async (): Promise<TableData<void>> => {
      return { data: null, error: null };
    }
  });

  private getTableData(table: TableName): any[] {
    switch (table) {
      case 'posts':
        return this.posts;
      case 'profiles':
        return this.profiles;
      case 'likes':
        return this.likes;
      case 'comments':
        return this.comments;
      case 'messages':
        return this.messages;
      case 'notifications':
        return this.notifications;
      case 'user_roles':
        return this.userRoles;
      default:
        return [];
    }
  }

  private seedData() {
    // Add mock profiles for test users
    this.users.forEach(user => {
      this.profiles.push({
        id: user.id,
        username: user.email.split('@')[0],
        full_name: user.email.split('@')[0].split('.').join(' '),
        avatar_url: null,
        created_at: user.created_at,
        updated_at: user.created_at
      });
    });

    // Add some mock posts
    this.posts.push({
      id: uuidv4(),
      content: 'Welcome to Rocket Football Academy! 🚀⚽',
      author_id: this.users[0].id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_academy_post: true
    });
  }
}

export const mockDb = new MockDatabase();