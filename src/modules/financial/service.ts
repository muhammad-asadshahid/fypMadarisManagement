import {
    collection,
    doc,
    getDocs,
    query,
    setDoc,
    where,
} from "firebase/firestore";
import { db, FIREBASE_CONFIGURED } from "@/lib/firebase";
import type {
    Donation,
    Donor,
    FeePayment,
    SalaryPayment,
    ZakatDistribution
} from "@/types";

const MOCK_DONORS: Donor[] = [
  {
    id: "donor-1",
    name: "Ahsan Khan",
    contactNumber: "03010001122",
    category: "General",
  },
];

const MOCK_DONATIONS: Donation[] = [
  {
    id: "donation-1",
    donorId: "donor-1",
    amount: 15000,
    category: "Zakat",
    date: new Date().toISOString(),
    note: "Ramadan donation",
  },
];

const MOCK_ZAKAT: ZakatDistribution[] = [];
const MOCK_SALARY_PAYMENTS: SalaryPayment[] = [];
const MOCK_FEE_PAYMENTS: FeePayment[] = [];

let donorsDb = [...MOCK_DONORS];
let donationsDb = [...MOCK_DONATIONS];
let zakatDb = [...MOCK_ZAKAT];
let salaryDb = [...MOCK_SALARY_PAYMENTS];
let feeDb = [...MOCK_FEE_PAYMENTS];

export interface FinancialService {
  getDonors(): Promise<Donor[]>;
  addDonor(donor: Omit<Donor, "id">): Promise<Donor>;
  getDonations(): Promise<Donation[]>;
  recordDonation(donation: Omit<Donation, "id">): Promise<Donation>;
  getZakatDistributions(): Promise<ZakatDistribution[]>;
  recordZakatDistribution(
    distribution: Omit<ZakatDistribution, "id">,
  ): Promise<ZakatDistribution>;
  getSalaryPayments(): Promise<SalaryPayment[]>;
  recordSalaryPayment(
    payment: Omit<SalaryPayment, "id">,
  ): Promise<SalaryPayment>;
  getFeePayments(month?: string): Promise<FeePayment[]>;
  setFeePayment(
    studentId: string,
    month: string,
    paid: boolean,
    amount?: number,
    note?: string,
  ): Promise<FeePayment>;
}

class FirestoreFinancialService implements FinancialService {
  private col(name: string) {
    return collection(db!, name);
  }

  async getDonors(): Promise<Donor[]> {
    const snapshot = await getDocs(this.col("donors"));
    return snapshot.docs.map((d) => d.data() as Donor);
  }

  async addDonor(donor: Omit<Donor, "id">): Promise<Donor> {
    const record: Donor = { id: `donor-${Date.now()}`, ...donor };
    await setDoc(doc(db!, "donors", record.id), record);
    return record;
  }

  async getDonations(): Promise<Donation[]> {
    const snapshot = await getDocs(this.col("donations"));
    return snapshot.docs.map((d) => d.data() as Donation);
  }

  async recordDonation(donation: Omit<Donation, "id">): Promise<Donation> {
    const record: Donation = { id: `donation-${Date.now()}`, ...donation };
    await setDoc(doc(db!, "donations", record.id), record);
    return record;
  }

  async getZakatDistributions(): Promise<ZakatDistribution[]> {
    const snapshot = await getDocs(this.col("zakatDistributions"));
    return snapshot.docs.map((d) => d.data() as ZakatDistribution);
  }

  async recordZakatDistribution(
    distribution: Omit<ZakatDistribution, "id">,
  ): Promise<ZakatDistribution> {
    const record: ZakatDistribution = {
      id: `zakat-${Date.now()}`,
      ...distribution,
    };
    await setDoc(doc(db!, "zakatDistributions", record.id), record);
    return record;
  }

  async getSalaryPayments(): Promise<SalaryPayment[]> {
    const snapshot = await getDocs(this.col("salaryPayments"));
    return snapshot.docs.map((d) => d.data() as SalaryPayment);
  }

  async recordSalaryPayment(
    payment: Omit<SalaryPayment, "id">,
  ): Promise<SalaryPayment> {
    const record: SalaryPayment = { id: `salary-${Date.now()}`, ...payment };
    await setDoc(doc(db!, "salaryPayments", record.id), record);
    return record;
  }

  async getFeePayments(month?: string): Promise<FeePayment[]> {
    const base = this.col("feePayments");
    const snapshot = month
      ? await getDocs(query(base, where("month", "==", month)))
      : await getDocs(base);
    return snapshot.docs.map((d) => d.data() as FeePayment);
  }

  async setFeePayment(
    studentId: string,
    month: string,
    paid: boolean,
    amount = 0,
    note?: string,
  ): Promise<FeePayment> {
    const id = `${studentId}__${month}`;
    const record: FeePayment = {
      id,
      studentId,
      month,
      paid,
      amount: paid ? amount : 0,
      ...(paid ? { paidAt: new Date().toISOString() } : {}),
      ...(note ? { note } : {}),
    };
    await setDoc(doc(db!, "feePayments", id), record);
    return record;
  }
}

class MockFinancialService implements FinancialService {
  async getDonors(): Promise<Donor[]> {
    return [...donorsDb];
  }

  async addDonor(donor: Omit<Donor, "id">): Promise<Donor> {
    const record: Donor = { id: `donor-${Date.now()}`, ...donor };
    donorsDb = [record, ...donorsDb];
    return record;
  }

  async getDonations(): Promise<Donation[]> {
    return [...donationsDb];
  }

  async recordDonation(donation: Omit<Donation, "id">): Promise<Donation> {
    const record: Donation = { id: `donation-${Date.now()}`, ...donation };
    donationsDb = [record, ...donationsDb];
    return record;
  }

  async getZakatDistributions(): Promise<ZakatDistribution[]> {
    return [...zakatDb];
  }

  async recordZakatDistribution(
    distribution: Omit<ZakatDistribution, "id">,
  ): Promise<ZakatDistribution> {
    const record: ZakatDistribution = {
      id: `zakat-${Date.now()}`,
      ...distribution,
    };
    zakatDb = [record, ...zakatDb];
    return record;
  }

  async getSalaryPayments(): Promise<SalaryPayment[]> {
    return [...salaryDb];
  }

  async recordSalaryPayment(
    payment: Omit<SalaryPayment, "id">,
  ): Promise<SalaryPayment> {
    const record: SalaryPayment = { id: `salary-${Date.now()}`, ...payment };
    salaryDb = [record, ...salaryDb];
    return record;
  }

  async getFeePayments(month?: string): Promise<FeePayment[]> {
    return month ? feeDb.filter((f) => f.month === month) : [...feeDb];
  }

  async setFeePayment(
    studentId: string,
    month: string,
    paid: boolean,
    amount = 0,
    note?: string,
  ): Promise<FeePayment> {
    const id = `${studentId}__${month}`;
    const record: FeePayment = {
      id,
      studentId,
      month,
      paid,
      amount: paid ? amount : 0,
      ...(paid ? { paidAt: new Date().toISOString() } : {}),
      ...(note ? { note } : {}),
    };
    feeDb = [record, ...feeDb.filter((f) => f.id !== id)];
    return record;
  }
}

export const financialService: FinancialService =
  FIREBASE_CONFIGURED && db
    ? new FirestoreFinancialService()
    : new MockFinancialService();
