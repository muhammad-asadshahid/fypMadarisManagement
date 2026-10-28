import { StyleSheet, View } from "react-native";
import { IconButton } from "react-native-paper";

import type { AttendanceStatus } from "@/types";

export const ATTENDANCE_STATUSES: AttendanceStatus[] = [
  "present",
  "absent",
  "leave",
];

const ICONS: Record<AttendanceStatus, string> = {
  present: "check-circle",
  absent: "close-circle",
  leave: "airplane",
};

export const STATUS_COLORS: Record<AttendanceStatus, string> = {
  present: "#2E7D32",
  absent: "#C62828",
  leave: "#EF6C00",
};

interface StatusPickerProps {
  value: AttendanceStatus;
  onChange: (status: AttendanceStatus) => void;
  labels: Record<AttendanceStatus, string>;
}

export function StatusPicker({ value, onChange, labels }: StatusPickerProps) {
  return (
    <View style={styles.row}>
      {ATTENDANCE_STATUSES.map((status) => {
        const active = value === status;
        return (
          <IconButton
            key={status}
            icon={ICONS[status]}
            size={20}
            mode={active ? "contained" : "outlined"}
            iconColor={active ? "#FFFFFF" : STATUS_COLORS[status]}
            containerColor={active ? STATUS_COLORS[status] : undefined}
            onPress={() => onChange(status)}
            accessibilityLabel={labels[status]}
            style={styles.button}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  button: {
    marginHorizontal: 0,
    marginVertical: 0,
  },
});
