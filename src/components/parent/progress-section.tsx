import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Card,
  Chip,
  List,
  Text,
  useTheme,
} from "react-native-paper";

import { MarksRow } from "@/components/asri-taleem/marks-row";
import { EmptyState } from "@/components/common/empty-state";
import { LessonLogForm } from "@/components/hifz/lesson-log-form";
import { GRADE_LABEL_KEYS } from "@/lib/hifz-grade";
import { asriTaleemService } from "@/modules/asri-taleem/service";
import { darsENizamiService } from "@/modules/dars-e-nizami/service";
import { hifzService } from "@/modules/hifz/service";
import { lessonLogService } from "@/modules/lessons/service";
import { nazraService } from "@/modules/nazra/service";
import type {
  DarsProgressRecord,
  HifzRecord,
  Kitab,
  LessonLog,
  MarksRecord,
  NazraRecord,
  Student,
  Subject,
} from "@/types";

function LabelValue({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.field}>
      <Text variant="labelSmall" style={styles.fieldLabel}>
        {label}
      </Text>
      <Text variant="bodyMedium">{value || "—"}</Text>
    </View>
  );
}

function HifzBlock({ student }: { student: Student }) {
  const { t } = useTranslation();
  const [lesson, setLesson] = useState<LessonLog | null>(null);
  const [records, setRecords] = useState<HifzRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [lessonHistory, studentRecords] = await Promise.all([
        lessonLogService.getHistory(student.classId),
        hifzService.getByStudent(student.id),
      ]);
      setLesson(lessonHistory[0] ?? null);
      setRecords(studentRecords);
    } finally {
      setLoading(false);
    }
  }, [student.classId, student.id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (loading) return <ActivityIndicator style={styles.loader} />;

  return (
    <View style={styles.block}>
      {lesson ? (
        <>
          <Text variant="titleMedium" style={styles.heading}>
            {t("parent.latestLesson")}
          </Text>
          <LessonLogForm
            classId={student.classId}
            programType="hifz_ul_quran"
            date={lesson.date}
            initial={lesson}
            saving={false}
            onSave={() => undefined}
            readOnly
          />
        </>
      ) : null}

      <Text variant="titleMedium" style={styles.heading}>
        {t("parent.hifzProgress")}
      </Text>
      {records.length === 0 ? (
        <EmptyState message={t("common.noData")} />
      ) : (
        records.map((record) => (
          <List.Item
            key={record.id}
            title={record.date}
            description={
              record.note
                ? `${t("hifz.mistakes")}: ${record.mistakeCount} • ${record.note}`
                : `${t("hifz.mistakes")}: ${record.mistakeCount}`
            }
            right={() => (
              <Chip compact mode="outlined" style={styles.chip}>
                {t(GRADE_LABEL_KEYS[record.grade])}
              </Chip>
            )}
          />
        ))
      )}
    </View>
  );
}

function NazraBlock({ student }: { student: Student }) {
  const { t } = useTranslation();
  const [lesson, setLesson] = useState<LessonLog | null>(null);
  const [records, setRecords] = useState<NazraRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [lessonHistory, studentRecords] = await Promise.all([
        lessonLogService.getHistory(student.classId),
        nazraService.getByStudent(student.id),
      ]);
      setLesson(lessonHistory[0] ?? null);
      setRecords(studentRecords);
    } finally {
      setLoading(false);
    }
  }, [student.classId, student.id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (loading) return <ActivityIndicator style={styles.loader} />;

  return (
    <View style={styles.block}>
      {lesson ? (
        <>
          <Text variant="titleMedium" style={styles.heading}>
            {t("parent.latestLesson")}
          </Text>
          <LessonLogForm
            classId={student.classId}
            programType="nazra_quran"
            date={lesson.date}
            initial={lesson}
            saving={false}
            onSave={() => undefined}
            readOnly
          />
        </>
      ) : null}

      <Text variant="titleMedium" style={styles.heading}>
        {t("parent.nazraProgress")}
      </Text>
      {records.length === 0 ? (
        <EmptyState message={t("common.noData")} />
      ) : (
        records.map((record) => (
          <Card key={record.id} mode="outlined" style={styles.nazraCard}>
            <Card.Content style={styles.nazraContent}>
              <Text variant="titleSmall">{record.date}</Text>
              <View style={styles.row}>
                <LabelValue
                  label={t("nazra.pageNumber")}
                  value={String(record.pageNumber)}
                />
                <LabelValue
                  label={t("nazra.lessonCompletion")}
                  value={`${record.lessonCompletion}%`}
                />
              </View>
              <View style={styles.row}>
                <LabelValue
                  label={t("nazra.fluencyLevel")}
                  value={String(record.fluencyLevel)}
                />
                <LabelValue
                  label={t("nazra.pronunciationErrors")}
                  value={String(record.pronunciationErrors)}
                />
              </View>
              {record.remarks ? (
                <LabelValue
                  label={t("nazra.remarks")}
                  value={record.remarks}
                />
              ) : null}
            </Card.Content>
          </Card>
        ))
      )}
    </View>
  );
}

function DarsBlock({ student }: { student: Student }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [kutub, setKutub] = useState<Kitab[]>([]);
  const [progress, setProgress] = useState<DarsProgressRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [bookList, records] = await Promise.all([
        darsENizamiService.getKutub(),
        darsENizamiService.getProgress(),
      ]);
      setKutub(bookList);
      setProgress(records.filter((r) => r.classId === student.classId));
    } finally {
      setLoading(false);
    }
  }, [student.classId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const byKitab = useMemo(
    () => Object.fromEntries(progress.map((r) => [r.kitabId, r])),
    [progress],
  );

  if (loading) return <ActivityIndicator style={styles.loader} />;

  if (kutub.length === 0) {
    return <EmptyState message={t("dars.noBooks")} />;
  }

  return (
    <View style={styles.block}>
      <Text variant="titleMedium" style={styles.heading}>
        {t("parent.darsProgress")}
      </Text>
      {kutub.map((kitab) => {
        const record = byKitab[kitab.id];
        const pct = record?.completionPercentage ?? 0;
        return (
          <Card key={kitab.id} mode="elevated" style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Text variant="titleMedium" style={styles.cardTitle}>
                  {kitab.name}
                </Text>
                <Text variant="titleMedium" style={styles.percent}>
                  {`${pct}%`}
                </Text>
              </View>
              <View style={styles.barTrack}>
                <View
                  style={{
                    flex: Math.min(100, Math.max(0, pct)),
                    backgroundColor: theme.colors.primary,
                  }}
                />
                <View style={{ flex: 100 - Math.min(100, Math.max(0, pct)) }} />
              </View>
              <Text variant="bodySmall" style={styles.pages}>
                {`${t("dars.pages")}: ${record?.pagesCovered ?? 0}/${kitab.totalPages}`}
              </Text>
            </Card.Content>
          </Card>
        );
      })}
    </View>
  );
}

function AsriBlock({ student }: { student: Student }) {
  const { t } = useTranslation();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [marks, setMarks] = useState<MarksRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [subjectList, allMarks] = await Promise.all([
        asriTaleemService.getSubjects(),
        asriTaleemService.getAllMarks(),
      ]);
      setSubjects(subjectList);
      setMarks(allMarks.filter((m) => m.studentId === student.id));
    } finally {
      setLoading(false);
    }
  }, [student.id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const values = useMemo(
    () =>
      Object.fromEntries(
        marks.map((m) => [m.subjectId, String(m.marksObtained)]),
      ),
    [marks],
  );

  if (loading) return <ActivityIndicator style={styles.loader} />;

  return (
    <View style={styles.block}>
      <Text variant="titleMedium" style={styles.heading}>
        {t("parent.asriProgress")}
      </Text>
      <MarksRow
        student={{
          id: student.id,
          name: student.name,
          fatherName: student.fatherName,
        }}
        grade={student.grade ?? 1}
        subjects={subjects}
        values={values}
        onChange={() => undefined}
        readOnly
      />
    </View>
  );
}

export function ProgressSection({ student }: { student: Student }) {
  const { t } = useTranslation();

  switch (student.programType) {
    case "hifz_ul_quran":
      return <HifzBlock student={student} />;
    case "nazra_quran":
      return <NazraBlock student={student} />;
    case "dars_e_nizami":
      return <DarsBlock student={student} />;
    case "asri_taleem":
      return <AsriBlock student={student} />;
    default:
      return <EmptyState message={t("parent.noProgressForProgram")} />;
  }
}

const styles = StyleSheet.create({
  block: {
    gap: 12,
  },
  heading: {
    fontWeight: "600",
    marginTop: 4,
  },
  loader: {
    marginTop: 32,
  },
  chip: {
    alignSelf: "center",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  field: {
    flex: 1,
    gap: 2,
  },
  fieldLabel: {
    opacity: 0.7,
  },
  nazraCard: {
    marginBottom: 4,
  },
  nazraContent: {
    gap: 8,
  },
  card: {
    marginBottom: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: {
    flex: 1,
    fontWeight: "600",
    paddingRight: 8,
  },
  percent: {
    fontWeight: "700",
  },
  barTrack: {
    flexDirection: "row",
    height: 8,
    width: "100%",
    borderRadius: 4,
    backgroundColor: "#E0E0E0",
    marginTop: 8,
    overflow: "hidden",
  },
  pages: {
    marginTop: 8,
  },
});
