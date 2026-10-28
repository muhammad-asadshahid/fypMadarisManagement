import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Text } from "react-native-paper";

import { MarksRow } from "@/components/asri-taleem/marks-row";
import { SubjectsManager } from "@/components/asri-taleem/subjects-manager";
import { EmptyState } from "@/components/common/empty-state";
import { ScreenWrapper } from "@/components/common/screen-wrapper";
import { useAssignedClasses } from "@/hooks/use-assigned-classes";
import { asriTaleemService } from "@/modules/asri-taleem/service";
import { studentService } from "@/modules/students/service";
import { useAuthStore } from "@/store/authStore";
import type { MarksInput, Student, Subject } from "@/types";

function clampMark(value: string): number {
  const n = Number(value.replace(/[^0-9]/g, ""));
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

export default function AsriTaleemScreen() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { classes, loading: classesLoading } = useAssignedClasses();

  const matching = useMemo(
    () => classes.filter((cls) => cls.programType === "asri_taleem"),
    [classes],
  );

  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [marks, setMarks] = useState<Record<string, Record<string, string>>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const canEdit = user?.role === "teacher";
  const teacherId = user?.teacherId ?? user?.id ?? "";

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [allStudents, subjectList, records] = await Promise.all([
        studentService.getAll(),
        asriTaleemService.getSubjects(),
        asriTaleemService.getAllMarks(),
      ]);
      const asriStudents = allStudents.filter(
        (student) => student.programType === "asri_taleem",
      );
      setStudents(asriStudents);
      setSubjects(subjectList);

      const map: Record<string, Record<string, string>> = {};
      asriStudents.forEach((student) => {
        map[student.id] = {};
      });
      records.forEach((record) => {
        map[record.studentId] = {
          ...(map[record.studentId] ?? {}),
          [record.subjectId]: String(record.marksObtained),
        };
      });
      setMarks(map);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const handleRenameSubject = async (subjectId: string, name: string) => {
    await asriTaleemService.renameSubject(subjectId, name);
    setSubjects((prev) =>
      prev.map((subject) =>
        subject.id === subjectId ? { ...subject, name } : subject,
      ),
    );
  };

  const handleGradeChange = async (studentId: string, grade: number) => {
    const previous = students;
    setStudents((prev) =>
      prev.map((student) =>
        student.id === studentId ? { ...student, grade } : student,
      ),
    );
    try {
      await asriTaleemService.setGrade(studentId, grade);
    } catch {
      setStudents(previous);
    }
  };

  const handleMarksChange = (
    studentId: string,
    subjectId: string,
    value: string,
  ) => {
    setMarks((prev) => ({
      ...prev,
      [studentId]: { ...(prev[studentId] ?? {}), [subjectId]: value },
    }));
  };

  const handleSaveMarks = async () => {
    const entries: MarksInput[] = [];
    students.forEach((student) => {
      subjects.forEach((subject) => {
        const raw = marks[student.id]?.[subject.id];
        if (raw !== undefined && raw.trim() !== "") {
          entries.push({
            studentId: student.id,
            subjectId: subject.id,
            marksObtained: clampMark(raw),
          });
        }
      });
    });
    setSaving(true);
    try {
      await asriTaleemService.saveMarks(entries, teacherId);
    } finally {
      setSaving(false);
    }
  };

  if (classesLoading) {
    return (
      <ScreenWrapper title={t("nav.asriTaleem")}>
        <ActivityIndicator style={styles.loader} />
      </ScreenWrapper>
    );
  }

  if (matching.length === 0) {
    return (
      <ScreenWrapper title={t("nav.asriTaleem")}>
        <EmptyState message={t("asri.notAssigned")} />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper title={t("nav.asriTaleem")}>
      {loading ? (
        <ActivityIndicator style={styles.loader} />
      ) : (
        <>
          <SubjectsManager
            subjects={subjects}
            canEdit={canEdit}
            onRename={handleRenameSubject}
          />

          {!canEdit && (
            <Text variant="bodySmall" style={styles.readOnlyNote}>
              {t("asri.readOnly")}
            </Text>
          )}

          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t("asri.marks")}
          </Text>

          {students.length === 0 ? (
            <EmptyState message={t("common.noData")} />
          ) : (
            <View style={styles.studentList}>
              {students.map((student) => (
                <MarksRow
                  key={student.id}
                  student={student}
                  grade={student.grade ?? 1}
                  subjects={subjects}
                  values={marks[student.id] ?? {}}
                  onChange={(subjectId, value) =>
                    handleMarksChange(student.id, subjectId, value)
                  }
                  readOnly={!canEdit}
                  onGradeChange={
                    canEdit
                      ? (grade) => handleGradeChange(student.id, grade)
                      : undefined
                  }
                />
              ))}
            </View>
          )}

          {canEdit && (
            <Button
              mode="contained"
              onPress={handleSaveMarks}
              loading={saving}
              disabled={saving}
              style={styles.saveMarks}
            >
              {t("asri.saveMarks")}
            </Button>
          )}
        </>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  loader: {
    marginTop: 48,
  },
  readOnlyNote: {
    opacity: 0.7,
  },
  sectionTitle: {
    marginTop: 8,
  },
  studentList: {
    gap: 12,
  },
  saveMarks: {
    marginTop: 12,
  },
});
