import { Database } from "@/integrations/supabase/types";

type Tables = Database['public']['Tables'];
type Profile = Tables['profiles']['Row'];
type Post = Tables['posts']['Row'];
type Like = Tables['likes']['Row'];
type Comment = Tables['comments']['Row'];
type Message = Tables['messages']['Row'];
type Notification = Tables['notifications']['Row'];
type UserRole = Tables['user_roles']['Row'];

class MockDatabase {
  private posts: Post[] = [];
  private profiles: Profile[] = [];
  private likes: Like[] = [];
  private comments: Comment[] = [];
  private messages: Message[] = [];
  private notifications: Notification[] = [];
  private userRoles: UserRole[] = [];
  private currentUser = {
    id: 'mock-user-id',
    email: 'dispet.fun@gmail.com'
  };

  // Auth methods
  async getUser() {
    return {
      data: { user: this.currentUser },
      error: null
    };
  }

  // Posts methods
  async getPosts() {
    return {
      data: this.posts.map(post => ({
        ...post,
        profiles: this.profiles.find(p => p.id === post.author_id) || {
          username: 'Unknown',
          avatar_url: null
        },
        likes: [{ count: this.likes.filter(l => l.post_id === post.id).length }],
        comments: [{ count: this.comments.filter(c => c.post_id === post.id).length }]
      })),
      error: null
    };
  }

  async createPost(post: Partial<Post>) {
    const newPost: Post = {
      id: crypto.randomUUID(),
      content: post.content || '',
      author_id: post.author_id || this.currentUser.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_academy_post: post.is_academy_post || false
    };
    this.posts.unshift(newPost);
    return { data: newPost, error: null };
  }

  // Likes methods
  async getLikes(postId: string) {
    return {
      data: this.likes.filter(like => like.post_id === postId),
      error: null
    };
  }

  async createLike(like: Partial<Like>) {
    const newLike: Like = {
      id: crypto.randomUUID(),
      post_id: like.post_id!,
      user_id: like.user_id || this.currentUser.id,
      created_at: new Date().toISOString()
    };
    this.likes.push(newLike);
    return { data: newLike, error: null };
  }

  // Comments methods
  async getComments(postId: string) {
    return {
      data: this.comments.filter(comment => comment.post_id === postId),
      error: null
    };
  }

  async createComment(comment: Partial<Comment>) {
    const newComment: Comment = {
      id: crypto.randomUUID(),
      content: comment.content || '',
      post_id: comment.post_id!,
      author_id: comment.author_id || this.currentUser.id,
      parent_id: comment.parent_id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.comments.push(newComment);
    return { data: newComment, error: null };
  }

  // Helper method to seed initial data
  seedData() {
    // Add mock profile for current user
    this.profiles.push({
      id: this.currentUser.id,
      username: 'CurrentUser',
      full_name: 'Current User',
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    // Add some mock posts
    this.createPost({
      content: 'Welcome to Rocket Football Academy! 🚀⚽',
      author_id: this.currentUser.id,
      is_academy_post: true
    });
  }
}

export const mockDb = new MockDatabase();
mockDb.seedData();