import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Divider,
  Text,
} from "react-native-paper";

import { EmptyState } from "@/components/common/empty-state";
import { ScreenWrapper } from "@/components/common/screen-wrapper";
import { HifzProgressRow } from "@/components/hifz/hifz-progress-row";
import { LessonLogForm } from "@/components/hifz/lesson-log-form";
import { useAssignedClasses } from "@/hooks/use-assigned-classes";
import { latestDate } from "@/lib/latest-by-student";
import { todayStr } from "@/modules/attendance/service";
import { hifzService } from "@/modules/hifz/service";
import { lessonLogService } from "@/modules/lessons/service";
import { useAuthStore } from "@/store/authStore";
import type { HifzUpdateInput, LessonLog, LessonLogInput } from "@/types";

export default function HifzScreen() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { classes, loading: classesLoading } = useAssignedClasses();

  const matching = useMemo(
    () => classes.filter((cls) => cls.programType === "hifz_ul_quran"),
    [classes],
  );

  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [lesson, setLesson] = useState<LessonLog | null>(null);
  const [mistakes, setMistakes] = useState<Record<string, number>>({});
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
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
      setMistakes({});
      setLastUpdated(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [lessonLog, records] = await Promise.all([
        lessonLogService.getLatestByClass(classId),
        hifzService.getLatestByClass(classId),
      ]);
      setLesson(lessonLog);
      const map: Record<string, number> = {};
      (selectedClass?.students ?? []).forEach((student) => {
        map[student.id] = 0;
      });
      records.forEach((record) => {
        map[record.studentId] = record.mistakeCount;
      });
      setMistakes(map);
      setLastUpdated(
        latestDate([...records.map((r) => r.date), lessonLog?.date]),
      );
    } finally {
      setLoading(false);
    }
  }, [classId, selectedClass]);

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
    const entries: HifzUpdateInput[] = selectedClass.students.map((student) => ({
      studentId: student.id,
      classId: selectedClass.id,
      lessonId,
      date,
      mistakeCount: mistakes[student.id] ?? 0,
    }));
    setSavingProgress(true);
    try {
      await hifzService.recordClass(entries, teacherId);
    } finally {
      setSavingProgress(false);
    }
  };

  if (classesLoading) {
    return (
      <ScreenWrapper title={t("nav.hifz")}>
        <ActivityIndicator style={styles.loader} />
      </ScreenWrapper>
    );
  }

  if (matching.length === 0) {
    return (
      <ScreenWrapper title={t("nav.hifz")}>
        <EmptyState message={t("hifz.notAssigned")} />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper title={t("nav.hifz")}>
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
            programType="hifz_ul_quran"
            date={date}
            initial={lesson}
            saving={savingLesson}
            onSave={handleSaveLesson}
            readOnly={!canEdit}
          />

          {!canEdit && (
            <Text variant="bodySmall" style={styles.readOnlyNote}>
              {t("hifz.readOnly")}
            </Text>
          )}

          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t("hifz.progress")}
          </Text>

          {lastUpdated ? (
            <Text variant="bodySmall" style={styles.lastUpdated}>
              {t("hifz.lastUpdated", { date: lastUpdated })}
            </Text>
          ) : null}

          {selectedClass?.students.length === 0 ? (
            <EmptyState message={t("common.noData")} />
          ) : (
            <View>
              {selectedClass?.students.map((student, index) => (
                <View key={student.id}>
                  {index > 0 && <Divider />}
                  <HifzProgressRow
                    student={student}
                    value={mistakes[student.id] ?? 0}
                    onChange={(value) =>
                      setMistakes((prev) => ({ ...prev, [student.id]: value }))
                    }
                    readOnly={!canEdit}
                  />
                </View>
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
              {t("hifz.saveProgress")}
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
  lastUpdated: {
    opacity: 0.7,
    marginBottom: 4,
  },
  readOnlyNote: {
    opacity: 0.7,
  },
  saveProgress: {
    marginTop: 12,
  },
});
