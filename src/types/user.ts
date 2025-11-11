// User and authentication types
export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  phoneNumber?: string
  dateOfBirth?: string
  houseNumber?: string
  area?: string
  city?: string
  state?: string
  postalCode?: string
  profileComplete: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthUser {
  id: string
  email: string
  displayName?: string
  photoURL?: string
}

export interface Testimony {
  id: string
  clientName: string
  propertyType: string
  location: string
  date: string
  quote: string
  projectDetails: string
  features: string[]
  results: string[]
  videoUrl?: string
  createdAt: string
  updatedAt: string
}

export interface Inquiry {
  id: string
  name: string
  email: string
  phone: string
  message: string
  status: string
  createdAt: string
}
