import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
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

import { PROGRAM_LABEL_KEYS, PROGRAM_TYPES } from "@/constants/programs";
import {
  teacherSchema,
  type TeacherSchemaType,
} from "@/modules/teachers/schema";
import type { Class } from "@/types";

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

  // Fall back to the program of an already-assigned class when editing older
  // teachers that predate the program field.
  const initialProgram =
    initialData?.programType ??
    classes.find((c) => (initialData?.classIds ?? []).includes(c.id))
      ?.programType ??
    "hifz_ul_quran";

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TeacherSchemaType>({
    resolver: zodResolver(teacherSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          programType: initialProgram,
          classIds: initialData.classIds ?? [],
        }
      : {
          name: "",
          email: "",
          password: "",
          contactNumber: "",
          classIds: [],
          salary: 0,
          qualification: "",
          experience: "",
          programType: "hifz_ul_quran",
        },
  });

  const selectedProgram = watch("programType");
  const selectedClassIds = watch("classIds") ?? [];

  const filteredClasses = useMemo(
    () => classes.filter((c) => c.programType === selectedProgram),
    [classes, selectedProgram],
  );

  // Drop any assigned class that doesn't belong to the selected program.
  useEffect(() => {
    const valid = selectedClassIds.filter((id) =>
      filteredClasses.some((c) => c.id === id),
    );
    if (valid.length !== selectedClassIds.length) {
      setValue("classIds", valid);
    }
  }, [filteredClasses, selectedClassIds, setValue]);

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

      <Controller
        control={control}
        name="qualification"
        render={({ field: { onBlur, onChange, value } }) => (
          <TextInput
            label={t("teachers.qualification")}
            value={value ?? ""}
            onChangeText={onChange}
            onBlur={onBlur}
            mode="outlined"
            error={!!errors.qualification}
          />
        )}
      />
      <HelperText type="error" visible={!!errors.qualification}>
        {translateError(errors.qualification?.message)}
      </HelperText>

      <Controller
        control={control}
        name="experience"
        render={({ field: { onBlur, onChange, value } }) => (
          <TextInput
            label={t("teachers.experience")}
            value={value ?? ""}
            onChangeText={onChange}
            onBlur={onBlur}
            mode="outlined"
            error={!!errors.experience}
          />
        )}
      />
      <HelperText type="error" visible={!!errors.experience}>
        {translateError(errors.experience?.message)}
      </HelperText>

      <Text variant="labelLarge" style={styles.sectionLabel}>
        {t("teachers.programType")}
      </Text>
      <View style={styles.chipRow}>
        {PROGRAM_TYPES.map((program) => (
          <Controller
            key={program}
            control={control}
            name="programType"
            render={({ field: { onChange, value } }) => (
              <Button
                mode={value === program ? "contained" : "outlined"}
                compact
                onPress={() => onChange(program)}
                style={styles.optionButton}
              >
                {t(PROGRAM_LABEL_KEYS[program])}
              </Button>
            )}
          />
        ))}
      </View>
      <HelperText type="error" visible={!!errors.programType}>
        {translateError(errors.programType?.message)}
      </HelperText>

      <Text variant="labelLarge" style={styles.sectionLabel}>
        {t("teachers.assignedClasses")}
      </Text>
      <View style={styles.chipRow}>
        {filteredClasses.length === 0 ? (
          <Text style={{ color: theme.colors.error }}>
            {t("teachers.noClasses")}
          </Text>
        ) : (
          filteredClasses.map((cls) => (
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
