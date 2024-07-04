import { Link, Meta, Pagination } from './common.model';
import { User } from './user.model';
import { Vehicle } from './vehicle.model';

export interface TasksFilter {
    status?: number
}

export interface Filter {
  search?: string;
  filter?: TasksFilter;
  order_by?: string;
  order_dir?: string;
  page: number;
  per_page: number;
  show_completed?: number;
}

export interface Task {
  id: number;
  description: string;
  due_date: string;
  created_at: string;
  task_owner: string;
  task_status: number;
  task_owner_id: number;
  title: string;
  updated_at: string;
  task_logs?: Array<TaskLog>
}

export interface TaskLog {
  content: string;
  created_at: string;
  portal_user_name: string;
}

export interface TasksResponse {
  data: Array<Task>;
  links: Link;
  meta: Meta;
}

export interface TaskOwner {
  id: number;
  full_name: string;
}

export interface AddTask {
  title: string
}

export interface UpdateTask {
  id?: number;
  description?: string;
  due_date?: string;
  created_at?: string;
  task_owner?: string;
  task_status?: number;
  task_owner_id?: number;
  title?: string;
  updated_at?: string;
}
