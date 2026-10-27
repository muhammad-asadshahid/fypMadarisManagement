import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import {
  Button,
  HelperText,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";

import {
  teacherSchema,
  type TeacherSchemaType,
} from "@/modules/teachers/schema";
import type { Class } from "@/types";

const TEACHER_SUBJECT_OPTIONS = [
  "Hifz",
  "Nazra",
  "Dars-e-Nizami",
  "Asri Taleem",
  "Noorani Qaida",
];

export function TeacherForm({
  classes,
  initialData,
  onSubmit,
  submitLabel,
  isSubmitting = false,
}: {
  classes: Class[];
  initialData?: Partial<TeacherSchemaType>;
  onSubmit: (d: TeacherSchemaType) => Promise<void>;
  submitLabel: string;
  isSubmitting?: boolean;
}) {
  const { t } = useTranslation();
  const theme = useTheme();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TeacherSchemaType>({
    resolver: zodResolver(teacherSchema),
    defaultValues: initialData ?? {
      name: "",
      email: "",
      password: "",
      contactNumber: "",
      subjects: [],
      classIds: [],
      salary: 0,
    },
  });

  const translateError = (key?: string) => (key ? t(key) : "");

  return (
    <View style={styles.form}>
      <Controller
        control={control}
        name="name"
        render={({ field: { onBlur, onChange, value } }) => (
          <TextInput
            label={t("teachers.name")}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            mode="outlined"
            error={!!errors.name}
          />
        )}
      />
      <HelperText type="error" visible={!!errors.name}>
        {translateError(errors.name?.message)}
      </HelperText>

      <Controller
        control={control}
        name="contactNumber"
        render={({ field: { onBlur, onChange, value } }) => (
          <TextInput
            label={t("teachers.contactNumber")}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            mode="outlined"
            keyboardType="phone-pad"
            error={!!errors.contactNumber}
          />
        )}
      />
      <HelperText type="error" visible={!!errors.contactNumber}>
        {translateError(errors.contactNumber?.message)}
      </HelperText>

      <Controller
        control={control}
        name="email"
        render={({ field: { onBlur, onChange, value } }) => (
          <TextInput
            label={t("teachers.email")}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            error={!!errors.email}
          />
        )}
      />
      <HelperText type="error" visible={!!errors.email}>
        {translateError(errors.email?.message)}
      </HelperText>

      <Controller
        control={control}
        name="password"
        render={({ field: { onBlur, onChange, value } }) => (
          <TextInput
            label={t("teachers.pin")}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            mode="outlined"
            keyboardType="numeric"
            maxLength={4}
            secureTextEntry
            error={!!errors.password}
          />
        )}
      />
      <HelperText type="error" visible={!!errors.password}>
        {translateError(errors.password?.message)}
      </HelperText>

      <Controller
        control={control}
        name="salary"
        render={({ field: { onBlur, onChange, value } }) => (
          <TextInput
            label={t("teachers.salary")}
            value={String(value ?? 0)}
            onChangeText={(text) => onChange(text === "" ? 0 : Number(text))}
            onBlur={onBlur}
            mode="outlined"
            keyboardType="numeric"
            error={!!errors.salary}
          />
        )}
      />
      <HelperText type="error" visible={!!errors.salary}>
        {translateError(errors.salary?.message)}
      </HelperText>

      <Text variant="labelLarge" style={styles.sectionLabel}>
        {t("teachers.subjects")}
      </Text>
      <View style={styles.chipRow}>
        {TEACHER_SUBJECT_OPTIONS.map((subject) => (
          <Controller
            key={subject}
            control={control}
            name="subjects"
            render={({ field: { onChange, value } }) => {
              const selected = value ?? [];
              const active = selected.includes(subject);
              return (
                <Button
                  mode={active ? "contained" : "outlined"}
                  compact
                  onPress={() =>
                    onChange(
                      active
                        ? selected.filter((item) => item !== subject)
                        : [...selected, subject],
                    )
                  }
                  style={styles.optionButton}
                >
                  {subject}
                </Button>
              );
            }}
          />
        ))}
      </View>
      <HelperText type="error" visible={!!errors.subjects}>
        {translateError(errors.subjects?.message)}
      </HelperText>

      <Text variant="labelLarge" style={styles.sectionLabel}>
        {t("teachers.assignedClasses")}
      </Text>
      <View style={styles.chipRow}>
        {classes.length === 0 ? (
          <Text style={{ color: theme.colors.error }}>
            {t("teachers.noClasses")}
          </Text>
        ) : (
          classes.map((cls) => (
            <Controller
              key={cls.id}
              control={control}
              name="classIds"
              render={({ field: { onChange, value } }) => {
                const selected = value ?? [];
                const active = selected.includes(cls.id);
                return (
                  <Button
                    mode={active ? "contained" : "outlined"}
                    compact
                    onPress={() =>
                      onChange(
                        active
                          ? selected.filter((item) => item !== cls.id)
                          : [...selected, cls.id],
                      )
                    }
                    style={styles.optionButton}
                  >
                    {cls.name}
                  </Button>
                );
              }}
            />
          ))
        )}
      </View>
      <HelperText type="error" visible={!!errors.classIds}>
        {translateError(errors.classIds?.message)}
      </HelperText>

      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
        disabled={isSubmitting}
        style={styles.submit}
      >
        {submitLabel}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: 8 },
  sectionLabel: { marginTop: 12, marginBottom: 4 },
  chipRow: {
    flexWrap: "wrap",
    flexDirection: "row",
    gap: 8,
  },
  optionButton: {
    marginBottom: 4,
  },
  submit: { marginTop: 12 },
});
