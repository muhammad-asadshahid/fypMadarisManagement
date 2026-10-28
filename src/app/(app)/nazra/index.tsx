import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Text } from "react-native-paper";

import { EmptyState } from "@/components/common/empty-state";
import { ScreenWrapper } from "@/components/common/screen-wrapper";
import { LessonLogForm } from "@/components/hifz/lesson-log-form";
import {
  NazraProgressRow,
  emptyNazraFields,
  type NazraProgressFields,
} from "@/components/hifz/nazra-progress-row";
import { useAssignedClasses } from "@/hooks/use-assigned-classes";
import { todayStr } from "@/modules/attendance/service";
import { lessonLogService } from "@/modules/lessons/service";
import { nazraService } from "@/modules/nazra/service";
import { useAuthStore } from "@/store/authStore";
import type { LessonLog, LessonLogInput, NazraUpdateInput } from "@/types";

function toNumber(value: string): number {
  return Number(value.replace(/[^0-9]/g, "")) || 0;
}

export default function NazraScreen() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { classes, loading: classesLoading } = useAssignedClasses();

  const matching = useMemo(
    () => classes.filter((cls) => cls.programType === "nazra_quran"),
    [classes],
  );

  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [lesson, setLesson] = useState<LessonLog | null>(null);
  const [progress, setProgress] = useState<Record<string, NazraProgressFields>>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [savingLesson, setSavingLesson] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);

  const selectedClass = useMemo(
    () => matching.find((cls) => cls.id === selectedClassId) ?? matching[0] ?? null,
    [matching, selectedClassId],
  );
  const classId = selectedClass?.id ?? null;
  const date = todayStr();
  const teacherId = user?.teacherId ?? user?.id ?? "";
  const canEdit = user?.role === "teacher";

  const loadClassData = useCallback(async () => {
    if (!classId) {
      setLesson(null);
      setProgress({});
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [lessonLog, records] = await Promise.all([
        lessonLogService.getByClassAndDate(classId, date),
        nazraService.getByClassAndDate(classId, date),
      ]);
      setLesson(lessonLog);
      const map: Record<string, NazraProgressFields> = {};
      (selectedClass?.students ?? []).forEach((student) => {
        map[student.id] = emptyNazraFields();
      });
      records.forEach((record) => {
        map[record.studentId] = {
          pageNumber: String(record.pageNumber),
          lessonCompletion: String(record.lessonCompletion),
          fluencyLevel: String(record.fluencyLevel),
          pronunciationErrors: String(record.pronunciationErrors),
          remarks: record.remarks ?? "",
        };
      });
      setProgress(map);
    } finally {
      setLoading(false);
    }
  }, [classId, date, selectedClass]);

  useFocusEffect(
    useCallback(() => {
      loadClassData();
    }, [loadClassData]),
  );

  const handleSaveLesson = async (input: LessonLogInput) => {
    setSavingLesson(true);
    try {
      setLesson(await lessonLogService.save(input, teacherId));
    } finally {
      setSavingLesson(false);
    }
  };

  const handleSaveProgress = async () => {
    if (!selectedClass) return;
    const lessonId = lesson?.id ?? `ll-${selectedClass.id}-${date}`;
    const entries: NazraUpdateInput[] = selectedClass.students.map((student) => {
      const fields = progress[student.id] ?? emptyNazraFields();
      return {
        studentId: student.id,
        classId: selectedClass.id,
        lessonId,
        date,
        pageNumber: toNumber(fields.pageNumber),
        lessonCompletion: toNumber(fields.lessonCompletion),
        fluencyLevel: toNumber(fields.fluencyLevel),
        pronunciationErrors: toNumber(fields.pronunciationErrors),
        remarks: fields.remarks.trim(),
      };
    });
    setSavingProgress(true);
    try {
      await nazraService.recordClass(entries, teacherId);
    } finally {
      setSavingProgress(false);
    }
  };

  if (classesLoading) {
    return (
      <ScreenWrapper title={t("nav.nazra")}>
        <ActivityIndicator style={styles.loader} />
      </ScreenWrapper>
    );
  }

  if (matching.length === 0) {
    return (
      <ScreenWrapper title={t("nav.nazra")}>
        <EmptyState message={t("nazra.notAssigned")} />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper title={t("nav.nazra")}>
      {matching.length > 1 && (
        <View style={styles.classList}>
          {matching.map((cls) => (
            <Button
              key={cls.id}
              compact
              mode={cls.id === classId ? "contained" : "outlined"}
              onPress={() => setSelectedClassId(cls.id)}
            >
              {cls.name}
            </Button>
          ))}
        </View>
      )}

      {loading ? (
        <ActivityIndicator style={styles.loader} />
      ) : (
        <>
          <LessonLogForm
            classId={classId ?? ""}
            programType="nazra_quran"
            date={date}
            initial={lesson}
            saving={savingLesson}
            onSave={handleSaveLesson}
            readOnly={!canEdit}
          />

          {!canEdit && (
            <Text variant="bodySmall" style={styles.readOnlyNote}>
              {t("nazra.readOnly")}
            </Text>
          )}

          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t("nazra.progress")}
          </Text>

          {selectedClass?.students.length === 0 ? (
            <EmptyState message={t("common.noData")} />
          ) : (
            <View style={styles.progressList}>
              {selectedClass?.students.map((student) => (
                <NazraProgressRow
                  key={student.id}
                  student={student}
                  value={progress[student.id] ?? emptyNazraFields()}
                  onChange={(patch) =>
                    setProgress((prev) => ({
                      ...prev,
                      [student.id]: {
                        ...(prev[student.id] ?? emptyNazraFields()),
                        ...patch,
                      },
                    }))
                  }
                  readOnly={!canEdit}
                />
              ))}
            </View>
          )}

          {canEdit && (
            <Button
              mode="contained"
              onPress={handleSaveProgress}
              loading={savingProgress}
              disabled={savingProgress}
              style={styles.saveProgress}
            >
              {t("nazra.saveProgress")}
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
  classList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    marginTop: 8,
  },
  readOnlyNote: {
    opacity: 0.7,
  },
  progressList: {
    gap: 12,
  },
  saveProgress: {
    marginTop: 12,
  },
});
