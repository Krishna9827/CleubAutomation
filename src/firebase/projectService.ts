import { db } from './config';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  DocumentReference,
} from 'firebase/firestore';

export interface ProjectData {
  id: string;
  userId?: string;
  clientInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  propertyDetails: {
    type: string;
    size: number;
    budget: number;
  };
  requirements: string[];
  rooms: {
    id: string;
    name: string;
    type: string;
    features: string[];
    appliances: {
      id: string;
      name: string;
      quantity: number;
      price: number;
    }[];
  }[];
  sections: {
    id: string;
    name: string;
    items: {
      id: string;
      name: string;
      quantity: number;
      price: number;
    }[];
  }[];
  totalCost: number;
  status: 'draft' | 'in-progress' | 'completed';
  createdAt: Date;
  updatedAt: Date;
  lastSavedPage: string;
}

export const projectService = {
  // Create a new project
  async createProject(initialData: Partial<ProjectData>, userId?: string): Promise<string> {
    const projectRef = doc(collection(db, 'projects'));
    const projectData: ProjectData = {
      id: projectRef.id,
      userId: userId,
      clientInfo: {
        name: '',
        email: '',
        phone: '',
        address: '',
      },
      propertyDetails: {
        type: '',
        size: 0,
        budget: 0,
      },
      requirements: [],
      rooms: [],
      sections: [],
      totalCost: 0,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSavedPage: 'index',
      ...initialData,
    };

    await setDoc(projectRef, {
      ...projectData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return projectRef.id;
  },

  // Update project data
  async updateProject(projectId: string, data: Partial<ProjectData>): Promise<void> {
    const projectRef = doc(db, 'projects', projectId);
    await updateDoc(projectRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  // Save current page progress
  async saveProgress(projectId: string, pageName: string, pageData: any): Promise<void> {
    const projectRef = doc(db, 'projects', projectId);
    await updateDoc(projectRef, {
      lastSavedPage: pageName,
      updatedAt: serverTimestamp(),
      ...pageData,
    });
  },

  // Get project by ID
  async getProject(projectId: string): Promise<ProjectData | null> {
    const projectRef = doc(db, 'projects', projectId);
    const projectSnap = await getDoc(projectRef);
    return projectSnap.exists() ? projectSnap.data() as ProjectData : null;
  },

  // Get all projects for a client
  async getClientProjects(clientEmail: string): Promise<ProjectData[]> {
    const projectsQuery = query(
      collection(db, 'projects'),
      where('clientInfo.email', '==', clientEmail)
    );
    const querySnapshot = await getDocs(projectsQuery);
    return querySnapshot.docs.map(doc => doc.data() as ProjectData);
  },

  // Save room selection
  async saveRoomSelection(projectId: string, rooms: ProjectData['rooms']): Promise<void> {
    await this.updateProject(projectId, { rooms });
  },

  // Save requirements
  async saveRequirements(
    projectId: string, 
    requirements: string[],
    propertyDetails: ProjectData['propertyDetails']
  ): Promise<void> {
    await this.updateProject(projectId, { 
      requirements,
      propertyDetails,
      lastSavedPage: 'requirements'
    });
  },

  // Save appliances for a room
  async saveRoomAppliances(
    projectId: string,
    roomId: string,
    appliances: ProjectData['rooms'][0]['appliances']
  ): Promise<void> {
    const project = await this.getProject(projectId);
    if (!project) return;

    const updatedRooms = project.rooms.map(room => 
      room.id === roomId ? { ...room, appliances } : room
    );

    await this.updateProject(projectId, { rooms: updatedRooms });
  },

  // Calculate and update total cost
  async updateTotalCost(projectId: string): Promise<void> {
    const project = await this.getProject(projectId);
    if (!project) return;

    const roomCosts = project.rooms.reduce((total, room) => 
      total + room.appliances.reduce((roomTotal, appliance) => 
        roomTotal + (appliance.price * appliance.quantity), 0
      ), 0
    );

    const sectionCosts = project.sections.reduce((total, section) => 
      total + section.items.reduce((sectionTotal, item) => 
        sectionTotal + (item.price * item.quantity), 0
      ), 0
    );

    const totalCost = roomCosts + sectionCosts;
    await this.updateProject(projectId, { totalCost });
  }
};