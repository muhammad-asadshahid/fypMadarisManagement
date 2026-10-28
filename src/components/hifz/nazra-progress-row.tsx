import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { Card, Text, TextInput } from "react-native-paper";

import type { ClassStudent } from "@/types";

export interface NazraProgressFields {
  pageNumber: string;
  lessonCompletion: string;
  fluencyLevel: string;
  pronunciationErrors: string;
  remarks: string;
}

export function emptyNazraFields(): NazraProgressFields {
  return {
    pageNumber: "",
    lessonCompletion: "",
    fluencyLevel: "",
    pronunciationErrors: "",
    remarks: "",
  };
}

function Field({
  label,
  value,
  onChangeText,
  readOnly,
  multiline = false,
  flex = false,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  readOnly: boolean;
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
      keyboardType={multiline ? "default" : "numeric"}
      label={label}
      value={value}
      onChangeText={onChangeText}
    />
  );
}

export function NazraProgressRow({
  student,
  value,
  onChange,
  readOnly = false,
}: {
  student: ClassStudent;
  value: NazraProgressFields;
  onChange: (patch: Partial<NazraProgressFields>) => void;
  readOnly?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <Card mode="outlined">
      <Card.Content style={styles.content}>
        <Text variant="titleSmall">{student.name}</Text>
        <Text variant="bodySmall">{student.fatherName}</Text>
        <View style={styles.row}>
          <Field
            flex
            label={t("nazra.pageNumber")}
            value={value.pageNumber}
            onChangeText={(text) => onChange({ pageNumber: text })}
            readOnly={readOnly}
          />
          <Field
            flex
            label={t("nazra.lessonCompletion")}
            value={value.lessonCompletion}
            onChangeText={(text) => onChange({ lessonCompletion: text })}
            readOnly={readOnly}
          />
        </View>
        <View style={styles.row}>
          <Field
            flex
            label={t("nazra.fluencyLevel")}
            value={value.fluencyLevel}
            onChangeText={(text) => onChange({ fluencyLevel: text })}
            readOnly={readOnly}
          />
          <Field
            flex
            label={t("nazra.pronunciationErrors")}
            value={value.pronunciationErrors}
            onChangeText={(text) => onChange({ pronunciationErrors: text })}
            readOnly={readOnly}
          />
        </View>
        <Field
          label={t("nazra.remarks")}
          value={value.remarks}
          onChangeText={(text) => onChange({ remarks: text })}
          multiline
          readOnly={readOnly}
        />
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: { gap: 8 },
  row: { flexDirection: "row", gap: 8 },
  half: { flex: 1 },
  field: { gap: 2 },
  fieldLabel: { opacity: 0.7 },
});
