import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { Button, Card, Text, TextInput } from "react-native-paper";

import type { LessonLog, LessonLogInput, ProgramType } from "@/types";

interface LessonFields {
  sabaqJuz: string;
  sabaqSurah: string;
  sabaqAyahStart: string;
  sabaqAyahEnd: string;
  sabaqPages: string;
  sabaqiDate: string;
  sabaqiSurah: string;
  sabaqiAyahStart: string;
  sabaqiAyahEnd: string;
  sabaqiNotes: string;
  manzilJuz: string;
  manzilSurah: string;
  manzilAyahStart: string;
  manzilAyahEnd: string;
}

function toFields(initial: LessonLog | null, date: string): LessonFields {
  return {
    sabaqJuz: initial ? String(initial.sabaqJuz) : "",
    sabaqSurah: initial?.sabaqSurah ?? "",
    sabaqAyahStart: initial ? String(initial.sabaqAyahStart) : "",
    sabaqAyahEnd: initial ? String(initial.sabaqAyahEnd) : "",
    sabaqPages: initial ? String(initial.sabaqPages) : "",
    sabaqiDate: initial?.sabaqiDate ?? date,
    sabaqiSurah: initial?.sabaqiSurah ?? "",
    sabaqiAyahStart: initial ? String(initial.sabaqiAyahStart) : "",
    sabaqiAyahEnd: initial ? String(initial.sabaqiAyahEnd) : "",
    sabaqiNotes: initial?.sabaqiNotes ?? "",
    manzilJuz: initial ? String(initial.manzilJuz) : "",
    manzilSurah: initial?.manzilSurah ?? "",
    manzilAyahStart: initial ? String(initial.manzilAyahStart) : "",
    manzilAyahEnd: initial ? String(initial.manzilAyahEnd) : "",
  };
}

function toNumber(value: string): number {
  return Number(value.replace(/[^0-9]/g, "")) || 0;
}

function Field({
  label,
  value,
  onChangeText,
  readOnly,
  numeric = false,
  multiline = false,
  flex = false,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  readOnly: boolean;
  numeric?: boolean;
  multiline?: boolean;
  flex?: boolean;
}) {
  const rootStyle = flex ? styles.half : undefined;

  if (readOnly) {
    return (
      <View style={[styles.field, rootStyle]}>
        <Text variant="labelSmall" style={styles.fieldLabel}>
          {label}
        </Text>
        <Text variant="bodyLarge">{value || "—"}</Text>
      </View>
    );
  }

  return (
    <TextInput
      style={rootStyle}
      mode="outlined"
      dense
      multiline={multiline}
      keyboardType={numeric ? "numeric" : "default"}
      label={label}
      value={value}
      onChangeText={onChangeText}
    />
  );
}

export function LessonLogForm({
  classId,
  programType,
  date,
  initial,
  saving,
  onSave,
  readOnly = false,
}: {
  classId: string;
  programType: ProgramType;
  date: string;
  initial: LessonLog | null;
  saving: boolean;
  onSave: (input: LessonLogInput) => void;
  readOnly?: boolean;
}) {
  const { t } = useTranslation();
  const [fields, setFields] = useState<LessonFields>(() =>
    toFields(initial, date),
  );

  useEffect(() => {
    setFields(toFields(initial, date));
  }, [initial, date]);

  const set = (key: keyof LessonFields) => (value: string) =>
    setFields((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    onSave({
      classId,
      programType,
      date,
      sabaqJuz: toNumber(fields.sabaqJuz),
      sabaqSurah: fields.sabaqSurah.trim(),
      sabaqAyahStart: toNumber(fields.sabaqAyahStart),
      sabaqAyahEnd: toNumber(fields.sabaqAyahEnd),
      sabaqPages: toNumber(fields.sabaqPages),
      sabaqiDate: fields.sabaqiDate.trim() || date,
      sabaqiSurah: fields.sabaqiSurah.trim(),
      sabaqiAyahStart: toNumber(fields.sabaqiAyahStart),
      sabaqiAyahEnd: toNumber(fields.sabaqiAyahEnd),
      sabaqiNotes: fields.sabaqiNotes.trim(),
      manzilJuz: toNumber(fields.manzilJuz),
      manzilSurah: fields.manzilSurah.trim(),
      manzilAyahStart: toNumber(fields.manzilAyahStart),
      manzilAyahEnd: toNumber(fields.manzilAyahEnd),
    });
  };

  return (
    <View style={styles.container}>
      <Card mode="elevated">
        <Card.Title title={t("lessons.sabaq")} titleVariant="titleMedium" />
        <Card.Content style={styles.cardContent}>
          <View style={styles.row}>
            <Field
              flex
              label={t("lessons.juz")}
              value={fields.sabaqJuz}
              onChangeText={set("sabaqJuz")}
              numeric
              readOnly={readOnly}
            />
            <Field
              flex
              label={t("lessons.surah")}
              value={fields.sabaqSurah}
              onChangeText={set("sabaqSurah")}
              readOnly={readOnly}
            />
          </View>
          <View style={styles.row}>
            <Field
              flex
              label={t("lessons.ayahStart")}
              value={fields.sabaqAyahStart}
              onChangeText={set("sabaqAyahStart")}
              numeric
              readOnly={readOnly}
            />
            <Field
              flex
              label={t("lessons.ayahEnd")}
              value={fields.sabaqAyahEnd}
              onChangeText={set("sabaqAyahEnd")}
              numeric
              readOnly={readOnly}
            />
          </View>
          <Field
            label={t("lessons.pages")}
            value={fields.sabaqPages}
            onChangeText={set("sabaqPages")}
            numeric
            readOnly={readOnly}
          />
        </Card.Content>
      </Card>

      <Card mode="elevated">
        <Card.Title title={t("lessons.sabaqi")} titleVariant="titleMedium" />
        <Card.Content style={styles.cardContent}>
          <Field
            label={t("lessons.date")}
            value={fields.sabaqiDate}
            onChangeText={set("sabaqiDate")}
            readOnly={readOnly}
          />
          <Field
            label={t("lessons.surah")}
            value={fields.sabaqiSurah}
            onChangeText={set("sabaqiSurah")}
            readOnly={readOnly}
          />
          <View style={styles.row}>
            <Field
              flex
              label={t("lessons.ayahStart")}
              value={fields.sabaqiAyahStart}
              onChangeText={set("sabaqiAyahStart")}
              numeric
              readOnly={readOnly}
            />
            <Field
              flex
              label={t("lessons.ayahEnd")}
              value={fields.sabaqiAyahEnd}
              onChangeText={set("sabaqiAyahEnd")}
              numeric
              readOnly={readOnly}
            />
          </View>
          <Field
            label={t("lessons.notes")}
            value={fields.sabaqiNotes}
            onChangeText={set("sabaqiNotes")}
            multiline
            readOnly={readOnly}
          />
        </Card.Content>
      </Card>

      <Card mode="elevated">
        <Card.Title title={t("lessons.manzil")} titleVariant="titleMedium" />
        <Card.Content style={styles.cardContent}>
          <View style={styles.row}>
            <Field
              flex
              label={t("lessons.juz")}
              value={fields.manzilJuz}
              onChangeText={set("manzilJuz")}
              numeric
              readOnly={readOnly}
            />
            <Field
              flex
              label={t("lessons.surah")}
              value={fields.manzilSurah}
              onChangeText={set("manzilSurah")}
              readOnly={readOnly}
            />
          </View>
          <View style={styles.row}>
            <Field
              flex
              label={t("lessons.ayahStart")}
              value={fields.manzilAyahStart}
              onChangeText={set("manzilAyahStart")}
              numeric
              readOnly={readOnly}
            />
            <Field
              flex
              label={t("lessons.ayahEnd")}
              value={fields.manzilAyahEnd}
              onChangeText={set("manzilAyahEnd")}
              numeric
              readOnly={readOnly}
            />
          </View>
        </Card.Content>
      </Card>

      {!readOnly && (
        <Button
          mode="contained"
          onPress={handleSave}
          loading={saving}
          disabled={saving}
        >
          {t("lessons.save")}
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  cardContent: { gap: 8 },
  row: { flexDirection: "row", gap: 8 },
  half: { flex: 1 },
  field: { gap: 2 },
  fieldLabel: { opacity: 0.7 },
});
