export type SubscriptionSummary = {
  id: string
  is_owner: boolean
  days_to_cutoff: number | null
}

export type CurrentUser = {
  id: string
  name: string
  last_name: string
  email: string
  permissions: string[]
  subscription: SubscriptionSummary | null
}

export type ApiError = {
  detail?: string
}

export type Page<T> = {
  items: T[]
  total: number
  limit: number
  offset: number
}

export function toPage<T>(data: Page<T> | T[]): Page<T> {
  if (Array.isArray(data)) {
    return {
      items: data,
      total: data.length,
      limit: data.length,
      offset: 0,
    }
  }
  return data
}

export type AdminUserRole = {
  id: string
  name: string
  description: string | null
}

export type AdminUser = {
  id: string
  name: string
  last_name: string
  email: string
  is_active: boolean
  locked_until: string | null
  created_at: string
  updated_at: string | null
  roles: AdminUserRole[]
  has_subscription: boolean
  subscription_id: string | null
}

export type RoleListItem = {
  id: string
  name: string
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string | null
  users_count: number
  permissions_count: number
  permissions: string[]
}

export type PermissionRead = {
  access: string
  description: string | null
}

export type PermissionGroupRead = {
  name: string
  permissions: PermissionRead[]
}

export type SubscriptionListItem = {
  id: string
  user_id: string
  is_active: boolean
  starts_at: string | null
  cutoff_date: string | null
  last_payment_at: string | null
  max_users: number
  created_at: string
  updated_at: string | null
  owner_name: string
  owner_last_name: string
  owner_email: string
  days_to_cutoff: number | null
  status: string
}

export type SubscriptionStats = {
  total: number
  active: number
  inactive: number
  expired: number
  due_soon: number
  without_cutoff_date: number
}

export type UserSearchResult = {
  id: string
  name: string
  last_name: string
  email: string
  is_active: boolean
  has_subscription: boolean
}
