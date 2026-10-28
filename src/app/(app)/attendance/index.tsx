import { AdminAttendance } from "@/components/attendance/admin-attendance";
import { TeacherAttendance } from "@/components/attendance/teacher-attendance";
import { useAuthStore } from "@/store/authStore";

export default function AttendanceScreen() {
  const user = useAuthStore((s) => s.user);

  // Teachers mark attendance for their own class; admins review the records.
  if (user?.role === "teacher") return <TeacherAttendance />;
  return <AdminAttendance />;
}
