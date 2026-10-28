import { useCallback, useEffect, useState } from "react";

import { studentService } from "@/modules/students/service";
import { teacherService } from "@/modules/teachers/service";
import { useAuthStore } from "@/store/authStore";
import type { Class } from "@/types";

/**
 * Classes the current user is allowed to work with.
 * - admin: every class
 * - teacher: only the classes listed in the teacher's `classIds`
 * - parent / signed out: none
 *
 * Call `reload()` to refetch (e.g. after a promotion changes a roster).
 */
export function useAssignedClasses(): {
  classes: Class[];
  loading: boolean;
  reload: () => void;
} {
  const user = useAuthStore((s) => s.user);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;

    (async () => {
      if (!user || user.role === "parent") {
        if (active) {
          setClasses([]);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      try {
        const all = await studentService.getClasses();
        if (!active) return;

        if (user.role === "admin") {
          setClasses(all);
          return;
        }

        const teacher = user.teacherId
          ? await teacherService.getById(user.teacherId)
          : null;
        if (!active) return;

        const ids = new Set(teacher?.classIds ?? []);
        setClasses(all.filter((cls) => ids.has(cls.id)));
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [user?.role, user?.teacherId, version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  return { classes, loading, reload };
}
