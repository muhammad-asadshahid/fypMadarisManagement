import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    setDoc,
} from "firebase/firestore";
import { db, FIREBASE_CONFIGURED } from "@/lib/firebase";
import { studentService } from "@/modules/students/service";
import type {
    HostelAllocation,
    MealRecord,
    Room,
    VisitorRecord,
} from "@/types";

const MOCK_ROOMS: Room[] = [
  {
    id: "room-1",
    name: "Room A",
    capacity: 4,
    createdAt: new Date().toISOString(),
  },
  {
    id: "room-2",
    name: "Room B",
    capacity: 3,
    createdAt: new Date().toISOString(),
  },
];

const MOCK_ALLOCATIONS: HostelAllocation[] = [
  {
    id: "alloc-1",
    studentId: "stu-1",
    roomId: "room-1",
    assignedAt: new Date().toISOString(),
  },
];

let roomsDb = [...MOCK_ROOMS];
let allocationsDb = [...MOCK_ALLOCATIONS];
let mealsDb: MealRecord[] = [];
let visitorsDb: VisitorRecord[] = [];

export interface HostelService {
  getRooms(): Promise<Room[]>;
  createRoom(room: Omit<Room, "id" | "createdAt">): Promise<Room>;
  allocateRoom(
    allocation: Omit<HostelAllocation, "id" | "assignedAt">,
  ): Promise<HostelAllocation>;
  getAllocations(): Promise<HostelAllocation[]>;
  getOccupancy(roomId: string): Promise<number>;
  recordMeal(meal: Omit<MealRecord, "id">): Promise<MealRecord>;
  recordVisitor(visitor: Omit<VisitorRecord, "id">): Promise<VisitorRecord>;
}

class FirestoreHostelService implements HostelService {
  private col(name: string) {
    return collection(db!, name);
  }

  async getRooms(): Promise<Room[]> {
    const snapshot = await getDocs(this.col("hostelRooms"));
    return snapshot.docs.map((d) => d.data() as Room);
  }

  async createRoom(room: Omit<Room, "id" | "createdAt">): Promise<Room> {
    const newRoom: Room = {
      id: `room-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...room,
    };
    await setDoc(doc(db!, "hostelRooms", newRoom.id), newRoom);
    return newRoom;
  }

  async allocateRoom(
    allocation: Omit<HostelAllocation, "id" | "assignedAt">,
  ): Promise<HostelAllocation> {
    const newAllocation: HostelAllocation = {
      id: `alloc-${Date.now()}`,
      assignedAt: new Date().toISOString(),
      ...allocation,
    };
    await setDoc(doc(db!, "hostelAllocations", newAllocation.id), newAllocation);

    const student = await studentService.getById(allocation.studentId);
    if (student) {
      await studentService.update(allocation.studentId, {
        name: student.name,
        fatherName: student.fatherName,
        dateOfBirth: student.dateOfBirth,
        address: student.address,
        contactNumber: student.contactNumber,
        admissionDate: student.admissionDate,
        programType: student.programType,
        classId: student.classId,
        hostelStatus: true,
        photoUri: student.photoUri,
      });
    }

    return newAllocation;
  }

  async getAllocations(): Promise<HostelAllocation[]> {
    const snapshot = await getDocs(this.col("hostelAllocations"));
    return snapshot.docs.map((d) => d.data() as HostelAllocation);
  }

  async getOccupancy(roomId: string): Promise<number> {
    const allocations = await this.getAllocations();
    return allocations.filter((a) => a.roomId === roomId).length;
  }

  async recordMeal(meal: Omit<MealRecord, "id">): Promise<MealRecord> {
    const created: MealRecord = { id: `meal-${Date.now()}`, ...meal };
    await setDoc(doc(db!, "mealRecords", created.id), created);
    return created;
  }

  async recordVisitor(
    visitor: Omit<VisitorRecord, "id">,
  ): Promise<VisitorRecord> {
    const created: VisitorRecord = { id: `visitor-${Date.now()}`, ...visitor };
    await setDoc(doc(db!, "visitorRecords", created.id), created);
    return created;
  }
}

class MockHostelService implements HostelService {
  async getRooms(): Promise<Room[]> {
    return [...roomsDb];
  }

  async createRoom(room: Omit<Room, "id" | "createdAt">): Promise<Room> {
    const newRoom: Room = {
      id: `room-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...room,
    };
    roomsDb = [newRoom, ...roomsDb];
    return newRoom;
  }

  async allocateRoom(
    allocation: Omit<HostelAllocation, "id" | "assignedAt">,
  ): Promise<HostelAllocation> {
    const newAllocation: HostelAllocation = {
      id: `alloc-${Date.now()}`,
      assignedAt: new Date().toISOString(),
      ...allocation,
    };
    allocationsDb = [newAllocation, ...allocationsDb];

    const student = await studentService.getById(allocation.studentId);
    if (student) {
      await studentService.update(allocation.studentId, {
        name: student.name,
        fatherName: student.fatherName,
        dateOfBirth: student.dateOfBirth,
        address: student.address,
        contactNumber: student.contactNumber,
        admissionDate: student.admissionDate,
        programType: student.programType,
        classId: student.classId,
        hostelStatus: true,
        photoUri: student.photoUri,
      });
    }

    return newAllocation;
  }

  async getAllocations(): Promise<HostelAllocation[]> {
    return [...allocationsDb];
  }

  async getOccupancy(roomId: string): Promise<number> {
    return allocationsDb.filter((allocation) => allocation.roomId === roomId)
      .length;
  }

  async recordMeal(meal: Omit<MealRecord, "id">): Promise<MealRecord> {
    const created = { id: `meal-${Date.now()}`, ...meal };
    mealsDb = [created, ...mealsDb];
    return created;
  }

  async recordVisitor(
    visitor: Omit<VisitorRecord, "id">,
  ): Promise<VisitorRecord> {
    const created = { id: `visitor-${Date.now()}`, ...visitor };
    visitorsDb = [created, ...visitorsDb];
    return created;
  }
}

export const hostelService: HostelService =
  FIREBASE_CONFIGURED && db
    ? new FirestoreHostelService()
    : new MockHostelService();
