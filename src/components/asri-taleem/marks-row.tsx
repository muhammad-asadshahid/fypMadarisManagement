import { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { Button, Card, Chip, Menu, Text, TextInput } from "react-native-paper";

import type { ClassStudent, Subject } from "@/types";

const GRADE_OPTIONS = Array.from({ length: 10 }, (_, index) => index + 1);

export function MarksRow({
  student,
  grade,
  subjects,
  values,
  onChange,
  readOnly,
  onGradeChange,
}: {
  student: ClassStudent;
  grade: number;
  subjects: Subject[];
  values: Record<string, string>;
  onChange: (subjectId: string, value: string) => void;
  readOnly: boolean;
  onGradeChange?: (grade: number) => void;
}) {
  const { t } = useTranslation();
  const [menuVisible, setMenuVisible] = useState(false);

  const handleChange = (subjectId: string, text: string) => {
    const digits = text.replace(/[^0-9]/g, "");
    if (digits !== "" && Number(digits) > 100) {
      onChange(subjectId, "100");
      return;
    }
    onChange(subjectId, digits);
  };

  return (
    <Card mode="outlined">
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text variant="titleSmall">{student.name}</Text>
            <Text variant="bodySmall">{student.fatherName}</Text>
          </View>
          {!onGradeChange ? (
            <Chip mode="outlined" compact>
              {`${t("asri.grade")} ${grade}`}
            </Chip>
          ) : (
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  compact
                  icon="chevron-down"
                  onPress={() => setMenuVisible(true)}
                >
                  {`${t("asri.grade")} ${grade}`}
                </Button>
              }
            >
              {GRADE_OPTIONS.map((option) => (
                <Menu.Item
                  key={option}
                  title={String(option)}
                  onPress={() => {
                    setMenuVisible(false);
                    onGradeChange(option);
                  }}
                />
              ))}
            </Menu>
          )}
        </View>

        <View style={styles.grid}>
          {subjects.map((subject) => {
            const value = values[subject.id] ?? "";
            return (
              <View key={subject.id} style={styles.cell}>
                {readOnly ? (
                  <>
                    <Text variant="labelSmall" style={styles.label}>
                      {subject.name}
                    </Text>
                    <Text variant="titleMedium">{value || "—"}</Text>
                  </>
                ) : (
                  <TextInput
                    style={styles.input}
                    mode="outlined"
                    dense
                    keyboardType="numeric"
                    maxLength={3}
                    label={subject.name}
                    placeholder={t("asri.outOf100")}
                    value={value}
                    onChangeText={(text) => handleChange(subject.id, text)}
                  />
                )}
              </View>
            );
          })}
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: { gap: 12 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  headerText: { flex: 1 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  cell: { width: 120 },
  input: { width: 120 },
  label: { opacity: 0.7 },
});
