import { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import {
  Button,
  Card,
  Dialog,
  IconButton,
  Portal,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";

import type { Subject } from "@/types";

export function SubjectsManager({
  subjects,
  canEdit,
  onRename,
}: {
  subjects: Subject[];
  canEdit: boolean;
  onRename: (subjectId: string, name: string) => void;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(
    null,
  );

  const close = () => setEditing(null);

  const submit = () => {
    const name = editing?.name.trim();
    if (editing && name) onRename(editing.id, name);
    close();
  };

  return (
    <Card mode="elevated">
      <Card.Title title={t("asri.subjects")} titleVariant="titleMedium" />
      <Card.Content>
        <View style={styles.chipRow}>
          {subjects.map((subject) => (
            <View
              key={subject.id}
              style={[styles.subjectChip, { borderColor: theme.colors.outline }]}
            >
              <Text variant="bodyMedium">{subject.name}</Text>
              {canEdit && (
                <IconButton
                  icon="pencil"
                  size={16}
                  style={styles.editIcon}
                  onPress={() =>
                    setEditing({ id: subject.id, name: subject.name })
                  }
                />
              )}
            </View>
          ))}
        </View>
      </Card.Content>

      <Portal>
        <Dialog visible={!!editing} onDismiss={close}>
          <Dialog.Title>{t("asri.renameSubject")}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              mode="outlined"
              autoFocus
              label={t("asri.subjectName")}
              value={editing?.name ?? ""}
              onChangeText={(text) =>
                setEditing((prev) => (prev ? { ...prev, name: text } : prev))
              }
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={close}>{t("common.cancel")}</Button>
            <Button onPress={submit}>{t("common.save")}</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </Card>
  );
}

const styles = StyleSheet.create({
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  subjectChip: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 20,
    paddingLeft: 12,
    paddingRight: 2,
    paddingVertical: 2,
  },
  editIcon: { margin: 0 },
});
