import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    setDoc,
    writeBatch,
} from "firebase/firestore";
import { db, FIREBASE_CONFIGURED } from "@/lib/firebase";
import { EMPTY_MEAL_PLAN } from "@/constants/hostel";
import type {
    HostelAllocation,
    MealPlanDay,
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
let mealPlanDb: MealPlanDay[] = EMPTY_MEAL_PLAN.map((d) => ({ ...d }));
let visitorsDb: VisitorRecord[] = [];

export interface HostelService {
  getRooms(): Promise<Room[]>;
  getRoom(id: string): Promise<Room | null>;
  createRoom(room: Omit<Room, "id" | "createdAt">): Promise<Room>;
  updateRoom(
    id: string,
    data: { name: string; capacity: number },
  ): Promise<Room>;
  allocateRoom(
    allocation: Omit<HostelAllocation, "id" | "assignedAt">,
  ): Promise<HostelAllocation>;
  removeAllocation(allocationId: string): Promise<void>;
  getAllocations(): Promise<HostelAllocation[]>;
  getOccupancy(roomId: string): Promise<number>;
  getMealPlan(): Promise<MealPlanDay[]>;
  saveMealPlan(plan: MealPlanDay[]): Promise<void>;
  recordVisitor(visitor: Omit<VisitorRecord, "id">): Promise<VisitorRecord>;
  getVisitors(): Promise<VisitorRecord[]>;
}

class FirestoreHostelService implements HostelService {
  private col(name: string) {
    return collection(db!, name);
  }

  async getRooms(): Promise<Room[]> {
    const snapshot = await getDocs(this.col("hostelRooms"));
    return snapshot.docs.map((d) => d.data() as Room);
  }

  async getRoom(id: string): Promise<Room | null> {
    const snap = await getDoc(doc(db!, "hostelRooms", id));
    return snap.exists() ? (snap.data() as Room) : null;
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

  async updateRoom(
    id: string,
    data: { name: string; capacity: number },
  ): Promise<Room> {
    const ref = doc(db!, "hostelRooms", id);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error("Room not found");
    const updated: Room = { ...(snap.data() as Room), id, ...data };
    await setDoc(ref, updated);
    return updated;
  }

  async allocateRoom(
    allocation: Omit<HostelAllocation, "id" | "assignedAt">,
  ): Promise<HostelAllocation> {
    const [rooms, allAllocations] = await Promise.all([
      this.getRooms(),
      this.getAllocations(),
    ]);
    // One student can only ever hold a single room.
    if (allAllocations.some((a) => a.studentId === allocation.studentId)) {
      throw new Error("hostel.studentAlreadyAllocated");
    }
    // A room can never exceed its capacity.
    const room = rooms.find((r) => r.id === allocation.roomId);
    const occupied = allAllocations.filter(
      (a) => a.roomId === allocation.roomId,
    ).length;
    if (room && occupied >= room.capacity) {
      throw new Error("hostel.roomFull");
    }

    const newAllocation: HostelAllocation = {
      id: `alloc-${Date.now()}`,
      assignedAt: new Date().toISOString(),
      ...allocation,
    };
    await setDoc(doc(db!, "hostelAllocations", newAllocation.id), newAllocation);

    return newAllocation;
  }

  async removeAllocation(allocationId: string): Promise<void> {
    await deleteDoc(doc(db!, "hostelAllocations", allocationId));
  }

  async getAllocations(): Promise<HostelAllocation[]> {
    const snapshot = await getDocs(this.col("hostelAllocations"));
    return snapshot.docs.map((d) => d.data() as HostelAllocation);
  }

  async getOccupancy(roomId: string): Promise<number> {
    const allocations = await this.getAllocations();
    return allocations.filter((a) => a.roomId === roomId).length;
  }

  async getMealPlan(): Promise<MealPlanDay[]> {
    const snapshot = await getDocs(this.col("mealPlan"));
    return snapshot.docs.map((d) => d.data() as MealPlanDay);
  }

  async saveMealPlan(plan: MealPlanDay[]): Promise<void> {
    const batch = writeBatch(db!);
    plan.forEach((day) => batch.set(doc(db!, "mealPlan", day.id), day));
    await batch.commit();
  }

  async recordVisitor(
    visitor: Omit<VisitorRecord, "id">,
  ): Promise<VisitorRecord> {
    const created: VisitorRecord = { id: `visitor-${Date.now()}`, ...visitor };
    await setDoc(doc(db!, "visitorRecords", created.id), created);
    return created;
  }

  async getVisitors(): Promise<VisitorRecord[]> {
    const snapshot = await getDocs(this.col("visitorRecords"));
    return snapshot.docs
      .map((d) => d.data() as VisitorRecord)
      .sort((a, b) => b.visitDate.localeCompare(a.visitDate));
  }
}

class MockHostelService implements HostelService {
  async getRooms(): Promise<Room[]> {
    return [...roomsDb];
  }

  async getRoom(id: string): Promise<Room | null> {
    return roomsDb.find((r) => r.id === id) ?? null;
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

  async updateRoom(
    id: string,
    data: { name: string; capacity: number },
  ): Promise<Room> {
    const existing = roomsDb.find((r) => r.id === id);
    if (!existing) throw new Error("Room not found");
    const updated: Room = { ...existing, ...data };
    roomsDb = roomsDb.map((r) => (r.id === id ? updated : r));
    return updated;
  }

  async allocateRoom(
    allocation: Omit<HostelAllocation, "id" | "assignedAt">,
  ): Promise<HostelAllocation> {
    // One student can only ever hold a single room.
    if (allocationsDb.some((a) => a.studentId === allocation.studentId)) {
      throw new Error("hostel.studentAlreadyAllocated");
    }
    // A room can never exceed its capacity.
    const room = roomsDb.find((r) => r.id === allocation.roomId);
    const occupied = allocationsDb.filter(
      (a) => a.roomId === allocation.roomId,
    ).length;
    if (room && occupied >= room.capacity) {
      throw new Error("hostel.roomFull");
    }

    const newAllocation: HostelAllocation = {
      id: `alloc-${Date.now()}`,
      assignedAt: new Date().toISOString(),
      ...allocation,
    };
    allocationsDb = [newAllocation, ...allocationsDb];

    return newAllocation;
  }

  async removeAllocation(allocationId: string): Promise<void> {
    allocationsDb = allocationsDb.filter((a) => a.id !== allocationId);
  }

  async getAllocations(): Promise<HostelAllocation[]> {
    return [...allocationsDb];
  }

  async getOccupancy(roomId: string): Promise<number> {
    return allocationsDb.filter((allocation) => allocation.roomId === roomId)
      .length;
  }

  async getMealPlan(): Promise<MealPlanDay[]> {
    return mealPlanDb.map((d) => ({ ...d }));
  }

  async saveMealPlan(plan: MealPlanDay[]): Promise<void> {
    mealPlanDb = plan.map((d) => ({ ...d }));
  }

  async recordVisitor(
    visitor: Omit<VisitorRecord, "id">,
  ): Promise<VisitorRecord> {
    const created = { id: `visitor-${Date.now()}`, ...visitor };
    visitorsDb = [created, ...visitorsDb];
    return created;
  }

  async getVisitors(): Promise<VisitorRecord[]> {
    return [...visitorsDb];
  }
}

export const hostelService: HostelService =
  FIREBASE_CONFIGURED && db
    ? new FirestoreHostelService()
    : new MockHostelService();
