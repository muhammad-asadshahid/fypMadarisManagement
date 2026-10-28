import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  Dialog,
  Portal,
  Snackbar,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";

import { EmptyState } from "@/components/common/empty-state";
import { ScreenWrapper } from "@/components/common/screen-wrapper";
import {
  computeCompletion,
  darsENizamiService,
} from "@/modules/dars-e-nizami/service";
import { studentService } from "@/modules/students/service";
import { teacherService } from "@/modules/teachers/service";
import { useAuthStore } from "@/store/authStore";
import type { Class, DarsProgressRecord, Kitab } from "@/types";

interface ProgressTarget {
  classId: string;
  kitab: Kitab;
}

/** Keeps a numeric input non-negative and no greater than `max`. */
function clampToMax(text: string, max: number): string {
  const digits = text.replace(/[^0-9]/g, "");
  if (!digits) return "";
  return String(Math.min(Number(digits), max));
}

export default function DarsENizamiScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const user = useAuthStore((s) => s.user);

  const [classes, setClasses] = useState<Class[]>([]);
  const [editableClassIds, setEditableClassIds] = useState<Set<string>>(
    new Set(),
  );
  const [kutub, setKutub] = useState<Kitab[]>([]);
  const [progress, setProgress] = useState<Record<string, DarsProgressRecord>>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const [progressTarget, setProgressTarget] = useState<ProgressTarget | null>(
    null,
  );
  const [pages, setPages] = useState("");

  const [bookDialog, setBookDialog] = useState(false);
  const [editingBook, setEditingBook] = useState<Kitab | null>(null);
  const [bookName, setBookName] = useState("");
  const [bookPages, setBookPages] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Kitab | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [allClasses, kutubList, progressList] = await Promise.all([
        studentService.getClasses(),
        darsENizamiService.getKutub(),
        darsENizamiService.getProgress(),
      ]);
      const darsClasses = allClasses.filter(
        (cls) => cls.programType === "dars_e_nizami",
      );

      // A teacher may edit only the Dars class they are assigned to.
      let editable = new Set<string>();
      if (user?.role === "teacher" && user.teacherId) {
        const teacher = await teacherService.getById(user.teacherId);
        const assigned = new Set(teacher?.classIds ?? []);
        editable = new Set(
          darsClasses.filter((cls) => assigned.has(cls.id)).map((c) => c.id),
        );
      }

      // Teachers only see their own Dars classes; the admin sees all of them.
      const visible =
        user?.role === "teacher"
          ? darsClasses.filter((cls) => editable.has(cls.id))
          : darsClasses;

      setClasses(visible);
      setEditableClassIds(editable);
      setKutub(kutubList);
      setProgress(Object.fromEntries(progressList.map((r) => [r.id, r])));
    } finally {
      setLoading(false);
    }
  }, [user?.role, user?.teacherId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const canEditAny = editableClassIds.size > 0;
  const key = (classId: string, kitabId: string) => `${classId}__${kitabId}`;

  const openProgress = (classId: string, kitab: Kitab) => {
    const existing = progress[key(classId, kitab.id)];
    setPages(String(existing?.pagesCovered ?? 0));
    setProgressTarget({ classId, kitab });
  };

  const previewPercentage = useMemo(() => {
    if (!progressTarget) return 0;
    return computeCompletion(progressTarget.kitab, Number(pages) || 0);
  }, [progressTarget, pages]);

  const saveProgress = async () => {
    if (!progressTarget) return;
    const pagesValue = Math.max(0, Number(pages) || 0);
    // Never allow progress to run past the book's total pages.
    if (pagesValue > progressTarget.kitab.totalPages) {
      setSnackbar(t("dars.limitExceeded"));
      return;
    }
    setSaving(true);
    try {
      const saved = await darsENizamiService.updateProgress(
        progressTarget.classId,
        progressTarget.kitab.id,
        { pagesCovered: pagesValue },
        user?.teacherId ?? user?.id ?? "teacher",
      );
      setProgress((prev) => ({ ...prev, [saved.id]: saved }));
      setProgressTarget(null);
      setSnackbar(t("dars.saved"));
    } catch {
      setSnackbar(t("common.error"));
    } finally {
      setSaving(false);
    }
  };

  const openNewBook = () => {
    setEditingBook(null);
    setBookName("");
    setBookPages("");
    setBookDialog(true);
  };

  const openEditBook = (kitab: Kitab) => {
    setEditingBook(kitab);
    setBookName(kitab.name);
    setBookPages(String(kitab.totalPages));
    setBookDialog(true);
  };

  const saveBook = async () => {
    const totalPages = Number(bookPages);
    if (!bookName.trim() || !totalPages) {
      setSnackbar(t("dars.invalidNumbers"));
      return;
    }
    setSaving(true);
    try {
      const saved = await darsENizamiService.saveKitab({
        id: editingBook?.id,
        name: bookName.trim(),
        totalPages,
      });
      setKutub((prev) =>
        prev.some((k) => k.id === saved.id)
          ? prev.map((k) => (k.id === saved.id ? saved : k))
          : [saved, ...prev],
      );
      setBookDialog(false);
      setSnackbar(t("dars.bookSaved"));
    } catch {
      setSnackbar(t("common.error"));
    } finally {
      setSaving(false);
    }
  };

  const confirmDeleteBook = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await darsENizamiService.deleteKitab(deleteTarget.id);
      setKutub((prev) => prev.filter((k) => k.id !== deleteTarget.id));
      setDeleteTarget(null);
      setBookDialog(false);
      setSnackbar(t("dars.bookDeleted"));
    } catch {
      setSnackbar(t("common.error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenWrapper title={t("nav.darsENizami")}>
      <View style={styles.headerRow}>
        <Text variant="titleMedium" style={styles.heading}>
          {t("dars.kitabWiseProgress")}
        </Text>
        {canEditAny ? (
          <Button compact mode="contained" icon="plus" onPress={openNewBook}>
            {t("dars.addBook")}
          </Button>
        ) : null}
      </View>

      {!canEditAny && !loading ? (
        <Text variant="bodySmall" style={styles.notice}>
          {t("dars.readOnly")}
        </Text>
      ) : null}

      {loading ? (
        <ActivityIndicator style={styles.loader} />
      ) : classes.length === 0 ? (
        <EmptyState message={t("dars.noClasses")} />
      ) : (
        classes.map((cls) => {
          const editable = editableClassIds.has(cls.id);
          const overall = kutub.length
            ? Math.round(
                kutub.reduce(
                  (sum, kitab) =>
                    sum +
                    (progress[key(cls.id, kitab.id)]?.completionPercentage ?? 0),
                  0,
                ) / kutub.length,
              )
            : 0;
          return (
            <View key={cls.id} style={styles.section}>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                {cls.name}
              </Text>
              <Text variant="bodySmall" style={styles.sectionSubtitle}>
                {`${t("dars.classProgress")}: ${overall}%`}
              </Text>

              {kutub.length === 0 ? (
                <EmptyState message={t("dars.noBooks")} />
              ) : (
                kutub.map((kitab) => {
                  const rec = progress[key(cls.id, kitab.id)];
                  const pct = rec?.completionPercentage ?? 0;
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
                          <View
                            style={{ flex: 100 - Math.min(100, Math.max(0, pct)) }}
                          />
                        </View>
                        <View style={styles.metaRow}>
                          <Text variant="bodySmall">
                            {`${t("dars.pages")}: ${rec?.pagesCovered ?? 0}/${kitab.totalPages}`}
                          </Text>
                        </View>
                      </Card.Content>
                      {editable ? (
                        <Card.Actions style={styles.cardActions}>
                          <Button
                            compact
                            mode="text"
                            icon="pencil"
                            onPress={() => openProgress(cls.id, kitab)}
                          >
                            {t("dars.updateProgress")}
                          </Button>
                          <Button
                            compact
                            mode="text"
                            icon="book-edit"
                            onPress={() => openEditBook(kitab)}
                          >
                            {t("dars.editBook")}
                          </Button>
                        </Card.Actions>
                      ) : null}
                    </Card>
                  );
                })
              )}
            </View>
          );
        })
      )}

      <Portal>
        <Dialog
          visible={!!progressTarget}
          onDismiss={() => setProgressTarget(null)}
        >
          <Dialog.Title>{t("dars.updateProgress")}</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogSubtitle}>
              {`${classes.find((c) => c.id === progressTarget?.classId)?.name ?? ""} • ${progressTarget?.kitab.name ?? ""}`}
            </Text>
            <TextInput
              label={t("dars.pagesCovered")}
              value={pages}
              onChangeText={(text) =>
                setPages(clampToMax(text, progressTarget?.kitab.totalPages ?? 0))
              }
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
            />
            <Text variant="bodySmall" style={styles.hint}>
              {t("dars.maxValue", {
                value: progressTarget?.kitab.totalPages ?? 0,
              })}
            </Text>
            <Text variant="bodyMedium" style={styles.preview}>
              {`${t("dars.completion")}: ${previewPercentage}%`}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setProgressTarget(null)}>
              {t("common.cancel")}
            </Button>
            <Button onPress={saveProgress} loading={saving}>
              {t("common.save")}
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={bookDialog} onDismiss={() => setBookDialog(false)}>
          <Dialog.Title>
            {editingBook ? t("dars.editBook") : t("dars.addBook")}
          </Dialog.Title>
          <Dialog.Content>
            <TextInput
              label={t("dars.bookName")}
              value={bookName}
              onChangeText={setBookName}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label={t("dars.totalPages")}
              value={bookPages}
              onChangeText={setBookPages}
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
            />
          </Dialog.Content>
          <Dialog.Actions style={styles.bookActions}>
            {editingBook ? (
              <Button
                textColor="#B00020"
                onPress={() => setDeleteTarget(editingBook)}
              >
                {t("common.delete")}
              </Button>
            ) : (
              <View />
            )}
            <View style={styles.bookActionsRight}>
              <Button onPress={() => setBookDialog(false)}>
                {t("common.cancel")}
              </Button>
              <Button onPress={saveBook} loading={saving}>
                {t("common.save")}
              </Button>
            </View>
          </Dialog.Actions>
        </Dialog>

        <Dialog
          visible={!!deleteTarget}
          onDismiss={() => setDeleteTarget(null)}
        >
          <Dialog.Title>{t("dars.deleteBook")}</Dialog.Title>
          <Dialog.Content>
            <Text>{t("dars.deleteBookConfirm")}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteTarget(null)}>
              {t("common.cancel")}
            </Button>
            <Button
              textColor="#B00020"
              onPress={confirmDeleteBook}
              loading={saving}
            >
              {t("common.delete")}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar
        visible={!!snackbar}
        onDismiss={() => setSnackbar(null)}
        duration={2000}
      >
        {snackbar}
      </Snackbar>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  heading: {
    fontWeight: "600",
    flex: 1,
  },
  notice: {
    opacity: 0.7,
    marginTop: 4,
  },
  loader: {
    marginTop: 48,
  },
  section: {
    marginTop: 16,
    gap: 8,
  },
  sectionTitle: {
    fontWeight: "700",
  },
  sectionSubtitle: {
    opacity: 0.7,
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
  hint: {
    opacity: 0.6,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  cardActions: {
    gap: 4,
  },
  dialogSubtitle: {
    marginBottom: 12,
  },
  input: {
    marginTop: 8,
  },
  preview: {
    marginTop: 16,
    fontWeight: "600",
  },
  bookActions: {
    justifyContent: "space-between",
  },
  bookActionsRight: {
    flexDirection: "row",
  },
});
