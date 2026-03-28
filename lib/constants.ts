export const APP_NAME = "Eagle Choice"
export const APP_DESCRIPTION = "Your trusted partner for laptops, Ghana Card registration, birth certificates, and visa services"
export const CURRENCY = "GHS"
export const CURRENCY_SYMBOL = "GH₵"

export const ROLES = {
  ADMIN: "admin",
  CLIENT: "client",
  USER: "user",
} as const

export type UserRole = (typeof ROLES)[keyof typeof ROLES]

export const ORDER_STATUSES = {
  PENDING: "pending",
  AGENT_CONFIRMED: "agent_confirmed",
  IN_PROGRESS: "in_progress",
  PAYMENT_PENDING: "payment_pending",
  PAID: "paid",
  PROCESSING: "processing",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const

export type OrderStatus = (typeof ORDER_STATUSES)[keyof typeof ORDER_STATUSES]

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  agent_confirmed: "Agent Confirmed",
  in_progress: "In Progress",
  payment_pending: "Awaiting Payment",
  paid: "Paid",
  processing: "Processing",
  completed: "Completed",
  cancelled: "Cancelled",
}

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  agent_confirmed: "bg-teal-100 text-teal-800",
  in_progress: "bg-blue-100 text-blue-800",
  payment_pending: "bg-orange-100 text-orange-800",
  paid: "bg-green-100 text-green-800",
  processing: "bg-purple-100 text-purple-800",
  completed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
}

export const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["agent_confirmed", "cancelled"],
  agent_confirmed: ["in_progress", "cancelled"],
  in_progress: ["payment_pending", "cancelled"],
  payment_pending: ["paid", "cancelled"],
  paid: ["processing"],
  processing: ["completed"],
  completed: [],
  cancelled: [],
}

export const PRODUCT_CATEGORIES = {
  LAPTOP: "laptop",
  ACCESSORY: "accessory",
} as const

export const SERVICE_CATEGORIES = {
  GHANA_CARD: "ghana_card",
  BIRTH_CERTIFICATE: "birth_certificate",
  VISA: "visa",
} as const

export const SERVICE_CATEGORY_LABELS: Record<string, string> = {
  ghana_card: "Ghana Card Registration",
  birth_certificate: "Birth Certificate",
  visa: "Visa Services",
  laptop: "Laptops",
  accessory: "Accessories",
}

export const PAYMENT_STATUSES = {
  PENDING: "pending",
  SUCCESS: "success",
  FAILED: "failed",
  ABANDONED: "abandoned",
} as const

export const POINTS_DEFAULT = {
  PERCENTAGE_RATE: 5,
  CONVERSION_RATE: 100,
  MIN_REDEMPTION: 1000,
}

export const NOTIFICATION_TYPES = {
  NEW_ORDER: "new_order",
  ORDER_STATUS: "order_status",
  PAYMENT_RECEIVED: "payment_received",
  NEW_MESSAGE: "new_message",
  POINTS_EARNED: "points_earned",
  REDEMPTION_UPDATE: "redemption_update",
} as const
