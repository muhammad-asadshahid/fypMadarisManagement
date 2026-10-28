import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { Chip, Text, TextInput } from "react-native-paper";

import { GRADE_LABEL_KEYS, gradeFromMistakes } from "@/lib/hifz-grade";
import type { ClassStudent } from "@/types";

export function HifzProgressRow({
  student,
  value,
  onChange,
  readOnly = false,
}: {
  student: ClassStudent;
  value: number;
  onChange: (value: number) => void;
  readOnly?: boolean;
}) {
  const { t } = useTranslation();
  const grade = gradeFromMistakes(value);

  return (
    <View style={styles.row}>
      <View style={styles.info}>
        <Text variant="bodyLarge">{student.name}</Text>
        <Text variant="bodySmall">{student.fatherName}</Text>
      </View>
      {readOnly ? (
        <View style={styles.readOnlyValue}>
          <Text variant="labelSmall" style={styles.readOnlyLabel}>
            {t("hifz.mistakes")}
          </Text>
          <Text variant="bodyLarge">{String(value)}</Text>
        </View>
      ) : (
        <TextInput
          style={styles.input}
          mode="outlined"
          dense
          keyboardType="numeric"
          label={t("hifz.mistakes")}
          value={String(value)}
          onChangeText={(text) =>
            onChange(Number(text.replace(/[^0-9]/g, "")) || 0)
          }
        />
      )}
      <Chip style={styles.chip} mode="outlined">
        {t(GRADE_LABEL_KEYS[grade])}
      </Chip>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  info: { flex: 1 },
  input: { width: 88 },
  readOnlyValue: { minWidth: 60, gap: 2 },
  readOnlyLabel: { opacity: 0.7 },
  chip: { minWidth: 96, justifyContent: "center" },
});
