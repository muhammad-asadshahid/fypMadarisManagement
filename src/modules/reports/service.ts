import {
  collection,
  getCountFromServer,
  getDocs,
} from "firebase/firestore";
import { db, FIREBASE_CONFIGURED } from "@/lib/firebase";
import { attendanceService, todayStr } from "@/modules/attendance/service";
import type { ReportSummary } from "@/types";

export interface ReportsService {
  getSummary(): Promise<ReportSummary>;
  getAttendanceSummary(month: string): Promise<{
    present: number;
    absent: number;
    leave: number;
    total: number;
  }>;
  getFeeSummary(): Promise<{ collected: number; pending: number }>;
}

class FirestoreReportsService implements ReportsService {
  private count(col: string) {
    return getCountFromServer(collection(db!, col));
  }

  async getSummary(): Promise<ReportSummary> {
    const date = todayStr();
    const [students, teachers, classes, today] = await Promise.all([
      this.count("students"),
      this.count("teachers"),
      this.count("classes"),
      attendanceService.getByDate(date),
    ]);

    const present = today.filter((r) => r.status === "present").length;
    const absent = today.filter((r) => r.status === "absent").length;

    let donations = 0;
    let fees = 0;
    let salaries = 0;
    let hostel = 0;

    try {
      const [donationSnap, feeSnap, salarySnap, hostelSnap] =
        await Promise.all([
          getDocs(collection(db!, "donations")),
          getDocs(collection(db!, "feeRecords")),
          getDocs(collection(db!, "salaryPayments")),
          getDocs(collection(db!, "hostelAllocations")),
        ]);
      donations = donationSnap.docs.reduce(
        (s, d) => s + Number(d.data().amount ?? 0),
        0,
      );
      fees = feeSnap.docs
        .filter((d) => d.data().paid)
        .reduce((s, d) => s + Number(d.data().amount ?? 0), 0);
      salaries = salarySnap.docs.reduce(
        (s, d) => s + Number(d.data().amount ?? 0),
        0,
      );
      hostel = hostelSnap.size;
    } catch {
      // Best-effort aggregate; missing collections default to zero.
    }

    return {
      totalStudents: students.data().count,
      totalTeachers: teachers.data().count,
      totalClasses: classes.data().count,
      presentToday: present,
      absentToday: absent,
      totalActiveHostelStudents: hostel,
      totalDonations: donations,
      totalFeesCollected: fees,
      totalSalariesPaid: salaries,
    };
  }

  async getAttendanceSummary(month: string): Promise<{
    present: number;
    absent: number;
    leave: number;
    total: number;
  }> {
    const counts = await attendanceService.getMonthlyReport(month);
    return {
      present: counts.present ?? 0,
      absent: counts.absent ?? 0,
      leave: counts.leave ?? 0,
      total: counts.total ?? 0,
    };
  }

  async getFeeSummary(): Promise<{ collected: number; pending: number }> {
    let collected = 0;
    let pending = 0;
    try {
      const snap = await getDocs(collection(db!, "feeRecords"));
      snap.docs.forEach((d) => {
        const data = d.data();
        const amount = Number(data.amount ?? 0);
        if (data.paid) collected += amount;
        else pending += amount;
      });
    } catch {
      // default zero when collection missing
    }
    return { collected, pending };
  }
}

class MockReportsService implements ReportsService {
  constructor(private summary: ReportSummary) {}

  async getSummary(): Promise<ReportSummary> {
    return this.summary;
  }

  async getAttendanceSummary(month: string): Promise<{
    present: number;
    absent: number;
    leave: number;
    total: number;
  }> {
    const counts = await attendanceService.getMonthlyReport(month);
    return {
      present: counts.present ?? 0,
      absent: counts.absent ?? 0,
      leave: counts.leave ?? 0,
      total: counts.total ?? 0,
    };
  }

  async getFeeSummary(): Promise<{ collected: number; pending: number }> {
    return { collected: 0, pending: 0 };
  }
}

const BASE: ReportSummary = {
  totalStudents: 0,
  totalTeachers: 0,
  totalClasses: 0,
  presentToday: 0,
  absentToday: 0,
  totalActiveHostelStudents: 0,
  totalDonations: 0,
  totalFeesCollected: 0,
  totalSalariesPaid: 0,
};

export const reportsService: ReportsService = (
  FIREBASE_CONFIGURED && db ? new FirestoreReportsService() : new MockReportsService(BASE)
) as ReportsService;