export class Blog {
  _id: string;
  title: string;
  description: string;
  photo: any;
  categories: any;
  status: string;
  commentCount: Number = 0;
  createdAt?: any;
  updatedAt?: any;
}

export class Comment {
  blogID: string;
  userName: String;
  email: String;
  website: String;
  comment: String;
  reply: String;
  createdAt?: any;
  updatedAt?: any;
}
